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
  const transports: ('polling' | 'websocket')[] = ['polling', 'websocket'];

  // Initialize socket client
  socketInstance = io(socketTarget, {
    path: SOCKET_PATH,
    transports,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
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

    // Deduplicate event bursts (e.g. backend emitting to both trip and user rooms simultaneously)
    const signature = `${trip.uuid}_${trip.trip_status}_${trip.drivers?.length ?? 0}_${trip.offer_amount}_${trip.seen_driver_count ?? trip.seen_drivers?.length ?? 0}`;
    const now = Date.now();
    if (signature === lastEventSignature && now - lastEventTimestamp < 350) {
      return;
    }
    lastEventSignature = signature;
    lastEventTimestamp = now;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Received rental-bid-trip-single for trip: ${trip.uuid}`, {
        status: trip.trip_status,
        bidsCount: trip.drivers?.length ?? 0,
        seenCount: trip.seen_driver_count ?? trip.seen_drivers?.length ?? 0,
        fare: trip.offer_amount,
      });
    }

    const listeners = activeTripSubscriptions.get(trip.uuid);
    if (listeners && listeners.size > 0) {
      listeners.forEach((callback) => {
        try {
          callback(trip);
        } catch (err) {
          console.error('[Socket.IO] Error in trip subscription listener:', err);
        }
      });
    }
  };

  // Listen to both the specific route event and general trip update event
  socketInstance.on(SocketEvents.RENTAL_BID_TRIP_SINGLE, handleTripIncomingData);
  socketInstance.on(SocketEvents.TRIP_UPDATED, handleTripIncomingData);

  return socketInstance;
}

/**
 * Emits 'join_trip' event to join the room 'trip_<tripUuid>'
 */
export function joinTripRoom(tripUuid: string): void {
  if (!tripUuid || typeof window === 'undefined') return;
  const socket = getTripSocket({ tripUuid });
  if (socket && socket.connected) {
    socket.emit(SocketEvents.JOIN_TRIP, { trip_uuid: tripUuid.trim() });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Joined trip room: ${tripUuid}`);
    }
  }
}

/**
 * Emits 'leave_trip' event to exit the trip room
 */
export function leaveTripRoom(tripUuid: string): void {
  if (!tripUuid || typeof window === 'undefined') return;
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(SocketEvents.LEAVE_TRIP, { trip_uuid: tripUuid.trim() });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Left trip room: ${tripUuid}`);
    }
  }
}

/**
 * Emits 'join_user' to receive user-targeted events
 */
export function joinUserRoom(userUuid: string): void {
  if (!userUuid || typeof window === 'undefined') return;
  const socket = getTripSocket({ userUuid });
  if (socket && socket.connected) {
    socket.emit(SocketEvents.JOIN_USER, { user_uuid: userUuid.trim() });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Socket.IO] Joined user room: ${userUuid}`);
    }
  }
}

/**
 * Emits 'leave_user'
 */
export function leaveUserRoom(userUuid: string): void {
  if (!userUuid || typeof window === 'undefined') return;
  if (socketInstance && socketInstance.connected) {
    socketInstance.emit(SocketEvents.LEAVE_USER, { user_uuid: userUuid.trim() });
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
  joinTripRoom,
  leaveTripRoom,
  joinUserRoom,
  leaveUserRoom,
  subscribeToRentalBidTripSingle,
};

export default tripSocketService;
