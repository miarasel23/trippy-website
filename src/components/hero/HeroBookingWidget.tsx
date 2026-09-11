'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FLEET_VEHICLES, VehicleKey } from '@/types/fleet';
import { DriverBid } from '@/types/booking';
import { ArrowRight, Check, X, MapPin, Navigation, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { AppUrls, getImageUrl } from '@/config/appUrls';

interface ApiCarItem {
  uuid: string;
  car_type: string;
  set_capacity: number | string;
  car_avatar: string;
  price_sets?: Array<{
    uuid: string;
    price_per_km: number;
    minimum_booking_price: number;
  }>;
}

interface ApiServiceItem {
  key: string;
  service_name: string;
  name: string;
  avatar: string | null;
  cars: ApiCarItem[];
}

const DEFAULT_SERVICES: ApiServiceItem[] = [
  {
    key: 'RIDE_SHARE',
    service_name: 'RIDE_SHARE',
    name: 'Ride Share',
    avatar: '52f869efcb28cdba3f1a0a82cb347fc06fabdc28142530419e27d7e4f079bbd0cea9a6516c6f5cda96231b22f432a3513767.png',
    cars: [],
  },
  {
    key: 'INTER_CITY_RENTER',
    service_name: 'INTER_CITY_RENTER',
    name: 'Intercity',
    avatar: '190e8548d1d02f7ea6cdcf3cd0b45510bc4a58d66ff8686bf33c4c98a33da3c76b29c4c8db76a8c81a73ff93cabc24e08718.png',
    cars: [],
  },
  {
    key: 'RETURN',
    service_name: 'RETURN',
    name: 'Return',
    avatar: null,
    cars: [],
  },
  {
    key: 'HOURLY',
    service_name: 'HOURLY',
    name: 'Hourly',
    avatar: '76ab166c17296a0cf7d80b14810bf010881f45b7e92e16deb331b6995de77d094c184f27d696c05ef02deaecd4794efc30b8.png',
    cars: [],
  },
  {
    key: 'AIRPORT_RENTER',
    service_name: 'AIRPORT_RENTER',
    name: 'Airport',
    avatar: '7dee1810bd2971744a1f0f964b9cf080a5026709239abd35cf59cd1b2b42c20c22cb59cb6981481ee11b92a9e87648a43122.png',
    cars: [],
  },
  {
    key: 'WEDDING_CAR',
    service_name: 'WEDDING_CAR',
    name: 'Wedding',
    avatar: '8a551f46e6954268b3178bdad291012433e2cded34e730043ead1dbfb3760810fe21a0c138afc8a19a467bbfb73149c708eb.png',
    cars: [],
  },
  {
    key: 'PACKAGE_DELIVERY',
    service_name: 'PACKAGE_DELIVERY',
    name: 'Delivery',
    avatar: 'dae376d54038d1da08aa2ff0bae0af8ffa9dcf5ff1516f5999d29b0e18384b4668c4d72b78737340d88a38d6de44c4e92ebc.png',
    cars: [],
  },
];

const CAR_NAMES: Record<string, string> = {
  MOTOR_CYCLE: 'Motorcycle',
  MOTOR_CYCLE_SAVER: 'Bike Saver',
  SEDAN_ECONOMY: 'Economy',
  SEDAN: 'Sedan',
  SEDAN_PREMIUM: 'Premium',
  NOAH: 'Toyota Noah',
  HIACE: 'Toyota Hiace',
};

export const HeroBookingWidget: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [serviceList, setServiceList] = useState<ApiServiceItem[]>(DEFAULT_SERVICES);
  const [selectedService, setSelectedService] = useState<string>('RIDE_SHARE');
  const [pickup, setPickup] = useState('412/1 Senpara Parbata Ln, Dhaka 1216');
  const [dropoff, setDropoff] = useState('Gazipur, Bangladesh');
  const [selectedCarIndex, setSelectedCarIndex] = useState<number>(0);
  const [fare, setFare] = useState<number>(1607);
  const [isSearching, setIsSearching] = useState(false);
  const [incomingBid, setIncomingBid] = useState<DriverBid | null>(null);

  // Fetch real-time services from /rental-info
  useEffect(() => {
    const fetchRentalInfo = async () => {
      try {
        const res = await fetch(
          `${AppUrls.proxy.rentalInfo}?platform=web&language_code=bn&action_when=admin_login`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json.status && json.data) {
          const loaded: ApiServiceItem[] = Object.entries(json.data).map(([k, v]: [string, any]) => ({
            key: k,
            service_name: v.service_name || k,
            name:
              k === 'RIDE_SHARE'
                ? 'Ride Share'
                : k === 'INTER_CITY_RENTER'
                ? 'Intercity'
                : k === 'RETURN'
                ? 'Return'
                : k === 'HOURLY'
                ? 'Hourly'
                : k === 'AIRPORT_RENTER'
                ? 'Airport'
                : k === 'WEDDING_CAR'
                ? 'Wedding'
                : k === 'PACKAGE_DELIVERY'
                ? 'Delivery'
                : (v.service_name || k).replace(/_/g, ' '),
            avatar: v.avatar || null,
            cars: v.cars || [],
          }));
          setServiceList(loaded);
        }
      } catch (e) {
        console.error('Failed to fetch rental info for tabs:', e);
      }
    };

    fetchRentalInfo();
  }, []);

  const currentServiceItem =
    serviceList.find((s) => s.key === selectedService) || serviceList[0];
  const activeCars = currentServiceItem?.cars || [];

  const handleServiceChange = (serviceKey: string) => {
    setSelectedService(serviceKey);
    setSelectedCarIndex(0);
    const srv = serviceList.find((s) => s.key === serviceKey);
    if (srv && srv.cars && srv.cars.length > 0) {
      const pSet = srv.cars[0].price_sets?.[0];
      if (pSet) {
        setFare(Math.round(pSet.minimum_booking_price + 22 * pSet.price_per_km));
      }
    }
  };

  const handleCarSelect = (index: number) => {
    setSelectedCarIndex(index);
    const car = activeCars[index];
    if (car && car.price_sets?.[0]) {
      const pSet = car.price_sets[0];
      setFare(Math.round(pSet.minimum_booking_price + 22 * pSet.price_per_km));
    }
  };

  const handleFareChange = (delta: number) => {
    setFare((prev) => Math.max(100, prev + delta));
  };

  const handleChipClick = (amount: number) => {
    setFare(amount);
  };

  const handleGiveOffer = () => {
    setIsSearching(true);
    setIncomingBid(null);

    // Simulate real-time radar search and driver counter-offer response
    setTimeout(() => {
      setIsSearching(false);
      setIncomingBid({
        id: 'bid-01',
        driverName: 'Md Rasel Mia',
        rating: 4.9,
        completedRides: 210,
        carModel: activeCars[selectedCarIndex]?.car_type || 'Toyota Hiace Microbus',
        licensePlate: 'Dhaka-Metro-cha-54-1400',
        avatarUrl: '/driver_found_page.png',
        proposedFare: fare,
        driverFare: Math.max(100, fare - 10),
        timeAwayMins: 4,
      });
    }, 1800);
  };

  const handleAcceptBid = () => {
    router.push('/tracking');
  };

  const handleDeclineBid = () => {
    setIncomingBid(null);
  };

  const chipBase = fare;
  const chip10 = Math.round(chipBase * 1.1);
  const chip20 = Math.round(chipBase * 1.2);

  return (
    <div className="booking-widget-card bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
      
      {/* Service Tabs loaded from /v1/rental-trip/rental-info */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl gap-1.5 mb-5 border border-slate-200 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {serviceList.map((srv) => {
          const isSelected = selectedService === srv.key;
          const avatarUrl = srv.avatar ? getImageUrl(srv.avatar) : null;
          return (
            <button
              key={srv.key}
              type="button"
              onClick={() => handleServiceChange(srv.key)}
              className={`flex-1 min-w-[96px] py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isSelected
                  ? 'bg-black text-white shadow-sm'
                  : 'text-slate-600 hover:text-black hover:bg-slate-200/60'
              }`}
            >
              {avatarUrl ? (
                <div className="relative w-5 h-5 flex-shrink-0">
                  <Image
                    src={avatarUrl}
                    alt={srv.name}
                    fill
                    className="object-contain"
                    sizes="20px"
                  />
                </div>
              ) : (
                <span className="text-sm flex-shrink-0">🔄</span>
              )}
              <span>{srv.name}</span>
            </button>
          );
        })}
      </div>

      {/* Origin & Destination Inputs */}
      <div className="space-y-3 mb-5 relative">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all">
          <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200">
            <Navigation className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {t.bookingWidget.pickupLabel}
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none truncate"
              placeholder={t.bookingWidget.pickupPlaceholder}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all">
          <span className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 border border-red-200">
            <MapPin className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {t.bookingWidget.dropoffLabel}
            </label>
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none truncate"
              placeholder={t.bookingWidget.dropoffPlaceholder}
            />
          </div>
        </div>
      </div>

      {/* Fleet Strip */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="text-slate-600 font-bold uppercase tracking-wider">
            {t.bookingWidget.selectVehicle}
          </span>
          <Link href="/fleet" className="text-slate-900 hover:underline font-bold">
            {t.common.exploreFleet} →
          </Link>
        </div>

        {activeCars.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {activeCars.slice(0, 4).map((car, idx) => {
              const isSelected = selectedCarIndex === idx;
              const carTitle = CAR_NAMES[car.car_type] || car.car_type.replace(/_/g, ' ');
              const carAvatarUrl = car.car_avatar ? getImageUrl(car.car_avatar) : null;
              return (
                <button
                  key={car.uuid || idx}
                  type="button"
                  onClick={() => handleCarSelect(idx)}
                  className={`p-2 rounded-xl flex flex-col items-center text-center transition-all border ${
                    isSelected
                      ? 'bg-slate-50 border-black ring-1 ring-black shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-12 overflow-hidden rounded-md mb-1.5 relative flex items-center justify-center bg-slate-100 p-1">
                    {carAvatarUrl ? (
                      <Image
                        src={carAvatarUrl}
                        alt={carTitle}
                        fill
                        className="object-contain"
                        sizes="60px"
                      />
                    ) : (
                      <span className="text-xl">🚗</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate w-full">
                    {carTitle}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {car.set_capacity} Seats
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(FLEET_VEHICLES) as VehicleKey[]).map((key) => {
              const v = FLEET_VEHICLES[key];
              const localizedVehicle = t.fleet.vehicles[key];
              const isSelected = key === 'hiace';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {}}
                  className={`p-2 rounded-xl flex flex-col items-center text-center transition-all border ${
                    isSelected
                      ? 'bg-slate-50 border-black ring-1 ring-black shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="w-full h-12 overflow-hidden rounded-md mb-1.5 relative flex items-center justify-center bg-slate-100">
                    <div
                      className="w-full h-36 bg-contain bg-no-repeat transition-transform"
                      style={{
                        backgroundImage: "url('/selecting_page.png')",
                        backgroundPosition: v.imagePosition,
                        transform: `scale(${v.scale || 1.6})`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900 leading-tight truncate w-full">
                    {localizedVehicle?.name || v.name}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    {localizedVehicle?.seats || v.seats}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fare Proposer Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-700">
            {t.bookingWidget.offerFare}
          </span>
          <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {t.bookingWidget.directNegotiation}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-slate-700">{t.common.currency}</span>
            <span className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              {fare}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFareChange(-50)}
              className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center transition-all shadow-sm"
              aria-label="Decrease fare"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => handleFareChange(50)}
              className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold text-lg flex items-center justify-center transition-all shadow-sm"
              aria-label="Increase fare"
            >
              +
            </button>
          </div>
        </div>

        {/* Quick Fare Percentage Chips */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleChipClick(chipBase)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              fare === chipBase
                ? 'bg-black border-black text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.common.currency} {chipBase}
          </button>
          <button
            type="button"
            onClick={() => handleChipClick(chip10)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              fare === chip10
                ? 'bg-black border-black text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.common.currency} {chip10} (+10%)
          </button>
          <button
            type="button"
            onClick={() => handleChipClick(chip20)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              fare === chip20
                ? 'bg-black border-black text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {t.common.currency} {chip20} (+20%)
          </button>
        </div>
      </div>

      {/* Submit Offer Button - All buttons should be black */}
      <button
        type="button"
        disabled={isSearching}
        onClick={handleGiveOffer}
        className="w-full btn btn-primary py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-md disabled:opacity-60 disabled:cursor-not-allowed bg-black text-white hover:bg-slate-900"
      >
        {isSearching ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t.bookingWidget.connecting}
          </>
        ) : (
          <>
            {t.bookingWidget.giveOffer} {t.common.currency} {fare}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Radar Pulse Searching Indicator */}
      {isSearching && (
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-700 font-medium animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          {t.bookingWidget.connecting}
        </div>
      )}

      {/* Simulated Incoming Driver Counter-Offer Bid */}
      {incomingBid && (
        <div className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-black relative flex-shrink-0">
                <Image
                  src={incomingBid.avatarUrl}
                  alt={incomingBid.driverName}
                  width={44}
                  height={44}
                  className="object-cover object-top"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  {incomingBid.driverName}
                  <span className="text-amber-500 text-xs font-semibold">★ {incomingBid.rating}</span>
                </div>
                <div className="text-xs text-slate-500">{incomingBid.licensePlate} • Hiace</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                {t.bookingWidget.driverFound}
              </span>
              <div className="text-lg font-extrabold text-slate-900 font-heading">
                {t.common.currency} {incomingBid.driverFare}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAcceptBid}
              className="flex-1 btn btn-primary py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1 bg-black text-white hover:bg-slate-900"
            >
              <Check className="w-3.5 h-3.5" /> {t.bookingWidget.acceptOffer}
            </button>
            <button
              type="button"
              onClick={handleDeclineBid}
              className="btn btn-secondary py-2 px-3 text-xs font-semibold rounded-lg bg-black text-white hover:bg-slate-900"
            >
              <X className="w-3.5 h-3.5" /> {t.bookingWidget.decline}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
