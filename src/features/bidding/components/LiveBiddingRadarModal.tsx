'use client';

import React from 'react';
import { useActiveTrip } from '@/features/trips/context/ActiveTripContext';
import { LiveBiddingRadarView } from './LiveBiddingRadarView';
import { X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export const LiveBiddingRadarModal: React.FC = () => {
  const {
    activeTrip,
    isRadarModalOpen,
    closeRadarModal,
    customerUuid,
    clearActiveTrip,
    setActiveTripManually,
  } = useActiveTrip();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const rawStatus = (activeTrip?.trip_status || '').toUpperCase();
  const isAcceptedOrActive =
    rawStatus !== 'REQUESTED' ||
    Boolean(activeTrip?.accepted_bid_uuid) ||
    Boolean(activeTrip?.accepted_driver);

  if (!isRadarModalOpen || !activeTrip || isAcceptedOrActive) return null;

  const pickupAddress =
    activeTrip.pickup_locations?.map((l) => l.address).filter(Boolean).join(' → ') ||
    (isBn ? 'পিকআপ লোকেশন' : 'Pickup Location');

  const dropoffAddress =
    activeTrip.dropoff_locations?.[0]?.address ||
    (isBn ? 'ড্রপঅফ লোকেশন' : 'Dropoff Location');

  const vehicleName =
    activeTrip.car_category?.car_type ||
    (isBn ? 'স্ট্যান্ডার্ড গাড়ি' : 'Standard Vehicle');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/60 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col ring-1 ring-black/10">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              {isBn ? 'লাইভ ড্রাইভার বিডিং রাডার' : 'Live Driver Bidding Radar'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/booking?trip_uuid=${activeTrip.uuid}`}
              onClick={closeRadarModal}
              className="text-xs text-slate-500 hover:text-black flex items-center gap-1 font-semibold transition-colors"
            >
              <span>{isBn ? 'বুকিং পেজে দেখুন' : 'Full Booking Page'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={closeRadarModal}
              className="p-1.5 rounded-full text-slate-500 hover:text-black hover:bg-slate-200 transition-colors"
              aria-label="Close radar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embed LiveBiddingRadarView */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-4 bg-slate-50/50">
          <LiveBiddingRadarView
            tripUuid={activeTrip.uuid || ''}
            customerUuid={customerUuid}
            serviceName={
              activeTrip.service_name ||
              (activeTrip as any).service_type ||
              (activeTrip as any).servive_type ||
              activeTrip.car_service?.service_name
            }
            proposedFare={activeTrip.offer_amount || 0}
            pickupAddress={pickupAddress}
            dropoffAddress={dropoffAddress}
            vehicleName={vehicleName}
            hoursBooked={
              activeTrip.hours_booked ||
              (activeTrip as any).hours ||
              (activeTrip as any).rental_duration ||
              undefined
            }
            createdAt={
              activeTrip.created_at ||
              (activeTrip as any).createdAt ||
              (activeTrip as any).creation_date ||
              (activeTrip as any).created_date ||
              (typeof window !== 'undefined' && activeTrip.uuid
                ? localStorage.getItem(`trippy_trip_created_${activeTrip.uuid}`) ||
                  sessionStorage.getItem(`trippy_trip_created_${activeTrip.uuid}`) ||
                  undefined
                : undefined)
            }
            isModal={true}
            onTripUuidUpdated={(newUuid) => {
              setActiveTripManually({ ...activeTrip, uuid: newUuid });
            }}
            onCancelTrip={() => {
              clearActiveTrip();
              closeRadarModal();
            }}
          />
        </div>
      </div>
    </div>
  );
};
