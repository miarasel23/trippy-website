'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { RentalDriverBid } from '@/features/trips/types/customerApi';
import { getImageUrl } from '@/features/trips/services/customerTripService';
import { parseAsiaBangladeshTimestamp } from '@/shared/utils/serviceFormat';
import { toBanglaDigits } from '../helpers/biddingFormatters';
import { Star, Loader2, Image as ImageIcon, MessageSquare } from 'lucide-react';

export interface DriverBidCardItemProps {
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

export const DriverBidCardItem: React.FC<DriverBidCardItemProps> = ({
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
  //   RIDE_SHARE  → 2 minutes (120 seconds)
  //   All others  → 40 minutes (2400 seconds)
  const totalDurationSecondsRaw = isRideShare ? 2 * 60 : 40 * 60;

  // Lock duration in a ref so service-type changes from polling don't reset the bar
  const totalDurRef = useRef<number>(totalDurationSecondsRaw);
  const hasExpiredRef = useRef(false);

  // Effective bid date: bid's own created_at takes priority; fall back to tripCreatedAt
  const effectiveBidDate =
    bid.created_at ||
    (bid as any).createdAt ||
    (bid as any).creation_date ||
    (bid as any).created_date ||
    tripCreatedAt;

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

  // Smooth progress bar update every 1000ms (1s) — empty deps so it NEVER restarts on polling
  useEffect(() => {
    hasExpiredRef.current = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const update = () => {
      const now = Date.now();
      const elapsedMs = Math.max(0, now - startTsRef.current);
      const totalMs = totalDurRef.current * 1000;
      const frac = Math.min(1, Math.max(0, elapsedMs / totalMs));

      setProgressFraction(frac);

      if (elapsedMs >= totalMs && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };

    update();
    if (!hasExpiredRef.current) {
      interval = setInterval(update, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
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
              unoptimized
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/avatar-placeholder.png';
              }}
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

          {/* Gallery Count Pill Badge */}
          <div className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-white rounded-md px-1.5 py-0.5 text-[9px] font-bold flex items-center gap-1 border border-white/20">
            <ImageIcon className="w-2.5 h-2.5" />
            <span>{isBn ? toBanglaDigits(displayPhotoCount.toString()) : displayPhotoCount}</span>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons: Decline & Accept with Progress Bar */}
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
          {/* Charcoal Dark Gray Progress Fill (#374151) */}
          <div
            className="absolute inset-0 bg-[#374151] pointer-events-none rounded-2xl will-change-transform"
            style={{
              transform: `scaleX(${Math.min(1, Math.max(0, 1 - progressFraction))})`,
              transformOrigin: 'right',
              transition: 'transform 1000ms linear',
            }}
          />

          {/* Text Overlay */}
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
