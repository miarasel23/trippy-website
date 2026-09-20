'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useActiveTrip } from '@/features/trips/context/ActiveTripContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/store/hooks';
import { useAppDispatch } from '@/store/hooks';
import { openLoginModal } from '@/features/auth/store/authSlice';
import { LiveBiddingRadarView } from '@/features/bidding/components/LiveBiddingRadarView';
import Image from 'next/image';
import { TripReviewModal } from '@/features/bidding/components/TripReviewModal';
import {
  customerTripService,
  getActiveCustomerUuid,
  getImageUrl,
} from '@/features/trips/services/customerTripService';
import { RentalTrip } from '@/features/trips/types/customerApi';
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
  CheckCircle2,
  XCircle,
  User,
  LogIn,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { formatTripServiceType } from '@/shared/utils/serviceFormat';
import { clearAllTripRelatedStorage, markTripReviewed, isTripReviewed } from '@/shared/utils/tripStorage';

const TripsContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  // ── Auth Gate: Show login prompt if user is not authenticated ─────────────
  if (mounted && !isAuthenticated) {
    return (
      <div className="py-16 bg-slate-50 min-h-[85vh] flex items-center">
        <div className="max-w-sm mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
            <User className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div>
            <Badge variant="primary" className="mb-3">
              {isBn ? 'লগইন প্রয়োজন' : 'Login Required'}
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading mb-2">
              {isBn ? 'আপনার ট্রিপ দেখতে লগইন করুন' : 'Sign in to View Your Trips'}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              {isBn
                ? 'আপনার রাইড ইতিহাস, চলমান ট্রিপ ও লাইভ ট্র্যাকিং দেখতে আপনার অ্যাকাউন্টে প্রবেশ করুন।'
                : 'Access your ride history, active trips and live tracking by signing in to your account.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(openLoginModal())}
            className="w-full py-3.5 px-6 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-black/10 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
          </button>

          <Link
            href="/booking"
            className="w-full py-3 px-6 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Car className="w-4 h-4 text-slate-500" />
            <span>{isBn ? 'রাইড বুক করুন' : 'Book a Ride'}</span>
          </Link>
        </div>
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
    (rawStatus === 'ACCEPTED' ||
     rawStatus === 'ON_THE_WAY' ||
     rawStatus === 'STARTED' ||
     rawStatus === 'IN_PROGRESS' ||
     rawStatus === 'INPROGRESS' ||
     rawStatus === 'RIDE_STARTED' ||
     rawStatus === 'FIRST_COMPLETED')
  );

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
      <div className="py-8 bg-slate-50/60 min-h-screen relative overflow-hidden bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <LiveBiddingRadarView
            tripUuid={currentTrip.uuid || ''}
            customerUuid={effectiveCustomerUuid}
            serviceName={
              currentTrip.service_name ||
              (currentTrip as any).service_type ||
              (currentTrip as any).servive_type ||
              currentTrip.car_service?.service_name
            }
            proposedFare={currentTrip.offer_amount || 0}
            pickupAddress={pickupAddress}
            dropoffAddress={dropoffAddress}
            vehicleName={vehicleName}
            hoursBooked={
              currentTrip.hours_booked ||
              (currentTrip as any).hours ||
              (currentTrip as any).rental_duration ||
              undefined
            }
            createdAt={
              currentTrip.created_at ||
              (currentTrip as any).createdAt ||
              (currentTrip as any).creation_date ||
              (currentTrip as any).created_date ||
              (typeof window !== 'undefined' && currentTrip.uuid
                ? localStorage.getItem(`trippy_trip_created_${currentTrip.uuid}`) ||
                  sessionStorage.getItem(`trippy_trip_created_${currentTrip.uuid}`) ||
                  undefined
                : undefined)
            }
            onTripUuidUpdated={(newUuid) => {
              if (specificTrip) {
                setSpecificTrip((prev) => (prev ? { ...prev, uuid: newUuid } : null));
              }
            }}
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


  // ── 2. All Trips List View with Review Status Check & Total Amount ───────
  const [customerTrips, setCustomerTrips] = useState<RentalTrip[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [selectedReviewTrip, setSelectedReviewTrip] = useState<RentalTrip | null>(null);

  useEffect(() => {
    if (!isTripRequested && !isTripActive && !isTripCompleted) {
      setIsLoadingList(true);
      customerTripService
        .fetchBids(effectiveCustomerUuid, language, 'ALL', token || undefined)
        .then((trips) => {
          if (Array.isArray(trips)) {
            setCustomerTrips(trips);
          }
        })
        .finally(() => {
          setIsLoadingList(false);
        });
    }
  }, [effectiveCustomerUuid, language, token, isTripRequested, isTripActive, isTripCompleted]);

  if (isLoadingList) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4">
        <div className="relative flex h-10 w-10 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-10 w-10 bg-emerald-500 items-center justify-center text-white">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-600">
          {isBn ? 'আপনার ট্রিপসমূহ লোড হচ্ছে...' : 'Loading your trips...'}
        </p>
      </div>
    );
  }

  // If customer has trips in ALL list, render them
  if (customerTrips.length > 0) {
    return (
      <div className="py-10 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="primary">{isBn ? 'ট্রিপ হিস্ট্রি' : 'Trip History'}</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading mt-1">
                {isBn ? 'আমার ট্রিপসমূহ' : 'My Trips & Bookings'}
              </h1>
            </div>

            <Link
              href="/booking"
              className="px-5 py-2.5 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <span>{isBn ? 'নতুন রাইড' : 'New Ride'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Trips Cards Grid */}
          <div className="space-y-4">
            {customerTrips.map((tripItem) => {
              const status = (tripItem.trip_status || '').toUpperCase();
              const isItemCompleted =
                status === 'COMPLETED' || status === 'FINISHED' || status === 'TRIP_COMPLETED';
              const isItemActive =
                status === 'IN_PROGRESS' ||
                status === 'RIDE_STARTED' ||
                status === 'FIRST_COMPLETED' ||
                status === 'ACCEPTED' ||
                status === 'ON_THE_WAY';
              const isItemRequested = status === 'REQUESTED';
              const isItemCancelled =
                status === 'CANCELLED' ||
                status === 'CANCELED' ||
                status === 'TRIP_CANCELLED' ||
                status === 'CANCEL';

              const activeDriver =
                tripItem.accepted_driver ||
                (tripItem.drivers && tripItem.drivers.length > 0 ? tripItem.drivers[0] : null);

              const fare =
                tripItem.total_amount ||
                activeDriver?.total_amount ||
                activeDriver?.bid_amount ||
                tripItem.offer_amount ||
                0;

              const pickup =
                tripItem.pickup_locations?.[0]?.address || (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point');
              const dropoff =
                tripItem.dropoff_locations?.[0]?.address || (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point');

              // Review check: review_status or given_review check
              const needsReview =
                isItemCompleted && !isTripReviewed(tripItem, tripItem.uuid);

              // Dynamic styling based on trip status:
              // - Completed: Light green card (bg-emerald-50/75 border-emerald-200)
              // - Cancelled: Red card (bg-red-50/80 border-red-200)
              // - Active/Default: Clean white card
              const cardClasses = isItemCancelled
                ? 'bg-red-50/80 border-red-200/90 hover:border-red-300'
                : isItemCompleted
                ? 'bg-emerald-50/75 border-emerald-200/90 hover:border-emerald-300'
                : 'bg-white border-slate-200/90 hover:border-slate-300';

              const dividerBorder = isItemCancelled
                ? 'border-red-200/60'
                : isItemCompleted
                ? 'border-emerald-200/60'
                : 'border-slate-100';

              const routeBoxClasses = isItemCancelled
                ? 'bg-white/85 border border-red-200/60'
                : isItemCompleted
                ? 'bg-white/85 border border-emerald-200/60'
                : 'bg-slate-50 border border-transparent';

              return (
                <div
                  key={tripItem.uuid || tripItem.id}
                  className={`rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 hover:shadow-md transition-all border ${cardClasses}`}
                >
                  {/* Top Row: Service name, Date & Total Fare */}
                  <div className={`flex items-start justify-between gap-3 pb-3 border-b ${dividerBorder}`}>
                    <div>
                      {(() => {
                        const itemServiceInfo = formatTripServiceType(
                          tripItem.service_name ||
                            (tripItem as any).service_type ||
                            (tripItem as any).servive_type ||
                            tripItem.car_service?.service_name,
                          tripItem.hours_booked ||
                            (tripItem as any).hours ||
                            (tripItem as any).rental_duration,
                          language
                        );
                        return (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs ${itemServiceInfo.badgeColor}`}>
                              {itemServiceInfo.name}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isItemCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isItemCancelled
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : isItemActive
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                                  : isItemRequested
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isItemCancelled
                                ? (isBn ? 'বাতিলকৃত ট্রিপ' : 'CANCELLED')
                                : isItemCompleted
                                ? (isBn ? 'সম্পন্ন' : 'COMPLETED')
                                : status}
                            </span>
                          </div>
                        );
                      })()}
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        {tripItem.created_at || tripItem.start_datetime || 'Recently booked'}
                      </span>
                    </div>

                    {/* Always show total_amount in front of customer */}
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {isBn ? 'সর্বমোট ভাড়া' : 'TOTAL FARE'}
                      </span>
                      <span className={`text-base sm:text-lg font-black font-heading ${
                        isItemCancelled ? 'text-red-900 line-through opacity-80' : 'text-slate-900'
                      }`}>
                        BDT {fare}
                      </span>
                    </div>
                  </div>

                  {/* Route Row */}
                  <div className={`space-y-2 rounded-2xl p-3.5 text-xs ${routeBoxClasses}`}>
                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {isBn ? 'পিকআপ' : 'PICKUP'}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 truncate" title={pickup}>
                          {pickup}
                        </p>
                      </div>
                    </div>

                    <div className="border-l border-slate-300 ml-1 h-2" />

                    <div className="flex items-start gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {isBn ? 'ড্রপঅফ' : 'DROPOFF'}
                        </span>
                        <p className="text-xs font-semibold text-slate-800 truncate" title={dropoff}>
                          {dropoff}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Driver & Action Button Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    {activeDriver ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-300 bg-slate-100 relative flex-shrink-0">
                          <Image
                            src={getImageUrl(activeDriver.profile_picture || activeDriver.profilePicture)}
                            alt={activeDriver.name || 'Driver'}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {activeDriver.name || activeDriver.driver_name || 'Driver'}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {activeDriver.car_reg_number || activeDriver.carRegNumber || 'Vehicle'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">
                        {isBn ? 'কোনো চালক নির্ধারিত হয়নি' : 'Driver not assigned yet'}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Review Option if Completed and review_status is false */}
                      {needsReview && activeDriver?.driver_uuid && (
                        <button
                          type="button"
                          onClick={() => setSelectedReviewTrip(tripItem)}
                          className="py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{isBn ? 'রিভিউ দিন' : 'Rate Driver'}</span>
                        </button>
                      )}

                      {isItemCompleted && !needsReview && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isBn ? 'রিভিউ সম্পন্ন' : 'Reviewed ★ 5.0'}</span>
                        </span>
                      )}

                      {isItemCancelled && (
                        <span className="text-xs font-bold text-red-800 bg-red-100 border border-red-300 px-3 py-1.5 rounded-xl flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span>{isBn ? 'বাতিলকৃত ট্রিপ' : 'Trip Cancelled'}</span>
                        </span>
                      )}

                      {isItemActive && (
                        <Link
                          href={`/tracking?trip_uuid=${tripItem.uuid}`}
                          className="py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span>{isBn ? 'লাইভ ট্র্যাকিং' : 'Live Tracking'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      {isItemRequested && (
                        <Link
                          href={`/trips?trip_uuid=${tripItem.uuid}`}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                        >
                          <span>{isBn ? 'বিডিং রাডার' : 'Bidding Radar'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal for selected review trip */}
          {selectedReviewTrip && (
            <TripReviewModal
              isOpen={Boolean(selectedReviewTrip)}
              onClose={() => setSelectedReviewTrip(null)}
              tripUuid={selectedReviewTrip.uuid || ''}
              driverUuid={
                selectedReviewTrip.accepted_driver?.driver_uuid ||
                selectedReviewTrip.drivers?.[0]?.driver_uuid ||
                ''
              }
              driverName={
                selectedReviewTrip.accepted_driver?.name ||
                selectedReviewTrip.drivers?.[0]?.name ||
                'Driver'
              }
              driverPhoto={
                selectedReviewTrip.accepted_driver?.profile_picture ||
                selectedReviewTrip.drivers?.[0]?.profile_picture
              }
              carPlate={
                selectedReviewTrip.accepted_driver?.car_reg_number ||
                selectedReviewTrip.drivers?.[0]?.car_reg_number
              }
              totalFare={
                selectedReviewTrip.total_amount ||
                selectedReviewTrip.offer_amount ||
                0
              }
              pickupAddress={
                selectedReviewTrip.pickup_locations?.[0]?.address || 'Pickup'
              }
              dropoffAddress={
                selectedReviewTrip.dropoff_locations?.[0]?.address || 'Dropoff'
              }
              onReviewSubmitted={() => {
                if (selectedReviewTrip.uuid) {
                  markTripReviewed(selectedReviewTrip.uuid);
                  clearAllTripRelatedStorage(selectedReviewTrip.uuid);
                }
                setSelectedReviewTrip(null);
                // Refresh trips
                customerTripService
                  .fetchBids(effectiveCustomerUuid, language, 'ALL', token || undefined)
                  .then((trips) => {
                    if (Array.isArray(trips)) setCustomerTrips(trips);
                  });
              }}
            />
          )}

        </div>
      </div>
    );
  }

  // ── 3. No Active Trip View (Empty State) ───────────────────────────────────
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
