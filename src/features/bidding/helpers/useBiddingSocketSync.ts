'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RentalDriverBid, RentalTrip } from '@/features/trips/types/customerApi';
import {
  customerTripService,
  getActiveCustomerUuid,
} from '@/features/trips/services/customerTripService';
import { clearAllTripRelatedStorage, isTripReviewed } from '@/shared/utils/tripStorage';
import { useTripSocket, useTripListSocket } from '@/features/trips/hooks/useTripSocket';
import { hasTripDataChanged } from '@/features/trips/context/ActiveTripContext';
import { useAppDispatch } from '@/store/hooks';
import { setTripCreatedAtOnce } from '@/features/trips/store/tripTimerSlice';
import {
  hasDriverBidsChanged,
  hasSeenDriversChanged,
  getPersistedCreatedAt,
} from './biddingFormatters';

export interface UseBiddingSocketSyncParams {
  currentTripUuid: string;
  customerUuid?: string;
  userUuid?: string;
  token?: string | null;
  language: string;
  isBn: boolean;
  isRideShare: boolean;
  activeTrip: RentalTrip | null;
  bids: RentalDriverBid[];
  seenDrivers: Array<{ driver_uuid?: string; name?: string; profile_picture?: string }>;
  seenDriverCount: number;
  proposedFare: number;
  tripCreatedAt?: string;
  setBids: (bids: RentalDriverBid[]) => void;
  setSeenDrivers: (drivers: Array<{ driver_uuid?: string; name?: string; profile_picture?: string }>) => void;
  setSeenDriverCount: (count: number) => void;
  setProposedFare: (fare: number) => void;
  setTripCreatedAt: (createdAt?: string) => void;
  setInternalServiceName: (name: string) => void;
  setInternalHoursBooked: (hours: string | number) => void;
  setCurrentTripUuid: (uuid: string) => void;
  setActiveTripManually: (trip: RentalTrip) => void;
  clearActiveTrip: () => void;
  onTripUuidUpdated?: (newUuid: string) => void;
  onCancelTrip: () => void;
  setCompletedTripForReview: (trip: RentalTrip) => void;
  setIsTripCompletedReviewOpen: (open: boolean) => void;
}

export interface UseBiddingSocketSyncReturn {
  isSocketConnected: boolean;
  isSocketFailed: boolean;
  isTerminalRef: React.MutableRefObject<boolean>;
  processTripUpdate: (trip: RentalTrip) => void;
}

/**
 * Custom hook to manage real-time WebSocket communication and resilient HTTP polling fallback.
 *
 * Architecture:
 * 1. Primary: Socket.IO events (`rental_bid_trip_single_for_customer`, `trip_updated`).
 * 2. Secondary (Fallback): If WebSocket drops or is offline, HTTP polling automatically takes over.
 * 3. Terminal Safety: Once a trip transitions to terminal states (Completed, Cancelled, Accepted),
 *    all sockets and polling safely cease.
 */
export function useBiddingSocketSync({
  currentTripUuid,
  customerUuid,
  userUuid,
  token,
  language,
  isBn,
  isRideShare,
  activeTrip,
  bids,
  seenDrivers,
  seenDriverCount,
  proposedFare,
  tripCreatedAt,
  setBids,
  setSeenDrivers,
  setSeenDriverCount,
  setProposedFare,
  setTripCreatedAt,
  setInternalServiceName,
  setInternalHoursBooked,
  setCurrentTripUuid,
  setActiveTripManually,
  clearActiveTrip,
  onTripUuidUpdated,
  onCancelTrip,
  setCompletedTripForReview,
  setIsTripCompletedReviewOpen,
}: UseBiddingSocketSyncParams): UseBiddingSocketSyncReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isTerminalRef = useRef<boolean>(false);

  // Synchronized refs to avoid stale closures in listeners
  const currentTripUuidRef = useRef(currentTripUuid);
  useEffect(() => { currentTripUuidRef.current = currentTripUuid; }, [currentTripUuid]);

  const activeTripRef = useRef(activeTrip);
  useEffect(() => { activeTripRef.current = activeTrip; }, [activeTrip]);

  const bidsRef = useRef(bids);
  useEffect(() => { bidsRef.current = bids; }, [bids]);

  const seenDriversRef = useRef(seenDrivers);
  useEffect(() => { seenDriversRef.current = seenDrivers; }, [seenDrivers]);

  const seenDriverCountRef = useRef(seenDriverCount);
  useEffect(() => { seenDriverCountRef.current = seenDriverCount; }, [seenDriverCount]);

  const proposedFareRef = useRef(proposedFare);
  useEffect(() => { proposedFareRef.current = proposedFare; }, [proposedFare]);

  const tripCreatedAtRef = useRef(tripCreatedAt);
  useEffect(() => { tripCreatedAtRef.current = tripCreatedAt; }, [tripCreatedAt]);

  const onTripUuidUpdatedRef = useRef(onTripUuidUpdated);
  useEffect(() => { onTripUuidUpdatedRef.current = onTripUuidUpdated; }, [onTripUuidUpdated]);

  const onCancelTripRef = useRef(onCancelTrip);
  useEffect(() => { onCancelTripRef.current = onCancelTrip; }, [onCancelTrip]);

  const setActiveTripManuallyRef = useRef(setActiveTripManually);
  useEffect(() => { setActiveTripManuallyRef.current = setActiveTripManually; }, [setActiveTripManually]);

  const clearActiveTripRef = useRef(clearActiveTrip);
  useEffect(() => { clearActiveTripRef.current = clearActiveTrip; }, [clearActiveTrip]);

  /**
   * Universal processor for trip updates coming from either Socket.IO or HTTP API
   */
  const processTripUpdate = useCallback(
    (trip: RentalTrip) => {
      if (!trip || isTerminalRef.current) return;

      const effectiveTrip =
        currentTripUuidRef.current ||
        activeTripRef.current?.uuid ||
        '';

      if (trip.uuid && trip.uuid !== currentTripUuidRef.current) {
        setCurrentTripUuid(trip.uuid);
        currentTripUuidRef.current = trip.uuid;
        if (onTripUuidUpdatedRef.current) {
          onTripUuidUpdatedRef.current(trip.uuid);
        }
      }

      // Sync and persist created_at timestamp
      const freshCreated =
        trip.created_at ||
        (trip as any).createdAt ||
        (trip as any).creation_date ||
        (trip as any).created_date ||
        (trip as any).rental_trip?.created_at ||
        tripCreatedAtRef.current ||
        getPersistedCreatedAt(trip.uuid) ||
        getPersistedCreatedAt(effectiveTrip);

      if (freshCreated) {
        if (!trip.created_at) {
          trip.created_at = freshCreated;
        }
        const uuidForTimer = trip.uuid || effectiveTrip;
        if (uuidForTimer) {
          dispatch(setTripCreatedAtOnce({ tripUuid: uuidForTimer, createdAt: freshCreated }));
        }
        if (!tripCreatedAtRef.current) {
          setTripCreatedAt(freshCreated);
        }
      }

      // Update service name & booked hours if changed
      const polledService =
        trip.service_name ||
        (trip as any).service_type ||
        (trip as any).servive_type ||
        trip.car_service?.service_name;
      if (polledService) {
        setInternalServiceName(polledService);
      }

      const polledHours =
        trip.hours_booked ||
        (trip as any).hours ||
        (trip as any).rental_duration;
      if (polledHours) {
        setInternalHoursBooked(polledHours);
      }

      // Update proposed fare if changed
      if (trip.offer_amount && trip.offer_amount !== proposedFareRef.current) {
        setProposedFare(trip.offer_amount);
      }

      // Update driver bids
      if (trip.drivers && Array.isArray(trip.drivers) && hasDriverBidsChanged(bidsRef.current, trip.drivers)) {
        setBids(trip.drivers);
      }

      // Update seen drivers
      if (trip.seen_drivers && Array.isArray(trip.seen_drivers) && hasSeenDriversChanged(seenDriversRef.current, trip.seen_drivers)) {
        setSeenDrivers(trip.seen_drivers);
      }

      const polledSeenCount =
        typeof trip.seen_driver_count === 'number'
          ? trip.seen_driver_count
          : (trip.seen_drivers?.length ?? 0);
      if (seenDriverCountRef.current !== polledSeenCount) {
        setSeenDriverCount(polledSeenCount);
      }

      // ── Handle Terminal Status Transitions ──
      const status = (trip.trip_status || '').toUpperCase();
      const isReviewDone = isTripReviewed(trip, effectiveTrip);

      // 1. Trip Completed
      if (status === 'COMPLETED' || status === 'TRIP_COMPLETED' || status === 'FINISHED') {
        isTerminalRef.current = true;
        clearAllTripRelatedStorage(trip.uuid || effectiveTrip);

        if (isReviewDone) {
          clearActiveTripRef.current();
          onCancelTripRef.current();
          return;
        }

        setCompletedTripForReview(trip);
        setIsTripCompletedReviewOpen(true);
        return;
      }

      // 2. Trip Cancelled
      if (status === 'CANCELLED' || status === 'CANCELED' || status === 'TRIP_CANCELLED') {
        isTerminalRef.current = true;
        clearAllTripRelatedStorage(trip.uuid || effectiveTrip);
        alert(isBn ? 'ট্রিপটি বাতিল করা হয়েছে।' : 'Trip has been cancelled.');
        onCancelTripRef.current();
        return;
      }

      // 3. Trip Accepted / In Progress -> Navigate to Tracking
      const isActiveRideStatus =
        status === 'ACCEPTED' ||
        status === 'BOOKED' ||
        status === 'ARRIVED_PICKUP_LOCATION' ||
        status === 'ON_THE_WAY' ||
        status === 'STARTED' ||
        status === 'RIDE_STARTED' ||
        status === 'IN_PROGRESS' ||
        status === 'INPROGRESS' ||
        status === 'FIRST_COMPLETED';

      if (isActiveRideStatus) {
        isTerminalRef.current = true;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('trippy_has_active_ride', 'true');
            localStorage.setItem('trippy_active_trip_cache', JSON.stringify(trip));
            sessionStorage.setItem('trippy_active_trip_cache', JSON.stringify(trip));
          } catch {}
        }
        setActiveTripManuallyRef.current(trip);
        const targetTripUuid = trip.uuid || effectiveTrip;
        const driverId =
          trip.accepted_driver?.driver_uuid ||
          (trip as any).driver_uuid ||
          (trip.drivers && trip.drivers[0]?.driver_uuid) ||
          '';
        const effectiveCust = trip.customer_uuid || (trip as any).customerUuid || '';
        router.push(
          `/tracking?trip_uuid=${targetTripUuid}${driverId ? `&driver_uuid=${driverId}` : ''}${
            effectiveCust ? `&customer_uuid=${effectiveCust}` : ''
          }`
        );
        return;
      }

      // Sync active trip context if data changed
      if (hasTripDataChanged(activeTripRef.current, trip)) {
        setActiveTripManuallyRef.current(trip);
      }
    },
    [dispatch, isBn, router, setCurrentTripUuid, setTripCreatedAt, setInternalServiceName, setInternalHoursBooked, setProposedFare, setBids, setSeenDrivers, setSeenDriverCount, setCompletedTripForReview, setIsTripCompletedReviewOpen]
  );

  const processTripUpdateRef = useRef(processTripUpdate);
  useEffect(() => { processTripUpdateRef.current = processTripUpdate; }, [processTripUpdate]);

  const effectiveActiveCustomerUuid =
    customerUuid ||
    activeTrip?.customer_uuid ||
    (activeTrip as any)?.customerUuid ||
    userUuid ||
    getActiveCustomerUuid();

  // ── Customer Trip List Socket Listener ──
  useTripListSocket({
    customerUuid: customerUuid,
    enabled: Boolean(customerUuid),
    onTripListUpdate: (updatedTrips) => {
      const currentActive =
        updatedTrips.find((t) => t.uuid === activeTripRef.current?.uuid) ||
        updatedTrips.find((t) => t.trip_status === 'REQUESTED') ||
        updatedTrips[0];
      if (currentActive) {
        processTripUpdateRef.current(currentActive);
      }
    },
  });

  // ── Single Trip Live Bids Socket Listener ──
  const { isConnected: isSocketConnected, socketFailed: isSocketFailed } = useTripSocket({
    tripUuid: currentTripUuid,
    customerUuid: effectiveActiveCustomerUuid,
    onTripUpdate: (trip) => {
      processTripUpdateRef.current(trip);
    },
    enabled: Boolean(currentTripUuid) && !isTerminalRef.current,
  });

  const hasFetchedInitialRef = useRef(false);

  // ── HTTP API Polling (Only active when WebSocket is disconnected) ──
  useEffect(() => {
    let isMounted = true;

    const pollBids = async () => {
      if (!isMounted || isTerminalRef.current) return;

      const effectiveCustomer =
        customerUuid ||
        activeTrip?.customer_uuid ||
        (activeTrip as any)?.customerUuid ||
        userUuid ||
        getActiveCustomerUuid();
      const effectiveTrip = currentTripUuidRef.current || activeTrip?.uuid || '';

      if (!effectiveCustomer) return;

      if (effectiveTrip) {
        const singleRes = await customerTripService.fetchSingleTripBids(
          effectiveCustomer,
          effectiveTrip,
          language,
          'ALL',
          token || undefined
        );

        if (!isMounted || isTerminalRef.current) return;

        if (singleRes.status && singleRes.data) {
          processTripUpdateRef.current(singleRes.data);
          return;
        }
      }

      // Fallback: list of requested trips if single trip had transient hiccup
      const trips: RentalTrip[] = await customerTripService.fetchBids(
        effectiveCustomer,
        language,
        'REQUESTED',
        token || undefined
      );

      if (!isMounted || isTerminalRef.current) return;

      if (trips && trips.length > 0) {
        const currentTrip = trips.find((t) => t.uuid === effectiveTrip) || trips[0];
        if (currentTrip && isMounted && !isTerminalRef.current) {
          processTripUpdateRef.current(currentTrip);
        }
      }
    };

    // Initial mount fetch to populate existing bids
    if (!hasFetchedInitialRef.current) {
      hasFetchedInitialRef.current = true;
      pollBids();
    }

    // Stop HTTP polling as long as WebSocket is active
    if (isSocketConnected) {
      return () => {
        isMounted = false;
      };
    }

    // Polling fallback every 5s for RideShare, 10s for other services
    const pollIntervalMs = isRideShare ? 5000 : 10000;
    const interval = setInterval(pollBids, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    customerUuid,
    userUuid,
    token,
    language,
    isRideShare,
    isSocketConnected,
    isSocketFailed,
    activeTrip?.uuid,
    activeTrip?.customer_uuid,
  ]);

  return {
    isSocketConnected,
    isSocketFailed,
    isTerminalRef,
    processTripUpdate,
  };
}
