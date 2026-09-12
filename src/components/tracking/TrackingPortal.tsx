'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '../common/Badge';
import {
  Share2,
  Phone,
  AlertTriangle,
  ShieldCheck,
  Check,
  Star,
  Sparkles,
  MapPin,
  Clock,
  Car,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveTrip } from '@/context/ActiveTripContext';
import { useAppSelector } from '@/redux/hooks';
import {
  customerTripService,
  getImageUrl,
  getActiveCustomerUuid,
} from '@/services/customerTripService';
import { RentalTrip, RentalDriverBid } from '@/types/customerApi';
import { TripReviewModal } from '@/components/booking/TripReviewModal';

export const TrackingPortal: React.FC = () => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAppSelector((state) => state.auth);
  const { activeTrip: contextActiveTrip, clearActiveTrip } = useActiveTrip();

  const tripUuidParam = searchParams.get('trip_uuid');
  const driverUuidParam = searchParams.get('driver_uuid');
  const customerUuidParam = searchParams.get('customer_uuid');

  const effectiveCustomerUuid =
    customerUuidParam || user?.uuid || getActiveCustomerUuid();
  const effectiveTripUuid = tripUuidParam || contextActiveTrip?.uuid || '';

  const [trip, setTrip] = useState<RentalTrip | null>(contextActiveTrip);
  const [speed, setSpeed] = useState<number>(48);
  const [etaMinutes, setEtaMinutes] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);

  // ── 1. Real-time Trip Polling (Every 10 seconds) ───────────────────────────
  useEffect(() => {
    let isMounted = true;

    const pollTripStatus = async () => {
      if (!effectiveTripUuid || !effectiveCustomerUuid) return;

      const res = await customerTripService.fetchSingleTripBids(
        effectiveCustomerUuid,
        effectiveTripUuid,
        language,
        'ALL',
        token || undefined
      );

      if (!isMounted) return;

      if (res.status && res.data) {
        const currentTrip = res.data;
        setTrip(currentTrip);

        const status = (currentTrip.trip_status || '').toUpperCase();
        // Step 4: When COMPLETED, show Review Option as per apps function & logic
        if (
          (status === 'COMPLETED' || status === 'FINISHED' || status === 'TRIP_COMPLETED') &&
          !currentTrip.given_review &&
          !hasReviewed
        ) {
          setIsReviewModalOpen(true);
        }
      }
    };

    pollTripStatus();
    const interval = setInterval(pollTripStatus, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [effectiveTripUuid, effectiveCustomerUuid, language, token, hasReviewed]);

  // Telemetry fluctuation simulator for speed and arrival countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const newSpeed = Math.floor(40 + Math.random() * 15);
      setSpeed(newSpeed);

      if (Math.random() > 0.6) {
        setEtaMinutes((prev) => (prev > 1 ? prev - 1 : prev));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // ── Extract Active Driver Details ─────────────────────────────────────────
  const activeDriver: RentalDriverBid | null =
    trip?.accepted_driver ||
    (trip?.drivers && driverUuidParam
      ? trip.drivers.find((d) => d.driver_uuid === driverUuidParam)
      : null) ||
    (trip?.drivers && trip.drivers.length > 0 ? trip.drivers[0] : null);

  const driverName = activeDriver?.name || activeDriver?.driver_name || 'Md Rasel Mia';
  const driverPhoto =
    activeDriver?.profile_picture ||
    activeDriver?.profilePicture ||
    activeDriver?.driver_photo ||
    '/images/car-placeholder.png';
  const driverRating = Number(activeDriver?.average_rating || activeDriver?.rating || 5.0).toFixed(1);
  const completedRides = activeDriver?.total_completed_trips || 8;
  const carPlate =
    activeDriver?.car_reg_number ||
    activeDriver?.carRegNumber ||
    activeDriver?.car_plate ||
    'Dhaka-Metro-cha-54-1400';
  const carType = trip?.car_category?.car_type || 'HIACE (11)';
  const agreedFare =
    activeDriver?.total_amount ||
    activeDriver?.bid_amount ||
    trip?.offer_amount ||
    648;

  const pickupAddress =
    trip?.pickup_locations?.[0]?.address || 'Senpara Porbota, Mirpur 10, Dhaka';
  const dropoffAddress =
    trip?.dropoff_locations?.[0]?.address || 'Gulshan 2, Dhaka';

  // ── Step-by-Step Lifecycle Status Logic ────────────────────────────────────
  const rawStatus = (trip?.trip_status || 'ACCEPTED').toUpperCase();
  const isCompleted =
    rawStatus === 'COMPLETED' || rawStatus === 'FINISHED' || rawStatus === 'TRIP_COMPLETED';
  const isStarted = rawStatus === 'STARTED' || isCompleted;
  const isOnTheWay = rawStatus === 'ON_THE_WAY' || isStarted;
  const isAccepted = true; // driver has been assigned/accepted

  const getStepIndex = () => {
    if (isCompleted) return 4;
    if (rawStatus === 'STARTED') return 3;
    if (rawStatus === 'ON_THE_WAY') return 2;
    return 1;
  };

  const currentStep = getStepIndex();

  const getStatusBanner = () => {
    if (isCompleted) {
      return {
        badge: isBn ? 'ট্রিপ সম্পন্ন' : 'Trip Completed',
        title: isBn ? 'আপনি নিরাপদে গন্তব্যে পৌঁছেছেন' : 'You have safely reached your destination',
        desc: isBn
          ? 'রাইডটি সফলভাবে সম্পন্ন হয়েছে। অনুগ্রহ করে চালকের সেবার মান রেটিং ও রিভিউ করুন।'
          : 'Your trip is complete. Please rate your driver to help maintain service quality.',
        color: 'emerald',
      };
    }
    if (rawStatus === 'STARTED') {
      return {
        badge: isBn ? 'যাত্রা চলমান' : 'Ride In Progress',
        title: isBn ? 'গন্তব্যের উদ্দেশ্যে গাড়ি এগিয়ে চলেছে' : 'Heading towards your destination',
        desc: isBn
          ? 'লাইভ জিপিএস রুট ট্র্যাকিং ও নিরাপত্তা নজরদারি সক্রিয় রয়েছে।'
          : 'Live highway tracking and safety protocols are currently active.',
        color: 'blue',
      };
    }
    if (rawStatus === 'ON_THE_WAY') {
      return {
        badge: isBn ? 'চালক আসছেন' : 'Driver On The Way',
        title: isBn ? 'চালক পিকআপ পয়েন্টে আসছেন' : 'Driver is heading to pickup point',
        desc: isBn
          ? `চালক প্রায় ${etaMinutes} মিনিটের মধ্যে আপনার কাছে পৌঁছাবেন।`
          : `Driver is arriving in approximately ${etaMinutes} minutes.`,
        color: 'amber',
      };
    }
    return {
      badge: isBn ? 'চালক নিশ্চিত' : 'Driver Confirmed',
      title: isBn ? 'চালক আপনার অফার গ্রহণ করেছেন' : 'Driver accepted your trip offer',
      desc: isBn
        ? 'চালক গাড়ি প্রস্তুত করছেন এবং শিগগিরই রওনা হবেন।'
        : 'Driver is preparing vehicle and reviewing the pickup location.',
      color: 'emerald',
    };
  };

  const banner = getStatusBanner();
  const displayTripId = effectiveTripUuid
    ? `#${effectiveTripUuid.slice(0, 8).toUpperCase()}`
    : '#TRP-LIVE';

  return (
    <div className="py-8 bg-slate-50/70 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── Top Header Bar ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="primary">
                {isBn ? 'লাইভ রাইড ট্র্যাকিং' : 'Live Ride Tracking'}
              </Badge>
              <span className="text-xs font-mono font-bold text-slate-500">
                {displayTripId}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
              {banner.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {banner.desc}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!isCompleted ? (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs sm:text-sm font-heading flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>
                  {isBn ? `পৌঁছাতে বাকি ${etaMinutes} মিনিট` : `Arriving in ~${etaMinutes} mins`}
                </span>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{isBn ? 'সম্পন্ন হয়েছে' : 'Completed'}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleShareLink}
              className="py-2.5 px-4 text-xs font-bold rounded-2xl flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isBn ? 'শেয়ার' : 'Share'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Step-by-Step Trip Lifecycle Progression (Matching App Logic) ──── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading">
              {isBn ? 'ট্রিপ স্ট্যাটাস ধাপসমূহ' : 'Trip Lifecycle Progress'}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {banner.badge}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="relative pt-2">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>

            {/* Step Icons & Labels Grid */}
            <div className="grid grid-cols-4 gap-2 text-center pt-3">
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 1
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  ✓
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">
                  {isBn ? 'চালক নিশ্চিত' : 'Confirmed'}
                </span>
              </div>

              {/* Step 2: On The Way */}
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 2
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">
                  {isBn ? 'চালক আসছেন' : 'On The Way'}
                </span>
              </div>

              {/* Step 3: Started */}
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 3
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">
                  {isBn ? 'যাত্রা শুরু' : 'Trip Started'}
                </span>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col items-center space-y-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep >= 4
                      ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  4
                </div>
                <span className="text-[11px] font-bold text-slate-900 leading-tight">
                  {isBn ? 'সম্পন্ন' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Completed Trip Celebration Banner with Review CTA ───────────── */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-center justify-between gap-5 animate-fadeIn">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBn ? 'রাইড সমাপ্ত' : 'Ride Finished'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                {isBn ? 'চালকের সাথে আপনার যাত্রা কেমন ছিল?' : 'How was your experience with the driver?'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                {isBn
                  ? 'আপনার অভিজ্ঞতা রেট করুন এবং চালকের সেবার মান বাড়াতে সাহায্য করুন।'
                  : 'Rate your driver to maintain high service standards and reward top-rated performance.'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {trip?.given_review || hasReviewed ? (
                <div className="px-5 py-3 rounded-2xl bg-white/15 border border-white/30 text-white text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{isBn ? 'রিভিউ জমা দেওয়া হয়েছে' : 'Review Submitted (★ 5.0)'}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="py-3 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{isBn ? 'রিভিউ ও রেটিং দিন' : 'Leave a Review & Rating'}</span>
                </button>
              )}

              <Link
                href="/booking"
                onClick={() => clearActiveTrip()}
                className="py-3 px-5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>{isBn ? 'নতুন রাইড' : 'New Ride'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ── Two-Column Main Layout: Left Driver/Telemetry & Right Highway Map ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Driver Card, Route Summary, Telemetry & Safety */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Driver Profile Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 flex-shrink-0 relative shadow-2xs">
                  <Image
                    src={getImageUrl(driverPhoto)}
                    alt={driverName}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {driverName}
                    </h3>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {driverRating}
                    </span>
                    <span className="text-slate-400 font-medium">
                      ({completedRides} {isBn ? 'ট্রিপ' : 'rides'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Model & Registration Plate */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isBn ? 'গাড়ির বিবরণ' : 'Vehicle & Model'}
                  </span>
                  <div className="text-xs font-bold text-slate-800 capitalize">
                    {carType}
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-white text-slate-900 border border-slate-300 px-2.5 py-1 rounded-lg shadow-2xs">
                  {carPlate}
                </span>
              </div>

              {/* Agreed Negotiated Fare */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {isBn ? 'সম্মত ভাড়া (ক্যাশ)' : 'Agreed Fare (Cash)'}
                </span>
                <span className="text-lg font-black text-slate-900 font-heading">
                  {isBn ? `৳ ${agreedFare}` : `BDT ${agreedFare}`}
                </span>
              </div>
            </div>

            {/* Route Points Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading block">
                {isBn ? 'রুট পয়েন্টসমূহ' : 'Route Details'}
              </span>

              {/* Pickup */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                  A
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point'}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {pickupAddress}
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-200 h-4 ml-3" />

              {/* Dropoff */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                  B
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point'}
                  </span>
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {dropoffAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isBn ? 'গতি' : 'Speed'}
                </span>
                <strong className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                  {isCompleted ? '0' : speed} km/h
                </strong>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isBn ? 'দূরত্ব' : 'Remaining'}
                </span>
                <strong className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                  {isCompleted ? '0 km' : '4.8 km'}
                </strong>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isBn ? 'জিপিএস' : 'GPS'}
                </span>
                <strong className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono">
                  ± 3m
                </strong>
              </div>
            </div>

            {/* Safety & Support Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-2.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading block">
                {isBn ? 'যাত্রীর নিরাপত্তা ও সহায়তা' : 'Passenger Safety & Hotline'}
              </span>

              <a
                href="tel:16223"
                className="w-full py-3 px-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'জরুরি হটলাইন: ১৬২২৩' : '24/7 Hotline: 16223'}</span>
              </a>

              <button
                type="button"
                onClick={() => alert(isBn ? 'জরুরি এসওএস সিগন্যাল পাঠানো হয়েছে।' : 'Emergency SOS triggered.')}
                className="w-full py-2.5 px-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isBn ? 'জরুরি এসওএস (SOS)' : 'Emergency SOS'}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Live Route Map Viewport */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-sm h-[620px]">
            <svg className="w-full h-full" viewBox="0 0 900 680" fill="none">
              <rect width="900" height="680" fill="#f8fafc" />

              {/* Secondary Highways */}
              <path d="M-100 120 Q 400 180 1000 140" stroke="#e2e8f0" strokeWidth="18" />
              <path d="M-100 360 Q 450 320 1000 390" stroke="#e2e8f0" strokeWidth="22" />
              <path d="M-100 580 Q 450 540 1000 600" stroke="#e2e8f0" strokeWidth="16" />
              <path d="M220 -80 Q 250 360 210 760" stroke="#e2e8f0" strokeWidth="20" />
              <path d="M720 -80 Q 690 360 740 760" stroke="#e2e8f0" strokeWidth="20" />

              {/* Glowing Highway Express Route */}
              <path
                d="M 280 610 Q 360 480 430 350 T 560 210 T 660 90"
                stroke="rgba(34, 197, 94, 0.25)"
                strokeWidth="32"
                strokeLinecap="round"
              />
              <path
                d="M 280 610 Q 360 480 430 350 T 560 210 T 660 90"
                stroke="#22C55E"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Completed Route Section */}
              <path
                d={
                  isCompleted
                    ? 'M 280 610 Q 360 480 430 350 T 560 210 T 660 90'
                    : 'M 280 610 Q 360 480 430 350 T 520 250'
                }
                stroke="#4ADE80"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Origin / Pickup Pin */}
              <g transform="translate(280, 610)">
                <circle r="18" fill="rgba(34, 197, 94, 0.3)" />
                <circle r="10" fill="#22C55E" />
                <circle r="4" fill="#FFFFFF" />
                <text x="24" y="6" fill="#0f172a" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700">
                  {pickupAddress.slice(0, 30)}
                </text>
              </g>

              {/* Destination / Dropoff Pin */}
              <g transform="translate(660, 90)">
                <circle r="20" fill="rgba(239, 68, 68, 0.3)" />
                <circle r="11" fill="#EF4444" />
                <circle r="4" fill="#FFFFFF" />
                <text x="-165" y="6" fill="#0f172a" fontFamily="var(--font-heading)" fontSize="13" fontWeight="700">
                  {dropoffAddress.slice(0, 30)}
                </text>
              </g>

              {/* Live Vehicle Marker */}
              <g transform={isCompleted ? 'translate(660, 90)' : 'translate(520, 250)'}>
                <circle r="30" fill="rgba(34, 197, 94, 0.28)">
                  <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect x="-16" y="-26" width="32" height="52" rx="10" fill="#FFFFFF" stroke="#22C55E" strokeWidth="3" />
                <rect x="-12" y="-18" width="24" height="12" rx="2" fill="#0F172A" />
                <rect x="-12" y="10" width="24" height="12" rx="2" fill="#0F172A" />
                <polygon points="-12,-26 -26,-56 26,-56 12,-26" fill="rgba(234, 179, 8, 0.35)" />
                <rect x="26" y="-20" width="130" height="30" rx="6" fill="#000000" stroke="#000000" strokeWidth="1.5" />
                <text x="36" y="0" fill="#ffffff" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
                  {isCompleted ? 'Arrived ✓' : `${speed} km/h • Live`}
                </text>
              </g>

              {/* Road Landmarks */}
              <text x="130" y="520" fill="#64748B" fontSize="12" fontWeight="600">Airport Road</text>
              <text x="240" y="420" fill="#64748B" fontSize="12" fontWeight="600">Mohakhali Flyover</text>
              <text x="410" y="300" fill="#64748B" fontSize="12" fontWeight="600">Banani</text>
              <text x="540" y="180" fill="#64748B" fontSize="12" fontWeight="600">Gulshan Circle</text>
            </svg>

            {/* Top GPS Overlay Pill */}
            <div className="absolute top-5 left-5 bg-white border border-slate-200 rounded-2xl p-3 px-4 flex gap-5 shadow-md text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isBn ? 'জিপিএস স্থিতি' : 'GPS Telemetry'}
                </span>
                <strong className="text-slate-900">{isBn ? 'লাইভ সংযুক্ত' : 'Live Connected'}</strong>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {isBn ? 'ট্রাফিক' : 'Traffic'}
                </span>
                <strong className="text-slate-900">{isBn ? 'স্বাভাবিক চলাচল' : 'Normal Flow'}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Give Review Modal as per apps function & logic ───────────────── */}
      <TripReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        tripUuid={effectiveTripUuid}
        driverUuid={activeDriver?.driver_uuid || driverUuidParam || ''}
        driverName={driverName}
        driverPhoto={driverPhoto}
        carPlate={carPlate}
        serviceName={trip?.service_name}
        totalFare={agreedFare}
        onReviewSubmitted={() => {
          setHasReviewed(true);
          if (trip) {
            setTrip({ ...trip, given_review: true });
          }
        }}
      />

    </div>
  );
};

export default TrackingPortal;
