'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { CarInfo, ServiceCategory } from '@/types/customerApi';
import { getImageUrl, customerTripService } from '@/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';
import {
  Car,
  Users,
  CheckCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  AlertCircle,
  Navigation,
  TrendingDown,
  TrendingUp,
  Route,
  Ruler,
} from 'lucide-react';

interface VehiclePriceListProps {
  serviceName: string;
  serviceCategory: ServiceCategory | null;
  pickupUuids: string[];
  dropoffUuids: string[];
  pickupAddress?: string;
  dropoffAddress?: string;
  startDatetime: string;
  endDatetime?: string;
  selectedCar: CarInfo | null;
  onSelectCar: (car: CarInfo, baseFare: number) => void;
  proposedFare: number;
  onChangeFare: (amount: number) => void;
  onSubmitOffer: () => void;
  isSubmitting?: boolean;
  /** Whether the current user is authenticated */
  isAuthenticated?: boolean;
  /** Called when a login is needed before fetching prices */
  onRequestLogin?: () => void;
  /** Optional customer note for driver */
  note?: string;
  onChangeNote?: (note: string) => void;
}


const CAR_DISPLAY_NAMES: Record<string, { bn: string; en: string; descBn: string; descEn: string }> = {
  MOTOR_CYCLE:       { bn: 'মোটরসাইকেল',              en: 'Motorcycle',             descBn: 'শহরের জ্যাম এড়িয়ে একা দ্রুত চলার জন্য', descEn: 'Quick solo rides bypassing traffic' },
  MOTOR_CYCLE_SAVER: { bn: 'বাইক সেভার',               en: 'Bike Saver',             descBn: 'সবচেয়ে কম খরচে দ্রুত যাত্রা',            descEn: 'Most affordable quick travel' },
  SEDAN_ECONOMY:     { bn: 'সিডান ইকোনমি',             en: 'Sedan Economy',          descBn: 'কম খরচে এসি কারে পরিবার বা বন্ধুদের সাথে যাত্রা', descEn: 'Affordable AC sedan for daily travel' },
  SEDAN:             { bn: 'স্ট্যান্ডার্ড সিডান',      en: 'Standard Sedan',         descBn: 'আরামদায়ক আসন ও লাগেজ স্পেসসহ এসি কার', descEn: 'Comfortable AC sedan with luggage space' },
  SEDAN_PREMIUM:     { bn: 'প্রিমিয়াম সিডান',          en: 'Premium Sedan',          descBn: 'সর্বোচ্চ আরাম ও লাক্সারি রাইডের নিশ্চয়তা', descEn: 'Executive comfort and luxury ride' },
  NOAH:              { bn: 'টয়োটা নোয়া (৭ সিট)',      en: 'Toyota Noah (7-Seat)',   descBn: 'বড় পরিবার বা ৭ জনের গ্রুপের জন্য প্রশস্ত এসি গাড়ি', descEn: 'Spacious 7-seater for family & groups' },
  HIACE:             { bn: 'টয়োটা হাইয়েস (১১ সিট)',   en: 'Toyota Hiace (11-Seat)', descBn: '১১ জনের পিকনিক বা যেকোনো লং ট্রিপে সেরা মাইক্রোবাস', descEn: '11-seater microbus for tours and events' },
};

export const VehiclePriceList: React.FC<VehiclePriceListProps> = ({
  serviceName,
  serviceCategory,
  pickupUuids,
  dropoffUuids,
  pickupAddress,
  dropoffAddress,
  startDatetime,
  endDatetime,
  selectedCar,
  onSelectCar,
  proposedFare,
  onChangeFare,
  onSubmitOffer,
  isSubmitting = false,
  isAuthenticated = false,
  onRequestLogin,
  note = '',
  onChangeNote,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const currSym = isBn ? '৳' : 'BDT';
  const formatFare = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return isBn ? `৳${num.toLocaleString('en-IN')}` : `BDT ${num.toLocaleString('en-IN')}`;
  };

  const validPickups  = pickupUuids.filter(id => id && id.trim().length > 0 && !id.startsWith('custom-'));
  const validDropoffs = dropoffUuids.filter(id => id && id.trim().length > 0 && !id.startsWith('custom-'));
  const hasRequiredLocations = validPickups.length > 0 && validDropoffs.length > 0;

  /** Helper functions for calculating minimum and maximum booking fares */
  const getCarMinFare = (car: CarInfo): number => {
    if (car.rent_calculation?.minimum_booking_price)
      return Math.round(car.rent_calculation.minimum_booking_price);
    const ps = car.price_sets?.[0];
    return ps ? Math.round(ps.minimum_booking_price) : 300;
  };

  const getCarMaxFare = (car: CarInfo): number => {
    if (car.rent_calculation?.maximum_booking_price)
      return Math.round(car.rent_calculation.maximum_booking_price);
    return getCarMinFare(car) * 2;
  };

  // Customer offer range: estimated fare is the minimum, customer can increase up to at least +100%
  const getOfferMin = (car: CarInfo): number => getCarMinFare(car);
  const getOfferMax = (car: CarInfo): number => {
    const minFare = getCarMinFare(car);
    const maxCalc = car.rent_calculation?.maximum_booking_price
      ? Math.round(car.rent_calculation.maximum_booking_price)
      : 0;
    // Minimum 100% increase (2x estimated fare) or higher if backend maximum_booking_price exists
    return Math.max(minFare * 2, maxCalc);
  };

  /** Cars coming from trip-price-details-customer API */
  const [apiCars, setApiCars] = useState<CarInfo[] | null>(null);
  /** Distance extracted from API response distance.total_km */
  const [apiTotalKm, setApiTotalKm] = useState<number>(0);
  /** pickup_to_dropoff_km from API */
  const [apiPickupToDropKm, setApiPickupToDropKm] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Keep a stable ref to the current selectedCar
  const selectedCarRef = useRef<CarInfo | null>(selectedCar);
  useEffect(() => {
    selectedCarRef.current = selectedCar;
  }, [selectedCar]);

  const scrollSlider = (dir: 'left' | 'right') => {
    sliderRef.current?.scrollBy({ left: dir === 'left' ? -290 : 290, behavior: 'smooth' });
  };

  /* ── Fetch price details from API ─────────────────────────────────────── */
  const fetchPriceDetails = useCallback(async () => {
    if (!hasRequiredLocations) {
      setApiCars(null);
      setApiTotalKm(0);
      setApiPickupToDropKm(0);
      return;
    }

    // If not authenticated, open login modal instead of calling the API
    if (!isAuthenticated) {
      onRequestLogin?.();
      return;
    }

    setIsCalculating(true);
    try {
      const result = await customerTripService.calculateTripPrice({
        platform: 'web',
        language_code: language,
        action_when: 'trip_details_customer_admin',
        servive_type: serviceName,
        country_code: 'BD',
        pickup_location_uuid: validPickups,
        dropoff_location_uuid: validDropoffs,
        start_datetime: startDatetime,
        ...(serviceName === 'RETURN' && endDatetime ? { end_datetime: endDatetime } : {}),
      });

      if (result.status && result.data) {
        const serviceData: any =
          result.data[serviceName] ?? Object.values(result.data)[0];

        if (serviceData && Array.isArray(serviceData.cars) && serviceData.cars.length > 0) {
          const newCars = serviceData.cars as CarInfo[];
          setApiCars(newCars);

          // Extract distance from first car (all cars share the same route)
          const dist = serviceData.cars[0]?.distance;
          if (dist) {
            setApiTotalKm(dist.total_km ?? 0);
            setApiPickupToDropKm(dist.pickup_to_dropoff_km ?? 0);
          }

          // If a vehicle was already selected, update it to the newly calculated car & base fare
          if (selectedCarRef.current) {
            const prevType = selectedCarRef.current.car_type;
            const prevUuid = selectedCarRef.current.uuid;
            const matching = newCars.find(
              (c) =>
                (prevType && c.car_type === prevType) ||
                (prevUuid && c.uuid === prevUuid)
            );

            if (matching) {
              const newFare = getCarMinFare(matching);
              onSelectCar(matching, newFare);
              onChangeFare(newFare);
            }
          }
        } else {
          setApiCars(null);
        }
      } else {
        setApiCars(null);
      }
    } catch {
      setApiCars(null);
    }
    setIsCalculating(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName, validPickups.join(','), validDropoffs.join(','), startDatetime, endDatetime, language, hasRequiredLocations, isAuthenticated]);

  useEffect(() => { fetchPriceDetails(); }, [fetchPriceDetails]);

  // Keep selectedCar and proposedFare synchronized whenever apiCars updates
  useEffect(() => {
    if (!selectedCar || !apiCars || apiCars.length === 0) return;

    const matchingCar = apiCars.find(
      (c) =>
        (selectedCar.car_type && c.car_type === selectedCar.car_type) ||
        (selectedCar.uuid && c.uuid === selectedCar.uuid)
    );

    if (matchingCar) {
      const currentMin = getCarMinFare(selectedCar);
      const newMin = getCarMinFare(matchingCar);
      const isRefDifferent = selectedCar !== matchingCar;
      const isFareDifferent = currentMin !== newMin;
      const isCalcDifferent =
        selectedCar.rent_calculation?.minimum_booking_price !==
        matchingCar.rent_calculation?.minimum_booking_price;

      if (isRefDifferent && (isFareDifferent || isCalcDifferent)) {
        onSelectCar(matchingCar, newMin);
        onChangeFare(newMin);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCars]);

  /* ── Helpers ──────────────────────────────────────────────────────────── */
  const displayCars = apiCars ?? (serviceCategory?.cars ?? []);

  // Effective distance to show (prefer total_km, then pickup_to_dropoff_km)
  const distanceKm = apiTotalKm > 0 ? apiTotalKm : apiPickupToDropKm > 0 ? apiPickupToDropKm : 0;

  const handleSelect = (car: CarInfo) => {
    const fare = getCarMinFare(car);
    onSelectCar(car, fare);
    onChangeFare(fare);
  };

  const handleAdjustFare = (delta: number) => {
    if (!selectedCar) return;
    const min = getOfferMin(selectedCar);
    const max = getOfferMax(selectedCar);
    onChangeFare(Math.min(max, Math.max(min, proposedFare + delta)));
  };

  const handleSetPercentage = (pct: number) => {
    if (!selectedCar) return;
    const min = getOfferMin(selectedCar);
    const max = getOfferMax(selectedCar);
    const calculated = Math.round(min * (1 + pct / 100));
    onChangeFare(Math.min(max, Math.max(min, calculated)));
  };

  /* ── 1. Placeholder when no locations ───────────────────────────────── */
  if (!hasRequiredLocations) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[190px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Car className="w-7 h-7 text-slate-400" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-1">
            {isBn ? 'গাড়ির তালিকা দেখতে লোকেশন দিন' : 'Select Locations to See Vehicles'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {isBn
              ? 'উপরে পিকআপ ও ড্রপঅফ লোকেশন নির্বাচন করুন। তারপর এখানে লাইভ ভাড়াসহ গাড়ির তালিকা আসবে।'
              : 'Select pickup & dropoff locations above. Live vehicle fares will load here automatically.'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1">
            <Navigation className="w-3 h-3 text-emerald-500" />
            {isBn ? 'পিকআপ' : 'Pickup'}
          </span>
          <span className="text-slate-300">→</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-500" />
            {isBn ? 'ড্রপঅফ' : 'Dropoff'}
          </span>
        </div>
      </div>
    );
  }

  /* ── 1b. Auth gate — locations set but user not logged in ─────────────── */
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 min-h-[190px]">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
          <ShieldCheck className="w-7 h-7 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 mb-1">
            {isBn ? 'ভাড়া দেখতে লগইন করুন' : 'Login to See Live Prices'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {isBn
              ? 'লাইভ গাড়ির ভাড়া ও দূরত্ব দেখতে এবং ট্রিপ বুক করতে লগইন করুন।'
              : 'Log in to fetch live vehicle prices, distance, and book your trip.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onRequestLogin?.()}
          className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {isBn ? 'লগইন করুন ও ভাড়া দেখুন' : 'Login & See Prices'}
        </button>
      </div>
    );
  }

  /* ── 2. Loading skeleton ─────────────────────────────────────────────── */
  if (isCalculating) {
    return (
      <div className="space-y-3">
        {/* Route bar skeleton */}
        <div className="h-14 bg-slate-100 animate-pulse rounded-2xl" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-52 sm:w-60 h-52 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  /* ── 3. No cars ──────────────────────────────────────────────────────── */
  if (displayCars.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
        <Car className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-xs font-semibold text-slate-500">
          {isBn
            ? 'এই সার্ভিসের জন্য কোনো গাড়ি পাওয়া যায়নি।'
            : 'No vehicles available for this service. Try another service.'}
        </p>
      </div>
    );
  }

  /* ── 4. Main render ──────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">

      {/* ── Route Summary Banner ──────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Pickup */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-3.5 h-3.5 text-white" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-widest">
              {isBn ? 'পিকআপ' : 'Pickup'}
            </p>
            <p className="text-xs font-bold text-white truncate">
              {pickupAddress || (isBn ? 'পিকআপ লোকেশন' : 'Pickup Location')}
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-px w-6 bg-slate-600 hidden sm:block" />
          <div className="flex flex-col items-center">
            <Route className="w-4 h-4 text-amber-400" />
          </div>
          <div className="h-px w-6 bg-slate-600 hidden sm:block" />
        </div>

        {/* Dropoff */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-white" />
          </span>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-red-400 tracking-widest">
              {isBn ? 'ড্রপঅফ' : 'Dropoff'}
            </p>
            <p className="text-xs font-bold text-white truncate">
              {dropoffAddress || (isBn ? 'ড্রপঅফ গন্তব্য' : 'Dropoff Destination')}
            </p>
          </div>
        </div>

        {/* Est. Km badge */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          {distanceKm > 0 && (
            <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-400/30 rounded-lg px-2 py-1">
              <Ruler className="w-3 h-3 text-amber-400" />
              <span className="text-[11px] font-black text-amber-400">
                {isBn ? 'আনু.' : 'Est.'} {distanceKm} {isBn ? 'কিমি' : 'km'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Vehicles Header + Slider arrows ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            {isBn ? 'গাড়ি বেছে নিন' : 'Choose Vehicle'}
          </span>
          <h2 className="text-sm font-extrabold text-slate-900">
            {isBn
              ? `${displayCars.length}টি গাড়ি উপলব্ধ`
              : `${displayCars.length} Vehicles Available`}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => scrollSlider('left')}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <button type="button" onClick={() => scrollSlider('right')}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* ── Horizontal Vehicle Slider ─────────────────────────────────── */}
      <div ref={sliderRef}
        className="flex items-stretch gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x pb-1">
        {displayCars.map((car) => {
          const isSelected  = selectedCar?.uuid === car.uuid;
          const meta        = CAR_DISPLAY_NAMES[car.car_type] ?? {
            bn: car.car_type.replace(/_/g, ' '),
            en: car.car_type.replace(/_/g, ' '),
            descBn: `${car.set_capacity} জনের আসন`,
            descEn: `${car.set_capacity} Seats`,
          };
          const minFare     = getCarMinFare(car);
          const maxFare     = getCarMaxFare(car);
          const hasRentCalc = Boolean(car.rent_calculation);

          // Per-car distance (same for all cars in one trip)
          const carDistKm   = car.distance?.total_km ?? car.distance?.pickup_to_dropoff_km ?? 0;
          const showCarDist = carDistKm > 0;

          return (
            <div key={car.uuid} onClick={() => handleSelect(car)}
              className={`flex-shrink-0 w-56 sm:w-64 rounded-2xl border transition-all duration-200 cursor-pointer snap-start flex flex-col relative group overflow-hidden ${
                isSelected
                  ? 'bg-slate-950 text-white border-black shadow-xl ring-2 ring-black/10 scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900 hover:border-slate-300 hover:shadow-md'
              }`}>

              {/* Selected badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-0.5 z-10">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}

              {/* Car Image Area */}
              <div className={`h-28 w-full flex items-center justify-center relative overflow-hidden ${isSelected ? 'bg-white/5' : 'bg-slate-50'}`}>
                {car.car_avatar ? (
                  <div className="relative w-44 h-24 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={getImageUrl(car.car_avatar)}
                      alt={isBn ? meta.bn : meta.en}
                      fill
                      className="object-contain"
                      sizes="176px"
                    />
                  </div>
                ) : (
                  <Car className={`w-10 h-10 ${isSelected ? 'text-white/50' : 'text-slate-300'}`} />
                )}
              </div>

              {/* Info Body */}
              <div className="p-3.5 flex flex-col gap-2 flex-1">
                {/* Name + Capacity */}
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-extrabold leading-tight">
                    {isBn ? meta.bn : meta.en}
                  </h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0 ${
                    isSelected ? 'bg-white/15 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Users className="w-2.5 h-2.5" />{car.set_capacity}
                  </span>
                </div>

                <p className={`text-[10px] leading-snug ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isBn ? meta.descBn : meta.descEn}
                </p>

                {/* Distance row (from API response) */}
                {showCarDist && (
                  <div className={`flex items-center gap-1 text-[10px] font-semibold rounded-lg px-2 py-1 ${
                    isSelected ? 'bg-white/10 text-slate-300' : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    <Ruler className="w-3 h-3" />
                    {carDistKm} {isBn ? 'কিমি মোট দূরত্ব' : 'km total distance'}
                  </div>
                )}

                {/* ── Price Block ────────────────────────────── */}
                <div className={`mt-auto pt-2.5 border-t ${isSelected ? 'border-white/10' : 'border-slate-100'}`}>

                  {/* minimum_booking_price — PROMINENT */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${isSelected ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                      {isBn ? 'সর্বনিম্ন ভাড়া' : 'Min. Booking Price'}
                    </span>
                  </div>

                  {/* Big price number */}
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-black font-mono ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatFare(minFare)}
                    </span>
                    {hasRentCalc && (
                      <span className={`text-[11px] font-semibold ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        – {formatFare(maxFare)}
                      </span>
                    )}
                  </div>

                  {/* price_per_km */}
                  {car.price_sets?.[0] && (
                    <p className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatFare(car.price_sets[0].price_per_km)}/{isBn ? 'কিমি' : 'km'}
                      {' · '}
                      {isBn ? 'ক্যান্সেলেশন' : 'Cancellation'} {formatFare(car.price_sets[0].cancellation_fee || 0)}
                    </p>
                  )}

                  {/* Offer range hint */}
                  <div className={`mt-1.5 flex items-center gap-1 text-[9px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
                    <span>{isBn ? 'অফার সীমা:' : 'Offer range:'}</span>
                    <span className="font-mono font-bold">{formatFare(minFare)}</span>
                    <span className="text-slate-300">–</span>
                    <span className="font-mono font-bold">{formatFare(getOfferMax(car))}</span>
                    <span className="text-emerald-600 font-bold">{isBn ? '(সর্বোচ্চ +১০০%)' : '(up to +100%)'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Fare Proposer (when a car is selected) ─────────────────────── */}
      {selectedCar && (() => {
        const sysMinFare = getCarMinFare(selectedCar);
        const offerMin   = getOfferMin(selectedCar);
        const offerMax   = getOfferMax(selectedCar);
        const diff       = proposedFare - sysMinFare;
        const pct        = Math.round((diff / sysMinFare) * 100);
        const meta       = CAR_DISPLAY_NAMES[selectedCar.car_type] ?? { bn: selectedCar.car_type, en: selectedCar.car_type, descBn: '', descEn: '' };

        return (
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedCar.car_avatar && (
                  <div className="relative w-14 h-10 flex-shrink-0">
                    <Image src={getImageUrl(selectedCar.car_avatar)} alt={isBn ? meta.bn : meta.en} fill className="object-contain" sizes="56px" />
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {isBn ? 'নির্বাচিত গাড়ি' : 'Selected Vehicle'}
                  </p>
                  <h3 className="text-sm font-extrabold text-white">{isBn ? meta.bn : meta.en}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">{isBn ? 'আপনার অফার' : 'Your Offer'}</p>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{formatFare(proposedFare)}</span>
                <p className={`text-[10px] font-bold mt-0.5 ${pct === 0 ? 'text-slate-300' : 'text-emerald-400'}`}>
                  {pct === 0
                    ? (isBn ? 'বেস আনুমানিক ভাড়া' : 'Base Est. Fare')
                    : `+${pct}% ${isBn ? 'আনুমানিক ভাড়া থেকে বেশি' : 'above est. fare'}`}
                </p>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* System fare reference + distance */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex-1">
                  <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-amber-700 uppercase tracking-wide">
                      {isBn ? 'আনুমানিক সর্বনিম্ন ভাড়া (বেস)' : 'Estimated Min. Fare (Base)'}
                    </p>
                    <p className="text-sm font-black text-amber-900 font-mono">{formatFare(sysMinFare)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex-1">
                  <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide">
                      {isBn ? 'সর্বোচ্চ প্রস্তাব সীমা (+১০০%)' : 'Max Allowed Offer (+100%)'}
                    </p>
                    <p className="text-sm font-black text-emerald-900 font-mono">{formatFare(offerMax)}</p>
                  </div>
                </div>

                {distanceKm > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                    <Ruler className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div>
                      <p className="text-[9px] font-bold text-blue-700 uppercase tracking-wide">
                        {isBn ? 'মোট দূরত্ব' : 'Total Distance'}
                      </p>
                      <p className="text-sm font-black text-blue-900 font-mono">{distanceKm} {isBn ? 'কিমি' : 'km'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Percentage Chips */}
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-2">
                  {isBn ? 'দ্রুত ভাড়া বাড়ানোর অপশন (শতকরা হার):' : 'Quick Fare Increase Options:'}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { labelBn: 'বেস (০%)', labelEn: 'Base (0%)', pct: 0 },
                    { labelBn: '+১০%', labelEn: '+10%', pct: 10 },
                    { labelBn: '+২০%', labelEn: '+20%', pct: 20 },
                    { labelBn: '+৫০%', labelEn: '+50%', pct: 50 },
                    { labelBn: '+৭৫%', labelEn: '+75%', pct: 75 },
                    { labelBn: '+১০০%', labelEn: '+100%', pct: 100 },
                  ].map((chip) => {
                    const targetFare = Math.round(sysMinFare * (1 + chip.pct / 100));
                    const isChipActive = Math.abs(proposedFare - targetFare) < 5;
                    return (
                      <button
                        key={chip.pct}
                        type="button"
                        onClick={() => handleSetPercentage(chip.pct)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          isChipActive
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span>{isBn ? chip.labelBn : chip.labelEn}</span>
                        <span className={`text-[10px] font-mono ${isChipActive ? 'text-emerald-300' : 'text-slate-500'}`}>
                          {formatFare(targetFare)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step adjust buttons + slider + editable input */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700">
                    {isBn ? 'ভাড়া নির্ধারণ করুন (স্লাইডার বা ইনপুট):' : 'Fine-Tune Fare (Slider or Direct Input):'}
                  </span>
                  
                  {/* Direct input */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 shadow-xs">
                    <span className="text-xs font-bold text-slate-500">{currSym}</span>
                    <input
                      type="number"
                      min={offerMin}
                      max={offerMax}
                      value={proposedFare}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) onChangeFare(val);
                      }}
                      onBlur={() => {
                        onChangeFare(Math.min(offerMax, Math.max(offerMin, proposedFare)));
                      }}
                      className="w-24 text-xs font-extrabold font-mono text-slate-900 bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustFare(-50)}
                    disabled={proposedFare <= offerMin}
                    title={isBn ? '৫০ টাকা কমান' : 'Decrease 50 BDT'}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isBn ? '−৫০ ৳' : '−50 BDT'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustFare(-20)}
                    disabled={proposedFare <= offerMin}
                    title={isBn ? '২০ টাকা কমান' : 'Decrease 20 BDT'}
                    className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isBn ? '−২০ ৳' : '−20 BDT'}
                  </button>
                  
                  <div className="flex-1 px-1">
                    <input
                      type="range"
                      min={offerMin}
                      max={offerMax}
                      step={10}
                      value={proposedFare}
                      onChange={(e) => onChangeFare(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-semibold mt-1 px-0.5">
                      <span>{formatFare(offerMin)} ({isBn ? 'বেস' : 'Base'})</span>
                      <span>{formatFare(Math.round(offerMin * 1.5))} ({isBn ? '+৫০%' : '+50%'})</span>
                      <span>{formatFare(offerMax)} ({isBn ? '+১০০%' : '+100%'})</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdjustFare(20)}
                    disabled={proposedFare >= offerMax}
                    title={isBn ? '২০ টাকা বাড়ান' : 'Increase 20 BDT'}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isBn ? '+২০ ৳' : '+20 BDT'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustFare(50)}
                    disabled={proposedFare >= offerMax}
                    title={isBn ? '৫০ টাকা বাড়ান' : 'Increase 50 BDT'}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    {isBn ? '+৫০ ৳' : '+50 BDT'}
                  </button>
                </div>
              </div>

              {/* Boundary hint */}
              <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-50/90 border border-emerald-200/90 rounded-xl px-3.5 py-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {isBn
                    ? `আনুমানিক ভাড়া ${formatFare(sysMinFare)} হলো সর্বনিম্ন সীমা। চালকদের দ্রুত বিড পাওয়ার জন্য আপনি সর্বনিম্ন ভাড়া থেকে সর্বোচ্চ ১০০% বাড়িয়ে (${formatFare(offerMax)}) পর্যন্ত অফার করতে পারবেন।`
                    : `Estimated fare ${formatFare(sysMinFare)} is the minimum. To attract drivers faster, you can increase your offer up to 100% (max ${formatFare(offerMax)}).`}
                </span>
              </div>

              {/* Special Note for Driver (User requested field) */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>{isBn ? 'ড্রাইভারের জন্য বিশেষ নোট (ঐচ্ছিক):' : 'Special Note for Driver (Optional):'}</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">{note?.length || 0}/120</span>
                </div>
                <input
                  type="text"
                  maxLength={120}
                  value={note || ''}
                  onChange={(e) => onChangeNote?.(e.target.value)}
                  placeholder={
                    isBn
                      ? 'যেমন: এসি চালু রাখবেন, ২টি লাগেজ সাথে আছে, পৌঁছানোর আগে কল করবেন...'
                      : 'e.g. Please keep AC on, have 2 suitcases, please call before arrival...'
                  }
                  className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all placeholder:text-slate-400 shadow-2xs"
                />
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    { bn: '❄️ এসি চালু রাখবেন', en: '❄️ Keep AC on' },
                    { bn: '🧳 লাগেজ আছে', en: '🧳 Have luggage' },
                    { bn: '📞 পৌঁছানোর আগে কল দিন', en: '📞 Call before arrival' },
                    { bn: '🤫 শান্ত যাত্রা চাই', en: '🤫 Quiet ride' },
                  ].map((chip) => (
                    <button
                      key={chip.en}
                      type="button"
                      onClick={() => {
                        const chipText = isBn ? chip.bn : chip.en;
                        const next = note ? `${note}, ${chipText}` : chipText;
                        onChangeNote?.(next.slice(0, 120));
                      }}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-100 hover:text-black transition-colors shadow-2xs"
                    >
                      {isBn ? chip.bn : chip.en}
                    </button>
                  ))}
                </div>
              </div>


              {/* Submit button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onSubmitOffer}
                className="w-full py-4 bg-slate-950 hover:bg-black text-white font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    {isBn ? 'অফার সাবমিট হচ্ছে...' : 'Submitting Offer...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    {isBn
                      ? `চালকদের অফার পাঠান — ${formatFare(proposedFare)}`
                      : `Send Offer to Drivers — ${formatFare(proposedFare)}`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default VehiclePriceList;
