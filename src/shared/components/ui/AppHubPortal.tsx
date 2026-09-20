'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/shared/components/ui/Badge';
import { QrCodeBox } from '@/shared/components/ui/QrCodeBox';
import { MessageSquare, Star, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const AppHubPortal: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* App Hub Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            {t.appHub.badge}
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading mb-6 leading-tight">
            {t.appHub.heroTitle1} <br />
            <span className="text-gradient">{t.appHub.heroTitle2}</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            {t.appHub.heroSubtitle}
          </p>

          {/* Download Store Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10 max-w-xl mx-auto lg:max-w-none">
            {/* Google Play — Customer App */}
            <a
              href="https://play.google.com/store/apps/details?id=com.trippy.user"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white hover:bg-neutral-900 border border-neutral-900 p-3 px-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm group w-full h-full min-h-[64px]"
            >
              <svg className="w-6 h-6 fill-white flex-shrink-0" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.986V2.8a2.38 2.38 0 0 1 .22-.986zM15.207 13.414l2.586 2.586-13.414 7.75c-.32.185-.68.25-1.03.25L15.207 13.414zm0-2.828L3.35 2c.35 0 .71.065 1.03.25l13.414 7.75-2.586 2.586zm1.414 1.414l3.18-1.836a1.76 1.76 0 0 1 0 3.05l-3.18 1.836V12z" />
              </svg>
              <div className="text-left min-w-0">
                <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider leading-none mb-0.5">
                  {t.appHub.getItOn}
                </span>
                <strong className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight block">
                  {t.appHub.googlePlay}
                </strong>
              </div>
            </a>

            {/* Apple App Store */}
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white hover:bg-neutral-900 border border-neutral-900 p-3 px-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm group w-full h-full min-h-[64px]"
            >
              <svg className="w-6 h-6 fill-white flex-shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.13.67-2.77 1.43-.57.66-.99 1.75-.86 2.8 1.1.09 2.06-.53 2.69-1.3" />
              </svg>
              <div className="text-left min-w-0">
                <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider leading-none mb-0.5">
                  {t.appHub.downloadOn}
                </span>
                <strong className="text-xs sm:text-sm font-bold text-white group-hover:text-white transition-colors leading-tight block">
                  {t.appHub.appStore}
                </strong>
              </div>
            </a>

            {/* Direct APK — spans 2 cols on mobile, 1 col on lg */}
            <a
              href="https://play.google.com/store/apps/details?id=com.trippy.user"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 lg:col-span-1 bg-black text-white hover:bg-neutral-900 border border-neutral-900 p-3 px-4 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm group w-full min-h-[64px]"
            >
              <svg className="w-6 h-6 fill-emerald-400 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <div className="text-left min-w-0">
                <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider leading-none mb-0.5">
                  {t.appHub.directAndroid}
                </span>
                <strong className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight block">
                  {t.appHub.downloadApk}
                </strong>
              </div>
            </a>
          </div>

          {/* QR Codes — Single code, choose after scanning */}
          <div className="flex justify-center">
            <QrCodeBox
              url="https://trippybd.com/get-app"
              link="/get-app"
              title="Install on Phone Instantly"
              subtitle="Scan to choose Customer or Rider app"
              category="POINT CAMERA & SCAN"
            />
          </div>
        </div>

        {/* 3 Core In-App Screenshots Trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-24">
          
          {/* Card 1: In-App Chat */}
          <div className="group bg-white rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100/80">
            <div className="mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-heading mb-3 tracking-tight">
                {t.appHub.featureChatTitle}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.appHub.featureChatDesc}
              </p>
            </div>

            <div className="relative w-full aspect-[9/19] bg-gradient-to-b from-slate-100 to-slate-200/50 rounded-[2rem] p-2 sm:p-3 shadow-inner border-4 border-white">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-black shadow-2xl">
                <Image
                  src="/playstore_screenshots/11_seamless_driver_chat.png"
                  alt="In-App Driver Chat Screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Receipts & Reviews */}
          <div className="group bg-white rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100/80">
            <div className="mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200/50 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 group-hover:from-amber-400 group-hover:to-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-heading mb-3 tracking-tight">
                {t.appHub.featureReceiptTitle}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.appHub.featureReceiptDesc}
              </p>
            </div>

            <div className="relative w-full aspect-[9/19] bg-gradient-to-b from-slate-100 to-slate-200/50 rounded-[2rem] p-2 sm:p-3 shadow-inner border-4 border-white">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-black shadow-2xl">
                <Image
                  src="/playstore_screenshots/12_transparent_fare_and_reviews.png"
                  alt="Trip Completed & Reviews Screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Trip History */}
          <div className="group bg-white rounded-[2.5rem] p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100/80">
            <div className="mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-heading mb-3 tracking-tight">
                {t.appHub.featureHistoryTitle}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t.appHub.featureHistoryDesc}
              </p>
            </div>

            <div className="relative w-full aspect-[9/19] bg-gradient-to-b from-slate-100 to-slate-200/50 rounded-[2rem] p-2 sm:p-3 shadow-inner border-4 border-white">
              <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-black shadow-2xl">
                <Image
                  src="/playstore_screenshots/13_complete_trip_history.png"
                  alt="Trip History Screenshot"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Technical Architecture Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="badge badge-primary mb-3">{t.appHub.archBadge}</span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mb-2">
              {t.appHub.archTitle}
            </h3>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              {t.appHub.archDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => alert('Trippy Architecture View: Foreground Location Service compliant with Android 14+ policies and WebSocket telemetry sync.')}
            className="btn btn-secondary py-3 px-6 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-2 bg-black text-white hover:bg-slate-900 border border-black"
          >
            {t.appHub.viewDocBtn} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
