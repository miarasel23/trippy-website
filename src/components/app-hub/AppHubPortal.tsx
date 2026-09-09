'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '../common/Badge';
import { QrCodeBox } from '../common/QrCodeBox';
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
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {/* Google Play */}
            <button
              type="button"
              onClick={() => alert('Downloading Tripyy Customer App for Android (v2.4.0 APK)...')}
              className="bg-black text-white hover:bg-slate-900 border border-black rounded-2xl p-3 px-6 flex items-center gap-3.5 transition-all hover:-translate-y-0.5 shadow-md group"
            >
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.986V2.8a2.38 2.38 0 0 1 .22-.986zM15.207 13.414l2.586 2.586-13.414 7.75c-.32.185-.68.25-1.03.25L15.207 13.414zm0-2.828L3.35 2c.35 0 .71.065 1.03.25l13.414 7.75-2.586 2.586zm1.414 1.414l3.18-1.836a1.76 1.76 0 0 1 0 3.05l-3.18 1.836V12z" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
                  {t.appHub.getItOn}
                </span>
                <strong className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {t.appHub.googlePlay}
                </strong>
              </div>
            </button>

            {/* Apple App Store */}
            <button
              type="button"
              onClick={() => alert('Opening Tripyy on Apple App Store...')}
              className="bg-black text-white hover:bg-slate-900 border border-black rounded-2xl p-3 px-6 flex items-center gap-3.5 transition-all hover:-translate-y-0.5 shadow-md group"
            >
              <svg className="w-7 h-7 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.13.67-2.77 1.43-.57.66-.99 1.75-.86 2.8 1.1.09 2.06-.53 2.69-1.3" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
                  {t.appHub.downloadOn}
                </span>
                <strong className="text-sm font-bold text-white group-hover:text-white transition-colors">
                  {t.appHub.appStore}
                </strong>
              </div>
            </button>

            {/* Direct APK */}
            <button
              type="button"
              onClick={() => alert('Downloading verified direct APK build...')}
              className="bg-black text-white hover:bg-slate-900 border border-black rounded-2xl p-3 px-6 flex items-center gap-3.5 transition-all hover:-translate-y-0.5 shadow-md group"
            >
              <svg className="w-7 h-7 fill-emerald-400" viewBox="0 0 24 24">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <div className="text-left">
                <span className="text-[10px] text-slate-300 block uppercase font-bold tracking-wider">
                  {t.appHub.directAndroid}
                </span>
                <strong className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {t.appHub.downloadApk}
                </strong>
              </div>
            </button>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <QrCodeBox
              title={t.appHub.qrTitle}
              subtitle={t.appHub.qrSubtitle}
              category={t.appHub.qrCategory}
            />
          </div>
        </div>

        {/* 3 Core In-App Screenshots Trio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Card 1: In-App Chat */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between shadow-xl hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                {t.appHub.featureChatTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t.appHub.featureChatDesc}
              </p>
            </div>

            <div className="bg-slate-100 border-4 border-slate-200 rounded-2xl overflow-hidden shadow-md relative h-80">
              <Image
                src="/chat_page.png"
                alt="In-App Driver Chat Screenshot"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Card 2: Receipts & Reviews */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between shadow-xl hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                {t.appHub.featureReceiptTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t.appHub.featureReceiptDesc}
              </p>
            </div>

            <div className="bg-slate-100 border-4 border-slate-200 rounded-2xl overflow-hidden shadow-md relative h-80">
              <Image
                src="/trip_completed_and_review_page.png"
                alt="Trip Completed & Reviews Screenshot"
                fill
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Card 3: Trip History */}
          <div className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col justify-between shadow-xl hover:border-slate-300 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-5">
                <Clock className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading mb-2">
                {t.appHub.featureHistoryTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {t.appHub.featureHistoryDesc}
              </p>
            </div>

            <div className="bg-slate-100 border-4 border-slate-200 rounded-2xl overflow-hidden shadow-md relative h-80">
              <Image
                src="/trip_history_page.png"
                alt="Trip History Screenshot"
                fill
                className="object-cover object-top"
              />
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
            onClick={() => alert('Tripyy Architecture View: Foreground Location Service compliant with Android 14+ policies and WebSocket telemetry sync.')}
            className="btn btn-secondary py-3 px-6 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-2 bg-black text-white hover:bg-slate-900 border border-black"
          >
            {t.appHub.viewDocBtn} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
