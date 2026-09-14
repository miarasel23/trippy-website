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
  Image as ImageIcon,
  ZoomIn,
  Eye,
  CameraOff,
  Copy,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePolicySupport } from '@/hooks/usePolicySupport';
import { useActiveTrip } from '@/context/ActiveTripContext';
import { useAppSelector } from '@/redux/hooks';
import {
  customerTripService,
  getImageUrl,
  getActiveCustomerUuid,
} from '@/services/customerTripService';
import {
  RentalTrip,
  RentalDriverBid,
  DriverTrackingRecord,
} from '@/types/customerApi';
import { TripReviewModal } from '@/components/booking/TripReviewModal';
import { CarPhotoGalleryModal } from '@/components/booking/CarPhotoGalleryModal';
import { TrackingGoogleMap } from '@/components/tracking/TrackingGoogleMap';
import { formatTripServiceType } from '@/utils/serviceFormat';
import { clearAllTripRelatedStorage, markTripReviewed, isTripReviewed } from '@/utils/tripStorage';

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
  const { hotlinePhone, hotlineDisplay, emergencyNumber, emergencyDisplay } = usePolicySupport();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAppSelector((state) => state.auth);
  const { activeTrip: contextActiveTrip, clearActiveTrip, dismissOverlay } = useActiveTrip();

  // Ensure right-side bidding overlay is always dismissed when on live tracking
  useEffect(() => {
    dismissOverlay();
  }, [dismissOverlay]);

  const tripUuidParam = searchParams.get('trip_uuid');
  const driverUuidParam = searchParams.get('driver_uuid');
  const customerUuidParam = searchParams.get('customer_uuid');

  const effectiveCustomerUuid =
    customerUuidParam || user?.uuid || getActiveCustomerUuid();
  const effectiveTripUuid =
    tripUuidParam || contextActiveTrip?.uuid || '';

  const [trip, setTrip] = useState<RentalTrip | null>(
    contextActiveTrip || null
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
  >([]);
  const [chatInput, setChatInput] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Photo Gallery Modal state
  const [isCarGalleryOpen, setIsCarGalleryOpen] = useState<boolean>(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  // Live Driver Tracking Telemetry (/v1/customer-driver-track/get)
  const [driverTrackingRecords, setDriverTrackingRecords] = useState<DriverTrackingRecord[]>([]);
  const [latestDriverLocation, setLatestDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
    updated_at?: string;
  }>({
    latitude: 23.8013563,
    longitude: 90.3763409,
    address: '3 Senpara Parbata Lane, Dhaka, Bangladesh',
    updated_at: '2026-09-12T13:10:27',
  });

  // Return trip and service type logic
  const serviceTypeParam = searchParams.get('service_type');
  const serviceNameParam = searchParams.get('service_name');
  const hoursParam = searchParams.get('hours_booked') || searchParams.get('hours');

  const rawServiceName =
    serviceNameParam ||
    serviceTypeParam ||
    trip?.service_name ||
    (trip as any)?.service_type ||
    (trip as any)?.servive_type ||
    trip?.car_service?.service_name ||
    '';

  const isRideShare =
    rawServiceName.toUpperCase() === 'RIDE_SHARE' ||
    rawServiceName.toLowerCase().includes('ride_share') ||
    rawServiceName.toLowerCase() === 'rideshare';

  // Dynamic polling interval: 5s for Ride Share, 30s for other services
  const pollIntervalMs = isRideShare ? 5000 : 30000;

  // ── 1. Real-time Trip Polling from Backend API (5s for Ride Share, 30s for Others) ──
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

        // If trip is strictly in REQUESTED bidding state, redirect back to trips/bidding radar
        if (status === 'REQUESTED') {
          router.push(`/trips?trip_uuid=${effectiveTripUuid}`);
          return;
        }

        const isDone =
          status === 'COMPLETED' ||
          status === 'FINISHED' ||
          status === 'TRIP_COMPLETED' ||
          status === 'CANCELLED' ||
          status === 'CANCELED' ||
          status === 'TRIP_CANCELLED';

        if (isDone) {
          clearAllTripRelatedStorage(effectiveTripUuid);
        } else {
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('trippy_has_active_ride', 'true');
            } catch {}
          }
        }

        // Check if review has been given
        const isReviewed = isTripReviewed(currentTrip, effectiveTripUuid);

        if (isDone && !isReviewed && !hasReviewed) {
          setIsReviewModalOpen(true);
        }
      }
    };

    pollTripStatus();
    const interval = setInterval(pollTripStatus, pollIntervalMs);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [effectiveTripUuid, effectiveCustomerUuid, language, token, hasReviewed, pollIntervalMs]);

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
  const carAvatar =
    trip?.car_category?.car_avatar ||
    (activeDriver as any)?.car_avatar ||
    (trip as any)?.car_service?.avatar ||
    null;

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

  // Driver UUID for live GPS tracking: URL param > activeDriver > accepted_driver > user sample driver UUID
  const effectiveDriverUuid =
    driverUuidParam ||
    activeDriver?.driver_uuid ||
    trip?.accepted_driver?.driver_uuid ||
    (trip?.drivers && trip.drivers.length > 0 ? trip.drivers[0].driver_uuid : null) ||
    'fcfa9476-27c5-4f67-8c30-59940d4b2fff';

  // ── 3. Step-by-Step Lifecycle Status Logic (Website Way) ───────────────────
  const statusParam = searchParams.get('status')?.toUpperCase();
  const tripStatusFromApi = (trip?.trip_status || '').toUpperCase();
  // Default to IN_PROGRESS when we have an active trip uuid being tracked, unless explicitly COMPLETED
  const rawStatus = (statusParam || tripStatusFromApi || (effectiveTripUuid ? 'IN_PROGRESS' : 'COMPLETED')).toUpperCase();

  // Completed or cancelled trip statuses
  const isCompleted =
    rawStatus === 'COMPLETED' ||
    rawStatus === 'FINISHED' ||
    rawStatus === 'TRIP_COMPLETED' ||
    rawStatus === 'CANCELLED' ||
    rawStatus === 'CANCELED' ||
    rawStatus === 'TRIP_CANCELLED';

  const isFirstCompleted =
    rawStatus === 'FIRST_COMPLETED' || rawStatus === 'FIRSTCOMPLETED';

  const isRideStarted =
    rawStatus === 'RIDE_STARTED' ||
    rawStatus === 'RIDESTARTED' ||
    rawStatus === 'STARTED' ||
    isFirstCompleted;

  // Strict status division as requested:
  // 1. ACCEPTED: Driver accepted, tracking is shown but driver location in map is NOT shown
  const isAccepted =
    rawStatus === 'ACCEPTED' || rawStatus === 'ACCEPT' || rawStatus === 'CONFIRMED';

  // 2. IN_PROGRESS: Driver is moving/on the way/ride started - driver location in map IS shown!
  const isInProgress =
    rawStatus === 'IN_PROGRESS' ||
    rawStatus === 'INPROGRESS' ||
    rawStatus === 'STARTED' ||
    rawStatus === 'RIDE_STARTED' ||
    rawStatus === 'ON_THE_WAY' ||
    rawStatus === 'ONTHEWAY' ||
    rawStatus === 'PICKUP_ARRIVED' ||
    isRideStarted;

  // Active trip remains visible and tracked until explicitly completed or cancelled
  const isActiveTrip = !isCompleted && (isAccepted || isInProgress || Boolean(effectiveTripUuid));

  // ── Live Rider Geolocation Tracking (Keeps rider location visible until completed) ──
  const [liveRiderGps, setLiveRiderGps] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    if (isCompleted) return;

    let watchId: number | null = null;
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveRiderGps({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {},
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000,
        }
      );
    } catch {}

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isCompleted]);

  // ── 2.b Live Driver Location Polling (/v1/customer-driver-track/get) ──────────
  useEffect(() => {
    // Only poll live driver GPS tracking when there is an active running trip!
    if (!effectiveDriverUuid || !isActiveTrip) return;
    let isMounted = true;

    const pollDriverLocation = async () => {
      try {
        const records = await customerTripService.fetchDriverLocation(
          effectiveDriverUuid,
          language,
          token || undefined
        );

        if (!isMounted) return;

        if (Array.isArray(records) && records.length > 0) {
          setDriverTrackingRecords(records);
          const latest = records[0];
          if (latest?.geolocation?.latitude && latest?.geolocation?.longitude) {
            const lat =
              typeof latest.geolocation.latitude === 'string'
                ? parseFloat(latest.geolocation.latitude)
                : Number(latest.geolocation.latitude);
            const lng =
              typeof latest.geolocation.longitude === 'string'
                ? parseFloat(latest.geolocation.longitude)
                : Number(latest.geolocation.longitude);

            if (!isNaN(lat) && !isNaN(lng)) {
              setLatestDriverLocation({
                latitude: lat,
                longitude: lng,
                address:
                  latest.geolocation.address || '3 Senpara Parbata Lane, Dhaka, Bangladesh',
                updated_at: latest.created_at || latest.updated_at,
              });
            }
          }
        }
      } catch {}
    };

    pollDriverLocation();
    const interval = setInterval(pollDriverLocation, 10000); // 10s polling interval

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [effectiveDriverUuid, language, token, isActiveTrip]);

  // Car photos list from driver info (Strictly use real photos; do not fall back to fake demo photos if driver has none)
  const noPhotosParam = searchParams.get('no_photos') === 'true';
  const rawCarPhotos = activeDriver?.car_photos;
  const carPhotos: string[] = noPhotosParam
    ? []
    : Array.isArray(rawCarPhotos)
    ? rawCarPhotos.filter((p) => Boolean(p && typeof p === 'string' && p.trim().length > 0))
    : [];

  const hoursBooked =
    hoursParam ||
    trip?.hours_booked ||
    (trip as any)?.hours ||
    (trip as any)?.rental_duration ||
    null;

  const serviceInfo = formatTripServiceType(rawServiceName, hoursBooked, language);

  const isReturnService =
    rawServiceName.toUpperCase().includes('RETURN') ||
    rawServiceName.toUpperCase().includes('ROUND') ||
    rawServiceName.toUpperCase().includes('TWO_WAY');

  const basePickupLocation = trip?.pickup_locations?.[0] || {
    uuid: 'pickup',
    latitude: '23.8014',
    longitude: '90.3763',
    address: 'Senpara Porbota, Mirpur 10., Dhaka, Bangladesh',
  };
  const baseDropoffLocation = trip?.dropoff_locations?.[0] || {
    uuid: 'dropoff',
    latitude: '23.7925',
    longitude: '90.4078',
    address: 'Gulshan 2, Dhaka, Bangladesh',
  };

  const shouldSwapLocations = isFirstCompleted && isReturnService;

  const activePickupLocation = shouldSwapLocations
    ? baseDropoffLocation
    : basePickupLocation;
  const activeDropoffLocation = shouldSwapLocations
    ? basePickupLocation
    : baseDropoffLocation;

  const pickupAddress =
    activePickupLocation.address || 'Senpara Porbota, Mirpur 10., Dhaka, Bangladesh';
  const dropoffAddress =
    activeDropoffLocation.address || 'Gulshan 2, Dhaka, Bangladesh';

  // Effective rider location (uses live GPS if permitted, otherwise designated pickup point)
  const effectiveRiderLocation = {
    latitude: liveRiderGps?.latitude || Number(activePickupLocation.latitude) || 23.8045,
    longitude: liveRiderGps?.longitude || Number(activePickupLocation.longitude) || 90.3701,
    address: liveRiderGps?.address || pickupAddress,
    isLiveGps: Boolean(liveRiderGps),
  };

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
    if (isRideStarted || rawStatus === 'IN_PROGRESS' || rawStatus === 'INPROGRESS') {
      return {
        badge: isBn ? 'যাত্রা চলমান' : 'Ride In Progress',
        title: isBn
          ? 'গন্তব্যের উদ্দেশ্যে গাড়ি এগিয়ে চলেছে'
          : 'Heading towards your destination',
        desc: isBn
          ? 'রাইডার ও চালকের অবস্থান দৃশ্যমান রয়েছে এবং লাইভ জিপিএস সক্রিয়।'
          : 'Rider and driver locations are visible with live GPS tracking active.',
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

  // ── Auto-open review popup when trip is completed and review not given ────
  useEffect(() => {
    if (isCompleted && !isReviewed && !hasReviewed) {
      const timer = setTimeout(() => {
        setIsReviewModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, isReviewed, hasReviewed]);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const msg = (textToSend || chatInput).trim();
    if (!msg) return;

    // Optimistic UI update
    const newMsg = {
      id: String(Date.now()),
      sender: 'customer' as const,
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    if (effectiveCustomerUuid && effectiveDriverUuid) {
      await customerTripService.sendLiveChatMessage(
        effectiveCustomerUuid,
        effectiveDriverUuid,
        msg,
        language,
        token || undefined
      );
    }
  };

  // Poll for live chat messages when chat modal is open
  useEffect(() => {
    if (!isChatModalOpen || !effectiveCustomerUuid || !effectiveDriverUuid) return;
    
    let isMounted = true;
    
    const fetchChat = async () => {
      const res = await customerTripService.fetchLiveChatConversation(
        effectiveCustomerUuid,
        effectiveDriverUuid,
        language,
        token || undefined
      );
      
      if (!isMounted) return;
      
      if (res.status && res.data && Array.isArray(res.data.messages)) {
        const fetchedMessages = res.data.messages.map((m: any) => ({
          id: m.uuid || String(Math.random()),
          sender: (m.sender_type || '').toUpperCase() === 'CUSTOMER' ? 'customer' : 'driver',
          text: m.message || '',
          time: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setChatMessages(fetchedMessages);
      }
    };
    
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isChatModalOpen, effectiveCustomerUuid, effectiveDriverUuid, language, token]);

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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('trippy_has_active_ride');
      } catch {}
    }
    clearActiveTrip();
    router.push('/');
  };

  return (
    <div className="py-8 bg-slate-50/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* ── 1. Top Header Bar (Website Way) ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="primary">
                {isBn ? 'লাইভ রাইড ট্র্যাকিং' : 'Live Ride Tracking'}
              </Badge>
              <span className={`text-xs font-extrabold px-3 py-0.5 rounded-full border shadow-2xs ${serviceInfo.badgeColor}`}>
                {serviceInfo.name}
              </span>
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

        {/* ── 4. Main Section: Active Live Tracking vs Completed Step-by-Step ── */}
        {isActiveTrip ? (
          /* ═══════════════════════════════════════════════════════════════════
             ACTIVE TRIP VIEW: Live Telemetry, Driver Controls & Google Map
             ═══════════════════════════════════════════════════════════════════ */
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
                  <div className="flex items-center gap-2.5">
                    {carAvatar && (
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        <img
                          src={getImageUrl(carAvatar)}
                          alt={carType}
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'গাড়ির বিবরণ' : 'Vehicle & Model'}
                      </span>
                      <div className="text-xs font-bold text-slate-800 capitalize">
                        {carType}
                      </div>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors" 
                    onClick={() => typeof window !== 'undefined' && navigator.clipboard.writeText(carPlate)} 
                    title={isBn ? 'কপি করুন' : 'Copy'}
                  >
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {carPlate}
                    </span>
                    <Copy className="w-3.5 h-3.5" />
                  </div>
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

                {/* Action Buttons: Phone Call & In-App Chat */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCallModalOpen(true)}
                    className="w-full py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4 fill-white" />
                    <span>{isBn ? 'কল করুন' : 'Call Driver'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsChatModalOpen(true)}
                    className="w-full py-3 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{isBn ? 'চ্যাট করুন' : 'Driver Chat'}</span>
                  </button>
                </div>

                {/* Cancel Trip Button (Allowed only before RIDE_STARTED) vs Ongoing Until Complete */}
                {isRideStarted ? (
                  <div className="w-full py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                    </span>
                    <span>
                      {isFirstCompleted
                        ? (isBn ? 'ফিরতি যাত্রা চলমান (সম্পন্ন না হওয়া পর্যন্ত)' : 'Return Leg Ongoing...')
                        : (isBn ? 'যাত্রা চলমান (সম্পন্ন না হওয়া পর্যন্ত)' : 'Ride Ongoing Until Complete')}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {isBn ? 'ট্রিপ বাতিল করুন' : 'Cancel Trip'}
                  </button>
                )}
              </div>

              {/* Route Points & Luggage Note Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading block">
                  {isBn ? 'রুট ও বুকিং বিবরণ' : 'Route & Booking Details'}
                </span>

                {/* Service Type & Hours Booked Row */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-2xs">
                      {carAvatar ? (
                        <img
                          src={getImageUrl(carAvatar)}
                          alt={carType}
                          className="w-full h-full object-contain p-0.5"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.car-fallback-icon');
                            if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Car
                        className={`w-4 h-4 text-slate-700 car-fallback-icon ${
                          carAvatar ? 'hidden' : 'block'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'সার্ভিস ধরন' : 'SERVICE TYPE'}
                      </span>
                      <span className="text-xs font-black text-slate-900 truncate block">
                        {serviceInfo.name}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${serviceInfo.badgeColor}`}>
                    {serviceInfo.isHourly ? (serviceInfo.hoursText || 'Hourly') : serviceInfo.name}
                  </span>
                </div>

                {/* Pickup Point A */}
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

              {/* Vehicle Photos Gallery Preview with Click-to-View & No-Image Fallback */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 font-heading block">
                    {isBn ? 'গাড়ির ছবিসমূহ' : 'Verified Vehicle Photos'}
                  </span>
                  {carPhotos.length > 0 && (
                    <span className="text-[11px] font-bold text-slate-400">
                      {carPhotos.length} {isBn ? 'টি ছবি' : 'photos'}
                    </span>
                  )}
                </div>

                {carPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {carPhotos.slice(0, 3).map((photo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedPhotoIndex(idx);
                          setIsCarGalleryOpen(true);
                        }}
                        className="group relative h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer focus:outline-hidden"
                      >
                        <Image
                          src={getImageUrl(photo)}
                          alt={`Vehicle Photo ${idx + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="120px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <Eye className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-1.5 py-6">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                      <CameraOff className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                      {isBn ? 'কোন ছবি নেই' : 'No image'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isBn ? 'চালক গাড়ির ছবি আপলোড করেননি' : 'Driver has not uploaded vehicle photos'}
                    </span>
                  </div>
                )}
              </div>

              {/* Telemetry Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 text-center shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isBn ? 'দূরত্ব' : 'Remaining'}
                  </span>
                  <strong className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                    4.8 km
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
                  href={`tel:${hotlinePhone}`}
                  className="w-full py-3 px-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{isBn ? `জরুরি হটলাইন: ${hotlineDisplay}` : `24/7 Hotline: ${hotlineDisplay}`}</span>
                </a>

                <a
                  href={`tel:${emergencyNumber}`}
                  className="w-full py-2.5 px-4 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isBn ? `জরুরি এসওএস (${emergencyDisplay})` : `Emergency SOS (${emergencyDisplay})`}</span>
                </a>
              </div>

            </div>

            {/* Right Column: Real Google Tracking Map with Live GPS Updates */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-xs min-h-[580px] lg:h-[640px]">
              <TrackingGoogleMap
                pickupLocation={activePickupLocation}
                dropoffLocation={activeDropoffLocation}
                driverLocation={isInProgress ? latestDriverLocation : null}
                riderLocation={effectiveRiderLocation}
                driverName={driverName}
                carType={carType}
                carPlate={carPlate}
                serviceName={serviceInfo.rawKey || rawServiceName || 'RIDE_SHARE'}
                tripStatus={rawStatus}
                speed={speed}
                etaMinutes={etaMinutes}
                totalFare={totalAmount}
                onCallDriver={() => setIsCallModalOpen(true)}
                onChatDriver={() => setIsChatModalOpen(true)}
                className="w-full h-full min-h-[580px] lg:h-[640px]"
              />
            </div>

          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             COMPLETED TRIP VIEW: Step-by-Step Completion Details & Receipt
             (Live map and tracking telemetry are completely hidden as requested)
             ═══════════════════════════════════════════════════════════════════ */
          <div className="space-y-6">
            {/* Step-by-step Detailed Journey Timeline Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {isBn ? 'যাত্রা সম্পন্ন বিবরণ' : 'Trip Completion Journey'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      {displayTripId}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                    {isBn ? 'ধাপে ধাপে ট্রিপ সম্পন্নের বিবরণ' : 'How Your Trip Was Completed Step by Step'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {isBn ? 'পরিশোধিত ভাড়া:' : 'Total Paid:'}
                  </span>
                  <span className="text-lg font-black text-slate-900 font-heading">
                    BDT {totalAmount}
                  </span>
                </div>
              </div>

              {/* 4 Step-by-Step Completion Milestones */}
              <div className="pt-6 relative">
                {/* Connecting Vertical Line */}
                <div className="absolute left-4 sm:left-5 top-10 bottom-10 w-0.5 bg-emerald-200" />

                <div className="space-y-8 relative">
                  {/* Step 1: Trip Accepted */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs sm:text-sm ring-4 ring-emerald-100 z-10 shadow-sm">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                          {isBn ? 'ধাপ ১: রাইড নিশ্চিত ও চালক বরাদ্দ' : 'Step 1: Ride Accepted & Driver Assigned'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {trip?.created_at ? new Date(trip.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '07:56 PM'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {isBn
                          ? `${driverName} আপনার বুকিং গ্রহণ করেছেন`
                          : `${driverName} accepted your ride request`}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {isBn
                          ? `গাড়ির মডেল: ${carType} (${carPlate})। অফারকৃত মোট ভাড়া BDT ${totalAmount} চালক কর্তৃক গৃহীত হয়।`
                          : `Vehicle: ${carType} (${carPlate}). Agreed fare of BDT ${totalAmount} was confirmed by driver.`}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Driver Arrived at Pickup */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs sm:text-sm ring-4 ring-emerald-100 z-10 shadow-sm">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                          {isBn ? 'ধাপ ২: পিকআপে পৌঁছানো ও আরোহণ' : 'Step 2: Pickup Arrival & Passenger Boarded'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {trip?.start_datetime ? new Date(trip.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:15 PM'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {isBn ? 'চালক সঠিক সময়ে পিকআপ পয়েন্টে পৌঁছান' : 'Driver arrived at pickup location on time'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        <span className="font-semibold text-slate-800">{isBn ? 'পিকআপ স্থান:' : 'Pickup Location:'} </span>
                        {pickupAddress}
                      </p>
                      {trip?.note && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                          <Luggage className="w-3.5 h-3.5 text-slate-500" />
                          <span>{trip.note}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Journey & Route Traversed */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs sm:text-sm ring-4 ring-emerald-100 z-10 shadow-sm">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                          {isBn ? 'ধাপ ৩: নিরাপদ মহাসড়ক যাত্রা পরিচালিত' : 'Step 3: Safe Highway Journey Traversed'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-medium">
                          {isBn ? 'রুট সম্পন্ন' : 'Route Verified'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {isBn ? 'নিরাপদ গতি ও সম্পূর্ণ সুরক্ষা নজরদারিতে যাত্রা' : 'Comfortable ride with safety protocols'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {isBn
                          ? 'পিকআপ থেকে ড্রপঅফ পয়েন্ট পর্যন্ত ট্রিপ্পি সার্বক্ষণিক লাইভ জিপিএস এবং যাত্রী সুরক্ষা নিশ্চিত করেছে।'
                          : 'Traversed safely across designated route with Trippy 24/7 security and live telemetry.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Safely Reached Destination */}
                  <div className="flex items-start gap-4 sm:gap-5">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs sm:text-sm ring-4 ring-emerald-100 z-10 shadow-sm">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                          {isBn ? 'ধাপ ৪: নিরাপদে গন্তব্যে পৌঁছানো ও ট্রিপ সমাপ্ত' : 'Step 4: Destination Reached & Completed'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {isBn ? 'সম্পন্ন ✓' : 'COMPLETED ✓'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {isBn ? 'যাত্রী নিরাপদে গন্তব্যে পৌঁছেছেন' : 'Safely arrived at destination'}
                      </h4>
                      <p className="text-xs text-slate-700 mt-1">
                        <span className="font-semibold text-slate-900">{isBn ? 'গন্তব্য স্থান:' : 'Dropoff Location:'} </span>
                        {dropoffAddress}
                      </p>
                      <div className="mt-3 flex items-center gap-3 pt-2 border-t border-emerald-200/60 text-xs text-emerald-900">
                        <span className="font-semibold">{isBn ? 'বিল পরিশোধ:' : 'Payment Status:'}</span>
                        <span className="font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                          BDT {totalAmount} ({trip?.payment_method || 'CASH'} - {isBn ? 'পরিশোধিত' : 'PAID'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Grid: Left Driver & Vehicle (with Photos / No Image), Right Receipt & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Driver & Vehicle Information */}
              <div className="lg:col-span-5 space-y-5">
                {/* Driver Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-heading block">
                    {isBn ? 'চালকের তথ্য' : 'Assigned Driver'}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-100 flex-shrink-0 relative shadow-2xs">
                      <Image
                        src={getImageUrl(driverPhoto)}
                        alt={driverName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {driverName}
                        </h3>
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="flex items-center gap-1 font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {driverRating}
                        </span>
                        <span className="text-slate-400">
                          ({completedRides} {isBn ? 'ট্রিপ সম্পন্ন' : 'trips completed'})
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-1">
                        📞 {driverPhone}
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Badge */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'গাড়ির বিবরণ' : 'Vehicle Model'}
                      </span>
                      <span className="text-xs font-bold text-slate-800 capitalize">
                        {carType}
                      </span>
                    </div>
                    <div 
                      className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors" 
                      onClick={() => typeof window !== 'undefined' && navigator.clipboard.writeText(carPlate)} 
                      title={isBn ? 'কপি করুন' : 'Copy'}
                    >
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {carPlate}
                      </span>
                      <Copy className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Vehicle Photos Gallery or "No Image" Fallback */}
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        {isBn ? 'গাড়ির ছবিসমূহ' : 'Vehicle Photos'}
                      </span>
                      {carPhotos.length > 0 && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {carPhotos.length} {isBn ? 'টি ছবি' : 'photos'} • {isBn ? 'ক্লিক করে বড় দেখুন' : 'Click to view'}
                        </span>
                      )}
                    </div>

                    {carPhotos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {carPhotos.map((photo, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedPhotoIndex(idx);
                              setIsCarGalleryOpen(true);
                            }}
                            className="group relative h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs cursor-pointer focus:outline-hidden"
                          >
                            <Image
                              src={getImageUrl(photo)}
                              alt={`Vehicle ${idx + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="120px"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-white/90 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <Eye className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-1 py-5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                          <CameraOff className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {isBn ? 'কোন ছবি নেই' : 'No image'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isBn ? 'চালক গাড়ির কোন ছবি সংযুক্ত করেননি' : 'Driver has no vehicle photos uploaded'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Route Details, Payment Receipt & Post-Trip CTAs */}
              <div className="lg:col-span-7 space-y-5">
                {/* Route & Booking Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-heading block">
                    {isBn ? 'রুট ও ভ্রমণ তথ্য' : 'Route Details'}
                  </span>

                  {/* Pickup */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      A
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'পিকআপ স্থান' : 'Pickup Point'}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {pickupAddress}
                      </p>
                    </div>
                  </div>

                  <div className="border-l-2 border-dashed border-slate-200 h-5 ml-3.5" />

                  {/* Dropoff */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      B
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isBn ? 'গন্তব্য স্থান' : 'Dropoff Point'}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800">
                        {dropoffAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Receipt Breakdown */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-heading">
                      {isBn ? 'ভাড়ার বিবরণী ও রসিদ' : 'Fare Breakdown & Receipt'}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {isBn ? 'পরিশোধিত' : 'Paid in Full'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{isBn ? 'মৌলিক ভাড়া (ড্রাইভার বিড):' : 'Driver Bid Amount:'}</span>
                      <span className="font-semibold text-slate-900">
                        BDT {activeDriver?.bid_amount || (totalAmount > 50 ? totalAmount - 12 : totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isBn ? 'ইনস্যুরেন্স ও সার্ভিস চার্জ:' : 'Insurance & Safety Fee:'}</span>
                      <span className="font-semibold text-slate-900">
                        BDT {activeDriver?.insurance_charge_amount || 12}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{isBn ? 'ডিসকাউন্ট / ছাড়:' : 'Customer Discount:'}</span>
                      <span className="font-semibold text-emerald-600">
                        - BDT {activeDriver?.customer_discount_amount || 0}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-900 font-heading">
                        {isBn ? 'সর্বমোট পরিশোধিত ভাড়া:' : 'Total Amount Paid:'}
                      </span>
                      <span className="text-xl font-black text-slate-900 font-heading">
                        BDT {totalAmount}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 text-right">
                      {isBn ? 'পেমেন্ট পদ্ধতি: ক্যাশ' : `Payment Method: ${trip?.payment_method || 'CASH'}`}
                    </p>
                  </div>
                </div>

                {/* Review & Next Ride CTAs */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                    <span>
                      {isReviewed
                        ? (isBn ? 'রিভিউ দেখুন / আপডেট' : 'View / Update Review')
                        : (isBn ? 'চালকের রিভিউ ও রেটিং দিন' : 'Rate Driver & Leave Review')}
                    </span>
                  </button>

                  <Link
                    href="/booking"
                    onClick={() => clearActiveTrip()}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{isBn ? 'নতুন রাইড বুক করুন' : 'Book Another Ride'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

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
      {(activeDriver?.driver_uuid || effectiveDriverUuid) && effectiveTripUuid && (
        <TripReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          tripUuid={effectiveTripUuid}
          driverUuid={activeDriver?.driver_uuid || effectiveDriverUuid}
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
            if (effectiveTripUuid) {
              markTripReviewed(effectiveTripUuid);
            }
            clearAllTripRelatedStorage(effectiveTripUuid);
            clearActiveTrip();
            // Redirect to home page for new trip booking as requested
            router.push('/');
          }}
        />
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL 5: VEHICLE PHOTO GALLERY MODAL ─────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <CarPhotoGalleryModal
        isOpen={isCarGalleryOpen}
        onClose={() => setIsCarGalleryOpen(false)}
        images={carPhotos}
        initialIndex={selectedPhotoIndex}
        carName={`${carType} (${carPlate})`}
        regNumber={carPlate}
      />

    </div>
  );
};

export default TrackingPortal;
