'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FLEET_VEHICLES, VehicleKey } from '@/types/fleet';
import { DriverBid } from '@/types/booking';
import { Badge } from '../common/Badge';
import { MapPin, Navigation, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const BookingPortal: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const [pickup, setPickup] = useState('412/1, 412 Senpara Parbata Ln, Dhaka 1216');
  const [dropoff, setDropoff] = useState('Gazipur, Bangladesh');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleKey>('hiace');
  const [fare, setFare] = useState<number>(1607);
  const [tripNote, setTripNote] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [incomingBid, setIncomingBid] = useState<DriverBid | null>(null);

  const handleVehicleSelect = (key: VehicleKey) => {
    setSelectedVehicle(key);
    setFare(FLEET_VEHICLES[key].baseFare);
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

    setTimeout(() => {
      setIsSearching(false);
      setIncomingBid({
        id: 'bid-02',
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

  const chipBase = fare;
  const chip10 = Math.round(chipBase * 1.1);
  const chip20 = Math.round(chipBase * 1.2);

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="primary" className="mb-2">
              {t.bookingWidget.liveFareProposer}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading">
              {t.bookingWidget.bookTripTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="badge badge-cyan">📍 {t.bookingWidget.dhakaToGazipur}</span>
            <span className="badge badge-amber">⚡ {t.bookingWidget.driversNearby}</span>
          </div>
        </div>

        {/* Main Two-Column Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Booking Form */}
          <div className="lg:col-span-6 bg-brand-card/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
            
            {/* Route Inputs */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-3.5 focus-within:border-brand-primary/50 transition-all">
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
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-3.5 focus-within:border-brand-primary/50 transition-all">
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
                  />
                </div>
              </div>
            </div>

            {/* Trip Meta Summary */}
            <div className="flex justify-between items-center text-xs text-slate-400 bg-black/25 border border-white/5 rounded-xl p-3 px-4 mb-6">
              <span>{t.bookingWidget.estDistance}: <strong className="text-white">20.82 {t.common.km}</strong></span>
              <span>{t.bookingWidget.estTime}: <strong className="text-brand-primary-light">45-55 {t.common.mins}</strong></span>
            </div>

            {/* Vehicle Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {t.bookingWidget.selectVehicle}
              </label>

              <div className="space-y-2.5">
                {(['sedan', 'noah', 'hiace'] as VehicleKey[]).map((key) => {
                  const v = FLEET_VEHICLES[key];
                  const locVehicle = t.fleet.vehicles[key];
                  const isSelected = selectedVehicle === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleVehicleSelect(key)}
                      className={`p-3.5 px-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-primary/15 border-brand-primary shadow-glow/20'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-9 overflow-hidden rounded-md relative flex items-center justify-center bg-black/30">
                          <div
                            className="w-full h-28 bg-contain bg-no-repeat"
                            style={{
                              backgroundImage: "url('/selecting_page.png')",
                              backgroundPosition: v.imagePosition,
                              transform: `scale(${v.scale || 1.6})`,
                            }}
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white leading-tight">
                            {locVehicle?.name || v.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {locVehicle?.seats || v.seats} • {locVehicle?.luggage || v.luggage}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-brand-primary-light font-heading">
                          {t.common.currency} {v.baseFare}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {isSelected ? t.common.verified : t.fleet.estimatedBase}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fare Proposer Box */}
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 sm:p-5 mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">
                  {t.bookingWidget.offerFare}
                </span>
                <span className="text-xs text-brand-primary-light font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t.bookingWidget.directNegotiation}
                </span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-brand-primary-light">{t.common.currency}</span>
                  <span className="text-4xl font-extrabold text-white font-heading">
                    {fare}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFareChange(-50)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xl flex items-center justify-center transition-all"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFareChange(50)}
                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xl flex items-center justify-center transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Chips */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleChipClick(chipBase)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
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
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
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
                  className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all ${
                    fare === chip20
                      ? 'bg-brand-primary/20 border-brand-primary text-brand-primary-light'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {t.common.currency} {chip20} (+20%)
                </button>
              </div>
            </div>

            {/* Optional Trip Note */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t.bookingWidget.tripNoteLabel}
              </label>
              <input
                type="text"
                value={tripNote}
                onChange={(e) => setTripNote(e.target.value)}
                placeholder={t.bookingWidget.tripNotePlaceholder}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary/50 transition-all"
              />
            </div>

            {/* Submit Offer CTA */}
            <button
              type="button"
              disabled={isSearching}
              onClick={handleGiveOffer}
              className="w-full btn btn-primary btn-glow py-4 px-6 rounded-xl font-extrabold text-base tracking-wide flex items-center justify-center gap-2 shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  {t.bookingWidget.connecting}
                </>
              ) : (
                <>
                  {t.bookingWidget.giveOffer} {t.common.currency} {fare}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Incoming Driver Counter-Offer Bid */}
            {incomingBid && (
              <div className="mt-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 shadow-glow/10 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary relative flex-shrink-0">
                      <Image
                        src={incomingBid.avatarUrl}
                        alt={incomingBid.driverName}
                        width={48}
                        height={48}
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
                    <div className="text-xl font-extrabold text-white font-heading">
                      {t.common.currency} {incomingBid.driverFare}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/tracking')}
                    className="flex-1 btn btn-primary py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-glow/20"
                  >
                    <Check className="w-4 h-4" /> {t.bookingWidget.acceptOffer} ({t.common.currency} {incomingBid.driverFare})
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncomingBid(null)}
                    className="btn btn-secondary py-2.5 px-4 text-xs font-semibold rounded-xl text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" /> {t.bookingWidget.decline}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Route Map Preview */}
          <div className="lg:col-span-6 bg-brand-card/90 border border-white/10 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-white">{t.bookingWidget.liveRouteTitle}</span>
              </div>
              <span className="badge badge-cyan text-xs">{t.bookingWidget.etaToPickup}</span>
            </div>

            <div className="w-full h-[580px] rounded-xl overflow-hidden relative bg-[#080c16] border border-white/5">
              <svg className="w-full h-full" viewBox="0 0 700 620" fill="none">
                <rect width="700" height="620" fill="#080c16" />
                
                {/* Background Roads */}
                <path d="M-50 100 Q 300 140 750 110" stroke="#131b2e" strokeWidth="12" />
                <path d="M-50 320 Q 350 280 750 340" stroke="#131b2e" strokeWidth="14" />
                <path d="M-50 510 Q 350 490 750 520" stroke="#131b2e" strokeWidth="10" />
                <path d="M160 -50 Q 180 320 150 670" stroke="#131b2e" strokeWidth="14" />
                <path d="M550 -50 Q 520 320 570 670" stroke="#131b2e" strokeWidth="14" />

                {/* Glowing Highway Route */}
                <path
                  d="M 220 540 Q 280 420 330 310 T 420 190 T 490 80"
                  stroke="rgba(16, 185, 129, 0.2)"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <path
                  d="M 220 540 Q 280 420 330 310 T 420 190 T 490 80"
                  stroke="#10B981"
                  strokeWidth="6"
                  strokeLinecap="round"
                />

                {/* Pickup Marker */}
                <g transform="translate(220, 540)">
                  <circle r="16" fill="rgba(16, 185, 129, 0.3)" />
                  <circle r="9" fill="#10B981" />
                  <circle r="3" fill="#FFFFFF" />
                  <text x="24" y="6" fill="#F8FAFC" fontFamily="var(--font-body)" fontSize="13" fontWeight="700">
                    Senpara Parbata Ln, Dhaka
                  </text>
                </g>

                {/* Destination Marker */}
                <g transform="translate(490, 80)">
                  <circle r="16" fill="rgba(239, 68, 68, 0.3)" />
                  <circle r="9" fill="#EF4444" />
                  <circle r="3" fill="#FFFFFF" />
                  <text x="-160" y="6" fill="#F8FAFC" fontFamily="var(--font-body)" fontSize="13" fontWeight="700">
                    Gazipur, Bangladesh
                  </text>
                </g>

                {/* Moving Hiace Marker */}
                <g transform="translate(330, 310)">
                  <circle r="26" fill="rgba(16, 185, 129, 0.25)" />
                  <rect x="-14" y="-22" width="28" height="44" rx="8" fill="#FFFFFF" stroke="#10B981" strokeWidth="2.5" />
                  <rect x="-10" y="-16" width="20" height="10" rx="2" fill="#1E293B" />
                  <rect x="-10" y="8" width="20" height="10" rx="2" fill="#1E293B" />
                  <rect x="20" y="-16" width="94" height="26" rx="6" fill="#111827" stroke="#10B981" strokeWidth="1" />
                  <text x="28" y="2" fill="#10B981" fontFamily="var(--font-body)" fontSize="11" fontWeight="700">
                    Hiace • 48 km/h
                  </text>
                </g>

                {/* Road Landmarks */}
                <text x="80" y="440" fill="#475569" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Mirpur 10</text>
                <text x="180" y="360" fill="#475569" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Uttara Sector 7</text>
                <text x="320" y="230" fill="#475569" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Tongi Junction</text>
                <text x="440" y="140" fill="#475569" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Board Bazar</text>
              </svg>

              {/* Floating Bottom Info Pill */}
              <div className="absolute bottom-5 right-5 bg-brand-surface/90 border border-white/10 rounded-xl p-3 px-4 backdrop-blur-md flex items-center gap-4 text-xs shadow-lg">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    {t.bookingWidget.tollsInclusive}
                  </span>
                  <strong className="text-white">{t.common.verified}</strong>
                </div>
                <div className="border-l border-white/10 pl-4">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    {t.bookingWidget.freeCancellation}
                  </span>
                  <strong className="text-brand-primary-light">0 {t.common.currency}</strong>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
