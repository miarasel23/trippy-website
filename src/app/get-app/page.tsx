'use client';

import React from 'react';
import Link from 'next/link';

const USER_URL = 'https://play.google.com/store/apps/details?id=com.trippy.user';
const RIDER_URL = 'https://play.google.com/store/apps/details?id=com.trippy.rider';

export default function GetAppPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between p-4 sm:p-8 font-sans">
      
      {/* Main Focus Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8">
        
        {/* Clean, Focused Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            Download Trippy App
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Select your role below to install directly from the Google Play Store.
          </p>
        </div>

        {/* Two Sharp Professional Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Customer / Passenger App */}
          <div className="group bg-white border-2 border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all flex flex-col justify-between p-6 sm:p-8">
            <div>
              {/* Badge & ID */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="text-[10px] font-mono uppercase font-bold tracking-[0.16em] px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  PASSENGER APP
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  com.trippy.user
                </span>
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 transition-colors">
                  <svg className="w-6 h-6 fill-emerald-700 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    Trippy Customer
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For passengers & ride booking
                  </p>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-2.5 my-6 pt-6 border-t border-slate-100 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 flex-shrink-0" />
                  <span>Instant ride booking with fair fare bidding</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 flex-shrink-0" />
                  <span>Real-time GPS tracking & in-app driver messaging</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-emerald-600 flex-shrink-0" />
                  <span>Door-to-door parcel delivery & verified drivers</span>
                </li>
              </ul>
            </div>

            {/* Sharp Action Button */}
            <a
              href={USER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-5 flex items-center justify-between text-xs tracking-wider uppercase transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.986V2.8a2.38 2.38 0 0 1 .22-.986zM15.207 13.414l2.586 2.586-13.414 7.75c-.32.185-.68.25-1.03.25L15.207 13.414zm0-2.828L3.35 2c.35 0 .71.065 1.03.25l13.414 7.75-2.586 2.586zm1.414 1.414l3.18-1.836a1.76 1.76 0 0 1 0 3.05l-3.18 1.836V12z" />
                </svg>
                <span>Download Customer App</span>
              </div>
              <span className="text-sm font-bold">→</span>
            </a>
          </div>

          {/* Card 2: Rider / Driver Partner App */}
          <div className="group bg-white border-2 border-slate-200 hover:border-black hover:shadow-lg transition-all flex flex-col justify-between p-6 sm:p-8">
            <div>
              {/* Badge & ID */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="text-[10px] font-mono uppercase font-bold tracking-[0.16em] px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200">
                  DRIVER PARTNER
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  com.trippy.rider
                </span>
              </div>

              {/* Title & Icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-black transition-colors">
                  <svg className="w-6 h-6 fill-slate-800 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    Trippy Rider
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For drivers, bikers & delivery fleet
                  </p>
                </div>
              </div>

              {/* Feature Points */}
              <ul className="space-y-2.5 my-6 pt-6 border-t border-slate-100 text-xs text-slate-700">
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                  <span>Set your own price with transparent bidding</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                  <span>Immediate cashout & low platform commissions</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 bg-black flex-shrink-0" />
                  <span>Integrated turn-by-turn map navigation</span>
                </li>
              </ul>
            </div>

            {/* Sharp Action Button */}
            <a
              href={RIDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full bg-black hover:bg-neutral-800 text-white font-bold py-3.5 px-5 flex items-center justify-between text-xs tracking-wider uppercase transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.986V2.8a2.38 2.38 0 0 1 .22-.986zM15.207 13.414l2.586 2.586-13.414 7.75c-.32.185-.68.25-1.03.25L15.207 13.414zm0-2.828L3.35 2c.35 0 .71.065 1.03.25l13.414 7.75-2.586 2.586zm1.414 1.414l3.18-1.836a1.76 1.76 0 0 1 0 3.05l-3.18 1.836V12z" />
                </svg>
                <span>Download Rider App</span>
              </div>
              <span className="text-sm font-bold">→</span>
            </a>
          </div>

        </div>

        {/* Security / Verification Badge */}
        <div className="mt-8 border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 fill-emerald-600 flex-shrink-0" viewBox="0 0 24 24">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
            <span>
              Official verified releases directly on the Google Play Store.
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
            GOOGLE PLAY PROTECT VERIFIED
          </span>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © {new Date().getFullYear()} Trippy. All rights reserved.
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-600 transition-colors font-medium"
        >
          <span>←</span>
          <span>Return to trippybd.com</span>
        </Link>
      </footer>

    </div>
  );
}
