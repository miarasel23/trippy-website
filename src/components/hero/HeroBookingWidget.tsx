'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FLEET_VEHICLES, VehicleKey } from '@/types/fleet';
import { ServiceType, DriverBid } from '@/types/booking';
import { ArrowRight, Check, X, MapPin, Navigation, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const HeroBookingWidget: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [service, setService] = useState<ServiceType>('rideshare');
  const [pickup, setPickup] = useState('412/1 Senpara Parbata Ln, Dhaka 1216');
  const [dropoff, setDropoff] = useState('Gazipur, Bangladesh');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleKey>('hiace');
  const [fare, setFare] = useState<number>(1607);
  const [isSearching, setIsSearching] = useState(false);
  const [incomingBid, setIncomingBid] = useState<DriverBid | null>(null);

  const handleVehicleSelect = (key: VehicleKey) => {
    setSelectedVehicle(key);
    const newBase = FLEET_VEHICLES[key].baseFare;
    setFare(newBase);
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
        carModel: 'Toyota Hiace Microbus',
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
    <div className="booking-widget-card bg-brand-card/90 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
      
      {/* Service Tabs */}
      <div className="flex bg-black/40 p-1 rounded-xl gap-1 mb-5 border border-white/5">
        {(['rideshare', 'intercity', 'return', 'hourly'] as ServiceType[]).map((tabKey) => {
          const icon = tabKey === 'rideshare' ? '🚗' : tabKey === 'intercity' ? '🛣️' : tabKey === 'return' ? '🔄' : '⏱️';
          return (
            <button
              key={tabKey}
              type="button"
              onClick={() => setService(tabKey)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                service === tabKey
                  ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 text-brand-primary-light border border-brand-primary/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{icon}</span> {t.bookingWidget.tabs[tabKey]}
            </button>
          );
        })}
      </div>

      {/* Origin & Destination Inputs */}
      <div className="space-y-3 mb-5 relative">
        <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/30 transition-all">
          <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Navigation className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.bookingWidget.pickupLabel}
            </label>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none truncate"
              placeholder={t.bookingWidget.pickupPlaceholder}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/30 border border-white/10 rounded-xl p-3 focus-within:border-brand-primary/50 focus-within:ring-1 focus-within:ring-brand-primary/30 transition-all">
          <span className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t.bookingWidget.dropoffLabel}
            </label>
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none truncate"
              placeholder={t.bookingWidget.dropoffPlaceholder}
            />
          </div>
        </div>
      </div>

      {/* Fleet Strip */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider">
            {t.bookingWidget.selectVehicle}
          </span>
          <Link href="/fleet" className="text-brand-primary-light hover:underline font-semibold">
            {t.common.exploreFleet} →
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(FLEET_VEHICLES) as VehicleKey[]).map((key) => {
            const v = FLEET_VEHICLES[key];
            const localizedVehicle = t.fleet.vehicles[key];
            const isSelected = selectedVehicle === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleVehicleSelect(key)}
                className={`p-2 rounded-xl flex flex-col items-center text-center transition-all border ${
                  isSelected
                    ? 'bg-brand-primary/15 border-brand-primary shadow-glow/20'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="w-full h-12 overflow-hidden rounded-md mb-1.5 relative flex items-center justify-center bg-black/20">
                  <div
                    className="w-full h-36 bg-contain bg-no-repeat transition-transform"
                    style={{
                      backgroundImage: "url('/selecting_page.png')",
                      backgroundPosition: v.imagePosition,
                      transform: `scale(${v.scale || 1.6})`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white leading-tight truncate w-full">
                  {localizedVehicle?.name || v.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {localizedVehicle?.seats || v.seats}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fare Proposer Box */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-300">
            {t.bookingWidget.offerFare}
          </span>
          <span className="text-xs text-brand-primary-light font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {t.bookingWidget.directNegotiation}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-brand-primary-light">{t.common.currency}</span>
            <span className="text-3xl font-extrabold text-white font-heading tracking-tight">
              {fare}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFareChange(-50)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg flex items-center justify-center transition-all"
              aria-label="Decrease fare"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => handleFareChange(50)}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg flex items-center justify-center transition-all"
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
                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary-light'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {t.common.currency} {chipBase}
          </button>
          <button
            type="button"
            onClick={() => handleChipClick(chip10)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              fare === chip10
                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary-light'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {t.common.currency} {chip10} (+10%)
          </button>
          <button
            type="button"
            onClick={() => handleChipClick(chip20)}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
              fare === chip20
                ? 'bg-brand-primary/20 border-brand-primary text-brand-primary-light'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {t.common.currency} {chip20} (+20%)
          </button>
        </div>
      </div>

      {/* Submit Offer Button */}
      <button
        type="button"
        disabled={isSearching}
        onClick={handleGiveOffer}
        className="w-full btn btn-primary btn-glow py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSearching ? (
          <>
            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
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
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-brand-primary-light font-medium animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
          {t.bookingWidget.connecting}
        </div>
      )}

      {/* Simulated Incoming Driver Counter-Offer Bid */}
      {incomingBid && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 shadow-glow/10 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-brand-primary relative flex-shrink-0">
                <Image
                  src={incomingBid.avatarUrl}
                  alt={incomingBid.driverName}
                  width={44}
                  height={44}
                  className="object-cover object-top"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {incomingBid.driverName}
                  <span className="text-amber-400 text-xs font-normal">★ {incomingBid.rating}</span>
                </div>
                <div className="text-xs text-slate-400">{incomingBid.licensePlate} • Hiace</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-brand-primary-light block">
                {t.bookingWidget.driverFound}
              </span>
              <div className="text-lg font-extrabold text-white font-heading">
                {t.common.currency} {incomingBid.driverFare}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAcceptBid}
              className="flex-1 btn btn-primary py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> {t.bookingWidget.acceptOffer}
            </button>
            <button
              type="button"
              onClick={handleDeclineBid}
              className="btn btn-secondary py-2 px-3 text-xs font-semibold rounded-lg text-slate-300 hover:text-white"
            >
              <X className="w-3.5 h-3.5" /> {t.bookingWidget.decline}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
