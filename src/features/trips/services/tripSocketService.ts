import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_PATH, SocketEvents } from '@/shared/config/appUrls';
import { RentalTrip } from '@/features/trips/types/customerApi';
import { normalizeRentalTrip, getActiveCustomerUuid } from '@/features/trips/services/customerTripService';

let socketInstance: Socket | null = null;
const activeTripSubscriptions = new Map<string, Set<(trip: RentalTrip) => void>>();
const statusListeners = new Set<(connected: boolean) => void>();

export interface TripSocketOptions {
  userUuid?: string;
  tripUuid?: string;
}

/**
 * Checks if the singleton Socket.IO instance is currently connected.
 */
export function isTripSocketConnected(): boolean {
  return Boolean(socketInstance && socketInstance.connected);
}

/**
 * Returns or initializes the singleton Socket.IO client instance.
 * Automatically configured with fallback transports (polling + websocket upgrade).
 */
export function getTripSocket(options?: TripSocketOptions): Socket {
  if (typeof window === 'undefined') {
    return null as unknown as Socket;
  }

  if (socketInstance && (socketInstance.connected || socketInstance.active)) {
    // If auth data changed, update auth property
    if (options?.userUuid || options?.tripUuid) {
      socketInstance.auth = {
        ...(socketInstance.auth || {}),
        user_uuid: options.userUuid || getActiveCustomerUuid(),
        trip_uuid: options.tripUuid || '',
      };
    }
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  const effectiveUserUuid = options?.userUuid || getActiveCustomerUuid();
  const effectiveTripUuid = options?.tripUuid || '';

  const socketTarget = SOCKET_URL || 'https://apitrippy.online';
  // Backend uvicorn returns "400 Bad Request: Invalid websocket upgrade".
  // Using polling transport with upgrade: false provides 100% reliable real-time updates without browser console errors.
  const transports: ('polling' | 'websocket')[] =
    process.env.NEXT_PUBLIC_SOCKET_TRANSPORTS === 'websocket'
      ? ['websocket']
      : ['polling'];

  // Initialize socket client
  socketInstance = io(socketTarget, {
    path: SOCKET_PATH,
    transports,
    upgrade: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
    timeout: 15000,
    autoConnect: true,
    auth: {
      user_uuid: effectiveUserUuid,
      trip_uuid: effectiveTripUuid,
    },
  });

  // Attach global lifecycle handlers
  socketInstance.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Connected successfully (sid: ${socketInstance?.id})`);
    }
    statusListeners.forEach((fn) => {
      try {
        fn(true);
      } catch {}
    });

    // Re-join any active trip rooms on reconnect
    activeTripSubscriptions.forEach((_, tripUuid) => {
      if (tripUuid && socketInstance?.connected) {
        joinTripRoom(tripUuid);
      }
    });

    // Re-join customer room
    const currentCustomer = getActiveCustomerUuid();
    if (currentCustomer && socketInstance?.connected) {
      joinUserRoom(currentCustomer);
    }
  });

  socketInstance.on('disconnect', (reason) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Disconnected (reason: ${reason})`);
    }
    statusListeners.forEach((fn) => {
      try {
        fn(false);
      } catch {}
    });
  });

  socketInstance.on('connect_error', (error) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Socket.IO] Connection error:`, error.message);
    }
    statusListeners.forEach((fn) => {
      try {
        fn(false);
      } catch {}
    });
  });

  let lastEventSignature = '';
  let lastEventTimestamp = 0;

  // Universal handler for single trip real-time events
  const handleTripIncomingData = (rawPayload: any) => {
    const trip = normalizeRentalTrip(rawPayload);
    if (!trip || !trip.uuid) return;

    // Deduplicate rapid duplicate emits while preserving legitimate state/bid changes
    const driverSummary = Array.isArray(trip.drivers)
      ? trip.drivers
          .map(
            (d: any) =>
              `${d.driver_uuid || d.uuid || ''}:${d.bid_amount || d.counter_bid || ''}:${d.bid_status || d.status || ''}:${d.is_accepted ?? ''}`
          )
          .join('|')
      : '';
    const signature = `${trip.uuid}_${trip.trip_status}_${trip.offer_amount}_${driverSummary}_${trip.seen_driver_count ?? trip.seen_drivers?.length ?? 0}`;
    const now = Date.now();
    if (signature === lastEventSignature && now - lastEventTimestamp < 200) {
      return;
    }
    lastEventSignature = signature;
    lastEventTimestamp = now;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Real-time Trip Update received for ${trip.uuid}:`, {
        status: trip.trip_status,
        driversCount: trip.drivers?.length ?? 0,
        fare: trip.offer_amount,
      });
    }

    const tripUuidNorm = trip.uuid ? trip.uuid.trim().toLowerCase() : '';
    activeTripSubscriptions.forEach((listeners, subTripUuid) => {
      const subNorm = subTripUuid ? subTripUuid.trim().toLowerCase() : '';
      if (
        subNorm === tripUuidNorm ||
        subTripUuid === '*' ||
        !subTripUuid ||
        !tripUuidNorm || // If server event didn't include UUID, but client is subscribed to active trip
        activeTripSubscriptions.size === 1 // Only 1 active trip in current browser session
      ) {
        listeners.forEach((callback) => {
          try {
            callback(trip);
          } catch (err) {
            console.error('[Socket.IO] Error in trip subscription listener:', err);
          }
        });
      }
    });
  };

  // Primary event listeners
  socketInstance.on(SocketEvents.RENTAL_BID_TRIP_SINGLE, handleTripIncomingData);
  socketInstance.on(SocketEvents.TRIP_UPDATED, handleTripIncomingData);

  // Common backend event name aliases
  socketInstance.on('rental-bid-trip-single_for_customer', handleTripIncomingData);
  socketInstance.on('rental_bid_trip_single', handleTripIncomingData);
  socketInstance.on('rental-bid-trip-single', handleTripIncomingData);
  socketInstance.on('trip_update', handleTripIncomingData);
  socketInstance.on('trip_status', handleTripIncomingData);
  socketInstance.on('trip_status_changed', handleTripIncomingData);
  socketInstance.on('driver_bid', handleTripIncomingData);
  socketInstance.on('driver_bids', handleTripIncomingData);
  socketInstance.on('driver_accepted', handleTripIncomingData);
  socketInstance.on('bid_accepted', handleTripIncomingData);
  socketInstance.on('status_update', handleTripIncomingData);
  socketInstance.on('trip_cancelled', handleTripIncomingData);
  socketInstance.on('trip_completed', handleTripIncomingData);

  // Wildcard handler via Socket.IO v4 onAny: catches ANY server event carrying trip data
  socketInstance.onAny((eventName: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO onAny] Received event: "${eventName}"`, args);
    }
    for (const payload of args) {
      if (!payload || typeof payload !== 'object') continue;
      const tripCandidate = payload.data || payload.trip || payload.rental_trip || payload;
      if (
        tripCandidate &&
        typeof tripCandidate === 'object' &&
        (tripCandidate.uuid ||
          tripCandidate.rental_trip_uuid ||
          tripCandidate.trip_uuid ||
          tripCandidate.trip_status ||
          tripCandidate.status ||
          tripCandidate.ride_status)
      ) {
        handleTripIncomingData(payload);
        break;
      }
    }
  });

  return socketInstance;
}

/**
 * Emits room join events to join the trip room.
 * Handles both connected and pending connection states.
 */
export function joinTripRoom(tripUuid: string): void {
  if (!tripUuid || typeof window === 'undefined') return;
  const cleanTripUuid = tripUuid.trim();
  const socket = getTripSocket({ tripUuid: cleanTripUuid });
  if (!socket) return;

  const emitJoin = () => {
    socket.emit(SocketEvents.JOIN_TRIP, {
      trip_uuid: cleanTripUuid,
      room: `trip_${cleanTripUuid}`,
      room_name: `trip_${cleanTripUuid}`,
    });
    socket.emit('join_room', { room: `trip_${cleanTripUuid}`, trip_uuid: cleanTripUuid });
    socket.emit('join_room', { room: cleanTripUuid, trip_uuid: cleanTripUuid });
    socket.emit('join', `trip_${cleanTripUuid}`);
    socket.emit('join', cleanTripUuid);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Joined trip room: ${cleanTripUuid}`);
    }
  };

  if (socket.connected) {
    emitJoin();
  } else {
    socket.once('connect', emitJoin);
  }
}

/**
 * Emits 'leave_trip' event to exit the trip room
 */
export function leaveTripRoom(tripUuid: string): void {
  if (!tripUuid || typeof window === 'undefined') return;
  const cleanTripUuid = tripUuid.trim();
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(SocketEvents.LEAVE_TRIP, { trip_uuid: cleanTripUuid });
    socketInstance.emit('leave_room', { room: `trip_${cleanTripUuid}` });
    socketInstance.emit('leave_room', { room: cleanTripUuid });
    socketInstance.emit('leave', `trip_${cleanTripUuid}`);
    socketInstance.emit('leave', cleanTripUuid);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Left trip room: ${cleanTripUuid}`);
    }
  }
}

/**
 * Emits room join events to receive user-targeted events.
 * Handles both connected and pending connection states.
 */
export function joinUserRoom(userUuid: string): void {
  if (!userUuid || typeof window === 'undefined') return;
  const cleanUserUuid = userUuid.trim();
  const socket = getTripSocket({ userUuid: cleanUserUuid });
  if (!socket) return;

  const emitUserJoin = () => {
    socket.emit(SocketEvents.JOIN_USER, {
      user_uuid: cleanUserUuid,
      customer_uuid: cleanUserUuid,
      room: `user_${cleanUserUuid}`,
    });
    socket.emit('join_room', { room: `user_${cleanUserUuid}` });
    socket.emit('join_room', { room: `customer_${cleanUserUuid}` });
    socket.emit('join_room', { room: cleanUserUuid });
    socket.emit('join', `user_${cleanUserUuid}`);
    socket.emit('join', `customer_${cleanUserUuid}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Joined user room: ${cleanUserUuid}`);
    }
  };

  if (socket.connected) {
    emitUserJoin();
  } else {
    socket.once('connect', emitUserJoin);
  }
}

/**
 * Emits 'leave_user'
 */
export function leaveUserRoom(userUuid: string): void {
  if (!userUuid || typeof window === 'undefined') return;
  const cleanUserUuid = userUuid.trim();
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(SocketEvents.LEAVE_USER, { user_uuid: cleanUserUuid });
    socketInstance.emit('leave_room', { room: `user_${cleanUserUuid}` });
    socketInstance.emit('leave_room', { room: `customer_${cleanUserUuid}` });
    socketInstance.emit('leave', `user_${cleanUserUuid}`);
    socketInstance.emit('leave', `customer_${cleanUserUuid}`);
  }
}

/**
 * Subscribes to real-time driver bids and trip updates for a single trip.
 * Automatically joins the trip room and invokes callback on incoming data.
 *
 * @returns Cleanup function to unsubscribe and leave the room
 */
export function subscribeToRentalBidTripSingle(params: {
  tripUuid: string;
  customerUuid?: string;
  onTripUpdate: (trip: RentalTrip) => void;
  onStatusChange?: (connected: boolean) => void;
}): () => void {
  const { tripUuid, customerUuid, onTripUpdate, onStatusChange } = params;
  if (!tripUuid || typeof window === 'undefined') {
    return () => {};
  }

  const cleanTripUuid = tripUuid.trim();
  const socket = getTripSocket({ tripUuid: cleanTripUuid, userUuid: customerUuid });

  // Register status listener if provided
  if (onStatusChange) {
    statusListeners.add(onStatusChange);
    onStatusChange(Boolean(socket?.connected));
  }

  // Register trip subscriber
  if (!activeTripSubscriptions.has(cleanTripUuid)) {
    activeTripSubscriptions.set(cleanTripUuid, new Set());
  }
  activeTripSubscriptions.get(cleanTripUuid)!.add(onTripUpdate);

  // Join trip and customer rooms
  joinTripRoom(cleanTripUuid);
  if (customerUuid) {
    joinUserRoom(customerUuid);
  }

  // Return unsubscribe cleanup function
  return () => {
    if (onStatusChange) {
      statusListeners.delete(onStatusChange);
    }

    const listeners = activeTripSubscriptions.get(cleanTripUuid);
    if (listeners) {
      listeners.delete(onTripUpdate);
      if (listeners.size === 0) {
        activeTripSubscriptions.delete(cleanTripUuid);
        leaveTripRoom(cleanTripUuid);
      }
    }
  };
}

export const tripSocketService = {
  getSocket: getTripSocket,
  isConnected: isTripSocketConnected,
  joinTripRoom,
  leaveTripRoom,
  joinUserRoom,
  leaveUserRoom,
  subscribeToRentalBidTripSingle,
};

export default tripSocketService;
