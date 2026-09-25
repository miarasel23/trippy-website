import { useEffect, useState, useRef } from 'react';
import { RentalTrip } from '@/features/trips/types/customerApi';
import { subscribeToRentalBidTripSingle } from '@/features/trips/services/tripSocketService';

export interface UseTripSocketParams {
  tripUuid?: string | null;
  customerUuid?: string | null;
  onTripUpdate: (trip: RentalTrip) => void;
  enabled?: boolean;
}

/**
 * React hook to bind Socket.IO real-time updates for `rental-bid-trip-single_for_customer`.
 * Automatically manages room joining, re-connections, and cleanup on unmount or trip change.
 */
export function useTripSocket({
  tripUuid,
  customerUuid,
  onTripUpdate,
  enabled = true,
}: UseTripSocketParams) {
  const [isConnected, setIsConnected] = useState(false);
  const onTripUpdateRef = useRef(onTripUpdate);
  onTripUpdateRef.current = onTripUpdate;

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

  return { isConnected };
}

export default useTripSocket;
