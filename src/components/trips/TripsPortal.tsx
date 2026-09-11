'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActiveTrip } from '@/context/ActiveTripContext';
import { useLanguage } from '@/context/LanguageContext';
import { LiveBiddingRadarView } from '@/components/booking/LiveBiddingRadarView';
import { customerTripService } from '@/services/customerTripService';
import { RentalTrip } from '@/types/customerApi';
import {
  Car,
  Compass,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

const TripsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const {
    activeTrip: contextActiveTrip,
    customerUuid,
    clearActiveTrip,
    refreshActiveTrip,
    isLoading: isRefreshing,
  } = useActiveTrip();

  const tripUuidParam = searchParams.get('trip_uuid');
  const [specificTrip, setSpecificTrip] = useState<RentalTrip | null>(null);
  const [isLoadingSpecific, setIsLoadingSpecific] = useState<boolean>(false);

  // If a specific trip_uuid was passed in query, try fetching it
  useEffect(() => {
    if (tripUuidParam && (!contextActiveTrip || contextActiveTrip.uuid !== tripUuidParam)) {
      setIsLoadingSpecific(true);
      customerTripService
        .fetchBids(customerUuid, language, 'REQUESTED')
        .then((trips) => {
          const match = trips.find((t) => t.uuid === tripUuidParam);
          if (match) {
            setSpecificTrip(match);
          }
        })
        .finally(() => {
          setIsLoadingSpecific(false);
        });
    }
  }, [tripUuidParam, customerUuid, language, contextActiveTrip]);

  const currentTrip = specificTrip || contextActiveTrip;

  if (isLoadingSpecific) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="relative flex h-10 w-10 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500 items-center justify-center text-white">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {isBn ? 'ট্রিপ লোড হচ্ছে...' : 'Loading trip details...'}
        </p>
      </div>
    );
  }

  // ── 1. If an active requested trip is found: Show Live Bidding Radar ────────
  if (currentTrip && currentTrip.trip_status === 'REQUESTED') {
    const pickupAddress =
      currentTrip.pickup_locations?.map((l) => l.address).filter(Boolean).join(' → ') ||
      (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point');

    const dropoffAddress =
      currentTrip.dropoff_locations?.[0]?.address ||
      (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point');

    const vehicleName =
      currentTrip.car_category?.car_type ||
      (isBn ? 'স্ট্যান্ডার্ড গাড়ি' : 'Vehicle');

    return (
      <div className="py-8 bg-slate-950/95 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>← {isBn ? 'হোমে ফিরে যান' : 'Back to Home'}</span>
            </Link>

            <button
              type="button"
              onClick={() => refreshActiveTrip()}
              disabled={isRefreshing}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>
          </div>

          <LiveBiddingRadarView
            tripUuid={currentTrip.uuid || ''}
            customerUuid={customerUuid}
            serviceName={currentTrip.service_name}
            proposedFare={currentTrip.offer_amount || 0}
            pickupAddress={pickupAddress}
            dropoffAddress={dropoffAddress}
            vehicleName={vehicleName}
            hoursBooked={currentTrip.hours_booked || undefined}
            note={currentTrip.note || undefined}
            createdAt={currentTrip.created_at}
            onCancelTrip={() => {
              clearActiveTrip();
              setSpecificTrip(null);
              router.push('/');
            }}
          />
        </div>
      </div>
    );
  }

  // ── 2. No Active Trip View ────────────────────────────────────────────────
  return (
    <div className="py-16 bg-slate-50 min-h-[85vh] flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-sm mb-6">
          <Compass className="w-10 h-10 stroke-[1.5]" />
        </div>

        <Badge variant="primary" className="mb-3">
          {isBn ? 'ট্রিপ হাব' : 'Trips Hub'}
        </Badge>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mb-3">
          {isBn ? 'বর্তমানে কোনো চলমান ট্রিপ নেই' : 'No Active Trips in Progress'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
          {isBn
            ? 'আপনি যখন কোনো রাইড শেয়ার বা ইন্টারসিটি ট্রিপ অনুরোধ করবেন, চালকদের লাইভ বিড এবং রিয়েল-টাইম রাডার এখানে প্রদর্শিত হবে।'
            : 'When you request a ride or intercity car rental, driver counter-offers and live radar tracking will appear here automatically.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/booking"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white text-sm font-bold shadow-lg shadow-black/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{isBn ? 'রাইড বুকিং শুরু করুন' : 'Book a Ride Now'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/fleet"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
          >
            <Car className="w-4 h-4 text-slate-500" />
            <span>{isBn ? 'গাড়ির তালিকা দেখুন' : 'Explore Fleet'}</span>
          </Link>
        </div>

        {/* Info Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 text-left">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'নিজের প্রস্তাবিত ভাড়া' : 'Set Your Fare'}</span>
            </div>
            <p className="text-xs text-slate-500">
              {isBn ? 'কোনো হিডেন সারচার্জ ছাড়া নিজের ভাড়ায় ভ্রমণ।' : 'Propose your fare and choose from multiple driver counter-offers.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'যাচাইকৃত চালক' : 'Verified Drivers'}</span>
            </div>
            <p className="text-xs text-slate-500">
              {isBn ? 'চালকের প্রোফাইল, রেটিং ও গাড়ির ছবি দেখে নির্বাচন।' : 'Inspect vehicle interior & exterior photos before accepting.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'লাইভ জিপিএস ট্র্যাকিং' : 'Live GPS Radar'}</span>
            </div>
            <p className="text-xs text-slate-500">
              {isBn ? 'ম্যাপে চালকের রিয়েল-টাইম অবস্থান পর্যবেক্ষণ করুন।' : 'Full Google Maps integration and driver route tracking.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TripsPortal: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      }
    >
      <TripsContent />
    </Suspense>
  );
};

export default TripsPortal;
