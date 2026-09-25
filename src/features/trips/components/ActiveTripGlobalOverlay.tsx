'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActiveTrip } from '@/features/trips/context/ActiveTripContext';
import { useLanguage } from '@/context/LanguageContext';
import { LiveBiddingRadarModal } from '@/features/bidding/components/LiveBiddingRadarModal';
import { formatTripServiceType } from '@/shared/utils/serviceFormat';
import {
  Radio,
  ChevronRight,
  Minimize2,
  Maximize2,
  X,
  Zap,
  ArrowRight,
} from 'lucide-react';

export const ActiveTripGlobalOverlay: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    activeTrip,
    bidsCount,
    isOverlayVisible,
    isMinimized,
    isRadarOnPage,
    isRadarModalOpen,
    setMinimized,
    dismissOverlay,
    openRadarModal,
  } = useActiveTrip();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  if (!mounted) return null;

  // Check if activeTrip status is strictly a pending REQUESTED bidding trip
  const rawStatus = (activeTrip?.trip_status || '').toUpperCase();
  const isRequestedBiddingTrip = rawStatus === 'REQUESTED';
  const hasAcceptedDriver =
    Boolean(activeTrip?.accepted_bid_uuid) ||
    Boolean(activeTrip?.accepted_driver) ||
    Boolean((activeTrip as any)?.driver_uuid) ||
    Boolean((activeTrip as any)?.driver) ||
    Boolean((activeTrip as any)?.assigned_driver);

  // If trip is not strictly in REQUESTED bidding state or has an assigned driver, it is an accepted / active ride
  const isAcceptedOrActiveTrip = !isRequestedBiddingTrip || hasAcceptedDriver;

  // Check if an active ride is marked in browser storage
  const hasActiveRideInStorage =
    typeof window !== 'undefined' &&
    localStorage.getItem('trippy_has_active_ride') === 'true';

  // Do not show floating popup card when:
  // 1. User is on /tracking, /booking, /trips
  // 2. An active ride or accepted trip is ongoing (bidding phase is finished)
  // 3. Current activeTrip is not in pending REQUESTED status
  // 4. Radar modal is open or radar view is already active on current page
  const isRadarActiveOnCurrentPage =
    isRadarOnPage ||
    pathname.startsWith('/booking') ||
    pathname.startsWith('/trips') ||
    pathname.startsWith('/tracking') ||
    isRadarModalOpen;

  if (
    !activeTrip ||
    !isOverlayVisible ||
    !isRequestedBiddingTrip ||
    isAcceptedOrActiveTrip ||
    hasActiveRideInStorage ||
    isRadarActiveOnCurrentPage
  ) {
    return <LiveBiddingRadarModal />;
  }

  const pickup =
    activeTrip.pickup_locations?.[0]?.address ||
    (isBn ? 'পিকআপ লোকেশন' : 'Pickup Location');
  const dropoff =
    activeTrip.dropoff_locations?.[0]?.address ||
    (isBn ? 'ড্রপঅফ লোকেশন' : 'Dropoff Location');

  const fare = activeTrip.offer_amount || 0;
  const formattedFare = isBn
    ? `৳ ${fare.toLocaleString('en-IN')}`
    : `BDT ${fare.toLocaleString('en-IN')}`;

  const formatServiceName = (name?: string, hours?: string | number | null) => {
    return formatTripServiceType(name, hours, language).name;
  };

  // ── Minimized Floating Pill View (Black & White Theme) ─────────────────────
  if (isMinimized) {
    return (
      <>
        <div className="fixed bottom-5 right-5 z-[9990] animate-bounce-short">
          <button
            type="button"
            onClick={() => setMinimized(false)}
            className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 rounded-full shadow-2xl backdrop-blur-xl transition-all duration-300 group ring-1 ring-black/5"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>

            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <span>
                  {formatServiceName(
                    activeTrip.service_name ||
                      (activeTrip as any).service_type ||
                      (activeTrip as any).servive_type ||
                      activeTrip.car_service?.service_name,
                    activeTrip.hours_booked ||
                      (activeTrip as any).hours ||
                      (activeTrip as any).rental_duration
                  )}
                </span>
                <span className="text-black font-extrabold">{formattedFare}</span>
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold">
                {bidsCount > 0
                  ? isBn
                    ? `🚗 ${bidsCount}টি ড্রাইভার বিড এসেছে!`
                    : `🚗 ${bidsCount} Driver Bids!`
                  : isBn
                  ? '📡 চালক খোঁজা হচ্ছে...'
                  : '📡 Waiting for bids...'}
              </div>
            </div>

            <div className="p-1 rounded-full bg-black text-white group-hover:scale-105 transition-all ml-1">
              <Maximize2 className="w-3 h-3" />
            </div>
          </button>
        </div>
        <LiveBiddingRadarModal />
      </>
    );
  }

  // ── Expanded Floating Card View (White Background & Black Button) ───────────
  return (
    <>
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9990] w-[calc(100vw-2.5rem)] sm:w-[400px] max-w-[420px] animate-slide-up">
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-2xl text-slate-900 overflow-hidden ring-1 ring-black/10">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                  {isBn ? 'চলমান রাইড অনুরোধ' : 'LIVE RIDE REQUEST'}
                </span>
                <span className="block text-[11px] text-slate-500 font-medium">
                  {formatServiceName(
                    activeTrip.service_name ||
                      (activeTrip as any).service_type ||
                      (activeTrip as any).servive_type ||
                      activeTrip.car_service?.service_name,
                    activeTrip.hours_booked ||
                      (activeTrip as any).hours ||
                      (activeTrip as any).rental_duration
                  )}
                  {activeTrip.car_category?.car_type ? ` • ${activeTrip.car_category.car_type}` : ''}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
                title={isBn ? 'মিনিমাইজ করুন' : 'Minimize'}
                aria-label="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={dismissOverlay}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 hover:text-slate-700 transition-colors"
                title={isBn ? 'বন্ধ করুন' : 'Dismiss'}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5 space-y-4">
            {/* Route Stops Box */}
            <div className="space-y-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 ring-4 ring-emerald-500/20" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {isBn ? 'পিকআপ' : 'PICKUP'}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 truncate" title={pickup}>
                    {pickup}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-1 h-2.5" />

              <div className="flex items-start gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0 ring-4 ring-amber-500/20" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    {isBn ? 'ড্রপঅফ' : 'DROPOFF'}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 truncate" title={dropoff}>
                    {dropoff}
                  </p>
                </div>
              </div>
            </div>

            {/* Proposed Fare & Drivers Bids Count */}
            <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {isBn ? 'প্রস্তাবিত ভাড়া' : 'PROPOSED FARE'}
                </span>
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  {formattedFare}
                </span>
              </div>

              <div className="text-right">
                {bidsCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold animate-pulse">
                    <Zap className="w-3.5 h-3.5 fill-current text-emerald-600" />
                    {isBn ? `${bidsCount}টি বিড প্রস্তুত!` : `${bidsCount} Bids Ready!`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-medium shadow-xs">
                    <Radio className="w-3.5 h-3.5 text-emerald-600 animate-spin" style={{ animationDuration: '3s' }} />
                    {isBn ? 'বিডের অপেক্ষায়...' : 'Waiting for bids...'}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Pure Black Button with White Text */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={openRadarModal}
                className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/15 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>{isBn ? 'লাইভ বিডিং রাডার দেখুন' : 'View Live Bidding Radar'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>

              <div className="flex items-center justify-between px-1">
                <Link
                  href={`/booking?trip_uuid=${activeTrip.uuid}`}
                  className="text-xs font-semibold text-slate-500 hover:text-black transition-colors flex items-center gap-1"
                >
                  <span>{isBn ? 'বুকিং পেজে যান' : 'Go to Booking Page'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/trips"
                  className="text-xs font-semibold text-slate-500 hover:text-black transition-colors"
                >
                  {isBn ? 'আমার ট্রিপসমূহ' : 'My Trips'}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <LiveBiddingRadarModal />
    </>
  );
};

export default ActiveTripGlobalOverlay;
