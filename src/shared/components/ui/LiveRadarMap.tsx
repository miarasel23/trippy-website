'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export const LiveRadarMap: React.FC = () => {
  const { t } = useLanguage();
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [speed, setSpeed] = useState(48);

  useEffect(() => {
    const timer = setInterval(() => {
      setSpeed(Math.floor(44 + Math.random() * 8));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-map-frame relative w-full h-full min-h-[520px] bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
      
      {/* SVG Map Container */}
      <div className="map-svg-container absolute inset-0 w-full h-full pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 600 520" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Light Background Grid Roads */}
          <rect width="600" height="520" fill="#f8fafc" />
          <path d="M-20 80 Q 200 120 620 90" stroke="#e2e8f0" strokeWidth="6" />
          <path d="M-10 240 Q 300 220 610 280" stroke="#e2e8f0" strokeWidth="8" />
          <path d="M-10 420 Q 320 380 620 440" stroke="#e2e8f0" strokeWidth="6" />
          <path d="M120 -10 Q 140 260 110 530" stroke="#e2e8f0" strokeWidth="8" />
          <path d="M480 -10 Q 460 260 500 530" stroke="#e2e8f0" strokeWidth="8" />

          {/* Dhaka to Gazipur Highway (N3) with Emerald Glow */}
          <path
            d="M 180 460 Q 220 350 260 280 T 320 180 T 380 70"
            stroke="rgba(16, 185, 129, 0.25)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M 180 460 Q 220 350 260 280 T 320 180 T 380 70"
            stroke="#10B981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8 6"
          />

          {/* Pickup Pin */}
          <g transform="translate(180, 460)">
            <circle r="14" fill="rgba(34, 197, 94, 0.3)" />
            <circle r="8" fill="#22C55E" />
            <circle r="3" fill="#FFFFFF" />
            <text x="20" y="5" fill="#0f172a" fontFamily="var(--font-body)" fontSize="12" fontWeight="700">
              {t.radarMap.dhakaPickup}
            </text>
          </g>

          {/* Destination Pin */}
          <g transform="translate(380, 70)">
            <circle r="14" fill="rgba(239, 68, 68, 0.3)" />
            <circle r="8" fill="#EF4444" />
            <circle r="3" fill="#FFFFFF" />
            <text x="-140" y="5" fill="#0f172a" fontFamily="var(--font-body)" fontSize="12" fontWeight="700">
              {t.radarMap.gazipurDest}
            </text>
          </g>

          {/* Moving Toyota Hiace Marker */}
          <g transform="translate(260, 280)">
            <circle r="24" fill="rgba(34, 197, 94, 0.25)">
              <animate attributeName="r" values="20;28;20" dur="2s" repeatCount="indefinite" />
            </circle>
            <rect x="-12" y="-18" width="24" height="36" rx="6" fill="#FFFFFF" stroke="#22C55E" strokeWidth="2" />
            <rect x="-9" y="-14" width="18" height="8" rx="2" fill="#0F172A" />
            <rect x="-9" y="8" width="18" height="8" rx="2" fill="#0F172A" />
            <polygon points="-8,-18 -16,-34 16,-34 8,-18" fill="rgba(234, 179, 8, 0.35)" />
          </g>

          {/* Other roaming vehicles */}
          <circle cx="210" cy="380" r="4" fill="#10B981" opacity="0.9" />
          <circle cx="340" cy="220" r="4" fill="#0F172A" opacity="0.8" />
          <circle cx="150" cy="240" r="4" fill="#10B981" opacity="0.9" />
          <circle cx="420" cy="360" r="4" fill="#0F172A" opacity="0.8" />
        </svg>

        {/* Animated Radar Pulse Center */}
        <div className="radar-pulse-center absolute top-[54%] left-[43%] pointer-events-none">
          <div className="radar-ring" />
          <div className="radar-ring" />
          <div className="radar-ring" />
        </div>
      </div>

      {/* Floating Top Card: Live Driver Matched */}
      <div className="relative z-10 m-5 self-end">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 px-4 shadow-xl flex items-center gap-3 animate-slide-up">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-black flex-shrink-0 relative">
            <Image
              src="/images/driver_found_page.png"
              alt="Driver"
              width={44}
              height={44}
              className="object-cover object-top"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Md Rasel Mia <span className="text-amber-500 text-[10px]">★ 4.9</span>
            </div>
            <p className="text-[11px] text-slate-500">Hiace Microbus • 210 Trips</p>
          </div>
          <div className="ml-2 px-2.5 py-1 rounded-lg bg-black text-white text-xs font-extrabold font-heading">
            {t.common.currency} 1597
          </div>
        </div>
      </div>

      {/* Floating Bottom Cards */}
      <div className="relative z-10 m-5 flex justify-between items-center gap-4">
        {/* Arrival Countdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 px-4 shadow-xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              {t.radarMap.arrivalCountdown}
            </span>
            <div className="text-xs font-bold text-slate-900 font-heading">
              {etaMinutes} {t.radarMap.minsRemaining} ({speed} {t.common.kmh})
            </div>
          </div>
        </div>

        {/* Highway Traffic Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 px-4 shadow-xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
              {t.radarMap.trafficStatus}
            </span>
            <div className="text-xs font-bold text-emerald-700">
              {t.radarMap.normalFlow}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
