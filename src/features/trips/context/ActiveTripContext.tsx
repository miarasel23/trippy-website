'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { RentalTrip } from '@/features/trips/types/customerApi';
import {
  customerTripService,
  getActiveCustomerUuid,
} from '@/features/trips/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { clearAllTripRelatedStorage, isTripReviewed } from '@/shared/utils/tripStorage';
import { subscribeToRentalBidTripSingle } from '@/features/trips/services/tripSocketService';

interface ActiveTripContextType {
  activeTrip: RentalTrip | null;
  bidsCount: number;
  isLoading: boolean;
  isOverlayVisible: boolean;
  isMinimized: boolean;
  isRadarModalOpen: boolean;
  isRadarOnPage: boolean;
  customerUuid: string;
  openRadarModal: () => void;
  closeRadarModal: () => void;
  setMinimized: (minimized: boolean) => void;
  dismissOverlay: () => void;
  showOverlay: () => void;
  setIsRadarOnPage: (active: boolean) => void;
  refreshActiveTrip: () => Promise<RentalTrip | null>;
  clearActiveTrip: () => void;
  setActiveTripManually: (trip: RentalTrip | null) => void;
}

const ActiveTripContext = createContext<ActiveTripContextType | undefined>(undefined);

/**
 * Compares two RentalTrip states.
 * Returns true ONLY IF:
 * - New data is found (new trip, new driver bid, fare changed, driver count increased, seen driver added, status changed)
 * - Any data was lost (trip deleted/completed, driver bid removed/withdrawn, count decreased)
 * Returns false if the data is semantically identical, PREVENTING any React re-renders.
 */
export function hasTripDataChanged(
  prev: RentalTrip | null,
  next: RentalTrip | null
): boolean {
  if (!prev && !next) return false;
  if (!prev && next) return true; // Found new trip!
  if (prev && !next) return true; // Lost trip!

  const p = prev!;
  const n = next!;

  if (p.uuid !== n.uuid) return true;
  if ((p.trip_status || '').toUpperCase() !== (n.trip_status || '').toUpperCase()) return true;
  if (Number(p.offer_amount || 0) !== Number(n.offer_amount || 0)) return true;
  if (p.accepted_bid_uuid !== n.accepted_bid_uuid) return true;
  if (n.created_at && p.created_at !== n.created_at) return true;
  if ((n as any).createdAt && (p as any).createdAt !== (n as any).createdAt) return true;
  if ((n as any).creation_date && (p as any).creation_date !== (n as any).creation_date) return true;

  const pTotalBids = p.total_bids ?? p.bid_summary?.total_bids ?? p.drivers?.length ?? 0;
  const nTotalBids = n.total_bids ?? n.bid_summary?.total_bids ?? n.drivers?.length ?? 0;
  if (pTotalBids !== nTotalBids) return true;

  const pSeenCount = p.seen_driver_count ?? p.seen_drivers?.length ?? 0;
  const nSeenCount = n.seen_driver_count ?? n.seen_drivers?.length ?? 0;
  if (pSeenCount !== nSeenCount) return true;

  const pDrivers = p.drivers || [];
  const nDrivers = n.drivers || [];
  if (pDrivers.length !== nDrivers.length) return true;

  for (let i = 0; i < nDrivers.length; i++) {
    const nd = nDrivers[i];
    const nId =
      nd.rent_bid_uuid ||
      nd.rentBidUuid ||
      nd.uuid ||
      nd.driver_uuid ||
      nd.driverUuid ||
      `driver-${i}`;
    const pd = pDrivers.find((d) => {
      const pId =
        d.rent_bid_uuid ||
        d.rentBidUuid ||
        d.uuid ||
        d.driver_uuid ||
        d.driverUuid ||
        '';
      return pId === nId;
    });

    if (!pd) return true; // New driver bid found!

    if (Number(pd.bid_amount || 0) !== Number(nd.bid_amount || 0)) return true;
    if (Number(pd.total_amount || 0) !== Number(nd.total_amount || 0)) return true;
    if (Number(pd.insurance_charge_amount || 0) !== Number(nd.insurance_charge_amount || 0)) return true;
    if (Number(pd.customer_discount_amount || 0) !== Number(nd.customer_discount_amount || 0)) return true;
    if (pd.bid_status !== nd.bid_status) return true;
    if (Number(pd.average_rating || 0) !== Number(nd.average_rating || 0)) return true;
    if ((pd.total_completed_trips || 0) !== (nd.total_completed_trips || 0)) return true;
    if ((pd.car_photos?.length || 0) !== (nd.car_photos?.length || 0)) return true;
    if ((pd.rating_list?.length || 0) !== (nd.rating_list?.length || 0)) return true;
    if (pd.car_reg_number !== nd.car_reg_number) return true;
  }

  const pSeen = p.seen_drivers || [];
  const nSeen = n.seen_drivers || [];
  if (pSeen.length !== nSeen.length) return true;
  for (let i = 0; i < nSeen.length; i++) {
    const ns = nSeen[i];
    const ps = pSeen.find((s) => s.driver_uuid === ns.driver_uuid);
    if (!ps) return true; // New seen driver found
  }

  return false;
}

export const ActiveTripProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { language } = useLanguage();
  const { user, token } = useAppSelector((state) => state.auth);

  const [activeTrip, setActiveTrip] = useState<RentalTrip | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached =
        sessionStorage.getItem('trippy_active_trip_cache') ||
        localStorage.getItem('trippy_active_trip_cache');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });

  useEffect(() => {
    if (activeTrip) {
      try {
        const json = JSON.stringify(activeTrip);
        sessionStorage.setItem('trippy_active_trip_cache', json);
        localStorage.setItem('trippy_active_trip_cache', json);
        const cTime =
          activeTrip.created_at ||
          (activeTrip as any).createdAt ||
          (activeTrip as any).creation_date ||
          (activeTrip as any).created_date;
        if (activeTrip.uuid && cTime) {
          localStorage.setItem(`trippy_trip_created_${activeTrip.uuid}`, cTime);
          sessionStorage.setItem(`trippy_trip_created_${activeTrip.uuid}`, cTime);
        }
      } catch {}
    } else {
      try {
        sessionStorage.removeItem('trippy_active_trip_cache');
        localStorage.removeItem('trippy_active_trip_cache');
      } catch {}
    }
  }, [activeTrip]);

  const [bidsCount, setBidsCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const cached =
        sessionStorage.getItem('trippy_active_trip_cache') ||
        localStorage.getItem('trippy_active_trip_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed?.drivers?.length ?? parsed?.total_bids ?? 0;
      }
    } catch {}
    return 0;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isRadarOnPage, setIsRadarOnPage] = useState<boolean>(false);

  // Stable reference to current activeTrip to prevent interval churn
  const activeTripRef = React.useRef<RentalTrip | null>(activeTrip);
  useEffect(() => {
    activeTripRef.current = activeTrip;
  }, [activeTrip]);

  // Memoized to avoid calling localStorage on every render
  const customerUuid = useMemo(
    () => user?.uuid || getActiveCustomerUuid(),
    [user]
  );

  /**
   * Refreshes active trip via /api/v1/rental-trip/rental-bid-trip-list_for_customer
   * ONLY updates React state and re-renders if new data is found or data is lost.
   */
  const refreshActiveTrip = useCallback(async (): Promise<RentalTrip | null> => {
    const effectiveToken =
      token || (typeof window !== 'undefined' ? localStorage.getItem('trippy_auth_token') : null);

    // Skip network request completely if not logged in to prevent 401 Unauthorized
    if (!effectiveToken || !customerUuid) {
      return null;
    }

    try {
      // 1. Query /api/v1/rental-trip/rental-bid-trip-list_for_customer
      const trips = await customerTripService.fetchBids(
        customerUuid,
        language,
        'REQUESTED',
        effectiveToken
      );

      let nextTrip: RentalTrip | null = null;
      if (trips && trips.length > 0) {
        const currentTargetUuid = activeTripRef.current?.uuid;
        const matched = currentTargetUuid
          ? trips.find((t) => t.uuid === currentTargetUuid)
          : null;
        nextTrip =
          matched ||
          trips.find((t) => (t.trip_status || '').toUpperCase() === 'REQUESTED') ||
          trips[0] ||
          null;

        if (nextTrip) {
          const status = (nextTrip.trip_status || '').toUpperCase();
          if (
            status === 'CANCELLED' ||
            status === 'CANCELED' ||
            status === 'TRIP_CANCELLED' ||
            status === 'COMPLETED' ||
            status === 'TRIP_COMPLETED' ||
            status === 'FINISHED' ||
            isTripReviewed(nextTrip, nextTrip.uuid)
          ) {
            nextTrip = null;
          }
        }
      }

      // If activeTrip exists but wasn't in REQUESTED list, check single trip endpoint
      if (!nextTrip && activeTripRef.current?.uuid) {
        const singleRes = await customerTripService.fetchSingleTripBids(
          customerUuid,
          activeTripRef.current.uuid,
          language,
          'ALL',
          effectiveToken
        );
        if (singleRes.status && singleRes.data) {
          const sTrip = singleRes.data;
          const status = (sTrip.trip_status || '').toUpperCase();
          if (
            status !== 'CANCELLED' &&
            status !== 'CANCELED' &&
            status !== 'TRIP_CANCELLED' &&
            status !== 'COMPLETED' &&
            status !== 'TRIP_COMPLETED' &&
            status !== 'FINISHED' &&
            !isTripReviewed(sTrip, sTrip.uuid)
          ) {
            nextTrip = sTrip;
          }
        }
      }

      // 2. ONLY re-render if new data is found OR data was lost
      if (nextTrip?.uuid) {
        const cTime =
          nextTrip.created_at ||
          (nextTrip as any).createdAt ||
          (nextTrip as any).creation_date ||
          (nextTrip as any).created_date;
        if (cTime && typeof window !== 'undefined') {
          try {
            localStorage.setItem(`trippy_trip_created_${nextTrip.uuid}`, cTime);
            sessionStorage.setItem(`trippy_trip_created_${nextTrip.uuid}`, cTime);
          } catch {}
        }
      }
      if (hasTripDataChanged(activeTripRef.current, nextTrip)) {
        setActiveTrip(nextTrip);
        if (nextTrip) {
          const count =
            nextTrip.drivers?.length ??
            nextTrip.total_bids ??
            (nextTrip as any).bid_summary?.total_bids ??
            0;
          setBidsCount(count);
        } else {
          setBidsCount(0);
        }
      }

      return nextTrip;
    } catch {
      return activeTripRef.current;
    }
  }, [customerUuid, language, token]);

  // ── Real-time Socket.IO Sync for Active Trip ──────────────────────────
  useEffect(() => {
    if (!activeTrip?.uuid || typeof window === 'undefined') return;

    const unsubscribe = subscribeToRentalBidTripSingle({
      tripUuid: activeTrip.uuid,
      customerUuid: customerUuid || undefined,
      onTripUpdate: (updatedTrip) => {
        if (hasTripDataChanged(activeTripRef.current, updatedTrip)) {
          setActiveTrip(updatedTrip);
          const count =
            updatedTrip.drivers?.length ??
            updatedTrip.total_bids ??
            (updatedTrip as any).bid_summary?.total_bids ??
            0;
          setBidsCount(count);
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, [activeTrip?.uuid, customerUuid]);

  // Initial load + gentle fallback check (60s if active trip is handled by Socket.IO, 25s if idle)
  useEffect(() => {
    let isMounted = true;
    const effectiveToken =
      token || (typeof window !== 'undefined' ? localStorage.getItem('trippy_auth_token') : null);

    // If not logged in, do not query or poll for customer active trips (prevents 401 Unauthorized)
    if (!effectiveToken || !customerUuid) {
      setIsLoading(false);
      return;
    }

    const check = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      await refreshActiveTrip();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    check();

    // Gentle polling interval: when an active trip is ongoing, Socket.IO provides real-time updates
    const intervalMs = activeTripRef.current ? 60000 : 25000;
    const interval = setInterval(() => {
      if (isMounted) {
        refreshActiveTrip();
      }
    }, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshActiveTrip, token, customerUuid]);

  const openRadarModal = useCallback(() => {
    setIsRadarModalOpen(true);
  }, []);

  const closeRadarModal = useCallback(() => {
    setIsRadarModalOpen(false);
  }, []);

  const dismissOverlay = useCallback(() => {
    setIsOverlayVisible(false);
  }, []);

  const showOverlay = useCallback(() => {
    setIsOverlayVisible(true);
    setIsMinimized(false);
  }, []);

  const clearActiveTrip = useCallback(() => {
    clearAllTripRelatedStorage();
    setActiveTrip(null);
    setBidsCount(0);
    setIsRadarModalOpen(false);
  }, []);

  const setActiveTripManually = useCallback((trip: RentalTrip | null) => {
    if (trip && isTripReviewed(trip, trip.uuid)) {
      clearAllTripRelatedStorage(trip.uuid);
      setActiveTrip(null);
      setBidsCount(0);
      setIsRadarModalOpen(false);
      return;
    }

    if (trip?.uuid) {
      const cTime =
        trip.created_at ||
        (trip as any).createdAt ||
        (trip as any).creation_date ||
        (trip as any).created_date ||
        activeTripRef.current?.created_at ||
        (activeTripRef.current as any)?.createdAt ||
        (typeof window !== 'undefined'
          ? localStorage.getItem(`trippy_trip_created_${trip.uuid}`) ||
            sessionStorage.getItem(`trippy_trip_created_${trip.uuid}`)
          : undefined);

      if (cTime) {
        trip.created_at = cTime;
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(`trippy_trip_created_${trip.uuid}`, cTime);
            sessionStorage.setItem(`trippy_trip_created_${trip.uuid}`, cTime);
          } catch {}
        }
      }
    }
    if (hasTripDataChanged(activeTripRef.current, trip)) {
      setActiveTrip(trip);
      if (trip) {
        setIsOverlayVisible(true);
        setIsMinimized(false);
        const count =
          trip.drivers?.length ??
          trip.total_bids ??
          (trip as any).bid_summary?.total_bids ??
          0;
        setBidsCount(count);
      } else {
        setBidsCount(0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ActiveTripContext.Provider
      value={{
        activeTrip,
        bidsCount,
        isLoading,
        isOverlayVisible,
        isMinimized,
        isRadarModalOpen,
        isRadarOnPage,
        customerUuid,
        openRadarModal,
        closeRadarModal,
        setMinimized: setIsMinimized,
        dismissOverlay,
        showOverlay,
        setIsRadarOnPage,
        refreshActiveTrip,
        clearActiveTrip,
        setActiveTripManually,
      }}
    >
      {children}
    </ActiveTripContext.Provider>
  );
};

export const useActiveTrip = (): ActiveTripContextType => {
  const context = useContext(ActiveTripContext);
  if (!context) {
    throw new Error('useActiveTrip must be used within an ActiveTripProvider');
  }
  return context;
};
