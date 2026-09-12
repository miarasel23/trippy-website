'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RentalDriverBid, RentalTrip } from '@/types/customerApi';
import {
  customerTripService,
  getImageUrl,
  getActiveCustomerUuid,
} from '@/services/customerTripService';
import { CarPhotoGalleryModal } from './CarPhotoGalleryModal';
import { RaiseOfferModal } from './RaiseOfferModal';
import { TripReviewModal } from './TripReviewModal';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveTrip, hasTripDataChanged } from '@/context/ActiveTripContext';
import { useAppSelector } from '@/redux/hooks';
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
  onCancelTrip,
}) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { user, token } = useAppSelector((state) => state.auth);
  const { setIsRadarOnPage, activeTrip, setActiveTripManually } = useActiveTrip();

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
    if (
      activeTrip?.seen_drivers &&
      Array.isArray(activeTrip.seen_drivers) &&
      hasSeenDriversChanged(seenDriversRef.current, activeTrip.seen_drivers)
    ) {
      setSeenDrivers(activeTrip.seen_drivers);
    }
    if (
      typeof activeTrip?.seen_driver_count === 'number' &&
      seenDriverCountRef.current !== activeTrip.seen_driver_count
    ) {
      setSeenDriverCount(activeTrip.seen_driver_count);
    }
  }, [activeTrip?.drivers, activeTrip?.seen_drivers, activeTrip?.seen_driver_count]);

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

  // Trip created timestamp
  const [tripCreatedAt, setTripCreatedAt] = useState<string>(
    initialCreatedAt || new Date().toISOString()
  );

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

  // ── 1. Finding Driver Countdown Timer (2 minutes / 120 seconds) ────────────
  const maxTimerSeconds = 120;
  const [cycleStartTs, setCycleStartTs] = useState<number>(() => Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState<number>(maxTimerSeconds);
  const [topProgressPct, setTopProgressPct] = useState<number>(0);

  // Smoothly re-calculate remaining seconds and progress every 100ms
  useEffect(() => {
    const check = () => {
      const elapsedMs = Math.max(0, Date.now() - cycleStartTs);
      const totalMs = maxTimerSeconds * 1000;
      const remSecs = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
      const pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

      setRemainingSeconds(remSecs);
      setTopProgressPct(pct);

      if (elapsedMs >= totalMs) {
        setIsTimerExpired(true);
      }
    };

    check();
    const interval = setInterval(check, 100);
    return () => clearInterval(interval);
  }, [cycleStartTs]);

  // Format MM:SS (e.g. 00:40)
  const formatCountdown = () => {
    if (remainingSeconds <= 0) {
      return isBn ? '০০:০০' : '00:00';
    }
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const mStr = String(mins).padStart(2, '0');
    const sStr = String(secs).padStart(2, '0');
    const timeStr = `${mStr}:${sStr}`;
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

  const handleBottomRaiseFare = async () => {
    setIsUpdatingBottomOffer(true);
    const effectiveTripUuid =
      tripUuid ||
      activeTrip?.uuid ||
      (bids[0] as any)?.trip_uuid ||
      (bids[0] as any)?.rental_trip_uuid ||
      '';
    const effectiveCustomerUuid =
      customerUuid ||
      activeTrip?.customer_uuid ||
      (activeTrip as any)?.customerUuid ||
      user?.uuid ||
      '';

    // Calls /v1/rental-trip/update-trip-offer-amount
    await customerTripService.updateOfferAmount(
      effectiveCustomerUuid,
      effectiveTripUuid,
      bottomOfferPrice,
      language
    );
    setIsUpdatingBottomOffer(false);
    setProposedFare(bottomOfferPrice);
    // Restart 2-minute cycle
    setCycleStartTs(Date.now());
    setIsTimerExpired(false);
    setHasPromptedExpired(false);
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

          if (trip.created_at && trip.created_at !== tripCreatedAt) {
            setTripCreatedAt(trip.created_at);
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
          if (typeof trip.seen_driver_count === 'number' && seenDriverCountRef.current !== trip.seen_driver_count) {
            setSeenDriverCount(trip.seen_driver_count);
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
          if (currentTrip.created_at && currentTrip.created_at !== tripCreatedAt) {
            setTripCreatedAt(currentTrip.created_at);
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
          if (typeof currentTrip.seen_driver_count === 'number' && seenDriverCountRef.current !== currentTrip.seen_driver_count) {
            setSeenDriverCount(currentTrip.seen_driver_count);
          }
          setActiveTripManually(currentTrip);
        }
      }
    };

    pollBids();
    // Poll every 10 seconds
    const interval = setInterval(pollBids, 10000);

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
    async (bid: RentalDriverBid, comment = 'Customer declined bid') => {
      const bidUuid =
        bid.rent_bid_uuid ||
        bid.rentBidUuid ||
        bid.uuid ||
        bid.driver_uuid ||
        bid.driverUuid ||
        '';

      if (bidUuid) {
        setHiddenBidUuids((prev) => new Set(prev).add(bidUuid));
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
    const id = b.rent_bid_uuid || b.rentBidUuid || b.uuid || b.driver_uuid || b.driverUuid || '';
    return !hiddenBidUuids.has(id);
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

    const res = await customerTripService.acceptBid(
      customerUuid,
      bidUuid,
      tripUuid,
      language
    );

    if (res.status) {
      const driverId = bidToAccept.driver_uuid || bidToAccept.driverUuid || '';
      router.push(`/tracking?trip_uuid=${tripUuid}&driver_uuid=${driverId}`);
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
    await customerTripService.cancelTrip(tripUuid, cancelReason, language);
    setIsCancellingTrip(false);
    setShowCancelDialog(false);
    onCancelTrip();
  };

  // Format Service Subtitle (Matching screenshot: "Inter city renter")
  const getFormattedServiceName = () => {
    switch (serviceName) {
      case 'RIDE_SHARE':
        return isBn ? 'রাইড শেয়ার' : 'Ride share';
      case 'INTER_CITY_RENTER':
        return isBn ? 'ইন্টারসিটি রেন্টার' : 'Inter city renter';
      case 'RETURN':
        return isBn ? 'রিটার্ন ট্রিপ' : 'Return trip';
      case 'HOURLY':
        return isBn
          ? `ঘন্টায় রেন্টাল (${hoursBooked || 4} ঘন্টা)`
          : `Hourly rental (${hoursBooked || 4} hours)`;
      case 'AIRPORT_RENTER':
        return isBn ? 'এয়ারপোর্ট ট্রান্সফার' : 'Airport transfer';
      default:
        return serviceName.replace(/_/g, ' ').toLowerCase();
    }
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
        {/* Concentric Animated Radar Icon (Matching screenshot) */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Concentric Pulsing Wave 1 */}
          <span className="absolute w-20 h-20 rounded-full bg-emerald-500/15 animate-ping opacity-60 pointer-events-none" />
          {/* Concentric Ring 2 */}
          <span className="absolute w-16 h-16 rounded-full border border-emerald-400/40 animate-pulse pointer-events-none" />
          {/* Concentric Ring 3 */}
          <span className="absolute w-12 h-12 rounded-full border-2 border-emerald-500/50 pointer-events-none" />
          {/* Center Target Circle */}
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
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

        {/* Finding Driver 2-minute Smooth Progress Bar */}
        <div className="w-full max-w-[280px] bg-slate-200/80 rounded-full h-1.5 overflow-hidden relative shadow-inner">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${topProgressPct}%` }}
          />
        </div>

        {/* Trip Timer Pill & Quick Raise Fare Chip */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
            remainingSeconds <= 10
              ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-mono">{formatCountdown()}</span>
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
                serviceName={serviceName}
                tripCreatedAt={tripCreatedAt}
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
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              {isBn
                ? `${toBanglaDigits(Math.max(1, seenDriverCount || seenDrivers.length || visibleBids.length))} জন চালক আপনার অনুরোধ দেখেছেন`
                : `${Math.max(1, seenDriverCount || seenDrivers.length || visibleBids.length)} driver${(seenDriverCount || seenDrivers.length || visibleBids.length) === 1 ? '' : 's'} viewed your request`}
            </span>
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
            <span className="font-mono">{formatCountdown()}</span>
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
        tripUuid={
          tripUuid ||
          activeTrip?.uuid ||
          (bids[0] as any)?.trip_uuid ||
          (bids[0] as any)?.rental_trip_uuid ||
          ''
        }
        customerUuid={
          customerUuid ||
          activeTrip?.customer_uuid ||
          (activeTrip as any)?.customerUuid ||
          user?.uuid ||
          ''
        }
        onOfferUpdated={(newFare) => {
          setProposedFare(newFare);
          setBottomOfferPrice(newFare);
          setIsTimerExpired(false);
          setHasPromptedExpired(false);
          setCycleStartTs(Date.now());
        }}
        onKeepTrying={() => {
          setIsTimerExpired(false);
          setHasPromptedExpired(false);
          setCycleStartTs(Date.now());
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
  tripCreatedAt: string;
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

  // 40 seconds duration for bid acceptance progress bar
  const totalDurationSeconds = 40;
  const hasExpiredRef = useRef(false);

  // Stable persistent start timestamp for this bid card
  const startTsRef = useRef<number>(Date.now());

  // Calculate start timestamp if bid has a fresh createdAt within the last 40 seconds
  useEffect(() => {
    const raw = bid.created_at || (bid as any).createdAt;
    if (raw) {
      try {
        const formatted =
          typeof raw === 'string' && !raw.includes('T') ? raw.replace(' ', 'T') : raw;
        const ts = new Date(formatted).getTime();
        const diff = Date.now() - ts;
        if (!isNaN(ts) && diff >= 0 && diff < totalDurationSeconds * 1000) {
          startTsRef.current = ts;
        }
      } catch {
        // preserve current mount time
      }
    }
  }, [bid.created_at]);

  const [progressFraction, setProgressFraction] = useState<number>(0);

  // Smooth progress bar update every 100ms; visual indicator only, NEVER auto-cancels!
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - startTsRef.current);
      const totalMs = totalDurationSeconds * 1000;
      const frac = Math.min(1, Math.max(0, elapsedMs / totalMs));

      setProgressFraction(frac);

      if (elapsedMs >= totalMs && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        // Do NOT auto decline! Driver offer remains visible and actionable.
      }
    }, 100);

    return () => clearInterval(interval);
  }, [totalDurationSeconds]);

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

  const baseBidAmount = bid.bid_amount ?? (bid as any).bidAmount ?? numAmount;
  const insuranceAmount = bid.insurance_charge_amount ?? 0;
  const discountAmount = bid.customer_discount_amount ?? 0;

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
      {/* 1. Fare Display with Detailed Breakdown */}
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

          {/* Breakdown: Base + Insurance + Discount */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
            <span>
              {isBn ? 'মূল অফার:' : 'Base Bid:'}{' '}
              <strong className="text-slate-700">
                {isBn
                  ? `৳ ${toBanglaDigits(Math.round(baseBidAmount))}`
                  : `BDT ${Math.round(baseBidAmount)}`}
              </strong>
            </span>
            {insuranceAmount > 0 && (
              <>
                <span>•</span>
                <span>
                  {isBn ? 'বীমা:' : 'Insurance:'}{' '}
                  <strong className="text-slate-700">
                    {isBn
                      ? `৳ ${toBanglaDigits(Math.round(insuranceAmount))}`
                      : `BDT ${Math.round(insuranceAmount)}`}
                  </strong>
                </span>
              </>
            )}
            {discountAmount > 0 && (
              <>
                <span>•</span>
                <span className="text-emerald-600 font-semibold">
                  {isBn ? 'ছাড়:' : 'Discount:'}{' '}
                  -{isBn
                    ? `৳ ${toBanglaDigits(Math.round(discountAmount))}`
                    : `BDT ${Math.round(discountAmount)}`}
                </span>
              </>
            )}
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

        {/* Accept Button with Charcoal Progress Fill */}
        <button
          type="button"
          disabled={isCurrentAccepting}
          onClick={() => onAccept(bid)}
          className={`relative overflow-hidden rounded-2xl bg-black border border-black text-white h-12 px-5 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center cursor-pointer select-none ${
            isCurrentAccepting ? 'opacity-80 pointer-events-none' : 'hover:bg-slate-950'
          }`}
        >
          {/* Charcoal Dark Gray Progress Fill (#505562) filling from right as 40s elapses */}
          <div
            className="absolute inset-y-0 right-0 bg-[#505562] transition-all duration-100 ease-linear pointer-events-none rounded-r-2xl"
            style={{ width: `${progressFraction * 100}%` }}
          />

          {/* Text Overlay in Crisp White */}
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
