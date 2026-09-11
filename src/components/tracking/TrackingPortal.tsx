'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import { Badge } from '../common/Badge';
import { Share2, Phone, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const TrackingPortal: React.FC = () => {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const tripUuidParam = searchParams.get('trip_uuid');
  const driverUuidParam = searchParams.get('driver_uuid');

  const [speed, setSpeed] = useState(48);
  const [etaMinutes, setEtaMinutes] = useState(18);
  const [progress, setProgress] = useState(70);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Dynamic realistic telemetry fluctuations
      const newSpeed = Math.floor(42 + Math.random() * 12);
      setSpeed(newSpeed);

      if (Math.random() > 0.65) {
        setEtaMinutes((prev) => (prev > 2 ? prev - 1 : prev));
        setProgress((prev) => Math.min(98, prev + 1));
      }
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const displayTripId = tripUuidParam
    ? `#${tripUuidParam.slice(0, 8).toUpperCase()}`
    : '#TRP-849201';

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Monitoring Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <Badge variant="primary">{t.tracking.badge}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
              {t.tracking.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.tracking.sharedTripLabel} <span className="text-slate-900 font-mono font-bold">{displayTripId}</span> • {t.tracking.foregroundStream}
            </p>
          </div>


          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-extrabold text-xs sm:text-sm tracking-wide font-heading">
              {t.tracking.arrivingIn} {etaMinutes} {t.common.mins}
            </div>
            <button
              type="button"
              onClick={handleShareLink}
              className="btn btn-secondary py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-2 bg-black text-white hover:bg-slate-900 border border-black"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> {t.tracking.linkCopied}
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" /> {t.tracking.shareLink}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar: Driver, Telemetry, and Safety */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Driver Profile Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-black flex-shrink-0 relative">
                  <Image
                    src="/driver_found_page.png"
                    alt="Driver Md Rasel Mia"
                    width={56}
                    height={56}
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Md Rasel Mia
                  </h3>
                  <div className="flex items-center gap-2 text-xs mt-0.5">
                    <span className="text-amber-500 font-semibold">★ 4.9</span>
                    <span className="text-slate-500">(210 {t.tracking.verifiedRides})</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {t.common.verified}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle & Plate */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 px-4 flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.tracking.vehicleModel}</span>
                  <div className="text-xs font-bold text-slate-900">{t.fleet.vehicles.hiace.name} (11)</div>
                </div>
                <span className="text-xs font-mono font-bold bg-white text-slate-900 border border-slate-300 px-2.5 py-1 rounded-md shadow-xs">
                  Dhaka-Metro-cha-54-1400
                </span>
              </div>

              {/* Agreed Negotiated Fare */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 px-4 flex items-center justify-between">
                <span className="text-xs text-slate-600">{t.tracking.agreedFare}</span>
                <span className="text-base font-extrabold text-slate-900 font-heading">
                  {t.common.currency} 1597 {t.tracking.cashPayment}
                </span>
              </div>
            </div>

            {/* Route Progress & Milestones */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.tracking.routeProgress}</span>
                <span className="text-sm font-extrabold text-slate-900 font-heading">{progress}%</span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-black transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-3 text-center text-xs">
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-black mb-1.5" />
                  <strong className="text-slate-900 text-xs">{t.tracking.milestone1}</strong>
                  <span className="text-[10px] text-slate-500">03:20 AM</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-black mb-1.5" />
                  <strong className="text-slate-900 text-xs">{t.tracking.milestone2}</strong>
                  <span className="text-[10px] text-slate-500">{t.tracking.passed}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 mb-1.5" />
                  <strong className="text-slate-900 text-xs">{t.tracking.milestone3}</strong>
                  <span className="text-[10px] text-slate-500">{t.tracking.arrivingIn} {etaMinutes}m</span>
                </div>
              </div>
            </div>

            {/* Live Telemetry Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.tracking.speed}</span>
                <strong className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">{speed} {t.common.kmh}</strong>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.tracking.remaining}</span>
                <strong className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">6.2 {t.common.km}</strong>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-sm">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.tracking.battery}</span>
                <strong className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono">84%</strong>
              </div>
            </div>

            {/* Safety Controls Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                {t.tracking.safetyTitle}
              </span>

              <button
                type="button"
                onClick={() => alert(t.tracking.sosAlert)}
                className="w-full btn btn-danger py-3 px-4 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4" /> {t.tracking.emergencySosBtn}
              </button>

              <a
                href="tel:16223"
                className="w-full btn btn-secondary py-3 px-4 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-900 border border-black"
              >
                <Phone className="w-4 h-4 text-emerald-400" /> {t.tracking.hotlineBtn}
              </a>
            </div>

          </div>

          {/* Right Column: Live Highway Map Viewport */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-xl h-[660px]">
            
            <svg className="w-full h-full" viewBox="0 0 900 680" fill="none">
              <rect width="900" height="680" fill="#f8fafc" />

              {/* Highway Network */}
              <path d="M-100 120 Q 400 180 1000 140" stroke="#e2e8f0" strokeWidth="18" />
              <path d="M-100 360 Q 450 320 1000 390" stroke="#e2e8f0" strokeWidth="22" />
              <path d="M-100 580 Q 450 540 1000 600" stroke="#e2e8f0" strokeWidth="16" />
              <path d="M220 -80 Q 250 360 210 760" stroke="#e2e8f0" strokeWidth="20" />
              <path d="M720 -80 Q 690 360 740 760" stroke="#e2e8f0" strokeWidth="20" />

              {/* Glowing Highway Line (N3 Expressway) */}
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

              {/* Completed Section */}
              <path
                d="M 280 610 Q 360 480 430 350 T 520 250"
                stroke="#4ADE80"
                strokeWidth="8"
                strokeLinecap="round"
              />

              {/* Origin Pin */}
              <g transform="translate(280, 610)">
                <circle r="18" fill="rgba(34, 197, 94, 0.3)" />
                <circle r="10" fill="#22C55E" />
                <circle r="4" fill="#FFFFFF" />
                <text x="24" y="6" fill="#0f172a" fontFamily="var(--font-body)" fontSize="14" fontWeight="700">
                  412/1 {t.tracking.milestone1}, Dhaka
                </text>
              </g>

              {/* Destination Pin */}
              <g transform="translate(660, 90)">
                <circle r="20" fill="rgba(239, 68, 68, 0.3)" />
                <circle r="11" fill="#EF4444" />
                <circle r="4" fill="#FFFFFF" />
                <text x="-165" y="6" fill="#0f172a" fontFamily="var(--font-body)" fontSize="14" fontWeight="700">
                  {t.tracking.milestone3}
                </text>
              </g>

              {/* Live Vehicle Hiace */}
              <g transform="translate(520, 250)">
                <circle r="32" fill="rgba(34, 197, 94, 0.28)">
                  <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect x="-16" y="-26" width="32" height="52" rx="10" fill="#FFFFFF" stroke="#22C55E" strokeWidth="3" />
                <rect x="-12" y="-18" width="24" height="12" rx="2" fill="#0F172A" />
                <rect x="-12" y="10" width="24" height="12" rx="2" fill="#0F172A" />
                <polygon points="-12,-26 -26,-56 26,-56 12,-26" fill="rgba(234, 179, 8, 0.35)" />
                <rect x="26" y="-20" width="130" height="30" rx="6" fill="#000000" stroke="#000000" strokeWidth="1.5" />
                <text x="36" y="0" fill="#ffffff" fontFamily="var(--font-mono)" fontSize="12" fontWeight="700">
                  {speed} {t.common.kmh} • Live
                </text>
              </g>

              {/* Milestones Labels */}
              <text x="130" y="520" fill="#64748B" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Airport Intersection</text>
              <text x="240" y="420" fill="#64748B" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Tongi Bridge</text>
              <text x="410" y="300" fill="#64748B" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Board Bazar</text>
              <text x="540" y="180" fill="#64748B" fontFamily="var(--font-body)" fontSize="13" fontWeight="600">Joydebpur Chowrasta</text>
            </svg>

            {/* Floating Top GPS Telemetry Pill */}
            <div className="absolute top-6 left-6 bg-white border border-slate-200 rounded-xl p-3.5 px-5 flex gap-6 shadow-xl text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.common.gpsProtected}</span>
                <strong className="text-slate-900">± 3m ({t.common.verified})</strong>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.radarMap.trafficStatus}</span>
                <strong className="text-slate-900">{t.radarMap.normalFlow}</strong>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
