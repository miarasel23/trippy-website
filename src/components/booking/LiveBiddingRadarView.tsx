'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RentalDriverBid, RentalTrip } from '@/types/customerApi';
import { customerTripService, getImageUrl } from '@/services/customerTripService';
import { CarPhotoGalleryModal } from './CarPhotoGalleryModal';
import { RaiseOfferModal } from './RaiseOfferModal';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveTrip } from '@/context/ActiveTripContext';
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
} from 'lucide-react';

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
  isModal = false,
  onCancelTrip,
}) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { user } = useAppSelector((state) => state.auth);
  const { setIsRadarOnPage } = useActiveTrip();

  useEffect(() => {
    if (!isModal && setIsRadarOnPage) {
      setIsRadarOnPage(true);
      return () => {
        setIsRadarOnPage(false);
      };
    }
  }, [isModal, setIsRadarOnPage]);

  const [proposedFare, setProposedFare] = useState<number>(initialProposedFare);
  const [bids, setBids] = useState<RentalDriverBid[]>([]);
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
    await customerTripService.updateOfferAmount(
      customerUuid,
      tripUuid,
      bottomOfferPrice,
      language
    );
    setIsUpdatingBottomOffer(false);
    setProposedFare(bottomOfferPrice);
    // Restart 40-second cycle
    setCycleStartTs(Date.now());
    setIsTimerExpired(false);
    setHasPromptedExpired(false);
  };

  // ── 2. Poll Driver Bids Every 5 Seconds ───────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    const pollBids = async () => {
      if (!customerUuid) return;
      const trips: RentalTrip[] = await customerTripService.fetchBids(
        customerUuid,
        language,
        'REQUESTED'
      );

      if (!isMounted) return;

      if (trips && trips.length > 0) {
        const currentTrip = trips.find((t) => t.uuid === tripUuid) || trips[0];
        if (currentTrip) {
          if (currentTrip.created_at) {
            setTripCreatedAt(currentTrip.created_at);
          }
          if (currentTrip.offer_amount) {
            setProposedFare(currentTrip.offer_amount);
          }
          if (currentTrip.drivers && Array.isArray(currentTrip.drivers)) {
            setBids(currentTrip.drivers);
          }
        }
      }
    };

    pollBids();
    const interval = setInterval(pollBids, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [customerUuid, tripUuid, language]);

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

  // Decline / Hide a Driver Bid
  const handleDeclineBid = async (
    bid: RentalDriverBid,
    comment = 'system decline'
  ) => {
    const bidUuid =
      bid.rent_bid_uuid ||
      bid.rentBidUuid ||
      bid.uuid ||
      bid.driver_uuid ||
      bid.driverUuid ||
      '';

    if (bidUuid) {
      setHiddenBidUuids((prev) => new Set(prev).add(bidUuid));
      await customerTripService.cancelRentBid(bidUuid, comment, language);
    }
  };

  // Filter out hidden bids
  const visibleBids = bids.filter((b) => {
    const id = b.rent_bid_uuid || b.rentBidUuid || b.uuid || b.driver_uuid || b.driverUuid || '';
    return !hiddenBidUuids.has(id);
  });

  // When 40-second timer expires: auto-decline visible bids & popup Raise Offer modal (Photo 2)
  useEffect(() => {
    if (isTimerExpired && !hasPromptedExpired) {
      setHasPromptedExpired(true);

      // Auto decline unaccepted bids via /v1/rental-trip/cancel-rent-bid-driver-or-customer-admin
      if (visibleBids.length > 0) {
        visibleBids.forEach((bid) => {
          handleDeclineBid(bid, 'system decline');
        });
      }

      // Open Raise Offer modal (Photo 2)
      setIsRaiseOfferOpen(true);
    }
  }, [isTimerExpired, hasPromptedExpired, visibleBids]);

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

        {/* Drivers Found Badge / Text (Matching screenshot green headline) */}
        <div className="flex items-center gap-2">
          {visibleBids.length > 0 ? (
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4CAF50] font-heading tracking-tight">
              {isBn
                ? `চালক পাওয়া গেছে! (${visibleBids.length})`
                : `Drivers Found! (${visibleBids.length})`}
            </h2>
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
                onDecline={(b, comment) => handleDeclineBid(b, comment)}
                onAccept={(b) => setBidToAccept(b)}
                onOpenGallery={(b) => handleOpenGallery(b)}
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
                ? `${toBanglaDigits(Math.max(1, visibleBids.length))} জন চালক আপনার অনুরোধ দেখেছেন`
                : `${Math.max(1, visibleBids.length)} driver${visibleBids.length === 1 ? '' : 's'} viewed your request`}
            </span>
            {/* Driver Avatar Thumbnail */}
            {visibleBids.length > 0 && (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100 relative shadow-2xs">
                <Image
                  src={getImageUrl(visibleBids[0].profile_picture || visibleBids[0].driver_photo)}
                  alt="Driver"
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
            )}
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
              {isBn ? 'ড্রাইভারদের অফারের জন্য অপেক্ষা করা হচ্ছে' : 'Waiting for offers from drivers'}
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

      {/* ── Raise Offer / Time Expired Modal (Matching Photo 2) ────────── */}
      <RaiseOfferModal
        isOpen={isRaiseOfferOpen}
        onClose={() => setIsRaiseOfferOpen(false)}
        currentOffer={proposedFare}
        tripUuid={tripUuid}
        customerUuid={customerUuid}
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
              <p className="text-xs text-slate-500 mt-1">
                {isBn
                  ? `${bidToAccept.name || 'চালকের'} প্রস্তাবিত ভাড়া ${formatFare(
                      bidToAccept.bid_amount || proposedFare
                    )} গ্রহণ করে যাত্রা শুরু করবেন?`
                  : `Confirm accepting ride from ${bidToAccept.name || 'driver'} for ${formatFare(
                      bidToAccept.bid_amount || proposedFare
                    )}?`}
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

// ── Driver Bid Card Item with Accept Button Progress Bar & Auto-Decline ──────
interface DriverBidCardItemProps {
  bid: RentalDriverBid;
  serviceName: string;
  tripCreatedAt: string;
  isBn: boolean;
  isCurrentAccepting: boolean;
  onDecline: (bid: RentalDriverBid, comment?: string) => void;
  onAccept: (bid: RentalDriverBid) => void;
  onOpenGallery: (bid: RentalDriverBid) => void;
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
}) => {
  const isRideShare =
    serviceName === 'RIDE_SHARE' ||
    serviceName?.toLowerCase().includes('ride_share') ||
    serviceName?.toLowerCase() === 'rideshare';

  // 40 seconds duration for bid acceptance progress bar
  const totalDurationSeconds = 40;

  const bidCreatedAt =
    bid.created_at || (bid as any).createdAt || tripCreatedAt || new Date().toISOString();
  const hasExpiredRef = useRef(false);

  const parseStartTs = () => {
    if (!bidCreatedAt) return Date.now();
    try {
      const ts = new Date(bidCreatedAt).getTime();
      return isNaN(ts) ? Date.now() : ts;
    } catch {
      return Date.now();
    }
  };

  const [progressFraction, setProgressFraction] = useState<number>(() => {
    const startTs = parseStartTs();
    const elapsedMs = Math.max(0, Date.now() - startTs);
    return Math.min(1, Math.max(0, elapsedMs / (totalDurationSeconds * 1000)));
  });

  // Smooth progress bar update every 100ms
  useEffect(() => {
    const startTs = parseStartTs();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - startTs);
      const totalMs = totalDurationSeconds * 1000;
      const frac = Math.min(1, Math.max(0, elapsedMs / totalMs));

      setProgressFraction(frac);

      if (elapsedMs >= totalMs && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        clearInterval(interval);
        // Automatically call cancel-rent-bid-driver-or-customer-admin when 40s timer completes
        onDecline(bid, 'system decline');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [totalDurationSeconds, bidCreatedAt, onDecline, bid]);

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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-md hover:shadow-lg transition-all space-y-4">
      {/* 1. Fare Display (Big Bold like screenshot: "BDT 664") */}
      <div className="flex items-baseline justify-between">
        <span className="text-3xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight">
          {formattedBidPrice}
        </span>
        <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full">
          {isBn ? 'ক্যাশ পেমেন্ট' : 'Cash'}
        </span>
      </div>

      {/* 2. Driver & Vehicle Profile Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Driver Info Left */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Driver Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex-shrink-0 relative shadow-2xs">
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
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {driverName}
            </h3>
            <div className="flex items-center gap-2 text-xs mt-0.5">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {Number(driverRating).toFixed(1)}
              </span>
              <span className="text-slate-400 font-medium">
                {isBn ? toBanglaDigits(completedRides.toString()) : completedRides} {isBn ? 'ট্রিপ' : 'rides'}
              </span>
            </div>
            <p className="text-xs font-mono font-medium text-slate-600 truncate mt-0.5">
              {carPlate}
            </p>
          </div>
        </div>

        {/* Car Photo Thumbnail with Photo Count Badge (Matching screenshot) */}
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
          className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 transition-all active:scale-98"
        >
          {isBn ? 'বাতিল' : 'Decline'}
        </button>

        {/* Accept Button with Charcoal Progress Fill (Matching Flutter Color(0xFF5A5E6B)) */}
        <button
          type="button"
          disabled={isCurrentAccepting}
          onClick={() => onAccept(bid)}
          className={`relative overflow-hidden rounded-xl bg-black border border-black text-white py-3 px-4 font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center cursor-pointer select-none ${
            isCurrentAccepting ? 'opacity-80 pointer-events-none' : 'hover:bg-slate-900'
          }`}
        >
          {/* Charcoal Dark Gray Progress Fill (Smooth 40s linear transition) */}
          <div
            className="absolute inset-y-0 right-0 bg-[#5A5E6B] transition-all duration-100 ease-linear pointer-events-none"
            style={{ width: `${progressFraction * 100}%` }}
          />

          {/* Text Overlay in Crisp White - No seconds text displayed */}
          <div className="relative z-10 flex items-center justify-center gap-1.5">
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
