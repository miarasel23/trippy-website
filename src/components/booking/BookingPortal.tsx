'use client';

import React, { useState, useEffect } from 'react';
import {
  ServiceCategory,
  LocationSearchResult,
  CarInfo,
} from '@/types/customerApi';
import { customerTripService } from '@/services/customerTripService';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openLoginModal } from '@/redux/features/authSlice';
import { ServicePhotoCardSelector } from './ServicePhotoCardSelector';
import { MultiLocationRouteSelector } from './MultiLocationRouteSelector';
import { TripDateTimeSchedule, formatDateTimeToApi } from './TripDateTimeSchedule';
import { VehiclePriceList } from './VehiclePriceList';
import { LiveBiddingRadarView } from './LiveBiddingRadarView';
import { GoogleRouteMap } from './GoogleRouteMap';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '../common/Badge';
import { Sparkles, MapPin, Zap } from 'lucide-react';

interface BookingPortalProps {
  isHero?: boolean;
}

export const BookingPortal: React.FC<BookingPortalProps> = ({ isHero = false }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
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
  const [startDatetime, setStartDatetime] = useState<string>(() =>
    formatDateTimeToApi(new Date())
  );
  const [endDatetime, setEndDatetime] = useState<string>(() => {
    const later = new Date(Date.now() + 8 * 3600 * 1000);
    return formatDateTimeToApi(later);
  });
  const [hoursBooked, setHoursBooked] = useState<string>('4');

  // 4. Vehicle & Fare state
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null);
  const [proposedFare, setProposedFare] = useState<number>(1850);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5. Active submitted trip for live bidding radar
  const [activeTrip, setActiveTrip] = useState<{
    uuid: string;
    customerUuid: string;
    vehicleName: string;
    proposedFare: number;
    pickupAddress: string;
    dropoffAddress: string;
  } | null>(null);

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

  // Reset selected car when service type changes
  useEffect(() => {
    setSelectedCar(null);
  }, [selectedService]);

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
      alert('অনুগ্রহ করে একটি গাড়ি নির্বাচন করুন।');
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
      alert('অনুগ্রহ করে পিকআপ ও ড্রপঅফ লোকেশন নির্বাচন করুন।');
      return;
    }

    if (selectedService === 'RETURN' && (!endDatetime || !endDatetime.trim())) {
      alert(
        isBn
          ? 'রিটার্ন ট্রিপের জন্য অনুগ্রহ করে ফেরার তারিখ ও সময় (end_datetime) প্রদান করুন।'
          : 'Please provide return date and time (end_datetime) for round trip.'
      );
      return;
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
      'guest-customer-uuid';

    setIsSubmitting(true);

    const payload = {
      service_name: selectedService,
      start_datetime: startDatetime,
      ...(selectedService === 'RETURN' ? { end_datetime: endDatetime } : {}),
      ...(selectedService === 'HOURLY' ? { hours_booked: hoursBooked } : {}),
      payment_method: 'CASH',
      customer_uuid: customerUuid,
      country_code: 'BD',
      platform: 'web',
      language_code: language,
      pickup_location_uuid: validPickups,
      dropoff_location_uuid: validDropoffs,
      price_set_uuid: priceSet.uuid,
      offer_ammount: proposedFare,
    };

    const res = await customerTripService.createRentalTrip(payload);
    setIsSubmitting(false);

    if (res.status) {
      const tripUuid = res.data?.uuid || `trip-${Date.now()}`;
      setActiveTrip({
        uuid: tripUuid,
        customerUuid,
        vehicleName: selectedCar.car_type,
        proposedFare,
        pickupAddress: pickupLocations[0]?.address || (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point'),
        dropoffAddress: dropoffLocations[0]?.address || (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point'),
      });
    } else {
      const fallbackTripUuid = `trip-${Date.now()}`;
      setActiveTrip({
        uuid: fallbackTripUuid,
        customerUuid,
        vehicleName: selectedCar.car_type,
        proposedFare,
        pickupAddress: pickupLocations[0]?.address || (isBn ? 'পিকআপ পয়েন্ট' : 'Pickup Point'),
        dropoffAddress: dropoffLocations[0]?.address || (isBn ? 'ড্রপঅফ পয়েন্ট' : 'Dropoff Point'),
      });
    }
  };

  return (
    <div className={isHero ? 'py-4 bg-transparent' : 'py-8 bg-slate-50/60 min-h-screen'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Banner */}
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
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Platform: Web
              </span>
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

        {/* Live Bidding Radar View (When trip offer is active) */}
        {activeTrip ? (
          <LiveBiddingRadarView
            tripUuid={activeTrip.uuid}
            customerUuid={activeTrip.customerUuid}
            proposedFare={activeTrip.proposedFare}
            pickupAddress={activeTrip.pickupAddress}
            dropoffAddress={activeTrip.dropoffAddress}
            vehicleName={activeTrip.vehicleName}
            onCancelTrip={() => setActiveTrip(null)}
          />
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

              {/* 3. Conditional Date and Time Schedule (ONLY WHEN service_type !== 'RIDE_SHARE') */}
              {selectedService !== 'RIDE_SHARE' && (
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
              )}


              {/* 4. Vehicles Horizontal Slider & Fare Proposer */}
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
