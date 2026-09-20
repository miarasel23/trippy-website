'use client';

import React from 'react';
import { Badge } from '@/shared/components/ui/Badge';
import { QrCodeBox } from '@/shared/components/ui/QrCodeBox';
import { useLanguage } from '@/context/LanguageContext';

export const AppDownloadBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Container - Zero border radius, professional sharp design */}
        <div className="relative overflow-hidden border border-slate-200 bg-white p-8 sm:p-12 lg:p-16 shadow-sm">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <Badge variant="primary" className="rounded-none mb-4">
                {t.appBanner.badge}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-heading mb-4 leading-tight">
                {t.appBanner.title}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                {t.appBanner.desc}
              </p>
            </div>

            {/* Right Download Block - Google Play, App Store & QR Code with EXACT same left-right alignment */}
            <div className="lg:col-span-5 flex justify-start lg:justify-end">
              <div className="w-full max-w-[340px] flex flex-col gap-3">
                
                {/* Google Play Button */}
                <a
                  href="https://play.google.com/store/apps/details?id=com.trippy.user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black text-white hover:bg-neutral-900 border border-black p-3 px-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm group min-h-[58px]"
                >
                  <svg className="w-6 h-6 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.986V2.8a2.38 2.38 0 0 1 .22-.986zM15.207 13.414l2.586 2.586-13.414 7.75c-.32.185-.68.25-1.03.25L15.207 13.414zm0-2.828L3.35 2c.35 0 .71.065 1.03.25l13.414 7.75-2.586 2.586zm1.414 1.414l3.18-1.836a1.76 1.76 0 0 1 0 3.05l-3.18 1.836V12z" />
                  </svg>
                  <div className="text-left min-w-0">
                    <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider leading-none mb-0.5">
                      {t.appHub.getItOn}
                    </span>
                    <strong className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-tight block">
                      {t.appHub.googlePlay}
                    </strong>
                  </div>
                </a>

                {/* App Store Button */}
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-black text-white hover:bg-neutral-900 border border-black p-3 px-4 flex items-center gap-3 transition-all hover:-translate-y-0.5 shadow-sm group min-h-[58px]"
                >
                  <svg className="w-6 h-6 fill-white flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.13.67-2.77 1.43-.57.66-.99 1.75-.86 2.8 1.1.09 2.06-.53 2.69-1.3" />
                  </svg>
                  <div className="text-left min-w-0">
                    <span className="text-[9px] text-neutral-400 block uppercase font-bold tracking-wider leading-none mb-0.5">
                      {t.appHub.downloadOn}
                    </span>
                    <strong className="text-sm font-bold text-white group-hover:text-white transition-colors leading-tight block">
                      {t.appHub.appStore}
                    </strong>
                  </div>
                </a>

                {/* QR Code Box - exactly same width and alignment */}
                <QrCodeBox
                  url="https://trippybd.com/get-app"
                  link="/get-app"
                  category={t.appHub.qrCategory}
                  title={t.appHub.qrTitle}
                  subtitle={t.appHub.qrSubtitle}
                  className="w-full bg-slate-50 border-slate-300"
                />

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
