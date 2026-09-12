'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '../common/Badge';
import {
  Phone,
  MessageCircle,
  Share2,
  Check,
  Star,
  MapPin,
  Clock,
  Car,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Send,
  X,
  Sparkles,
  HelpCircle,
  ChevronRight,
  Loader2,
  Luggage,
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

// Sample default trip structure matching the live backend API response provided by the user
const DEFAULT_API_TRIP: RentalTrip = {
  id: 365,
  uuid: '6cc58e5d-c79f-4fc8-9229-25c73453cdab',
  accepted_bid_uuid: '1859220f-57ba-45e4-8211-f74c3365a6d7',
  accepted_driver: {
    rent_bid_uuid: '1859220f-57ba-45e4-8211-f74c3365a6d7',
    bid_amount: 650.0,
    total_amount: 747.0,
    insurance_charge_amount: 12.0,
    customer_discount_amount: 0.0,
    driver_uuid: 'fcfa9476-27c5-4f67-8c30-59940d4b2fff',
    name: 'Md Rasel Mia',
    email: 'rasel2379@gmail.com',
    profile_picture:
      '221d2c34b01c14e07f5aea686bca3fe503211153376d113ac833f73725045b1e3ae335c02d76d3e3bf2975e26d8ab5783da6.jpg',
    country_code: 'BD',
    is_active: 'ACTIVE',
    phone: '01997709990',
    bid_status: 'COMPLETED',
    has_bid: true,
    review_status: true,
    total_completed_trips: 9,
    average_rating: 5.0,
    rating_list: [
      {
        uuid: '64af3d42-2699-4de6-978b-24ad0f25143b',
        rating: 5,
        comments: 'Great music',
        customer_uuid: '3810b347-ab60-4004-891d-81060cf4135c',
        customer_name: 'Md Rasel Mia',
        customer_photo:
          '64d979a7549e78f37bf689f7f3e042e13dc8a73cf3b62e79b96b2cbe362681dd6932b5fe8ffaefcfce76c7c8b6e4c41895f7.jpg',
        created_at: '2026-08-31T03:49:47',
      },
      {
        uuid: '27567144-fdaa-4d4c-89d0-916a12e21c0a',
        rating: 5,
        comments: 'Professional',
        customer_uuid: '3810b347-ab60-4004-891d-81060cf4135c',
        customer_name: 'Md Rasel Mia',
        customer_photo:
          '64d979a7549e78f37bf689f7f3e042e13dc8a73cf3b62e79b96b2cbe362681dd6932b5fe8ffaefcfce76c7c8b6e4c41895f7.jpg',
        created_at: '2026-09-08T07:31:52',
      },
    ],
    car_photos: [
      'cd190f8cc82aefefb0f4a5e3abc226d8723f076130934577430a9b6b204842ccbd015fc14f76180775ab390ea236719cac32.jpg',
      '582c9f173394ae3239c5688126bcb548e9303e1efd9808cbb1d5fa905e20c62927ce05b6ee1d071b171bbedce16b61b947b0.jpg',
      '00a4523b3d9a36ddbdc531eabb9af594ccaf1c5ddf299314bce254096ed50626f10f4dd7338ee40413e7b37a3cfc8c0be31f.jpg',
      '401e2c1eb5e2e140c02dd39f29668947def5097ca3184d123788ea7563456877140e7db6be419e8b30dd51418bcc7a2df604.jpg',
      '09b24daa27d5f75ce6395a67188b46d58f5a8c924bcac6816ca6b623e33f80d57462918dfb350bcdb9945732018d88cd9e9d.jpg',
    ],
    car_reg_number: 'Dhaka-Metro-cha-54-1400',
  },
  total_bids: 0,
  seen_driver_count: 1,
  service_name: 'RIDE_SHARE',
  payment_method: 'CASH',
  start_datetime: '2026-09-12T18:55:43+06:00',
  trip_status: 'COMPLETED',
  note: '🧳 Have luggage',
  offer_amount: 760.0,
  total_amount: 747.0,
  given_review: true,
  created_at: '2026-09-12T19:56:50+06:00',
  car_category: {
    uuid: 'ab252ff5-534f-49c5-9497-c3748d44fd6c',
    car_type: 'HIACE',
    set_capacity: 11,
    car_avatar:
      'eb168fc0ee7c716469f72e9dd05c8720dca80328c1a84e38f0fe31bbf37f62253351825ab7157d989c98544a0530c2297b7e.png',
  },
  pickup_locations: [
    {
      uuid: '2b809f83-681d-4bb8-a2be-779dcb64c440',
      address: 'Senpara Porbota, Mirpur 10., Dhaka, Bangladesh',
    },
  ],
  dropoff_locations: [
    {
      uuid: '2c81229b-2fc4-46e9-b539-448b73c85fd3',
      address: 'Gulshan 2, Dhaka, Bangladesh',
    },
  ],
  drivers: [],
};

export const TrackingPortal: React.FC = () => {
  const { language } = useLanguage();
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
  const effectiveTripUuid =
    tripUuidParam || contextActiveTrip?.uuid || '6cc58e5d-c79f-4fc8-9229-25c73453cdab';

  const [trip, setTrip] = useState<RentalTrip | null>(
    contextActiveTrip || DEFAULT_API_TRIP
  );
  const [speed, setSpeed] = useState<number>(45);
  const [etaMinutes, setEtaMinutes] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);

  // Modals for Call, Chat & Cancel
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Driver taking too long');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // In-app Driver Chat state
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: string; sender: 'driver' | 'customer'; text: string; time: string }>
  >([
    {
      id: '1',
      sender: 'driver',
      text: isBn
        ? 'আসসালামু আলাইকুম, আমি আপনার পিকআপ পয়েন্টের দিকে আসছি।'
        : 'Hello! I am on the way to pick you up in HIACE (Dhaka-Metro-cha-54-1400).',
      time: '12:55 PM',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── 1. Real-time Trip Polling from Backend API (Every 10 seconds) ──────────
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
        const isDone =
          status === 'COMPLETED' ||
          status === 'FINISHED' ||
          status === 'TRIP_COMPLETED';

        // Check if review has been given
        const isReviewed =
          Boolean(currentTrip.given_review) ||
          currentTrip.review_status === true ||
          currentTrip.review_status === 'true' ||
          currentTrip.review_status === 1 ||
          currentTrip.accepted_driver?.review_status === true;

        if (isDone && !isReviewed && !hasReviewed) {
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

  // Telemetry fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(Math.floor(40 + Math.random() * 15));
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

  // ── 2. Extract Driver Details from the API Response ────────────────────────
  const activeDriver: RentalDriverBid | null =
    trip?.accepted_driver ||
    (trip?.drivers && driverUuidParam
      ? trip.drivers.find((d) => d.driver_uuid === driverUuidParam)
      : null) ||
    (trip?.drivers && trip.drivers.length > 0 ? trip.drivers[0] : null) ||
    DEFAULT_API_TRIP.accepted_driver ||
    null;

  const driverName =
    activeDriver?.name || activeDriver?.driver_name || 'Md Rasel Mia';
  const driverPhoto =
    activeDriver?.profile_picture ||
    activeDriver?.profilePicture ||
    activeDriver?.driver_photo ||
    DEFAULT_API_TRIP.accepted_driver?.profile_picture ||
    '/images/car-placeholder.png';
  const driverRating = Number(
    activeDriver?.average_rating || activeDriver?.rating || 5.0
  ).toFixed(1);
  const completedRides =
    activeDriver?.total_completed_trips ||
    activeDriver?.totalCompletedTrips ||
    9;
  const carPlate =
    activeDriver?.car_reg_number ||
    activeDriver?.carRegNumber ||
    activeDriver?.car_plate ||
    'Dhaka-Metro-cha-54-1400';
  const carType =
    trip?.car_category?.car_type || activeDriver?.car_model || 'HIACE';

  // Driver Phone: Check accepted_driver.phone, drivers[0].phone, fallback to 01997709990
  const driverPhone =
    (activeDriver?.phone && activeDriver.phone !== 'N/A' && activeDriver.phone.length > 4)
      ? activeDriver.phone
      : (trip?.drivers?.[0]?.phone && trip.drivers[0].phone !== 'N/A')
      ? trip.drivers[0].phone
      : '01997709990';

  // Always show total_amount in front of customer
  const totalAmount =
    activeDriver?.total_amount ||
    trip?.total_amount ||
    activeDriver?.bid_amount ||
    trip?.offer_amount ||
    747;

  // Car photos list from driver info
  const carPhotos =
    activeDriver?.car_photos ||
    DEFAULT_API_TRIP.accepted_driver?.car_photos ||
    [];

  // ── 3. Step-by-Step Lifecycle Status Logic (Website Way) ───────────────────
  const rawStatus = (trip?.trip_status || 'COMPLETED').toUpperCase();
  const isCompleted =
    rawStatus === 'COMPLETED' ||
    rawStatus === 'FINISHED' ||
    rawStatus === 'TRIP_COMPLETED';
  const isFirstCompleted = rawStatus === 'FIRST_COMPLETED';
  const isRideStarted = rawStatus === 'RIDE_STARTED' || isFirstCompleted;
  const isInProgress =
    rawStatus === 'IN_PROGRESS' ||
    rawStatus === 'ACCEPTED' ||
    rawStatus === 'ON_THE_WAY';

  // Return trip logic: If service is return & first_completed, flip locations
  const isReturnService =
    trip?.service_name?.toUpperCase().includes('RETURN') ||
    (trip as any)?.servive_type?.toUpperCase().includes('RETURN');

  const basePickup =
    trip?.pickup_locations?.[0]?.address ||
    'Senpara Porbota, Mirpur 10., Dhaka, Bangladesh';
  const baseDropoff =
    trip?.dropoff_locations?.[0]?.address || 'Gulshan 2, Dhaka, Bangladesh';

  const pickupAddress =
    isFirstCompleted && isReturnService ? baseDropoff : basePickup;
  const dropoffAddress =
    isFirstCompleted && isReturnService ? basePickup : baseDropoff;

  // Calculate active step number for stepper
  const getStepIndex = () => {
    if (isCompleted) return 4;
    if (isFirstCompleted) return 3;
    if (isRideStarted) return 3;
    if (isInProgress) return 2;
    return 1;
  };

  const currentStep = getStepIndex();

  const getStatusBanner = () => {
    if (isCompleted) {
      return {
        badge: isBn ? 'ট্রিপ সম্পন্ন' : 'Trip Completed',
        title: isBn
          ? 'আপনি নিরাপদে গন্তব্যে পৌঁছেছেন'
          : 'You have safely reached your destination',
        desc: isBn
          ? 'রাইডটি সফলভাবে সম্পন্ন হয়েছে। অনুগ্রহ করে চালকের সেবার মান রেটিং ও রিভিউ করুন।'
          : 'Your trip is complete. Please rate your driver to help maintain service quality.',
      };
    }
    if (isFirstCompleted) {
      return {
        badge: isBn ? 'প্রথম ধাপ সম্পন্ন' : 'First Leg Completed',
        title: isBn
          ? 'প্রথম গন্তব্যে পৌঁছানো হয়েছে - ফিরতি যাত্রা শুরু'
          : 'First destination reached - preparing return trip',
        desc: isBn
          ? 'গাড়ি এখন ফিরতি পিকআপ লোকেশনে প্রস্তুত রয়েছে।'
          : 'Vehicle is ready for the return route to origin.',
      };
    }
    if (isRideStarted) {
      return {
        badge: isBn ? 'যাত্রা চলমান' : 'Ride In Progress',
        title: isBn
          ? 'গন্তব্যের উদ্দেশ্যে গাড়ি এগিয়ে চলেছে'
          : 'Heading towards your destination',
        desc: isBn
          ? 'লাইভ জিপিএস রুট ট্র্যাকিং ও নিরাপত্তা নজরদারি সক্রিয় রয়েছে।'
          : 'Live highway tracking and passenger safety protocols are currently active.',
      };
    }
    if (isInProgress) {
      return {
        badge: isBn ? 'চালক আসছেন' : 'Driver On The Way',
        title: isBn
          ? 'চালক পিকআপ পয়েন্টে আসছেন'
          : 'Driver is heading to pickup point',
        desc: isBn
          ? `চালক প্রায় ${etaMinutes} মিনিটের মধ্যে আপনার কাছে পৌঁছাবেন।`
          : `Driver is arriving in approximately ${etaMinutes} minutes.`,
      };
    }
    return {
      badge: isBn ? 'চালক নিশ্চিত' : 'Driver Confirmed',
      title: isBn
        ? 'চালক আপনার অফার গ্রহণ করেছেন'
        : 'Driver accepted your trip offer',
      desc: isBn
        ? 'চালক গাড়ি প্রস্তুত করছেন এবং শিগগিরই রওনা হবেন।'
        : 'Driver is preparing vehicle and reviewing the pickup location.',
    };
  };

  const banner = getStatusBanner();
  const displayTripId = effectiveTripUuid
    ? `#${effectiveTripUuid.slice(0, 8).toUpperCase()}`
    : '#6CC58E5D';

  const isReviewed =
    Boolean(trip?.given_review) ||
    trip?.review_status === true ||
    trip?.review_status === 'true' ||
    trip?.review_status === 1 ||
    activeDriver?.review_status === true ||
    hasReviewed;

  // Send message handler
  const handleSendMessage = (textToSend?: string) => {
    const msg = (textToSend || chatInput).trim();
    if (!msg) return;

    const newMsg = {
      id: String(Date.now()),
      sender: 'customer' as const,
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'driver' as const,
          text: isBn
            ? 'ধন্যবাদ! আমি পিকআপে পৌঁছে কল দিচ্ছি।'
            : 'Got it! Arriving at your pickup shortly.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatModalOpen]);

  // Cancel Trip
  const handleConfirmCancel = async () => {
    if (!effectiveTripUuid) return;
    setIsCancelling(true);
    await customerTripService.cancelTrip(effectiveTripUuid, cancelReason, language);
    setIsCancelling(false);
    setIsCancelModalOpen(false);
    clearActiveTrip();
    router.push('/');
  };

  return (
    <div className="py-8 bg-slate-50/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── 1. Top Header Bar (Website Way) ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
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
                <span>{isBn ? 'সম্পন্ন হয়েছে' : 'Trip Completed'}</span>
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

        {/* ── 2. Step-by-Step Lifecycle Stepper (Website Way) ───────────────── */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
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

            {/* 4 Step Bubbles */}
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

              {/* Step 2: Driver On The Way */}
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

              {/* Step 3: Ride In Progress */}
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
                  {isFirstCompleted
                    ? isBn ? 'ফিরতি যাত্রা' : 'Return Leg'
                    : isBn ? 'যাত্রা শুরু' : 'In Progress'}
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

        {/* ── 3. Completed Celebration Card with Review CTA ─────────────────── */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-center justify-between gap-5 animate-fadeIn">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isBn ? 'রাইড সমাপ্ত' : 'Ride Completed'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                {isBn
                  ? 'চালকের সাথে আপনার যাত্রা কেমন ছিল?'
                  : 'How was your experience with the driver?'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
                {isBn
                  ? 'আপনার মূল্যবান মতামত চালকের সেবার মান উন্নত করতে সাহায্য করবে।'
                  : 'Rate your driver to help maintain quality and reward top-rated service.'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {isReviewed ? (
                <div className="px-5 py-3 rounded-2xl bg-white/15 border border-white/30 text-white text-xs font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{isBn ? 'রিভিউ জমা দেওয়া হয়েছে' : 'Review Submitted (★ 5.0)'}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="py-3 px-6 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{isBn ? 'রিভিউ ও রেটিং দিন' : 'Rate Driver & Leave Review'}</span>
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

        {/* ── 4. Main Two-Column Portal Layout (Driver Card & Map) ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Driver Info, Route, Vehicle Photos & Safety */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Driver Profile Card (With Real Name, Phone, Photo, Plate, Total Fare) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 flex-shrink-0 relative shadow-2xs">
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

              {/* Always Display Total Amount in Front of Customer */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isBn ? 'সর্বমোট ভাড়া' : 'TOTAL FARE'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isBn ? 'ক্যাশে পরিশোধ' : 'Paid via CASH'}
                  </span>
                </div>
                <span className="text-xl font-black text-slate-900 font-heading">
                  BDT {totalAmount}
                </span>
              </div>

              {/* Action Buttons: Phone Call & In-App Chat (Matching App Function) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Green Call Button */}
                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(true)}
                  className="w-full py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>{isBn ? 'কল করুন' : 'Call Driver'}</span>
                </button>

                {/* Blue Chat Button */}
                <button
                  type="button"
                  onClick={() => setIsChatModalOpen(true)}
                  className="w-full py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{isBn ? 'চ্যাট করুন' : 'Driver Chat'}</span>
                </button>
              </div>

              {/* Cancellation or Review Button depending on state */}
              {isInProgress ? (
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  {isBn ? 'ট্রিপ বাতিল করুন' : 'Cancel Trip'}
                </button>
              ) : isCompleted ? (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{isReviewed ? (isBn ? 'রিভিউ দেখুন / আপডেট' : 'View / Update Review') : (isBn ? 'রিভিউ ও রেটিং দিন' : 'Rate Driver & Review')}</span>
                </button>
              ) : null}
            </div>

            {/* Route Points & Luggage Note Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading block">
                {isBn ? 'রুট ও বুকিং বিবরণ' : 'Route & Booking Details'}
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

              {/* Trip Note from API */}
              {trip?.note && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                  <Luggage className="w-4 h-4 text-slate-500" />
                  <span className="font-semibold">{trip.note}</span>
                </div>
              )}
            </div>

            {/* Vehicle Photos Gallery from API car_photos */}
            {carPhotos.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading block">
                  {isBn ? 'গাড়ির ছবিসমূহ' : 'Verified Vehicle Photos'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {carPhotos.slice(0, 3).map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs"
                    >
                      <Image
                        src={getImageUrl(photo)}
                        alt={`Car Photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Safety & Hotline */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-2.5">
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
                onClick={() =>
                  alert(
                    isBn
                      ? 'জরুরি এসওএস সিগন্যাল পাঠানো হয়েছে।'
                      : 'Emergency SOS alert sent.'
                  )
                }
                className="w-full py-2.5 px-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isBn ? 'জরুরি এসওএস (SOS)' : 'Emergency SOS'}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Interactive Live Route Map Viewport */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-xs h-[640px]">
            <svg className="w-full h-full" viewBox="0 0 900 680" fill="none">
              <rect width="900" height="680" fill="#f8fafc" />

              {/* Highways */}
              <path d="M-100 120 Q 400 180 1000 140" stroke="#e2e8f0" strokeWidth="18" />
              <path d="M-100 360 Q 450 320 1000 390" stroke="#e2e8f0" strokeWidth="22" />
              <path d="M-100 580 Q 450 540 1000 600" stroke="#e2e8f0" strokeWidth="16" />
              <path d="M220 -80 Q 250 360 210 760" stroke="#e2e8f0" strokeWidth="20" />
              <path d="M720 -80 Q 690 360 740 760" stroke="#e2e8f0" strokeWidth="20" />

              {/* Glowing Route Polyline */}
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

              {/* Origin Pin (A) */}
              <g transform="translate(280, 610)">
                <circle r="18" fill="rgba(34, 197, 94, 0.3)" />
                <circle r="10" fill="#22C55E" />
                <circle r="4" fill="#FFFFFF" />
                <text
                  x="24"
                  y="6"
                  fill="#0f172a"
                  fontFamily="var(--font-heading)"
                  fontSize="13"
                  fontWeight="700"
                >
                  {pickupAddress.slice(0, 30)}
                </text>
              </g>

              {/* Destination Pin (B) */}
              <g transform="translate(660, 90)">
                <circle r="20" fill="rgba(239, 68, 68, 0.3)" />
                <circle r="11" fill="#EF4444" />
                <circle r="4" fill="#FFFFFF" />
                <text
                  x="-165"
                  y="6"
                  fill="#0f172a"
                  fontFamily="var(--font-heading)"
                  fontSize="13"
                  fontWeight="700"
                >
                  {dropoffAddress.slice(0, 30)}
                </text>
              </g>

              {/* Live Vehicle Marker */}
              <g transform={isCompleted ? 'translate(660, 90)' : 'translate(520, 250)'}>
                <circle r="30" fill="rgba(34, 197, 94, 0.28)">
                  <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect
                  x="-16"
                  y="-26"
                  width="32"
                  height="52"
                  rx="10"
                  fill="#FFFFFF"
                  stroke="#22C55E"
                  strokeWidth="3"
                />
                <rect x="-12" y="-18" width="24" height="12" rx="2" fill="#0F172A" />
                <rect x="-12" y="10" width="24" height="12" rx="2" fill="#0F172A" />
                <polygon points="-12,-26 -26,-56 26,-56 12,-26" fill="rgba(234, 179, 8, 0.35)" />
                <rect
                  x="26"
                  y="-20"
                  width="130"
                  height="30"
                  rx="6"
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <text
                  x="36"
                  y="0"
                  fill="#ffffff"
                  fontFamily="var(--font-mono)"
                  fontSize="12"
                  fontWeight="700"
                >
                  {isCompleted ? 'Arrived ✓' : `${speed} km/h • Live`}
                </text>
              </g>

              {/* Road Landmarks */}
              <text x="130" y="520" fill="#64748B" fontSize="12" fontWeight="600">Airport Road</text>
              <text x="240" y="420" fill="#64748B" fontSize="12" fontWeight="600">Mohakhali Flyover</text>
              <text x="410" y="300" fill="#64748B" fontSize="12" fontWeight="600">Banani</text>
              <text x="540" y="180" fill="#64748B" fontSize="12" fontWeight="600">Gulshan Circle</text>
            </svg>

            {/* Bottom Floating Map Banner */}
            <div className="absolute bottom-5 left-5 right-5 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    {carType} • {carPlate}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {driverName} ({driverRating}★)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900 font-heading mr-2">
                  BDT {totalAmount}
                </span>

                <button
                  type="button"
                  onClick={() => setIsCallModalOpen(true)}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs cursor-pointer"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4 fill-white" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsChatModalOpen(true)}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                  title="Chat Driver"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL 1: DRIVER PHONE CALL MODAL ─────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {isCallModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-100">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 mx-auto relative shadow-sm">
              <Image
                src={getImageUrl(driverPhoto)}
                alt={driverName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{driverName}</h3>
              <p className="text-xs text-slate-500">{carType} • {carPlate}</p>
              <div className="mt-2 text-xl font-black text-slate-900 font-mono tracking-wider">
                {driverPhone}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`tel:${driverPhone.replace(/\s+/g, '')}`}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>{isBn ? 'এখনই কল করুন' : 'Call Driver Now'}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(driverPhone);
                    alert(isBn ? 'নম্বর কপি হয়েছে!' : 'Phone number copied!');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                {isBn ? 'নম্বর কপি করুন' : 'Copy Number'}
              </button>

              <button
                type="button"
                onClick={() => setIsCallModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 py-1 cursor-pointer"
              >
                {isBn ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL 2: IN-APP DRIVER CHAT MODAL ────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-md w-full h-[520px] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-slide-up">
            
            {/* Chat Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 relative border border-emerald-500">
                  <Image
                    src={getImageUrl(driverPhoto)}
                    alt={driverName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{driverName}</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • {carPlate}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsChatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'customer' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[78%] p-3 rounded-2xl text-xs font-medium ${
                      msg.sender === 'customer'
                        ? 'bg-black text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Reply Chips */}
            <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap">
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    isBn ? 'আমি পিকআপ পয়েন্টে দাঁড়িয়ে আছি' : "I'm at the pickup point"
                  )
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                📍 {isBn ? 'পিকআপে আছি' : 'At pickup'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    isBn ? 'পৌঁছে কল দিবেন দয়া করে' : 'Please call when you arrive'
                  )
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                📞 {isBn ? 'পৌঁছে কল দিন' : 'Call on arrival'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleSendMessage(isBn ? 'আমি নিচে নামছি' : 'Coming down now')
                }
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                🚶 {isBn ? 'নিচে নামছি' : 'Coming down'}
              </button>
            </div>

            {/* Chat Input Field */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={isBn ? 'মেসেজ লিখুন...' : 'Type a message...'}
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL 3: CANCEL TRIP CONFIRMATION ────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                {isBn ? 'ট্রিপ বাতিল করতে চান?' : 'Cancel this Trip?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isBn
                  ? 'চালক ইতিমধ্যে আপনার পিকআপের জন্য প্রস্তুত হচ্ছেন।'
                  : 'The driver is already assigned and heading to pickup.'}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 block">
                {isBn ? 'বাতিলের কারণ নির্বাচন করুন:' : 'Select cancellation reason:'}
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800"
              >
                <option value="Driver taking too long">Driver is taking too long</option>
                <option value="Changed my travel plan">Changed my travel plan</option>
                <option value="Booked another vehicle">Booked another ride</option>
                <option value="Driver requested to cancel">Driver asked to cancel</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                {isBn ? 'ফিরে যান' : 'Keep Trip'}
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCancelling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{isBn ? 'হ্যাঁ, বাতিল করুন' : 'Confirm Cancel'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL 4: TRIP REVIEW MODAL (Matching Image 4) ────────────────── */}
      {/* ────────────────────────────────────────────────────────────────── */}
      {activeDriver?.driver_uuid && effectiveTripUuid && (
        <TripReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          tripUuid={effectiveTripUuid}
          driverUuid={activeDriver.driver_uuid}
          driverName={driverName}
          driverPhoto={driverPhoto}
          carType={carType}
          carPlate={carPlate}
          serviceName={trip?.service_name || 'RIDE_SHARE'}
          totalFare={totalAmount}
          pickupAddress={pickupAddress}
          dropoffAddress={dropoffAddress}
          startTime={trip?.created_at || trip?.start_datetime}
          paymentMethod={trip?.payment_method || 'CASH'}
          onReviewSubmitted={() => {
            setHasReviewed(true);
            setIsReviewModalOpen(false);
          }}
        />
      )}

    </div>
  );
};

export default TrackingPortal;
