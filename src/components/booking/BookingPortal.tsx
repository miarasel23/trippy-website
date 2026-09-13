'use client';

import React, { useState, useEffect } from 'react';
import {
  ServiceCategory,
  LocationSearchResult,
  CarInfo,
} from '@/types/customerApi';
import {
  customerTripService,
  getActiveCustomerUuid,
  clearTripDataFromLocalStorage,
} from '@/services/customerTripService';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openLoginModal } from '@/redux/features/authSlice';
import { ServicePhotoCardSelector } from './ServicePhotoCardSelector';
import { MultiLocationRouteSelector } from './MultiLocationRouteSelector';
import { TripDateTimeSchedule, formatDateTimeToApi } from './TripDateTimeSchedule';
import { VehiclePriceList } from './VehiclePriceList';
import { LiveBiddingRadarView } from './LiveBiddingRadarView';
import { GoogleRouteMap } from './GoogleRouteMap';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveTrip } from '@/context/ActiveTripContext';
import { Badge } from '../common/Badge';
import { Sparkles, MapPin, Zap, RefreshCw, PlusCircle } from 'lucide-react';

interface BookingPortalProps {
  isHero?: boolean;
}

export const BookingPortal: React.FC<BookingPortalProps> = ({ isHero = false }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, token } = useAppSelector((state) => state.auth);
  const { language } = useLanguage();
  const isBn = language === 'bn';

  // 1. Service state
  const [services, setServices] = useState<Record<string, ServiceCategory>>({});
  const [selectedService, setSelectedService] = useState<string>('RIDE_SHARE');
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // 2. Multi-location route state – empty by default so vehicle list shows prompt
  const [pickupLocations, setPickupLocations] = useState<LocationSearchResult[]>([
    {
      uuid: '',
      address: '',
      latitude: 23.8103,
      longitude: 90.4125,
    },
  ]);

  const [dropoffLocations, setDropoffLocations] = useState<LocationSearchResult[]>([
    {
      uuid: '',
      address: '',
      latitude: 23.8103,
      longitude: 90.4125,
    },
  ]);

  const [activeLocationIndex, setActiveLocationIndex] = useState<{
    type: 'pickup' | 'dropoff';
    index: number;
  } | null>({ type: 'pickup', index: 0 });

  // 3. Date and Time schedule state (Bangladesh Time format)
  const [startDatetime, setStartDatetime] = useState<string>(() => {
    const isRide = selectedService === 'RIDE_SHARE';
    const initDate = isRide ? new Date() : new Date(Date.now() + 2 * 3600 * 1000);
    return formatDateTimeToApi(initDate);
  });
  const [endDatetime, setEndDatetime] = useState<string>(() => {
    const later = new Date(Date.now() + 10 * 3600 * 1000);
    return formatDateTimeToApi(later);
  });
  const [hoursBooked, setHoursBooked] = useState<string>('4');

  // 4. Vehicle & Fare state
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [proposedFare, setProposedFare] = useState<number>(1850);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5. Active submitted trip for live bidding radar
  const {
    activeTrip: globalActiveTrip,
    setActiveTripManually,
    clearActiveTrip: clearGlobalActiveTrip,
  } = useActiveTrip();
  const [hasDismissedRadar, setHasDismissedRadar] = useState(false);

  const [activeTrip, setActiveTrip] = useState<{
    uuid: string;
    customerUuid: string;
    serviceName: string;
    vehicleName: string;
    proposedFare: number;
    pickupAddress: string;
    dropoffAddress: string;
    hoursBooked?: string;
    note?: string;
    createdAt?: string;
  } | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached =
        sessionStorage.getItem('trippy_booking_active_trip') ||
        localStorage.getItem('trippy_booking_active_trip');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.uuid && !parsed.createdAt) {
          parsed.createdAt =
            localStorage.getItem(`trippy_trip_created_${parsed.uuid}`) ||
            sessionStorage.getItem(`trippy_trip_created_${parsed.uuid}`) ||
            undefined;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    if (activeTrip) {
      try {
        const json = JSON.stringify(activeTrip);
        sessionStorage.setItem('trippy_booking_active_trip', json);
        localStorage.setItem('trippy_booking_active_trip', json);
        if (activeTrip.uuid && activeTrip.createdAt) {
          localStorage.setItem(`trippy_trip_created_${activeTrip.uuid}`, activeTrip.createdAt);
          sessionStorage.setItem(`trippy_trip_created_${activeTrip.uuid}`, activeTrip.createdAt);
        }
      } catch {}
    } else {
      try {
        sessionStorage.removeItem('trippy_booking_active_trip');
        localStorage.removeItem('trippy_booking_active_trip');
      } catch {}
    }
  }, [activeTrip]);

  // Auto-resume live bidding radar if an active REQUESTED trip exists on server
  useEffect(() => {
    if (
      globalActiveTrip &&
      globalActiveTrip.trip_status === 'REQUESTED' &&
      !hasDismissedRadar
    ) {
      const pAddress =
        globalActiveTrip.pickup_locations
          ?.map((p) => p.address)
          .filter(Boolean)
          .join(' → ') || (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point');
      const dAddress =
        globalActiveTrip.dropoff_locations?.[0]?.address ||
        (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point');

      const resolvedCreatedAt =
        globalActiveTrip.created_at ||
        (globalActiveTrip as any).createdAt ||
        (globalActiveTrip as any).creation_date ||
        (globalActiveTrip as any).created_date ||
        (typeof window !== 'undefined' && globalActiveTrip.uuid
          ? localStorage.getItem(`trippy_trip_created_${globalActiveTrip.uuid}`) ||
            sessionStorage.getItem(`trippy_trip_created_${globalActiveTrip.uuid}`)
          : undefined);

      if (!activeTrip) {
        setActiveTrip({
          uuid: globalActiveTrip.uuid || '',
          customerUuid:
            user?.uuid ||
            localStorage.getItem('trippy_customer_uuid') ||
            getActiveCustomerUuid(),
          serviceName:
            globalActiveTrip.service_name ||
            (globalActiveTrip as any).service_type ||
            (globalActiveTrip as any).servive_type ||
            globalActiveTrip.car_service?.service_name ||
            'RIDE_SHARE',
          vehicleName: globalActiveTrip.car_category?.car_type || 'Vehicle',
          proposedFare: globalActiveTrip.offer_amount || 0,
          pickupAddress: pAddress,
          dropoffAddress: dAddress,
          hoursBooked:
            globalActiveTrip.hours_booked ||
            (globalActiveTrip as any).hours ||
            (globalActiveTrip as any).rental_duration ||
            undefined,
          note: globalActiveTrip.note || undefined,
          createdAt: resolvedCreatedAt,
        });
      } else if (resolvedCreatedAt && activeTrip.createdAt !== resolvedCreatedAt) {
        setActiveTrip((prev) => (prev ? { ...prev, createdAt: resolvedCreatedAt } : null));
      }
    }
  }, [globalActiveTrip, activeTrip, hasDismissedRadar, user, isBn]);

  // Fetch real-time services from /rental-info
  useEffect(() => {
    const loadServices = async () => {
      setIsLoadingServices(true);
      const data = await customerTripService.fetchRentalInfo(language);
      if (data) {
        setServices(data);
        const keys = Object.keys(data);
        if (keys.length > 0 && !data[selectedService]) {
          setSelectedService(keys[0]);
        }
      }
      setIsLoadingServices(false);
    };

    loadServices();
  }, [language]);

  // Reset selected car and update departure datetime when service type changes
  useEffect(() => {
    setSelectedCar(null);
    const now = Date.now();
    const currentStartTs = new Date(startDatetime.replace(' ', 'T')).getTime();

    if (selectedService !== 'RIDE_SHARE') {
      const minRequiredTs = now + 2 * 3600 * 1000;
      // If start time is less than 2 hours from now or in the past, automatically select 2 hours later
      if (isNaN(currentStartTs) || currentStartTs < minRequiredTs - 30 * 1000) {
        const twoHoursLater = new Date(minRequiredTs);
        setStartDatetime(formatDateTimeToApi(twoHoursLater));

        if (selectedService === 'RETURN') {
          const later = new Date(twoHoursLater.getTime() + 8 * 3600 * 1000);
          setEndDatetime(formatDateTimeToApi(later));
        }
      }
    } else {
      // If switching to RIDE_SHARE and start time was in the past, reset to now
      if (isNaN(currentStartTs) || currentStartTs < now - 60 * 1000) {
        setStartDatetime(formatDateTimeToApi(new Date()));
      }
    }
  }, [selectedService]);

  // When activeTrip becomes active, automatically scroll to driver finding radar so user never has to scroll up
  useEffect(() => {
    if (activeTrip) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      requestAnimationFrame(() => {
        const target = document.getElementById('booking-top') || document.getElementById('home-booking');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }, [activeTrip?.uuid]);

  const handleSelectCar = (car: CarInfo, baseFare: number) => {
    setSelectedCar(car);
    setProposedFare(baseFare);
  };


  // Re-edit location directly from map click or drag
  const handleMapLocationSelect = (
    type: 'pickup' | 'dropoff',
    index: number,
    loc: LocationSearchResult
  ) => {
    if (type === 'pickup') {
      const updated = [...pickupLocations];
      updated[index] = loc;
      setPickupLocations(updated);
    } else {
      setDropoffLocations([loc]); // Strictly single dropoff
    }
  };

  // Submit trip offer
  const handleSubmitOffer = async () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }

    if (!selectedCar) {
      alert(isBn ? 'অনুগ্রহ করে একটি গাড়ি নির্বাচন করুন।' : 'Please select a vehicle.');
      return;
    }

    const validPickups = pickupLocations
      .map((l) => l.uuid)
      .filter((id) => id && id.trim().length > 0);
    const validDropoffs = dropoffLocations
      .slice(0, 1)
      .map((l) => l.uuid)
      .filter((id) => id && id.trim().length > 0);

    if (validPickups.length === 0 || validDropoffs.length === 0) {
      alert(
        isBn
          ? 'অনুগ্রহ করে পিকআপ ও ড্রপঅফ লোকেশন নির্বাচন করুন।'
          : 'Please select valid pickup and dropoff locations.'
      );
      return;
    }

    const nowTs = Date.now();
    const startTs = new Date(startDatetime.replace(' ', 'T')).getTime();

    // Disallow past date and time for all trips
    if (isNaN(startTs) || startTs < nowTs - 60 * 1000) {
      alert(
        isBn
          ? 'অতীতের তারিখ বা সময় নির্বাচন করা যাবে না। অনুগ্রহ করে বর্তমান বা ভবিষ্যতের সময় নির্ধারণ করুন।'
          : 'Cannot select past date or time. Please select current or future time.'
      );
      return;
    }

    // Lead time validation for non-RIDE_SHARE services (at least 2 hours in advance)
    if (selectedService !== 'RIDE_SHARE') {
      const minLeadTime = nowTs + 2 * 3600 * 1000 - 60 * 1000; // 2 hours minimum
      if (startTs < minLeadTime) {
        alert(
          isBn
            ? 'ইন্টারসিটি বা শিডিউল করা ট্রিপের জন্য শুরু করার সময় বর্তমান সময় থেকে কমপক্ষে ২ ঘন্টা পরের হতে হবে।'
            : 'For non-rideshare trips, scheduled departure must be at least 2 hours from now.'
        );
        return;
      }
    }

    if (selectedService === 'RETURN') {
      if (!endDatetime || !endDatetime.trim()) {
        alert(
          isBn
            ? 'রিটার্ন ট্রিপের জন্য অনুগ্রহ করে ফেরার তারিখ ও সময় (end_datetime) প্রদান করুন।'
            : 'Please provide return date and time (end_datetime) for round trip.'
        );
        return;
      }
      const startTs = new Date(startDatetime.replace(' ', 'T')).getTime();
      const endTs = new Date(endDatetime.replace(' ', 'T')).getTime();
      if (endTs <= startTs) {
        alert(
          isBn
            ? 'ফেরার সময় অবশ্যই যাত্রার শুরুর সময়ের পরের হতে হবে।'
            : 'Return date and time must be later than departure time.'
        );
        return;
      }
    }

    const priceSet = selectedCar.price_sets?.[0];
    if (!priceSet) {
      alert(
        isBn ? 'গাড়ির প্রাইস সেট পাওয়া যায়নি।' : 'Car price set not found.'
      );
      return;
    }

    const customerUuid =
      user?.uuid ||
      localStorage.getItem('trippy_customer_uuid') ||
      getActiveCustomerUuid();

    setIsSubmitting(true);

    const payload = {
      service_name: selectedService,
      start_datetime: startDatetime,
      ...(selectedService === 'RETURN' ? { end_datetime: endDatetime } : {}),
      ...(selectedService === 'HOURLY' ? { hours_booked: hoursBooked || '4' } : {}),
      payment_method: 'CASH',
      customer_uuid: customerUuid,
      country_code: 'BD',
      platform: 'web',
      language_code: language,
      pickup_location_uuid: validPickups,
      dropoff_location_uuid: validDropoffs,
      price_set_uuid: priceSet.uuid,
      offer_ammount: proposedFare,
      ...(note.trim() ? { note: note.trim() } : {}),
    };

    const res = await customerTripService.createRentalTrip(payload);
    setIsSubmitting(false);

    const formattedPickup =
      pickupLocations
        .filter((p) => p.address)
        .map((p) => p.address)
        .join(' → ') || (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point');
    const formattedDropoff =
      dropoffLocations[0]?.address || (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point');

    let createdTripUuid = '';
    if (res && res.status !== false) {
      if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data) && res.data.length > 0) {
          createdTripUuid = res.data[0]?.uuid || res.data[0]?.trip_uuid || '';
        } else {
          createdTripUuid = res.data.uuid || res.data.trip_uuid || res.data.rental_trip_uuid || '';
        }
      }
      if (!createdTripUuid) {
        createdTripUuid = (res as any).uuid || (res as any).trip_uuid || '';
      }
    }
    if (!createdTripUuid) {
      createdTripUuid = `trip-${Date.now()}`;
    }

    // Clean old trip and date data from localStorage upon new trip creation
    clearTripDataFromLocalStorage();

    const tripData = {
      uuid: createdTripUuid,
      customerUuid,
      serviceName: selectedService,
      vehicleName: selectedCar.car_type,
      proposedFare,
      pickupAddress: formattedPickup,
      dropoffAddress: formattedDropoff,
      hoursBooked: selectedService === 'HOURLY' ? hoursBooked : undefined,
      note: note.trim() || undefined,
      createdAt: res.data?.created_at || (res.data as any)?.trip?.created_at || new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && tripData.uuid) {
      try {
        localStorage.setItem(`trippy_trip_created_${tripData.uuid}`, tripData.createdAt);
        sessionStorage.setItem(`trippy_trip_created_${tripData.uuid}`, tripData.createdAt);
      } catch {}
    }

    setActiveTrip(tripData);

    // Sync globally so the global overlay and active trip context reflect the new request
    setActiveTripManually({
      uuid: tripData.uuid,
      customer_uuid: customerUuid,
      service_name: selectedService,
      offer_amount: proposedFare,
      trip_status: 'REQUESTED',
      pickup_locations: [{ address: formattedPickup, uuid: validPickups[0] }],
      dropoff_locations: [{ address: formattedDropoff, uuid: validDropoffs[0] }],
      car_category: { car_type: selectedCar.car_type },
      hours_booked: selectedService === 'HOURLY' ? hoursBooked : undefined,
      note: note.trim() || undefined,
      created_at: tripData.createdAt,
      drivers: [],
    } as any);

    // Call /v1/rental-trip/rental-bid-trip-single_for_customer immediately after trip creation
    customerTripService
      .fetchSingleTripBids(customerUuid, createdTripUuid, language, 'ALL', token || undefined)
      .then((singleRes) => {
        if (singleRes.status && singleRes.data) {
          setActiveTripManually(singleRes.data);
        }
      })
      .catch((err) => {
        console.warn('Initial single trip polling call:', err);
      });

    // Automatically scroll to driver finding radar view so user immediately sees next step without scrolling up
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const target = document.getElementById('booking-top') || document.getElementById('home-booking');
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    });
  };


  return (
    <div id="booking-top" className={isHero ? 'py-4 bg-transparent' : 'py-8 bg-slate-50/60 min-h-screen scroll-mt-24'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Banner (Only shown in search/form mode, hidden when driver finding is active) */}
        {!activeTrip && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isBn
                    ? isHero
                      ? 'বাংলাদেশে প্রথম স্বয়ংক্রিয় রাইড শেয়ারিং ও রেন্টাল প্ল্যাটফর্ম'
                      : 'লাইভ ট্রিপ বুকিং ও রুট ম্যাপ'
                    : isHero
                    ? 'First Direct Driver Bidding Platform in Bangladesh'
                    : 'Live Trip Booking & Route Map'}
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                {isBn
                  ? isHero
                    ? 'আপনার যাত্রা, আপনার নিজের প্রস্তাবিত ভাড়া'
                    : 'ট্রিপ বুক করুন ও নিজের পছন্দমত ভাড়া দিন'
                  : isHero
                  ? 'Your Ride, Your Own Proposed Fare'
                  : 'Book Your Trip & Set Your Own Fare'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
                {isBn
                  ? isHero
                    ? 'পছন্দের সার্ভিস, গাড়ি ও নিজের প্রস্তাবিত ভাড়ায় চালকদের সাথে সরাসরি যুক্ত হোন। কোনো হিডেন চার্জ ছাড়া বাংলাদেশের যেকোনো প্রান্তে ভ্রমণ করুন।'
                    : 'যাচাইকৃত চালক, লাইভ গুগল রুট ও কোনো হিডেন চার্জ ছাড়া বাংলাদেশের যেকোনো প্রান্তে ভ্রমণ করুন'
                  : isHero
                  ? 'Choose your service, select vehicles, and negotiate directly with drivers. Travel anywhere in Bangladesh with zero hidden fees.'
                  : 'Verified drivers, live Google routing, and transparent pricing across Bangladesh.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <span className="badge badge-primary flex items-center gap-1 text-xs">
                <MapPin className="w-3 h-3 text-emerald-600" />{' '}
                {isBn ? 'সারা বাংলাদেশে' : 'All Across Bangladesh'}
              </span>
              <span className="badge badge-warning flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3 text-amber-500" />{' '}
                {isBn ? 'চালকরা প্রস্তুত' : 'Drivers Ready'}
              </span>
            </div>
          </div>
        )}

        {/* Live Bidding Radar View (When trip offer is active - starts cleanly at top) */}
        {activeTrip ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 bg-slate-900 text-white rounded-2xl px-4 py-2.5 shadow-sm border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-200">
                  {isBn
                    ? 'আপনার রাইড রিকোয়েস্টের বিডিং চালু আছে'
                    : 'Active Trip Request - Bidding Open'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setHasDismissedRadar(true);
                  setActiveTrip(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isBn ? 'নতুন রাইড খুঁজুন' : 'New Ride Search'}</span>
              </button>
            </div>

            <LiveBiddingRadarView
              tripUuid={activeTrip.uuid}
              customerUuid={activeTrip.customerUuid}
              serviceName={activeTrip.serviceName}
              proposedFare={activeTrip.proposedFare}
              pickupAddress={activeTrip.pickupAddress}
              dropoffAddress={activeTrip.dropoffAddress}
              vehicleName={activeTrip.vehicleName}
              hoursBooked={activeTrip.hoursBooked}
              note={activeTrip.note}
              createdAt={activeTrip.createdAt}
              initialBids={globalActiveTrip?.drivers || []}
              onTripUuidUpdated={(newUuid) => {
                setActiveTrip((prev) => (prev ? { ...prev, uuid: newUuid } : null));
              }}
              onCancelTrip={() => {
                setActiveTrip(null);
                clearGlobalActiveTrip();
              }}
            />
          </div>
        ) : (
          /* Two-Column Responsive Layout: Left Controls, Right Sticky Google Map */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Booking Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Service Cards Horizontal Slider (Matches Screenshot) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {isBn ? 'সার্ভিস ক্যাটাগরি' : 'Service Category'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {isBn ? 'অনুভূমিকভাবে স্ক্রোল করুন' : 'Scroll horizontally'}
                  </span>
                </div>
                <ServicePhotoCardSelector
                  services={services}
                  selectedService={selectedService}
                  onSelectService={(name) => setSelectedService(name)}
                  isLoading={isLoadingServices}
                />
              </div>

              {/* 2. Multi-Location Route Selector (Multi-Pickup & Dropoff) */}
              <MultiLocationRouteSelector
                pickupLocations={pickupLocations}
                dropoffLocations={dropoffLocations}
                onChangePickups={(locs) => setPickupLocations(locs)}
                onChangeDropoffs={(locs) => setDropoffLocations(locs)}
                onSelectActiveLocation={(type, index) =>
                  setActiveLocationIndex({ type, index })
                }
              />

              {/* 3. Date and Time Schedule (always shown for all service types) */}
              {/* RIDE_SHARE: current time accepted (no advance required) */}
              {/* All other services: minimum 2 hours in advance */}
              <div className="animate-fade-in">
                <TripDateTimeSchedule
                  serviceType={selectedService}
                  startDatetime={startDatetime}
                  endDatetime={endDatetime}
                  hoursBooked={hoursBooked}
                  onChangeStartDatetime={(val) => setStartDatetime(val)}
                  onChangeEndDatetime={(val) => setEndDatetime(val)}
                  onChangeHoursBooked={(val) => setHoursBooked(val)}
                />
              </div>


              {/* 4. Vehicles Horizontal Slider, Note Field & Fare Proposer */}
              <VehiclePriceList
                serviceName={selectedService}
                serviceCategory={services[selectedService] || null}
                pickupUuids={pickupLocations.map((p) => p.uuid)}
                dropoffUuids={dropoffLocations.map((d) => d.uuid)}
                pickupAddress={pickupLocations.filter(p => p.address).map(p => p.address).join(' → ')}
                dropoffAddress={dropoffLocations[0]?.address || ''}
                startDatetime={startDatetime}
                endDatetime={endDatetime}
                selectedCar={selectedCar}
                onSelectCar={handleSelectCar}
                proposedFare={proposedFare}
                onChangeFare={(amount) => setProposedFare(amount)}
                onSubmitOffer={handleSubmitOffer}
                isSubmitting={isSubmitting}
                isAuthenticated={isAuthenticated}
                onRequestLogin={() => dispatch(openLoginModal())}
                note={note}
                onChangeNote={(val) => setNote(val)}
              />



            </div>

            {/* Right Column: Sticky Google Route Map (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <GoogleRouteMap
                pickupLocations={pickupLocations}
                dropoffLocations={dropoffLocations}
                activeLocationIndex={activeLocationIndex}
                onMapLocationSelect={handleMapLocationSelect}
                className="h-[460px] lg:h-[640px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPortal;
