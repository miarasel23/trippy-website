'use client';

import React from 'react';
import Image from 'next/image';
import { RentalDriverBid } from '@/features/trips/types/customerApi';
import { getImageUrl } from '@/features/trips/services/customerTripService';
import { CarPhotoGalleryModal } from './CarPhotoGalleryModal';
import { RaiseOfferModal } from './RaiseOfferModal';
import { TripReviewModal } from './TripReviewModal';
import { DriverBidCardItem } from './DriverBidCardItem';
import { clearAllTripRelatedStorage, markTripReviewed } from '@/shared/utils/tripStorage';
import {
  useBiddingLogic,
  formatFare,
  toBanglaDigits,
  hasDriverBidsChanged,
  hasSeenDriversChanged,
} from '../helpers';
import {
  ArrowLeft,
  Clock,
  Star,
  Loader2,
  AlertCircle,
  Car,
  MapPin,
  Navigation,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';

export { hasDriverBidsChanged, hasSeenDriversChanged, toBanglaDigits };

export interface LiveBiddingRadarViewProps {
  tripUuid: string;
  customerUuid: string;
  serviceName?: string;
  proposedFare: number;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleName: string;
  hoursBooked?: string | number;
  note?: string;
  createdAt?: string;
  initialBids?: RentalDriverBid[];
  isModal?: boolean;
  onTripUuidUpdated?: (newUuid: string) => void;
  onCancelTrip: () => void;
}

export const LiveBiddingRadarView: React.FC<LiveBiddingRadarViewProps> = (props) => {
  const {
    pickupAddress,
    dropoffAddress,
    note,
    onCancelTrip,
  } = props;

  const {
    isBn,
    user,
    currentTripUuid,
    currentTripUuidRef,
    internalServiceName,
    proposedFare,
    visibleBids,
    seenDrivers,
    seenDriverCount,
    isSocketConnected,
    effectiveCreatedAt,
    remainingSeconds,
    topProgressPct,
    formatCountdown,
    bottomOfferPrice,
    isUpdatingBottomOffer,
    offerUpdatedNotice,
    handleBottomDecrement,
    handleBottomIncrement,
    handleBottomRaiseFare,
    isDrawerExpanded,
    setIsDrawerExpanded,
    isGalleryOpen,
    setIsGalleryOpen,
    galleryImages,
    galleryCarName,
    galleryRegNumber,
    handleOpenGallery,
    reviewsModalBid,
    setReviewsModalBid,
    completedTripForReview,
    setIsTripCompletedReviewOpen,
    isTripCompletedReviewOpen,
    isRaiseOfferOpen,
    setIsRaiseOfferOpen,
    bidToAccept,
    setBidToAccept,
    isAccepting,
    handleDeclineBid,
    handleConfirmAcceptBid,
    showCancelDialog,
    setShowCancelDialog,
    cancelReason,
    setCancelReason,
    isCancellingTrip,
    handleConfirmCancelTrip,
    handleRaiseOfferUpdated,
    handleKeepTrying,
    getFormattedServiceName,
  } = useBiddingLogic(props);

  return (
    <div className="w-full max-w-xl mx-auto min-h-[580px] flex flex-col justify-between relative pb-6">

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-3 mb-4 border-b border-slate-100">
        {/* Back Arrow */}
        <button
          type="button"
          onClick={() => setShowCancelDialog(true)}
          className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-900 transition-colors cursor-pointer"
          title={isBn ? 'ট্রিপ বাতিল বা ফিরে যান' : 'Cancel or Go Back'}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-900" />
        </button>

        {/* Title and Subtitle */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-heading">
              {isBn ? 'আপনার রাইড খোঁজা হচ্ছে' : 'Finding your ride'}
            </h1>
            {isSocketConnected && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200 shadow-2xs"
                title={isBn ? 'রিয়েল-টাইম সকেট সংযোগ সক্রিয়' : 'Real-time WebSocket active'}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
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
        {/* Continuous Smooth 360° Radar Scanner */}
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

          {/* Sonar Wave 1 */}
          <span className="absolute w-24 h-24 rounded-full border border-emerald-500/40 bg-emerald-500/10 pointer-events-none animate-radar-ripple-1" />

          {/* Sonar Wave 2 */}
          <span className="absolute w-24 h-24 rounded-full border border-emerald-500/40 bg-emerald-500/10 pointer-events-none animate-radar-ripple-2" />

          {/* Mid Concentric Guide Ring */}
          <div className="absolute w-16 h-16 rounded-full border border-emerald-500/30 pointer-events-none" />

          {/* Inner Concentric Guide Ring */}
          <div className="absolute w-10 h-10 rounded-full border border-emerald-500/40 pointer-events-none" />

          {/* Radar Coordinate Crosshairs */}
          <div className="absolute w-full h-[1px] bg-emerald-500/15 pointer-events-none" />
          <div className="absolute h-full w-[1px] bg-emerald-500/15 pointer-events-none" />

          {/* Center Target Beacon */}
          <div className="relative z-10 w-7 h-7 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center animate-beacon-pulse shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-[0_0_4px_rgba(5,150,105,0.8)]" />
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          {isBn ? 'আরও চালকদের খোঁজ চলছে...' : 'Searching for more drivers...'}
        </p>

        {/* Drivers Found Badge / Headline */}
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

        {/* Progress Bar */}
        <div className="w-full max-w-[280px] bg-slate-200/80 rounded-full h-1.5 overflow-hidden relative shadow-inner">
          <div
            className="bg-emerald-500 h-full w-full rounded-full pointer-events-none will-change-transform"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, topProgressPct / 100))})`,
              transformOrigin: 'left',
              transition: 'transform 1000ms linear',
            }}
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
            <span className="font-mono tabular-nums tracking-wider">{formatCountdown()}</span>
          </div>

          {/* Quick Raise Fare Chip */}
          <button
            type="button"
            onClick={() => setIsRaiseOfferOpen(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>{isBn ? 'ভাড়া বাড়ান' : 'Raise Fare'}</span>
          </button>
        </div>
      </div>

      {/* ── Bids List Section ────────────────────────────────────────────── */}
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-100 shadow-2xs transition-colors mt-2 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              {isBn ? 'ভাড়া বাড়িয়ে দ্রুত চালক পান' : 'Raise Fare to Attract Drivers'}
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Section: Drivers Viewed + Stepper Fare Card ───────────── */}
      <div className="mt-4 space-y-3">
        {/* Header line above card */}
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

        {/* Bottom Card */}
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
                  ? `আপনার নতুন প্রস্তাবিত ভাড়া ${formatFare(proposedFare, isBn)} সফলভাবে আপডেট হয়েছে`
                  : `Your proposed fare of ${formatFare(proposedFare, isBn)} has been updated`}
              </span>
            </div>
          )}

          {/* Stepper: [ -10 ]   BDT 15409   [ +10 ] */}
          <div className="grid grid-cols-12 gap-3 items-center">
            <button
              type="button"
              onClick={handleBottomDecrement}
              className="col-span-3 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shadow-2xs cursor-pointer"
            >
              {isBn ? '-১০' : '-10'}
            </button>

            <div className="col-span-6 text-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                {formatFare(bottomOfferPrice, isBn)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleBottomIncrement}
              className="col-span-3 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm border border-slate-200 flex items-center justify-center transition-colors active:scale-95 shadow-2xs cursor-pointer"
            >
              {isBn ? '+১০' : '+10'}
            </button>
          </div>

          {/* [ Raise fare ] Button */}
          <button
            type="button"
            disabled={isUpdatingBottomOffer}
            onClick={handleBottomRaiseFare}
            className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-2xl border border-slate-200 shadow-2xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isUpdatingBottomOffer ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <span>{isBn ? 'ভাড়া বাড়ান' : 'Raise fare'}</span>
            )}
          </button>

          {/* Collapsible Details */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsDrawerExpanded((prev) => !prev)}
              className="w-full py-2 flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
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
                    {formatFare(proposedFare, isBn)}
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
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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

      {/* ── Raise Offer / Time Expired Modal ────────────────────────────── */}
      <RaiseOfferModal
        isOpen={isRaiseOfferOpen}
        onClose={() => setIsRaiseOfferOpen(false)}
        currentOffer={proposedFare}
        tripUuid={currentTripUuidRef.current || currentTripUuid || props.tripUuid}
        customerUuid={props.customerUuid}
        onOfferUpdated={handleRaiseOfferUpdated}
        onKeepTrying={handleKeepTrying}
      />

      {/* ── Accept Bid Confirmation Dialog ────────────────────────────── */}
      {bidToAccept && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (!isAccepting && e.target === e.currentTarget) {
              setBidToAccept(null);
            }
          }}
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <Car className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isBn ? 'চালকের বিড গ্রহণ করবেন?' : 'Accept Driver Bid?'}
              </h3>

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
                      {formatFare(totalAmt, isBn)}
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
                disabled={Boolean(isAccepting)}
                onClick={() => setBidToAccept(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                {isBn ? 'না, ভাবছি' : 'No'}
              </button>

              <button
                type="button"
                disabled={Boolean(isAccepting)}
                onClick={handleConfirmAcceptBid}
                className={`relative overflow-hidden py-2.5 px-4 rounded-xl font-bold text-xs border shadow-sm transition-all select-none ${
                  isAccepting
                    ? 'bg-slate-900 border-slate-800 text-white cursor-wait opacity-95'
                    : 'bg-black hover:bg-slate-900 border-black text-white active:scale-98 cursor-pointer'
                }`}
              >
                {isAccepting && (
                  <div
                    className="absolute inset-0 bg-emerald-950/70 pointer-events-none animate-btn-fill"
                    style={{ willChange: 'width' }}
                  />
                )}

                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isAccepting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400 shrink-0" />
                      <span>{isBn ? 'গ্রহণ করা হচ্ছে...' : 'Accepting...'}</span>
                    </>
                  ) : (
                    <span>{isBn ? 'হ্যাঁ, গ্রহণ করুন' : 'Yes, Accept'}</span>
                  )}
                </div>

                {isAccepting && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 w-full animate-btn-progress" />
                  </div>
                )}
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
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
              >
                {isBn ? 'না, অপেক্ষা করি' : 'No, Keep Looking'}
              </button>

              <button
                type="button"
                disabled={isCancellingTrip}
                onClick={handleConfirmCancelTrip}
                className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs border border-red-600 shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>{isBn ? 'যাত্রীদের প্রতিক্রিয়া ও রেটিং' : 'Passenger Reviews & Ratings'}</span>
              <span className="font-bold text-slate-900">
                {reviewsModalBid.rating_list?.length || 0} {isBn ? 'টি রিভিউ' : 'reviews'}
              </span>
            </div>

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

                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating || 5 }).map((_, sIdx) => (
                          <Star
                            key={sIdx}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>

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

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const toAccept = reviewsModalBid;
                  setReviewsModalBid(null);
                  setBidToAccept(toAccept);
                }}
                className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
            const u = completedTripForReview.uuid || props.tripUuid;
            if (u) markTripReviewed(u);
            clearAllTripRelatedStorage(u);
            setIsTripCompletedReviewOpen(false);
            onCancelTrip();
          }}
          tripUuid={completedTripForReview.uuid || props.tripUuid || ''}
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
            const u = completedTripForReview.uuid || props.tripUuid;
            if (u) markTripReviewed(u);
            clearAllTripRelatedStorage(u);
            setIsTripCompletedReviewOpen(false);
            onCancelTrip();
          }}
        />
      )}

    </div>
  );
};

export default LiveBiddingRadarView;
