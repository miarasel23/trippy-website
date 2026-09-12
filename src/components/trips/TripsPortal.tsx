'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActiveTrip } from '@/context/ActiveTripContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/redux/hooks';
import { LiveBiddingRadarView } from '@/components/booking/LiveBiddingRadarView';
import Image from 'next/image';
import { TripReviewModal } from '@/components/booking/TripReviewModal';
import {
  customerTripService,
  getActiveCustomerUuid,
  getImageUrl,
} from '@/services/customerTripService';
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
  Star,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';

const TripsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { token } = useAppSelector((state) => state.auth);

  const {
    activeTrip: contextActiveTrip,
    customerUuid,
    clearActiveTrip,
    refreshActiveTrip,
    isLoading: isRefreshing,
  } = useActiveTrip();

  const tripUuidParam = searchParams.get('trip_uuid');
  const customerUuidParam = searchParams.get('customer_uuid');
  const effectiveCustomerUuid = customerUuidParam || customerUuid || getActiveCustomerUuid();

  const [specificTrip, setSpecificTrip] = useState<RentalTrip | null>(null);
  const [isLoadingSpecific, setIsLoadingSpecific] = useState<boolean>(false);

  // If a specific trip_uuid was passed in query, try fetching it via single trip bids endpoint
  useEffect(() => {
    if (tripUuidParam && (!contextActiveTrip || contextActiveTrip.uuid !== tripUuidParam)) {
      setIsLoadingSpecific(true);
      customerTripService
        .fetchSingleTripBids(effectiveCustomerUuid, tripUuidParam, language, 'ALL', token || undefined)
        .then((res) => {
          if (res.status && res.data) {
            setSpecificTrip(res.data);
          } else {
            // Fallback to fetchBids list
            customerTripService
              .fetchBids(effectiveCustomerUuid, language, 'REQUESTED', token || undefined)
              .then((trips) => {
                const match = trips.find((t) => t.uuid === tripUuidParam);
                if (match) setSpecificTrip(match);
              });
          }
        })
        .finally(() => {
          setIsLoadingSpecific(false);
        });
    }
  }, [tripUuidParam, effectiveCustomerUuid, language, contextActiveTrip, token]);

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
  const rawStatus = (currentTrip?.trip_status || '').toUpperCase();
  const isTripRequested = Boolean(currentTrip && rawStatus === 'REQUESTED');
  const isTripCompleted = Boolean(
    currentTrip &&
    (rawStatus === 'COMPLETED' || rawStatus === 'FINISHED' || rawStatus === 'TRIP_COMPLETED')
  );
  const isTripActive = Boolean(
    currentTrip &&
    (rawStatus === 'ACCEPTED' || rawStatus === 'ON_THE_WAY' || rawStatus === 'STARTED')
  );

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);

  // Auto redirect active trips (ACCEPTED, ON_THE_WAY, STARTED) to live tracking
  useEffect(() => {
    if (isTripActive && currentTrip?.uuid) {
      const driverId =
        currentTrip.accepted_driver?.driver_uuid ||
        currentTrip.drivers?.[0]?.driver_uuid ||
        '';
      router.push(`/tracking?trip_uuid=${currentTrip.uuid}${driverId ? `&driver_uuid=${driverId}` : ''}`);
    }
  }, [isTripActive, currentTrip?.uuid, currentTrip?.accepted_driver?.driver_uuid, currentTrip?.drivers, router]);

  // If completed and not yet reviewed, auto-open review modal
  useEffect(() => {
    if (isTripCompleted && currentTrip && !currentTrip.given_review && !hasReviewed) {
      setIsReviewModalOpen(true);
    }
  }, [isTripCompleted, currentTrip, hasReviewed]);

  if (isTripRequested && currentTrip) {
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
            customerUuid={effectiveCustomerUuid}
            serviceName={currentTrip.service_name}
            proposedFare={currentTrip.offer_amount || 0}
            pickupAddress={pickupAddress}
            dropoffAddress={dropoffAddress}
            vehicleName={vehicleName}
            hoursBooked={currentTrip.hours_booked || undefined}
            note={currentTrip.note || undefined}
            createdAt={currentTrip.created_at}
            initialBids={currentTrip.drivers || []}
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

  // ── 2. If Trip is in Progress (ACCEPTED, ON_THE_WAY, STARTED) ────────────────
  if (isTripActive && currentTrip) {
    const activeDriver =
      currentTrip.accepted_driver ||
      (currentTrip.drivers && currentTrip.drivers.length > 0 ? currentTrip.drivers[0] : null);
    const driverId = activeDriver?.driver_uuid || '';

    return (
      <div className="py-16 bg-slate-50 min-h-[85vh] flex items-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-pulse">
            <Compass className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="primary" className="mb-2">
              {rawStatus === 'STARTED'
                ? isBn ? 'যাত্রা শুরু হয়েছে' : 'Ride In Progress'
                : rawStatus === 'ON_THE_WAY'
                ? isBn ? 'চালক আসছেন' : 'Driver On The Way'
                : isBn ? 'চালক নিশ্চিত' : 'Driver Confirmed'}
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'লাইভ ট্র্যাকিং পেজে নিয়ে যাওয়া হচ্ছে...' : 'Redirecting to Live Trip Tracking...'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isBn
                ? 'আপনার রাইড সক্রিয় রয়েছে। চালকের অবস্থান ও টার্ন-বাই-টার্ন ম্যাপ দেখতে নিচে ক্লিক করুন।'
                : 'Your ride is active. Click below to view driver location, live speed, and GPS route.'}
            </p>
          </div>

          <Link
            href={`/tracking?trip_uuid=${currentTrip.uuid}${driverId ? `&driver_uuid=${driverId}` : ''}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-sm shadow-xl shadow-black/10 transition-all"
          >
            <span>{isBn ? 'লাইভ ট্র্যাকিং খুলুন' : 'Open Live GPS Tracking'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── 3. If Trip is Completed: Show Completion Card & Review Option ──────────
  if (isTripCompleted && currentTrip) {
    const activeDriver =
      currentTrip.accepted_driver ||
      (currentTrip.drivers && currentTrip.drivers.length > 0 ? currentTrip.drivers[0] : null);
    const driverId = activeDriver?.driver_uuid || '';
    const driverName = activeDriver?.name || activeDriver?.driver_name || 'Md Rasel Mia';
    const driverPhoto = activeDriver?.profile_picture || '/images/car-placeholder.png';
    const carPlate = activeDriver?.car_reg_number || 'Dhaka-Metro-cha-54-1400';
    const totalFare = activeDriver?.total_amount || currentTrip.offer_amount || 0;

    const pickupAddress =
      currentTrip.pickup_locations?.[0]?.address || (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point');
    const dropoffAddress =
      currentTrip.dropoff_locations?.[0]?.address || (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point');

    return (
      <div className="py-12 bg-slate-50 min-h-[85vh]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <Badge variant="primary">
              {isBn ? 'ট্রিপ সফলভাবে সম্পন্ন' : 'Trip Safely Completed'}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              {isBn ? 'আপনার যাত্রা সম্পন্ন হয়েছে' : 'Your Journey is Complete'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {isBn
                ? 'নিরাপদ ভ্রমণের জন্য ধন্যবাদ। অনুগ্রহ করে চালকের সেবার মান রেটিং করুন।'
                : 'Thank you for riding with Trippy. Please rate your driver to help maintain safety and excellence.'}
            </p>
          </div>

          {/* Trip Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
            {/* Driver Profile */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 relative">
                  <Image
                    src={getImageUrl(driverPhoto)}
                    alt={driverName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{driverName}</h3>
                  <p className="text-xs text-slate-400 font-mono">{carPlate}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  {isBn ? 'মোট ভাড়া' : 'Total Fare'}
                </span>
                <span className="text-lg font-black text-slate-900">
                  {isBn ? `৳ ${totalFare}` : `BDT ${totalFare}`}
                </span>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-2 bg-slate-50 rounded-2xl p-4 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 truncate">{pickupAddress}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 truncate">{dropoffAddress}</span>
              </div>
            </div>

            {/* Review Action */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {currentTrip.given_review || hasReviewed ? (
                <div className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isBn ? 'রিভিউ সম্পন্ন হয়েছে (★ 5.0)' : 'Review Submitted (★ 5.0)'}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{isBn ? 'চালকের রিভিউ ও রেটিং দিন' : 'Rate Driver & Leave Review'}</span>
                </button>
              )}

              <Link
                href="/booking"
                onClick={() => {
                  clearActiveTrip();
                  setSpecificTrip(null);
                }}
                className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm text-center transition-all flex items-center justify-center gap-1.5"
              >
                <span>{isBn ? 'নতুন রাইড বুক করুন' : 'Book Another Ride'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Review Modal */}
          {driverId && currentTrip.uuid && (
            <TripReviewModal
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              tripUuid={currentTrip.uuid}
              driverUuid={driverId}
              driverName={driverName}
              driverPhoto={driverPhoto}
              carPlate={carPlate}
              serviceName={currentTrip.service_name}
              totalFare={totalFare}
              onReviewSubmitted={() => {
                setHasReviewed(true);
                setIsReviewModalOpen(false);
                refreshActiveTrip();
              }}
            />
          )}
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
