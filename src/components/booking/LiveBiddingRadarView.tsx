'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RentalDriverBid, RentalTrip } from '@/types/customerApi';
import {
  customerTripService,
  getImageUrl,
  getActiveCustomerUuid,
  clearTripDataFromLocalStorage,
} from '@/services/customerTripService';
import { CarPhotoGalleryModal } from './CarPhotoGalleryModal';
import { RaiseOfferModal } from './RaiseOfferModal';
import { TripReviewModal } from './TripReviewModal';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveTrip, hasTripDataChanged } from '@/context/ActiveTripContext';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import {
  setTripCreatedAtOnce,
  forceTripCreatedAt,
} from '@/redux/features/tripTimerSlice';
import {
  formatTripServiceType,
  parseAsiaBangladeshTimestamp,
} from '@/utils/serviceFormat';
import {
  ArrowLeft,
  Clock,
  Star,
  Shield,
  Loader2,
  AlertCircle,
  Car,
  Image as ImageIcon,
  MapPin,
  Navigation,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  RotateCcw,
  MessageSquare,
  CheckCircle2,
  Phone,
} from 'lucide-react';

export function hasDriverBidsChanged(
  prev: RentalDriverBid[],
  next: RentalDriverBid[]
): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const nb = next[i];
    const nId =
      nb.rent_bid_uuid ||
      nb.rentBidUuid ||
      nb.uuid ||
      nb.driver_uuid ||
      nb.driverUuid ||
      `bid-${i}`;
    const pb = prev.find((b) => {
      const pId =
        b.rent_bid_uuid ||
        b.rentBidUuid ||
        b.uuid ||
        b.driver_uuid ||
        b.driverUuid ||
        '';
      return pId === nId;
    });
    if (!pb) return true;
    if (Number(pb.bid_amount || 0) !== Number(nb.bid_amount || 0)) return true;
    if (Number(pb.total_amount || 0) !== Number(nb.total_amount || 0)) return true;
    if (Number(pb.insurance_charge_amount || 0) !== Number(nb.insurance_charge_amount || 0)) return true;
    if (pb.bid_status !== nb.bid_status) return true;
    if (Number(pb.average_rating || 0) !== Number(nb.average_rating || 0)) return true;
    if ((pb.rating_list?.length || 0) !== (nb.rating_list?.length || 0)) return true;
    if ((pb.car_photos?.length || 0) !== (nb.car_photos?.length || 0)) return true;
  }
  return false;
}

export function hasSeenDriversChanged(
  prev: Array<{ driver_uuid?: string; name?: string; profile_picture?: string }>,
  next: Array<{ driver_uuid?: string; name?: string; profile_picture?: string }>
): boolean {
  if (prev.length !== next.length) return true;
  for (let i = 0; i < next.length; i++) {
    const nd = next[i];
    const pd = prev.find((d) => d.driver_uuid === nd.driver_uuid);
    if (!pd) return true;
  }
  return false;
}

interface LiveBiddingRadarViewProps {
  tripUuid: string;
  customerUuid: string;
  serviceName?: string;
  proposedFare: number;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleName: string;
  hoursBooked?: string;
  note?: string;
  createdAt?: string;
  initialBids?: RentalDriverBid[];
  isModal?: boolean;
  onTripUuidUpdated?: (newUuid: string) => void;
  onCancelTrip: () => void;
}

export const LiveBiddingRadarView: React.FC<LiveBiddingRadarViewProps> = ({
  tripUuid,
  customerUuid,
  serviceName = 'INTER_CITY_RENTER',
  proposedFare: initialProposedFare,
  pickupAddress,
  dropoffAddress,
  vehicleName,
  hoursBooked,
  note,
  createdAt: initialCreatedAt,
  initialBids,
  isModal = false,
  onTripUuidUpdated,
  onCancelTrip,
}) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { user, token } = useAppSelector((state) => state.auth);
  const { setIsRadarOnPage, activeTrip, setActiveTripManually, dismissOverlay } = useActiveTrip();

  // Dynamic active trip UUID state: when offer amount is updated, backend creates a new trip
  const [currentTripUuid, setCurrentTripUuid] = useState<string>(tripUuid);
  const currentTripUuidRef = useRef<string>(tripUuid);

  // Dynamic service name and hours booked state
  const [internalServiceName, setInternalServiceName] = useState<string>(serviceName);
  const [internalHoursBooked, setInternalHoursBooked] = useState<string | number | undefined>(hoursBooked);

  useEffect(() => {
    if (serviceName) setInternalServiceName(serviceName);
  }, [serviceName]);

  useEffect(() => {
    if (hoursBooked) setInternalHoursBooked(hoursBooked);
  }, [hoursBooked]);

  useEffect(() => {
    if (tripUuid && tripUuid !== currentTripUuidRef.current) {
      setCurrentTripUuid(tripUuid);
      currentTripUuidRef.current = tripUuid;
    }
  }, [tripUuid]);

  useEffect(() => {
    currentTripUuidRef.current = currentTripUuid;
  }, [currentTripUuid]);

  useEffect(() => {
    if (!isModal && setIsRadarOnPage) {
      setIsRadarOnPage(true);
      return () => {
        setIsRadarOnPage(false);
      };
    }
  }, [isModal, setIsRadarOnPage]);

  const [proposedFare, setProposedFare] = useState<number>(initialProposedFare);
  const [bids, setBids] = useState<RentalDriverBid[]>(() => {
    if (initialBids && initialBids.length > 0) return initialBids;
    if (activeTrip?.drivers && activeTrip.drivers.length > 0) return activeTrip.drivers;
    return [];
  });
  const [seenDrivers, setSeenDrivers] = useState<
    Array<{
      driver_uuid?: string;
      name?: string;
      profile_picture?: string;
      created_at?: string;
    }>
  >(activeTrip?.seen_drivers || []);
  const [seenDriverCount, setSeenDriverCount] = useState<number>(
    activeTrip?.seen_driver_count ?? (activeTrip?.seen_drivers?.length || 0)
  );

  // Stable references to prevent unnecessary re-render loops
  const bidsRef = useRef<RentalDriverBid[]>(bids);
  const seenDriversRef = useRef(seenDrivers);
  const seenDriverCountRef = useRef(seenDriverCount);

  useEffect(() => {
    bidsRef.current = bids;
  }, [bids]);

  useEffect(() => {
    seenDriversRef.current = seenDrivers;
  }, [seenDrivers]);

  useEffect(() => {
    seenDriverCountRef.current = seenDriverCount;
  }, [seenDriverCount]);

  // Sync with activeTrip from context whenever it updates (only if new data found or lost)
  useEffect(() => {
    if (
      activeTrip?.drivers &&
      Array.isArray(activeTrip.drivers) &&
      hasDriverBidsChanged(bidsRef.current, activeTrip.drivers)
    ) {
      setBids(activeTrip.drivers);
    }
    const newSeen = Array.isArray(activeTrip?.seen_drivers) ? activeTrip.seen_drivers : [];
    if (hasSeenDriversChanged(seenDriversRef.current, newSeen)) {
      setSeenDrivers(newSeen);
    }
    const newSeenCount =
      typeof activeTrip?.seen_driver_count === 'number'
        ? activeTrip.seen_driver_count
        : (activeTrip?.seen_drivers?.length ?? 0);
    if (seenDriverCountRef.current !== newSeenCount) {
      setSeenDriverCount(newSeenCount);
    }
    const tripOffer = Number(activeTrip?.offer_amount || (activeTrip as any)?.offer_ammount || 0);
    if (tripOffer > 0 && tripOffer !== proposedFare) {
      setProposedFare(tripOffer);
      setBottomOfferPrice(tripOffer);
    }
  }, [
    activeTrip?.drivers,
    activeTrip?.seen_drivers,
    activeTrip?.seen_driver_count,
    activeTrip?.offer_amount,
    (activeTrip as any)?.offer_ammount,
  ]);

  // Sync with initialBids prop if passed (only if bids changed)
  useEffect(() => {
    if (
      initialBids &&
      Array.isArray(initialBids) &&
      hasDriverBidsChanged(bidsRef.current, initialBids)
    ) {
      setBids(initialBids);
    }
  }, [initialBids]);

  const [hiddenBidUuids, setHiddenBidUuids] = useState<Set<string>>(new Set());
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isCancellingTrip, setIsCancellingTrip] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');

  // Photo Gallery Modal state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryCarName, setGalleryCarName] = useState<string>('');
  const [galleryRegNumber, setGalleryRegNumber] = useState<string>('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Driver Reviews Modal state
  const [reviewsModalBid, setReviewsModalBid] = useState<RentalDriverBid | null>(null);

  // Completed Trip Review Modal state
  const [completedTripForReview, setCompletedTripForReview] = useState<RentalTrip | null>(null);
  const [isTripCompletedReviewOpen, setIsTripCompletedReviewOpen] = useState(false);

  // Raise Offer Modal state
  const [isRaiseOfferOpen, setIsRaiseOfferOpen] = useState(false);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [hasPromptedExpired, setHasPromptedExpired] = useState(false);

  // Accept Confirmation Dialog state
  const [bidToAccept, setBidToAccept] = useState<RentalDriverBid | null>(null);

  // Drawer expansion state
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  const dispatch = useAppDispatch();

  // Trip created timestamp (tracks server created_at)
  // Read from Redux first so polling can never overwrite an already-stored value.
  // Try every possible UUID key so the selector stays populated even when currentTripUuid state lags.
  const reduxCreatedAt = useAppSelector(
    (state) => {
      const map = (state as any).tripTimer?.createdAtByTripUuid ?? {};
      return (
        map[currentTripUuidRef.current || ''] ||
        map[currentTripUuid || ''] ||
        map[tripUuid || ''] ||
        map[activeTrip?.uuid || ''] ||
        undefined
      ) as string | undefined;
    }
  );

  const [tripCreatedAt, setTripCreatedAt] = useState<string | undefined>(
    reduxCreatedAt ||
    activeTrip?.created_at ||
    (activeTrip as any)?.createdAt ||
    (activeTrip as any)?.creation_date ||
    initialCreatedAt
  );

  // Sync with activeTrip.created_at when context updates from server
  // But only update local state if Redux doesn't already have a stable value
  useEffect(() => {
    const serverDate =
      activeTrip?.created_at ||
      (activeTrip as any)?.createdAt ||
      (activeTrip as any)?.creation_date;
    const uuid = currentTripUuid || tripUuid || activeTrip?.uuid;
    if (serverDate && uuid) {
      // Dispatch write-once to Redux — won't overwrite if already set
      dispatch(setTripCreatedAtOnce({ tripUuid: uuid, createdAt: serverDate }));
      // Update local state only if we don't already have a value
      if (!tripCreatedAt) {
        setTripCreatedAt(serverDate);
      }
    } else if (!tripCreatedAt && initialCreatedAt) {
      setTripCreatedAt(initialCreatedAt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrip?.created_at, (activeTrip as any)?.createdAt, (activeTrip as any)?.creation_date, initialCreatedAt]);

  const [bottomOfferPrice, setBottomOfferPrice] = useState<number>(initialProposedFare);
  const [isUpdatingBottomOffer, setIsUpdatingBottomOffer] = useState(false);

  useEffect(() => {
    setBottomOfferPrice(proposedFare);
  }, [proposedFare]);

  const formatFare = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    const formatted = Math.round(num).toLocaleString('en-IN');
    return isBn ? `৳ ${toBanglaDigits(formatted)}` : `BDT ${formatted}`;
  };

  const serviceInfo = formatTripServiceType(
    internalServiceName,
    internalHoursBooked,
    language
  );
  const isRideShare = serviceInfo.isRideShare;

  // ── 1. Finding Driver Countdown Timer ────────────────────────────────────
  // RIDE_SHARE = 2 minutes (120s), all other services = 1 hour (3600s)
  // maxTimerSecondsRaw is derived from service type on each render
  const maxTimerSecondsRaw = isRideShare ? 2 * 60 : 1 * 3600;

  // Stable persistent start timestamp for this trip countdown session
  const tripKeyRef = useRef<string>('');

  const effectiveTripKey =
    currentTripUuidRef.current ||
    currentTripUuid ||
    tripUuid ||
    activeTrip?.uuid ||
    '';

  // Helper to retrieve persisted creation timestamp by trip UUID
  const getPersistedCreatedAt = (uuid?: string): string | undefined => {
    if (!uuid || typeof window === 'undefined') return undefined;
    try {
      return (
        localStorage.getItem(`trippy_trip_created_${uuid}`) ||
        sessionStorage.getItem(`trippy_trip_created_${uuid}`) ||
        undefined
      );
    } catch {
      return undefined;
    }
  };

  // Effective creation timestamp: prefer Redux (immutable across polling), then local state, then props, then cache
  const effectiveCreatedAt =
    reduxCreatedAt ||
    tripCreatedAt ||
    activeTrip?.created_at ||
    (activeTrip as any)?.createdAt ||
    (activeTrip as any)?.creation_date ||
    (activeTrip as any)?.created_date ||
    initialCreatedAt ||
    getPersistedCreatedAt(effectiveTripKey);

  // Persist effectiveCreatedAt whenever available
  useEffect(() => {
    if (effectiveCreatedAt && effectiveTripKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`trippy_trip_created_${effectiveTripKey}`, effectiveCreatedAt);
        sessionStorage.setItem(`trippy_trip_created_${effectiveTripKey}`, effectiveCreatedAt);
      } catch { }
    }
  }, [effectiveCreatedAt, effectiveTripKey]);

  const startTsRef = useRef<number>(0);

  // ── Timer Lock ──────────────────────────────────────────────────────────
  // Once the countdown has started (startTsRef is set to a valid past timestamp),
  // timerLockedRef = true prevents ANY subsequent code from resetting startTsRef.
  // This is the single source of truth that makes the timer immune to:
  //   • trip UUID changes (raise-fare creates a new trip)
  //   • polling responses (each /rental-bid-trip-list returns new created_at)
  //   • ActiveTripContext updates (setActiveTripManually changes activeTrip)
  const timerLockedRef = useRef<boolean>(false);

  // Lock maxTimerSeconds in a ref so polling cannot reset the timer:
  // Once startTsRef is set (countdown running), maxTimerSeconds is frozen.
  const maxTimerSecondsRef = useRef<number>(maxTimerSecondsRaw);
  if (maxTimerSecondsRef.current !== maxTimerSecondsRaw && !timerLockedRef.current) {
    maxTimerSecondsRef.current = maxTimerSecondsRaw;
  }
  const maxTimerSeconds = maxTimerSecondsRef.current;

  // Safe start timestamp computation: preserves true elapsed time from created_at in Asia/Dhaka time
  const computeSafeStartTs = useCallback(
    (dateStr?: string | null): number => {
      if (!dateStr) {
        const persisted = getPersistedCreatedAt(effectiveTripKey);
        if (persisted) {
          const rawTs = parseAsiaBangladeshTimestamp(persisted);
          return Math.min(Date.now(), rawTs);
        }
        return startTsRef.current && startTsRef.current < Date.now()
          ? startTsRef.current
          : Date.now();
      }
      const rawTs = parseAsiaBangladeshTimestamp(dateStr);
      const now = Date.now();
      return Math.min(now, rawTs);
    },
    [effectiveTripKey]
  );

  const [cycleStartTs, setCycleStartTs] = useState<number>(() => {
    const initialTs = computeSafeStartTs(effectiveCreatedAt);
    startTsRef.current = initialTs;
    // Lock immediately if we got a real past timestamp from created_at
    if (initialTs < Date.now()) {
      timerLockedRef.current = true;
    }
    return initialTs;
  });

  // Initialize start timestamp ONCE — only if timer is not yet locked.
  // When tripKeyRef changes (new UUID from raise-fare), we do NOT reset the timer.
  if (!tripKeyRef.current || (effectiveTripKey && tripKeyRef.current !== effectiveTripKey)) {
    tripKeyRef.current = effectiveTripKey;
    if (!timerLockedRef.current) {
      const safeTs = computeSafeStartTs(effectiveCreatedAt);
      if (safeTs < Date.now() || !startTsRef.current) {
        startTsRef.current = safeTs;
        timerLockedRef.current = true;
      }
    }
    // If already locked: UUID changed (raise-fare new trip) but timer keeps running — do nothing.
  } else if (!timerLockedRef.current && effectiveCreatedAt) {
    const safeTs = computeSafeStartTs(effectiveCreatedAt);
    if (safeTs < Date.now() && safeTs !== startTsRef.current) {
      startTsRef.current = safeTs;
      timerLockedRef.current = true;
    }
  }

  // Sync cycle start ONLY on very first load (when timer is not yet locked).
  // After lock: effectiveCreatedAt changes from polling/offer-updates are IGNORED.
  useEffect(() => {
    if (!effectiveCreatedAt) return;
    // If already locked, do NOT allow any timestamp updates from polling or API responses
    if (timerLockedRef.current) return;
    const parsed = parseAsiaBangladeshTimestamp(effectiveCreatedAt);
    const currentTs = startTsRef.current;
    if (!currentTs || Math.abs(parsed - currentTs) > 2000) {
      startTsRef.current = parsed;
      timerLockedRef.current = true;
      setCycleStartTs(parsed);
      const elapsedMs = Math.max(0, Date.now() - parsed);
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const maxSecs = maxTimerSecondsRef.current;
      setRemainingSeconds(Math.max(0, maxSecs - elapsedSecs));
      setTopProgressPct(Math.min(100, Math.max(0, (elapsedMs / (maxSecs * 1000)) * 100)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveCreatedAt]);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const now = Date.now();
    const start = computeSafeStartTs(effectiveCreatedAt);
    const elapsedSecs = Math.max(0, Math.floor((now - start) / 1000));
    return Math.max(0, maxTimerSeconds - elapsedSecs);
  });

  const [topProgressPct, setTopProgressPct] = useState<number>(() => {
    const now = Date.now();
    const start = computeSafeStartTs(effectiveCreatedAt);
    const elapsedMs = Math.max(0, now - start);
    return Math.min(100, Math.max(0, (elapsedMs / (maxTimerSeconds * 1000)) * 100));
  });

  const restartCountdown = useCallback(() => {
    const now = Date.now();
    startTsRef.current = now;
    timerLockedRef.current = true; // re-lock at new timestamp (intentional restart only)
    setCycleStartTs(now);
    setRemainingSeconds(maxTimerSeconds);
    setTopProgressPct(0);
    setIsTimerExpired(false);
    setHasPromptedExpired(false);
  }, [maxTimerSeconds]);

  /**
   * Reset countdown anchored to a specific created_at string from the server.
   * Used after a successful raise-fare API call: the backend creates a NEW trip
   * with a new created_at. We compute how many seconds have already elapsed from
   * that new created_at and show the correct remaining time.
   *
   * Example: created_at = 30s ago, maxTimer = 120s → remaining = 90s displayed.
   *
   * This is intentional and does NOT conflict with the polling guard (timerLockedRef)
   * because this function explicitly re-locks after setting the new anchor.
   */
  const resetCountdownFromCreatedAt = useCallback((createdAtStr: string) => {
    const parsed = parseAsiaBangladeshTimestamp(createdAtStr);
    const now = Date.now();
    const maxSecs = maxTimerSecondsRef.current;
    const elapsedMs = Math.max(0, now - parsed);
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, maxSecs - elapsedSecs);
    const pct = Math.min(100, Math.max(0, (elapsedMs / (maxSecs * 1000)) * 100));

    // Temporarily unlock so we can update the anchor, then re-lock immediately
    timerLockedRef.current = false;
    startTsRef.current = parsed;
    timerLockedRef.current = true; // re-lock — polling cannot touch this anymore
    setCycleStartTs(parsed);
    setRemainingSeconds(remaining);
    setTopProgressPct(pct);
    setIsTimerExpired(remaining <= 0);
    setHasPromptedExpired(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decrement second by second smoothly: 01:00:00 -> 00:59:59 -> 00:59:58...
  // Uses startTsRef (stable ref, never reset by polling) for correct elapsed calculation
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const maxSecs = maxTimerSecondsRef.current;
      const elapsedMs = Math.max(0, now - startTsRef.current);
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const remSecs = Math.max(0, maxSecs - elapsedSecs);
      const totalMs = maxSecs * 1000;
      const pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

      setRemainingSeconds(remSecs);
      setTopProgressPct(pct);

      if (remSecs <= 0) {
        setIsTimerExpired(true);
      } else {
        setIsTimerExpired(false);
      }
    };

    check();
    const interval = setInterval(check, 100);
    return () => clearInterval(interval);
    // Run once on mount — reads from refs, so no dependency needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format HH:MM:SS (e.g. 01:00:00 -> 00:59:59) or MM:SS (e.g. 02:00 -> 01:59)
  // Uses locked maxTimerSeconds ref to ensure format doesn't change during polling
  const formatCountdown = () => {
    const maxSecs = maxTimerSecondsRef.current;
    const showHours = maxSecs >= 3600;
    if (remainingSeconds <= 0) {
      const zeroStr = showHours ? '00:00:00' : '00:00';
      return isBn ? toBanglaDigits(zeroStr) : zeroStr;
    }
    const hours = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(mins).padStart(2, '0');
    const sStr = String(secs).padStart(2, '0');

    const timeStr = showHours || hours > 0
      ? `${hStr}:${mStr}:${sStr}`
      : `${mStr}:${sStr}`;

    return isBn ? toBanglaDigits(timeStr) : timeStr;
  };

  const handleBottomDecrement = () => {
    if (bottomOfferPrice > 10) {
      setBottomOfferPrice((prev) => Math.max(10, prev - 10));
    }
  };

  const handleBottomIncrement = () => {
    setBottomOfferPrice((prev) => prev + 10);
  };

  const [offerUpdatedNotice, setOfferUpdatedNotice] = useState<boolean>(false);

  const handleBottomRaiseFare = async () => {
    setIsUpdatingBottomOffer(true);
    const targetOldTripUuid =
      currentTripUuidRef.current ||
      currentTripUuid ||
      activeTrip?.uuid ||
      tripUuid ||
      (bids[0] as any)?.trip_uuid ||
      (bids[0] as any)?.rental_trip_uuid ||
      '';
    const effectiveCustomerUuid =
      customerUuid ||
      activeTrip?.customer_uuid ||
      (activeTrip as any)?.customerUuid ||
      user?.uuid ||
      getActiveCustomerUuid();

    // 1. Remove all old trip and date data from local storage
    clearTripDataFromLocalStorage();

    // 2. Calls /v1/rental-trip/update-trip-offer-amount with the current trip ID
    const res = await customerTripService.updateOfferAmount(
      effectiveCustomerUuid,
      targetOldTripUuid,
      bottomOfferPrice,
      language,
      token || undefined
    );

    // 3. Extract the NEW trip UUID from the successful API response
    let newTripUuid = '';
    if (res && res.status !== false) {
      if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data) && res.data.length > 0) {
          newTripUuid = res.data[0]?.uuid || res.data[0]?.trip_uuid || '';
        } else {
          newTripUuid = res.data.uuid || res.data.trip_uuid || res.data.rental_trip_uuid || '';
        }
      }
      if (!newTripUuid) {
        newTripUuid = (res as any).uuid || (res as any).trip_uuid || '';
      }
    }

    const effectiveNewTripUuid = newTripUuid || targetOldTripUuid;

    // 4. Update trip UUID references so subsequent calls, polling, and modals use the new trip ID
    setCurrentTripUuid(effectiveNewTripUuid);
    currentTripUuidRef.current = effectiveNewTripUuid;
    if (onTripUuidUpdated && newTripUuid) {
      onTripUuidUpdated(effectiveNewTripUuid);
    }

    // 5. Clean old trip data (reset old bids and seen drivers because old trip is deleted by backend)
    setBids([]);
    setSeenDrivers([]);
    setHiddenBidUuids(new Set());

    // 6. Immediately show edit data
    setProposedFare(bottomOfferPrice);
    setBottomOfferPrice(bottomOfferPrice);
    setOfferUpdatedNotice(true);
    setTimeout(() => setOfferUpdatedNotice(false), 4000);

    // 7. Call /v1/rental-trip/rental-bid-trip-single_for_customer with NEW trip ID
    if (effectiveNewTripUuid) {
      try {
        const singleRes = await customerTripService.fetchSingleTripBids(
          effectiveCustomerUuid,
          effectiveNewTripUuid,
          language,
          'ALL',
          token || undefined
        );
        if (singleRes.status && singleRes.data) {
          const trip = singleRes.data;
          const freshFare = Number(
            trip.offer_amount || (trip as any).offer_ammount || bottomOfferPrice
          );
          setProposedFare(freshFare);
          setBottomOfferPrice(freshFare);
          if (trip.created_at) {
            // Write-once to Redux (immutable — polling will not overwrite once set)
            dispatch(setTripCreatedAtOnce({ tripUuid: effectiveNewTripUuid, createdAt: trip.created_at }));
            // Update local tripCreatedAt so future renders use the new trip's timestamp
            setTripCreatedAt(trip.created_at);
            // ✓ Reset timer anchored to new trip's created_at:
            // Calculates elapsed seconds from created_at→now and shows remaining time.
            // timerLockedRef blocks all polling from touching startTsRef after this.
            resetCountdownFromCreatedAt(trip.created_at);
          } else {
            // No created_at from server — fallback: reset to full duration from now
            restartCountdown();
          }
          if (trip.drivers && Array.isArray(trip.drivers)) {
            setBids(trip.drivers);
          }
          if (trip.seen_drivers && Array.isArray(trip.seen_drivers)) {
            setSeenDrivers(trip.seen_drivers);
          }
          const freshSeenCount =
            typeof trip.seen_driver_count === 'number'
              ? trip.seen_driver_count
              : (trip.seen_drivers?.length ?? 0);
          setSeenDriverCount(freshSeenCount);
          setActiveTripManually(trip);
        } else {
          setActiveTripManually({
            uuid: effectiveNewTripUuid,
            customer_uuid: effectiveCustomerUuid,
            service_name: serviceName,
            offer_amount: bottomOfferPrice,
            trip_status: 'REQUESTED',
            pickup_locations: [{ address: pickupAddress }],
            dropoff_locations: [{ address: dropoffAddress }],
            drivers: [],
            created_at: new Date().toISOString(),
          } as any);
          // Fallback: no created_at available, reset timer from now
          restartCountdown();
        }
      } catch {}
    }

    setIsUpdatingBottomOffer(false);
    // NOTE: Do NOT restart countdown here — the main timer must run continuously
    // from the original trip creation time, unaffected by offer updates.
  };

  // ── 2. Poll Driver Bids via /v1/rental-trip/rental-bid-trip-single_for_customer Every 5s until completed or cancelled ──
  useEffect(() => {
    let isMounted = true;
    let isTerminal = false;

    const pollBids = async () => {
      if (!isMounted || isTerminal) return;

      const effectiveCustomer =
        customerUuid ||
        activeTrip?.customer_uuid ||
        (activeTrip as any)?.customerUuid ||
        user?.uuid ||
        getActiveCustomerUuid();
      const effectiveTrip =
        currentTripUuidRef.current ||
        currentTripUuid ||
        tripUuid ||
        activeTrip?.uuid ||
        (bids[0] as any)?.trip_uuid ||
        (bids[0] as any)?.rental_trip_uuid ||
        '';

      if (!effectiveCustomer) return;

      // 1. Call /v1/rental-trip/rental-bid-trip-single_for_customer with trip_status=ALL
      if (effectiveTrip) {
        const singleRes = await customerTripService.fetchSingleTripBids(
          effectiveCustomer,
          effectiveTrip,
          language,
          'ALL',
          token || undefined
        );

        if (!isMounted || isTerminal) return;

        if (singleRes.status && singleRes.data) {
          const trip = singleRes.data;

          if (trip.uuid && trip.uuid !== currentTripUuidRef.current) {
            setCurrentTripUuid(trip.uuid);
            currentTripUuidRef.current = trip.uuid;
            if (onTripUuidUpdated) {
              onTripUuidUpdated(trip.uuid);
            }
          }

          const freshCreated =
            trip.created_at ||
            (trip as any).createdAt ||
            (trip as any).creation_date ||
            (trip as any).created_date ||
            (trip as any).rental_trip?.created_at ||
            tripCreatedAt ||
            getPersistedCreatedAt(trip.uuid) ||
            getPersistedCreatedAt(effectiveTrip);

          if (freshCreated) {
            if (!trip.created_at) {
              trip.created_at = freshCreated;
            }
            // Write-once to Redux: polling will not overwrite once set
            const uuidForTimer = trip.uuid || effectiveTrip;
            if (uuidForTimer) {
              dispatch(setTripCreatedAtOnce({ tripUuid: uuidForTimer, createdAt: freshCreated }));
            }
            // Only update local React state if not already set (Redux is authoritative)
            if (!tripCreatedAt) {
              setTripCreatedAt(freshCreated);
            }
          }
          const polledService =
            trip.service_name ||
            (trip as any).service_type ||
            (trip as any).servive_type ||
            trip.car_service?.service_name;
          if (polledService && polledService !== internalServiceName) {
            setInternalServiceName(polledService);
          }
          const polledHours =
            trip.hours_booked ||
            (trip as any).hours ||
            (trip as any).rental_duration;
          if (polledHours && polledHours !== internalHoursBooked) {
            setInternalHoursBooked(polledHours);
          }
          if (trip.offer_amount && trip.offer_amount !== proposedFare) {
            setProposedFare(trip.offer_amount);
          }
          if (trip.drivers && Array.isArray(trip.drivers) && hasDriverBidsChanged(bidsRef.current, trip.drivers)) {
            setBids(trip.drivers);
          }
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

          // Sync with active trip global context (only if trip data changed)
          setActiveTripManually(trip);

          // Handle trip completion or cancellation (until completed and cancelled)
          const status = (trip.trip_status || '').toUpperCase();
          if (
            status === 'COMPLETED' ||
            status === 'TRIP_COMPLETED' ||
            status === 'FINISHED'
          ) {
            isTerminal = true;
            clearInterval(interval);
            setCompletedTripForReview(trip);
            setIsTripCompletedReviewOpen(true);
            return;
          }

          if (
            status === 'CANCELLED' ||
            status === 'CANCELED' ||
            status === 'TRIP_CANCELLED'
          ) {
            isTerminal = true;
            clearInterval(interval);
            alert(isBn ? 'ট্রিপটি বাতিল করা হয়েছে।' : 'Trip has been cancelled.');
            onCancelTrip();
            return;
          }

          if (status === 'ACCEPTED' || status === 'ON_THE_WAY' || status === 'STARTED') {
            isTerminal = true;
            clearInterval(interval);
            const driverId =
              trip.accepted_driver?.driver_uuid ||
              (trip as any).driver_uuid ||
              (trip.drivers && trip.drivers[0]?.driver_uuid) ||
              '';
            router.push(`/tracking?trip_uuid=${effectiveTrip}&driver_uuid=${driverId}`);
            return;
          }

          return;
        }
      }

      // Fallback: fetchBids list every 10 seconds if single endpoint had temporary hiccup
      const trips: RentalTrip[] = await customerTripService.fetchBids(
        effectiveCustomer,
        language,
        'REQUESTED',
        token || undefined
      );

      if (!isMounted || isTerminal) return;

      if (trips && trips.length > 0) {
        const currentTrip = trips.find((t) => t.uuid === effectiveTrip) || trips[0];
        if (currentTrip) {
          const fallbackCreated =
            currentTrip.created_at ||
            (currentTrip as any).createdAt ||
            (currentTrip as any).creation_date ||
            (currentTrip as any).created_date ||
            (currentTrip as any).rental_trip?.created_at;

          if (fallbackCreated) {
            const uuid = currentTrip.uuid;
            if (uuid) {
              dispatch(setTripCreatedAtOnce({ tripUuid: uuid, createdAt: fallbackCreated }));
            }
            if (!tripCreatedAt) {
              setTripCreatedAt(fallbackCreated);
            }
          }
          const polledFallbackService =
            currentTrip.service_name ||
            (currentTrip as any).service_type ||
            (currentTrip as any).servive_type ||
            currentTrip.car_service?.service_name;
          if (polledFallbackService && polledFallbackService !== internalServiceName) {
            setInternalServiceName(polledFallbackService);
          }
          const polledFallbackHours =
            currentTrip.hours_booked ||
            (currentTrip as any).hours ||
            (currentTrip as any).rental_duration;
          if (polledFallbackHours && polledFallbackHours !== internalHoursBooked) {
            setInternalHoursBooked(polledFallbackHours);
          }
          if (currentTrip.offer_amount && currentTrip.offer_amount !== proposedFare) {
            setProposedFare(currentTrip.offer_amount);
          }
          if (currentTrip.drivers && Array.isArray(currentTrip.drivers) && hasDriverBidsChanged(bidsRef.current, currentTrip.drivers)) {
            setBids(currentTrip.drivers);
          }
          if (currentTrip.seen_drivers && Array.isArray(currentTrip.seen_drivers) && hasSeenDriversChanged(seenDriversRef.current, currentTrip.seen_drivers)) {
            setSeenDrivers(currentTrip.seen_drivers);
          }
          const fallbackSeenCount =
            typeof currentTrip.seen_driver_count === 'number'
              ? currentTrip.seen_driver_count
              : (currentTrip.seen_drivers?.length ?? 0);
          if (seenDriverCountRef.current !== fallbackSeenCount) {
            setSeenDriverCount(fallbackSeenCount);
          }
          setActiveTripManually(currentTrip);
        }
      }
    };

    pollBids();
    // Dynamic polling interval: 5s for RIDE_SHARE, 30s for other services
    const pollIntervalMs = isRideShare ? 5000 : 30000;
    const interval = setInterval(pollBids, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    customerUuid,
    tripUuid,
    language,
    activeTrip?.uuid,
    activeTrip?.customer_uuid,
    user?.uuid,
    token,
    router,
    isBn,
    onCancelTrip,
    setActiveTripManually,
    isRideShare,
  ]);

  // ── 3. Action Handlers ───────────────────────────────────────────────────
  // Open Photo Gallery for a Driver's Car
  const handleOpenGallery = (bid: RentalDriverBid) => {
    const rawPhotos = bid.car_photos || bid.carPhotos || [];
    // If no car_photos array, fallback to driver photo or single car avatar
    const photos =
      rawPhotos.length > 0
        ? rawPhotos
        : bid.profile_picture || bid.profilePicture || bid.driver_photo
          ? [bid.profile_picture || bid.profilePicture || bid.driver_photo!]
          : ['/images/car-placeholder.png'];

    setGalleryImages(photos);
    setGalleryCarName(bid.car_model || bid.name || bid.driver_name || vehicleName);
    setGalleryRegNumber(bid.car_reg_number || bid.carRegNumber || bid.car_plate || '');
    setIsGalleryOpen(true);
  };

  // Decline / Hide a Driver Bid (Calls /v1/rental-trip/cancel-rent-bid-driver-or-customer-admin)
  const handleDeclineBid = useCallback(
    async (
      bid: RentalDriverBid,
      comment = 'cancel_rent_bid_driver_or_customer_admin'
    ) => {
      const bidUuid =
        bid.bid_uuid ||
        (bid as any).bidUuid ||
        bid.rent_bid_uuid ||
        bid.rentBidUuid ||
        bid.uuid ||
        bid.driver_uuid ||
        bid.driverUuid ||
        '';

      const allIds = [
        bid.bid_uuid,
        (bid as any).bidUuid,
        bid.rent_bid_uuid,
        bid.rentBidUuid,
        bid.uuid,
        bid.driver_uuid,
        bid.driverUuid,
      ].filter(Boolean) as string[];

      if (bidUuid) {
        setHiddenBidUuids((prev) => {
          const next = new Set(prev);
          allIds.forEach((id) => next.add(id));
          return next;
        });
        await customerTripService.cancelRentBid(
          bidUuid,
          comment,
          language,
          token || undefined
        );
      }
    },
    [language, token]
  );

  // Filter out hidden bids
  const visibleBids = bids.filter((b) => {
    const ids = [
      b.bid_uuid,
      (b as any).bidUuid,
      b.rent_bid_uuid,
      b.rentBidUuid,
      b.uuid,
      b.driver_uuid,
      b.driverUuid,
    ].filter(Boolean) as string[];

    return !ids.some((id) => hiddenBidUuids.has(id));
  });

  // When timer expires: ONLY prompt raise offer modal if NO driver bids were found
  useEffect(() => {
    if (isTimerExpired && !hasPromptedExpired) {
      setHasPromptedExpired(true);
      if (visibleBids.length === 0) {
        setIsRaiseOfferOpen(true);
      }
    }
  }, [isTimerExpired, hasPromptedExpired, visibleBids.length]);

  // Accept Driver Bid
  const handleConfirmAcceptBid = async () => {
    if (!bidToAccept) return;
    const bidUuid =
      bidToAccept.rent_bid_uuid ||
      bidToAccept.rentBidUuid ||
      bidToAccept.uuid ||
      bidToAccept.driver_uuid ||
      bidToAccept.driverUuid ||
      '';

    setIsAccepting(bidUuid);

    const activeCurrentUuid = currentTripUuidRef.current || currentTripUuid || tripUuid;

    const res = await customerTripService.acceptBid(
      customerUuid,
      bidUuid,
      activeCurrentUuid,
      language
    );

    if (res.status) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('trippy_has_active_ride', 'true');
        } catch {}
      }
      dismissOverlay();
      const driverId = bidToAccept.driver_uuid || bidToAccept.driverUuid || '';
      router.push(`/tracking?trip_uuid=${activeCurrentUuid}&driver_uuid=${driverId}`);
    } else {
      setIsAccepting(null);
      setBidToAccept(null);
      alert(
        res.message ||
        (isBn ? 'ড্রাইভারের বিড গ্রহণে সমস্যা হয়েছে।' : 'Failed to accept driver bid.')
      );
    }
  };

  // Cancel Entire Trip Request
  const handleConfirmCancelTrip = async () => {
    setIsCancellingTrip(true);
    const activeCurrentUuid = currentTripUuidRef.current || currentTripUuid || tripUuid;
    await customerTripService.cancelTrip(activeCurrentUuid, cancelReason, language);
    setIsCancellingTrip(false);
    setShowCancelDialog(false);
    onCancelTrip();
  };

  // Format Service Subtitle (Supports Intercity, Ride share, Hourly with duration hours)
  const getFormattedServiceName = () => {
    return formatTripServiceType(
      internalServiceName,
      internalHoursBooked,
      language
    ).name;
  };



  return (
    <div className="w-full max-w-xl mx-auto min-h-[580px] flex flex-col justify-between relative pb-6">

      {/* ── Top Bar (Exact layout as screenshot) ─────────────────────────── */}
      <div className="flex items-center justify-between py-3 mb-4 border-b border-slate-100">
        {/* Back Arrow */}
        <button
          type="button"
          onClick={() => setShowCancelDialog(true)}
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-colors"
          title={isBn ? 'ট্রিপ বাতিল বা ফিরে যান' : 'Cancel or Go Back'}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900" />
        </button>

        {/* Title and Subtitle */}
        <div className="text-center">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-heading">
            {isBn ? 'আপনার রাইড খোঁজা হচ্ছে' : 'Finding your ride'}
          </h1>
          <p className="text-xs font-semibold text-slate-600 capitalize tracking-wide">
            {getFormattedServiceName()}
          </p>
        </div>

        {/* Customer Profile Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex-shrink-0 relative shadow-xs">
          {user?.profile_picture ? (
            <Image
              src={getImageUrl(user.profile_picture)}
              alt="Profile"
              fill
              className="object-cover"
              sizes="36px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>

      {/* ── Center Section: Radar Animation & Status ───────────────────── */}
      <div className="flex flex-col items-center justify-center my-4 space-y-3">
        {/* Continuous Smooth 360° Radar Scanner with Harmonic Ripples (No 1-second popping) */}
        <div className="relative w-24 h-24 flex items-center justify-center select-none">
          {/* Outer Boundary Static Ring */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/25 pointer-events-none" />

          {/* Continuous Smooth 360° Rotating Radar Sweep Scanner Beam */}
          <div
            className="absolute inset-0.5 rounded-full overflow-hidden pointer-events-none animate-radar-sweep"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, rgba(16, 185, 129, 0.04) 290deg, rgba(16, 185, 129, 0.32) 360deg)',
            }}
          >
            {/* Leading Sweep Scanner Needle */}
            <div className="absolute top-0 right-1/2 w-1/2 h-[1.5px] bg-gradient-to-l from-emerald-400 via-emerald-400/80 to-transparent origin-right shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          </div>

          {/* Smooth Continuous Sonar Wave 1 (3.6s cycle) */}
          <span className="absolute w-24 h-24 rounded-full border border-emerald-500/40 bg-emerald-500/10 pointer-events-none animate-radar-ripple-1" />

          {/* Smooth Continuous Sonar Wave 2 (3.6s cycle with 1.8s offset) */}
          <span className="absolute w-24 h-24 rounded-full border border-emerald-500/40 bg-emerald-500/10 pointer-events-none animate-radar-ripple-2" />

          {/* Mid Concentric Guide Ring */}
          <div className="absolute w-16 h-16 rounded-full border border-emerald-500/30 pointer-events-none" />

          {/* Inner Concentric Guide Ring */}
          <div className="absolute w-10 h-10 rounded-full border border-emerald-500/40 pointer-events-none" />

          {/* Subtle Radar Coordinate Crosshairs (Horizontal & Vertical) */}
          <div className="absolute w-full h-[1px] bg-emerald-500/15 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-emerald-500/15 pointer-events-none" />

          {/* Center Target Beacon with Smooth Organic Breathing Glow */}
          <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-beacon-pulse shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_4px_rgba(5,150,105,0.8)]" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          {isBn ? 'আরও চালকদের খোঁজ চলছে...' : 'Searching for more drivers...'}
        </p>

        {/* Drivers Found Badge / Text (Prominent Green Headline) */}
        <div className="flex items-center justify-center">
          {visibleBids.length > 0 ? (
            <div className="flex flex-col items-center gap-1 text-center animate-fadeIn">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isBn
                    ? `${toBanglaDigits(visibleBids.length)} জন চালক বিড করেছেন`
                    : `${visibleBids.length} Driver${visibleBids.length === 1 ? '' : 's'} Offered`}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-600 font-heading tracking-tight">
                {isBn
                  ? `চালক পাওয়া গেছে! (${toBanglaDigits(visibleBids.length)})`
                  : `Drivers Found! (${visibleBids.length})`}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isBn
                  ? 'চালকের বিবরণ এবং প্রস্তাবিত ভাড়া দেখে অফার গ্রহণ করুন'
                  : 'Review driver details & accept your preferred offer'}
              </p>
            </div>
          ) : (
            <h2 className="text-base font-bold text-slate-700">
              {isBn ? 'নিকটবর্তী চালকদের জন্য অপেক্ষা করা হচ্ছে' : 'Waiting for nearby drivers...'}
            </h2>
          )}
        </div>

        {/* Finding Driver Smooth GPU-composited Progress Bar */}
        <div className="w-full max-w-[280px] bg-slate-200/80 rounded-full h-1.5 overflow-hidden relative shadow-inner">
          <div
            className="bg-emerald-500 h-full w-full rounded-full pointer-events-none will-change-transform"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, topProgressPct / 100))})`,
              transformOrigin: 'left',
              transition: 'transform 200ms linear',
            }}
          />
        </div>

        {/* Trip Timer Pill & Quick Raise Fare Chip */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${remainingSeconds <= 10
            ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono tabular-nums tracking-wider">{formatCountdown()}</span>
          </div>

          {/* Quick Raise Fare Chip */}
          <button
            type="button"
            onClick={() => setIsRaiseOfferOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>{isBn ? 'ভাড়া বাড়ান' : 'Raise Fare'}</span>
          </button>
        </div>
      </div>

      {/* ── Bids List Section (Matches the Driver Card in Screenshot) ────── */}
      <div className="space-y-4 my-2 flex-1">
        {visibleBids.length > 0 ? (
          visibleBids.map((bid, idx) => {
            const bidKey =
              bid.rent_bid_uuid ||
              bid.rentBidUuid ||
              bid.uuid ||
              bid.driver_uuid ||
              `bid-${idx}`;

            const isCurrentAccepting =
              isAccepting ===
              (bid.rent_bid_uuid ||
                bid.rentBidUuid ||
                bid.uuid ||
                bid.driver_uuid ||
                bid.driverUuid);

            return (
              <DriverBidCardItem
                key={bidKey}
                bid={bid}
                serviceName={internalServiceName}
                tripCreatedAt={effectiveCreatedAt || ''}
                isBn={isBn}
                isCurrentAccepting={Boolean(isCurrentAccepting)}
                onDecline={handleDeclineBid}
                onAccept={(b) => setBidToAccept(b)}
                onOpenGallery={(b) => handleOpenGallery(b)}
                onOpenReviews={(b) => setReviewsModalBid(b)}
              />
            );
          })
        ) : (
          /* Empty Waiting State */
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {isBn ? 'কোনো চালক এখনো বিড করেননি' : 'No driver bids yet'}
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {isBn
                  ? 'আপনার প্রস্তাবিত ভাড়া নিকটবর্তী চালকদের কাছে পাঠানো হয়েছে। খুব শীঘ্রই চালকদের অফার এখানে দেখতে পাবেন।'
                  : 'Your proposed fare has been sent to nearby drivers. Bids will appear here in real-time.'}
              </p>
            </div>

            {/* Quick Raise Offer CTA */}
            <button
              type="button"
              onClick={() => setIsRaiseOfferOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-100 shadow-2xs transition-colors mt-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              {isBn ? 'ভাড়া বাড়িয়ে দ্রুত চালক পান' : 'Raise Fare to Attract Drivers'}
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Section: Drivers Viewed + Stepper Fare Card (Photo 1) ── */}
      <div className="mt-4 space-y-3">
        {/* Header line above card: Drivers Viewed & Timer */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {(() => {
              const count = Math.max(
                typeof seenDriverCount === 'number' ? seenDriverCount : 0,
                seenDrivers?.length || 0,
                visibleBids.length
              );
              return (
                <span className="text-xs sm:text-sm font-semibold text-slate-700">
                  {isBn
                    ? `${toBanglaDigits(count)} জন চালক আপনার অনুরোধ দেখেছেন`
                    : `${count} driver${count === 1 ? '' : 's'} viewed your request`}
                </span>
              );
            })()}
            {/* Driver Avatar Thumbnails */}
            {seenDrivers && seenDrivers.length > 0 ? (
              <div className="flex -space-x-1.5 overflow-hidden">
                {seenDrivers.slice(0, 3).map((sd, i) => (
                  <div
                    key={sd.driver_uuid || i}
                    className="w-6 h-6 rounded-full overflow-hidden border border-white bg-slate-100 relative shadow-2xs"
                  >
                    <Image
                      src={getImageUrl(sd.profile_picture)}
                      alt={sd.name || 'Driver'}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                ))}
              </div>
            ) : visibleBids.length > 0 ? (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs">
                <Image
                  src={getImageUrl(visibleBids[0].profile_picture || visibleBids[0].driver_photo)}
                  alt="Driver"
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
            ) : null}
          </div>

          {/* Green Timer Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#81C784]">
            <Clock className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span className="font-mono tabular-nums tracking-wider">{formatCountdown()}</span>
          </div>
        </div>

        {/* Bottom Card (Matches Photo 1) */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Top Handle Indicator */}
          <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto" />

          {/* Title */}
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {visibleBids.length > 0
                ? isBn
                  ? 'চালকের অফার প্রস্তুত — নিচের বাটনে ভাড়া পরিবর্তন করতে পারেন'
                  : 'Driver Offer Ready — Or Adjust Your Proposed Fare'
                : isBn
                  ? 'ড্রাইভারদের অফারের জন্য অপেক্ষা করা হচ্ছে'
                  : 'Waiting for offers from drivers'}
            </h3>
          </div>

          <div className="border-t border-slate-100" />

          {/* Success Banner when Offer is Raised / Updated */}
          {offerUpdatedNotice && (
            <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                {isBn
                  ? `আপনার নতুন প্রস্তাবিত ভাড়া ${formatFare(proposedFare)} সফলভাবে আপডেট হয়েছে`
                  : `Your proposed fare of ${formatFare(proposedFare)} has been updated`}
              </span>
            </div>
          )}

          {/* Stepper: [ -10 ]   BDT 15409   [ +10 ] */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <button
              type="button"
              onClick={handleBottomDecrement}
              className="col-span-3 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shadow-2xs"
            >
              {isBn ? '-১০' : '-10'}
            </button>

            <div className="col-span-6 text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                {formatFare(bottomOfferPrice)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBottomIncrement}
              className="col-span-3 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shadow-2xs"
            >
              {isBn ? '+১০' : '+10'}
            </button>
          </div>

          {/* [ Raise fare ] Button (Calls update-trip-offer-amount) */}
          <button
            type="button"
            disabled={isUpdatingBottomOffer}
            onClick={handleBottomRaiseFare}
            className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isUpdatingBottomOffer ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <span>{isBn ? 'ভাড়া বাড়ান' : 'Raise fare'}</span>
            )}
          </button>

          {/* Collapsible Details: Pickup, Dropoff, Note, Cancel Request */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsDrawerExpanded((prev) => !prev)}
              className="w-full py-2 flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <span>{isBn ? 'ট্রিপের বিস্তারিত ও রুট' : 'Trip Details & Route'}</span>
              <span className="flex items-center gap-1 text-[11px]">
                {isDrawerExpanded ? (isBn ? 'লুকান' : 'Hide') : (isBn ? 'দেখুন' : 'View')}
                {isDrawerExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>

            {isDrawerExpanded && (
              <div className="pt-3 pb-1 space-y-3 text-xs border-t border-slate-100 animate-fade-in">
                {/* Service Type & Hours Summary */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">
                    {isBn ? 'সার্ভিস ধরন:' : 'Service Type:'}
                  </span>
                  <span className="font-bold text-slate-900 font-heading text-xs">
                    {getFormattedServiceName()}
                  </span>
                </div>

                {/* Proposed Fare Summary */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">
                    {isBn ? 'আপনার প্রস্তাবিত ভাড়া:' : 'Your Proposed Fare:'}
                  </span>
                  <span className="font-bold text-slate-900 font-heading text-sm">
                    {formatFare(proposedFare)}
                  </span>
                </div>

                {/* Route Stops */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'পিকআপ পয়েন্ট' : 'Pickup'}
                      </span>
                      <p className="font-semibold text-slate-800">{pickupAddress}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'ড্রপঅফ গন্তব্য' : 'Dropoff'}
                      </span>
                      <p className="font-semibold text-slate-800">{dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger Note */}
                {note && (
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900">
                    <span className="font-bold block mb-0.5">
                      {isBn ? 'আপনার নোট:' : 'Your Special Note:'}
                    </span>
                    <span>{note}</span>
                  </div>
                )}

                {/* Cancel Trip Button */}
                <button
                  type="button"
                  onClick={() => setShowCancelDialog(true)}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ট্রিপ রিকোয়েস্ট বাতিল করুন' : 'Cancel Trip Request'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Photo Gallery Modal ────────────────────────────────────────── */}
      <CarPhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={galleryImages}
        carName={galleryCarName}
        regNumber={galleryRegNumber}
      />

      {/* ── Raise Offer / Time Expired Modal (Calls update-trip-offer-amount) ── */}
      <RaiseOfferModal
        isOpen={isRaiseOfferOpen}
        onClose={() => setIsRaiseOfferOpen(false)}
        currentOffer={proposedFare}
        tripUuid={currentTripUuidRef.current || currentTripUuid || tripUuid}
        customerUuid={
          customerUuid ||
          activeTrip?.customer_uuid ||
          (activeTrip as any)?.customerUuid ||
          user?.uuid ||
          getActiveCustomerUuid()
        }
        onOfferUpdated={async (newFare, newTripUuid) => {
          const effectiveNewUuid = newTripUuid || currentTripUuidRef.current || tripUuid;
          setCurrentTripUuid(effectiveNewUuid);
          currentTripUuidRef.current = effectiveNewUuid;
          if (onTripUuidUpdated && newTripUuid) {
            onTripUuidUpdated(effectiveNewUuid);
          }

          // Clean old trip data
          clearTripDataFromLocalStorage();
          setBids([]);
          setSeenDrivers([]);
          setHiddenBidUuids(new Set());

          setProposedFare(newFare);
          setBottomOfferPrice(newFare);
          // NOTE: Do NOT restart countdown — timer runs continuously from trip creation,
          // unaffected by raise-offer API calls.
          setOfferUpdatedNotice(true);
          setTimeout(() => setOfferUpdatedNotice(false), 4000);

          const effCust =
            customerUuid ||
            activeTrip?.customer_uuid ||
            (activeTrip as any)?.customerUuid ||
            user?.uuid ||
            getActiveCustomerUuid();

          if (effectiveNewUuid) {
            try {
              const singleRes = await customerTripService.fetchSingleTripBids(
                effCust,
                effectiveNewUuid,
                language,
                'ALL',
                token || undefined
              );
              if (singleRes.status && singleRes.data) {
                const trip = singleRes.data;
                const freshFare = Number(
                  trip.offer_amount || (trip as any).offer_ammount || newFare
                );
                setProposedFare(freshFare);
                setBottomOfferPrice(freshFare);
                if (trip.created_at) {
                  // Write-once to Redux (immutable — polling will not overwrite once set)
                  dispatch(setTripCreatedAtOnce({ tripUuid: effectiveNewUuid, createdAt: trip.created_at }));
                  setTripCreatedAt(trip.created_at);
                  // ✓ Reset timer anchored to new trip's created_at
                  resetCountdownFromCreatedAt(trip.created_at);
                } else {
                  restartCountdown();
                }
                if (trip.drivers && Array.isArray(trip.drivers)) {
                  setBids(trip.drivers);
                }
                if (trip.seen_drivers && Array.isArray(trip.seen_drivers)) {
                  setSeenDrivers(trip.seen_drivers);
                }
                const modalSeenCount =
                  typeof trip.seen_driver_count === 'number'
                    ? trip.seen_driver_count
                    : (trip.seen_drivers?.length ?? 0);
                setSeenDriverCount(modalSeenCount);
                setActiveTripManually(trip);
              } else {
                setActiveTripManually({
                  uuid: effectiveNewUuid,
                  customer_uuid: effCust,
                  service_name: serviceName,
                  offer_amount: newFare,
                  trip_status: 'REQUESTED',
                  pickup_locations: [{ address: pickupAddress }],
                  dropoff_locations: [{ address: dropoffAddress }],
                  drivers: [],
                  created_at: new Date().toISOString(),
                } as any);
              }
            } catch {}
          }
        }}
        onKeepTrying={(newTripUuid) => {
          if (newTripUuid && newTripUuid !== currentTripUuidRef.current) {
            setCurrentTripUuid(newTripUuid);
            currentTripUuidRef.current = newTripUuid;
            if (onTripUuidUpdated) {
              onTripUuidUpdated(newTripUuid);
            }
          }
          const newTs = new Date().toISOString();
          if (newTripUuid) {
            dispatch(forceTripCreatedAt({ tripUuid: newTripUuid, createdAt: newTs }));
          }
          setTripCreatedAt(newTs);
          restartCountdown();
        }}
      />

      {/* ── Accept Bid Confirmation Dialog ────────────────────────────── */}
      {bidToAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <Car className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isBn ? 'চালকের বিড গ্রহণ করবেন?' : 'Accept Driver Bid?'}
              </h3>

              {/* Prominently show Total Amount, not bid amount */}
              {(() => {
                const rawTotal = Number(
                  bidToAccept.total_amount ?? (bidToAccept as any).totalAmount
                );
                const insurance = Number(bidToAccept.insurance_charge_amount ?? 0);
                const discount = Number(bidToAccept.customer_discount_amount ?? 0);
                const rawBid = Number(
                  bidToAccept.bid_amount ?? (bidToAccept as any).bidAmount ?? 0
                );
                const totalAmt =
                  !isNaN(rawTotal) && rawTotal > 0
                    ? rawTotal
                    : rawBid > 0
                      ? rawBid + insurance - discount
                      : proposedFare;

                return (
                  <div className="my-3 py-3 px-5 bg-slate-50 rounded-2xl border border-slate-200/80 inline-flex flex-col items-center">
                    <span className="text-[11px] uppercase font-bold text-slate-500 block tracking-wider">
                      {isBn ? 'মোট ভাড়া (টোটাল অ্যামাউন্ট)' : 'Total Amount (Payable)'}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-0.5">
                      {formatFare(totalAmt)}
                    </span>
                  </div>
                );
              })()}

              <p className="text-xs text-slate-500">
                {isBn
                  ? `${bidToAccept.name || 'চালকের'} এই মোট ভাড়ায় যাত্রা নিশ্চিত করতে চান?`
                  : `Confirm accepting ride from ${bidToAccept.name || 'driver'} for the total amount shown above?`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBidToAccept(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
              >
                {isBn ? 'না, ভাবছি' : 'No'}
              </button>

              <button
                type="button"
                onClick={handleConfirmAcceptBid}
                className="py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-xs border border-black shadow-sm transition-colors"
              >
                {isBn ? 'হ্যাঁ, গ্রহণ করুন' : 'Yes, Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Trip Request Confirmation Dialog ───────────────────── */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isBn ? 'ট্রিপ রিকোয়েস্ট বাতিল করবেন?' : 'Cancel Trip Request?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isBn
                  ? 'আপনি কি নিশ্চিত যে এই ট্রিপ রিকোয়েস্টটি বাতিল করতে চান?'
                  : 'Are you sure you want to cancel this trip request?'}
              </p>
            </div>

            {/* Cancel reason dropdown */}
            <div className="text-left">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                {isBn ? 'বাতিলের কারণ:' : 'Reason for cancellation:'}
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="Changed my mind">
                  {isBn ? 'পরিকল্পনা পরিবর্তন হয়েছে' : 'Changed my mind'}
                </option>
                <option value="Taking too long to find drivers">
                  {isBn ? 'চালক পেতে বেশি সময় লাগছে' : 'Taking too long to find drivers'}
                </option>
                <option value="Want to change location or time">
                  {isBn ? 'লোকেশন বা সময় পরিবর্তন করব' : 'Want to change location or time'}
                </option>
                <option value="Found alternative transport">
                  {isBn ? 'অন্য যানবাহন পেয়েছি' : 'Found alternative transport'}
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
              >
                {isBn ? 'না, অপেক্ষা করি' : 'No, Keep Looking'}
              </button>

              <button
                type="button"
                disabled={isCancellingTrip}
                onClick={handleConfirmCancelTrip}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs border border-red-600 shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                {isCancellingTrip ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                <span>{isBn ? 'বাতিল করুন' : 'Yes, Cancel'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Driver Reviews Modal ─────────────────────────────────────────── */}
      {reviewsModalBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 relative shadow-2xs flex-shrink-0">
                  <Image
                    src={getImageUrl(
                      reviewsModalBid.profile_picture ||
                      reviewsModalBid.profilePicture ||
                      reviewsModalBid.driver_photo
                    )}
                    alt={reviewsModalBid.name || 'Driver'}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {reviewsModalBid.name ||
                      reviewsModalBid.driver_name ||
                      (isBn ? 'চালক' : 'Driver')}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {Number(reviewsModalBid.average_rating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-slate-400 font-medium">
                      ({reviewsModalBid.total_completed_trips || 0} {isBn ? 'ট্রিপ' : 'trips'})
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReviewsModalBid(null)}
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subtitle / Total Reviews Count */}
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>{isBn ? 'যাত্রীদের প্রতিক্রিয়া ও রেটিং' : 'Passenger Reviews & Ratings'}</span>
              <span className="font-bold text-slate-900">
                {reviewsModalBid.rating_list?.length || 0} {isBn ? 'টি রিভিউ' : 'reviews'}
              </span>
            </div>

            {/* Scrollable Reviews List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {reviewsModalBid.rating_list && reviewsModalBid.rating_list.length > 0 ? (
                reviewsModalBid.rating_list.map((r, i) => (
                  <div
                    key={r.uuid || `review-${i}`}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 bg-slate-200 relative flex-shrink-0">
                          {r.customer_photo ? (
                            <Image
                              src={getImageUrl(r.customer_photo)}
                              alt={r.customer_name || 'Passenger'}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {(r.customer_name || 'P').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {r.customer_name || (isBn ? 'যাত্রী' : 'Passenger')}
                          </p>
                          {r.created_at && (
                            <p className="text-[10px] text-slate-400">
                              {new Date(r.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Star rating */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating || 5 }).map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review text or tag comment */}
                    {r.comments && (
                      <div className="pt-0.5">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
                          💬 {r.comments}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isBn ? 'কোনো লিখিত রিভিউ পাওয়া যায়নি' : 'No written reviews found'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const toAccept = reviewsModalBid;
                  setReviewsModalBid(null);
                  setBidToAccept(toAccept);
                }}
                className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>{isBn ? 'এই চালকের অফার গ্রহণ করুন' : 'Accept This Driver Offer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trip Completed Review Modal ──────────────────────────────────── */}
      {completedTripForReview && (
        <TripReviewModal
          isOpen={isTripCompletedReviewOpen}
          onClose={() => {
            setIsTripCompletedReviewOpen(false);
            onCancelTrip();
          }}
          tripUuid={completedTripForReview.uuid || tripUuid || ''}
          driverUuid={
            completedTripForReview.accepted_driver?.driver_uuid ||
            (completedTripForReview as any).driver_uuid ||
            (completedTripForReview.drivers && completedTripForReview.drivers[0]?.driver_uuid) ||
            ''
          }
          driverName={
            completedTripForReview.accepted_driver?.name ||
            (completedTripForReview.drivers && completedTripForReview.drivers[0]?.name) ||
            'Driver'
          }
          driverPhoto={
            completedTripForReview.accepted_driver?.profile_picture ||
            (completedTripForReview.drivers && completedTripForReview.drivers[0]?.profile_picture)
          }
          carPlate={
            completedTripForReview.accepted_driver?.car_reg_number ||
            (completedTripForReview.drivers && completedTripForReview.drivers[0]?.car_reg_number)
          }
          serviceName={completedTripForReview.service_name}
          totalFare={
            completedTripForReview.accepted_driver?.total_amount ||
            completedTripForReview.offer_amount
          }
          onReviewSubmitted={() => {
            setIsTripCompletedReviewOpen(false);
            onCancelTrip();
          }}
        />
      )}

    </div>
  );
};

// ── Bengali Digit Converter ─────────────────────────────────────────────────
function toBanglaDigits(str: string | number): string {
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bangla = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(english[i], bangla[i]);
  }
  return res;
}

// ── Driver Bid Card Item with Accept Button Progress Bar ──────────────────
interface DriverBidCardItemProps {
  bid: RentalDriverBid;
  serviceName: string;
  tripCreatedAt?: string;
  isBn: boolean;
  isCurrentAccepting: boolean;
  onDecline: (bid: RentalDriverBid, comment?: string) => void;
  onAccept: (bid: RentalDriverBid) => void;
  onOpenGallery: (bid: RentalDriverBid) => void;
  onOpenReviews: (bid: RentalDriverBid) => void;
}

const DriverBidCardItem: React.FC<DriverBidCardItemProps> = ({
  bid,
  serviceName,
  tripCreatedAt,
  isBn,
  isCurrentAccepting,
  onDecline,
  onAccept,
  onOpenGallery,
  onOpenReviews,
}) => {
  const isRideShare =
    serviceName === 'RIDE_SHARE' ||
    serviceName?.toLowerCase().includes('ride_share') ||
    serviceName?.toLowerCase() === 'rideshare';

  // Accept button progress bar durations:
  //   RIDE_SHARE  → 40 seconds
  //   All others  → 40 minutes (2400 seconds)
  const totalDurationSecondsRaw = isRideShare ? 40 : 40 * 60;

  // Lock duration in a ref so service-type changes from polling don't reset the bar
  const totalDurRef = useRef<number>(totalDurationSecondsRaw);
  const hasExpiredRef = useRef(false);

  // Effective bid date: tripCreatedAt (from Redux, write-once) takes priority
  const effectiveBidDate =
    tripCreatedAt ||
    bid.created_at ||
    (bid as any).createdAt ||
    (bid as any).creation_date ||
    (bid as any).created_date;

  const initialBidTs = parseAsiaBangladeshTimestamp(effectiveBidDate);

  // Write-once start timestamp ref — never overwrite after first valid set
  const startTsRef = useRef<number>(initialBidTs && initialBidTs < Date.now() ? initialBidTs : Date.now());
  const hasStartBeenSet = useRef<boolean>(Boolean(initialBidTs && initialBidTs < Date.now()));

  // Update startTsRef ONCE when effectiveBidDate first becomes available (e.g. first API response)
  if (effectiveBidDate && !hasStartBeenSet.current) {
    const ts = parseAsiaBangladeshTimestamp(effectiveBidDate);
    if (!isNaN(ts) && ts < Date.now()) {
      startTsRef.current = ts;
      hasStartBeenSet.current = true;
    }
  }

  const [progressFraction, setProgressFraction] = useState<number>(() => {
    const elapsedMs = Math.max(0, Date.now() - startTsRef.current);
    const totalMs = totalDurRef.current * 1000;
    return Math.min(1, Math.max(0, elapsedMs / totalMs));
  });

  // Smooth progress bar update every 100ms — empty deps so it NEVER restarts on polling
  useEffect(() => {
    hasExpiredRef.current = false;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - startTsRef.current);
      const totalMs = totalDurRef.current * 1000;
      const frac = Math.min(1, Math.max(0, elapsedMs / totalMs));

      setProgressFraction(frac);

      if (elapsedMs >= totalMs && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        // After progress bar ends, cancel bid and remove from UI
        onDecline(bid, 'cancel_rent_bid_driver_or_customer_admin');
      }
    }, 100);

    return () => clearInterval(interval);
    // Empty deps: reads from refs, so safe to run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const rawAmount =
    bid.total_amount ??
    (bid as any).totalAmount ??
    bid.bid_amount ??
    (bid as any).bidAmount ??
    0;
  const numAmount =
    typeof rawAmount === 'string' ? parseFloat(rawAmount) || 0 : Number(rawAmount);
  const formattedBidPrice = isBn
    ? `৳ ${toBanglaDigits(Math.round(numAmount).toLocaleString('en-IN'))}`
    : `BDT ${Math.round(numAmount).toLocaleString('en-IN')}`;

  const driverName =
    bid.name || bid.driver_name || (bid as any).driverName || (isBn ? 'চালক' : 'Driver');
  const driverRating =
    bid.average_rating ?? (bid as any).averageRating ?? bid.rating ?? 5.0;
  const completedRides =
    bid.total_completed_trips ?? (bid as any).totalCompletedTrips ?? 0;
  const carPlate =
    bid.car_reg_number || (bid as any).carRegNumber || bid.car_plate || 'Dhaka-Metro';

  const rawPhotos = bid.car_photos || bid.carPhotos || [];
  const primaryPhoto =
    rawPhotos.length > 0
      ? rawPhotos[0]
      : bid.profile_picture || bid.profilePicture || bid.driver_photo || '/images/car-placeholder.png';
  const displayPhotoCount = rawPhotos.length > 0 ? rawPhotos.length : 1;
  const reviewCount = bid.rating_list ? bid.rating_list.length : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-md hover:shadow-lg transition-all space-y-4">
      {/* 1. Fare Display */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight">
              {formattedBidPrice}
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
              {isBn ? 'মোট প্রদেয়' : 'Total Payable'}
            </span>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
          <span>💵</span> {isBn ? 'ক্যাশ পেমেন্ট' : 'Cash'}
        </span>
      </div>

      {/* 2. Driver & Vehicle Profile Row */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Driver Info Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Driver Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 flex-shrink-0 relative shadow-2xs">
            <Image
              src={getImageUrl(bid.profile_picture || bid.profilePicture || bid.driver_photo)}
              alt={driverName}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>

          {/* Driver Name, Rating, and Car Plate */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {driverName}
              </h3>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ✓
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {Number(driverRating).toFixed(1)}
              </span>
              <span className="text-slate-400 font-medium">
                • {isBn ? toBanglaDigits(completedRides.toString()) : completedRides}{' '}
                {isBn ? 'ট্রিপ' : 'rides'}
              </span>

              {/* Reviews Button badge if rating_list exists */}
              {reviewCount > 0 && (
                <button
                  type="button"
                  onClick={() => onOpenReviews(bid)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                  title={isBn ? 'রিভিউ দেখুন' : 'View Reviews'}
                >
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>
                    {isBn ? toBanglaDigits(reviewCount.toString()) : reviewCount}{' '}
                    {isBn ? 'রিভিউ' : 'Reviews'}
                  </span>
                </button>
              )}
            </div>

            <p className="text-xs font-mono font-medium text-slate-600 truncate mt-0.5">
              {carPlate}
            </p>
          </div>
        </div>

        {/* Car Photo Thumbnail with Photo Count Badge */}
        <div
          onClick={() => onOpenGallery(bid)}
          className="relative w-20 sm:w-24 h-14 sm:h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer flex-shrink-0 group shadow-2xs transition-transform hover:scale-105"
          title={isBn ? 'গাড়ির ছবি দেখুন' : 'View Car Photos'}
        >
          <Image
            src={getImageUrl(primaryPhoto)}
            alt="Car interior/exterior"
            fill
            className="object-cover"
            sizes="96px"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Gallery Count Pill Badge (🖼️ 5) */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1 border border-white/20">
            <ImageIcon className="w-2.5 h-2.5" />
            <span>{isBn ? toBanglaDigits(displayPhotoCount.toString()) : displayPhotoCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons: Decline (Gray) & Accept with Progress Bar (Black + Charcoal Progress Fill) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Decline Button */}
        <button
          type="button"
          onClick={() => onDecline(bid, 'Customer declined bid')}
          className="h-12 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all active:scale-98 flex items-center justify-center cursor-pointer"
        >
          {isBn ? 'বাতিল' : 'Decline'}
        </button>

        {/* Accept Button with Charcoal Progress Fill Running in Background */}
        <button
          type="button"
          disabled={isCurrentAccepting}
          onClick={() => onAccept(bid)}
          className={`relative overflow-hidden rounded-2xl bg-black border border-black text-white h-12 px-5 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center cursor-pointer select-none ${isCurrentAccepting ? 'opacity-80 pointer-events-none' : 'hover:bg-slate-950'
            }`}
        >
          {/* Charcoal Dark Gray Progress Fill (#374151) — starts fully filled (right side)
               and drains right-to-left as time elapses. scaleX goes 1→0, origin='right'. */}
          <div
            className="absolute inset-0 bg-[#374151] pointer-events-none rounded-2xl will-change-transform"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, 1 - progressFraction))})`,
              transformOrigin: 'right',
              transition: 'transform 200ms linear',
            }}
          />

          {/* Text Overlay in Crisp White without countdown numbers (clean background progress process) */}
          <div className="relative z-10 flex items-center justify-center gap-1.5 font-bold text-white text-sm">
            {isCurrentAccepting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isBn ? 'গ্রহণ হচ্ছে...' : 'Accepting...'}</span>
              </>
            ) : (
              <span>{isBn ? 'গ্রহণ করুন' : 'Accept'}</span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default LiveBiddingRadarView;
