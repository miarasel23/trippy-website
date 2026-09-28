import { useEffect, useState, useRef } from 'react';
import { RentalTrip } from '@/features/trips/types/customerApi';
import {
  subscribeToRentalBidTripSingle,
  subscribeToRentalBidTripList,
  subscribeToDriverTrack,
  isTripSocketConnected,
  isTripSocketFailed,
  onSocketFailure,
} from '@/features/trips/services/tripSocketService';

export interface UseTripSocketParams {
  tripUuid?: string | null;
  customerUuid?: string | null;
  onTripUpdate: (trip: RentalTrip) => void;
  enabled?: boolean;
}

/**
 * React hook to bind Socket.IO real-time updates for `rental-bid-trip-single_for_customer`.
 *
 * Returns:
 *   isConnected  — WebSocket is currently live → Socket.IO handles all updates, zero polling.
 *   socketFailed — WebSocket permanently unavailable → component should use HTTP API polling.
 */
export function useTripSocket({
  tripUuid,
  customerUuid,
  onTripUpdate,
  enabled = true,
}: UseTripSocketParams) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isTripSocketConnected();
  });
  const [socketFailed, setSocketFailed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isTripSocketFailed();
  });
  const onTripUpdateRef = useRef(onTripUpdate);
  onTripUpdateRef.current = onTripUpdate;

  // Subscribe to Socket.IO real-time trip updates
  useEffect(() => {
    if (!enabled || !tripUuid) {
      setIsConnected(false);
      return;
    }

    const unsubscribe = subscribeToRentalBidTripSingle({
      tripUuid,
      customerUuid: customerUuid || undefined,
      onTripUpdate: (trip) => {
        onTripUpdateRef.current(trip);
      },
      onStatusChange: (status) => {
        setIsConnected(status);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [tripUuid, customerUuid, enabled]);

  // Track permanent WebSocket failure so component switches to HTTP API polling
  useEffect(() => {
    const removeListener = onSocketFailure((failed) => {
      setSocketFailed(failed);
      if (failed) setIsConnected(false);
    });
    return removeListener;
  }, []);

  return { isConnected, socketFailed };
}




export interface UseTripListSocketParams {
  customerUuid?: string | null;
  onTripListUpdate: (trips: RentalTrip[]) => void;
  enabled?: boolean;
}

export function useTripListSocket({
  customerUuid,
  onTripListUpdate,
  enabled = true,
}: UseTripListSocketParams) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isTripSocketConnected();
  });
  const [socketFailed, setSocketFailed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isTripSocketFailed();
  });
  const onTripListUpdateRef = useRef(onTripListUpdate);
  onTripListUpdateRef.current = onTripListUpdate;

  useEffect(() => {
    if (!enabled || !customerUuid) {
      setIsConnected(false);
      return;
    }

    const unsubscribe = subscribeToRentalBidTripList({
      customerUuid,
      onTripListUpdate: (trips) => {
        onTripListUpdateRef.current(trips);
      },
      onStatusChange: (status) => {
        setIsConnected(status);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [customerUuid, enabled]);

  // Track permanent WebSocket failure
  useEffect(() => {
    const removeListener = onSocketFailure((failed) => {
      setSocketFailed(failed);
      if (failed) setIsConnected(false);
    });
    return removeListener;
  }, []);

  return { isConnected, socketFailed };
}

export interface UseDriverTrackSocketParams {
  tripUuid?: string | null;
  customerUuid?: string | null;
  onTrackUpdate: (trackData: any) => void;
  enabled?: boolean;
}

export function useDriverTrackSocket({
  tripUuid,
  customerUuid,
  onTrackUpdate,
  enabled = true,
}: UseDriverTrackSocketParams) {
  const onTrackUpdateRef = useRef(onTrackUpdate);
  onTrackUpdateRef.current = onTrackUpdate;

  useEffect(() => {
    if (!enabled || (!tripUuid && !customerUuid)) {
      return;
    }

    const unsubscribe = subscribeToDriverTrack({
      tripUuid: tripUuid || undefined,
      customerUuid: customerUuid || undefined,
      onTrackUpdate: (data) => {
        onTrackUpdateRef.current(data);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [tripUuid, customerUuid, enabled]);
}

export default useTripSocket;
