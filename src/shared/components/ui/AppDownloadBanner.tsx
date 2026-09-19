'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/shared/components/ui/Badge';
import { QrCodeBox } from '@/shared/components/ui/QrCodeBox';
import { useLanguage } from '@/context/LanguageContext';

export const AppDownloadBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 lg:p-16 shadow-lg">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-8">
              <Badge variant="primary" className="mb-4">
                {t.appBanner.badge}
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-heading mb-4 leading-tight">
                {t.appBanner.title}
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl">
                {t.appBanner.desc}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/app"
                  className="btn btn-primary py-3 px-6 rounded-xl font-bold text-sm flex items-center gap-2.5 bg-black text-white hover:bg-slate-900"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186a2.38 2.38 0 0 1-.22-.986V2.8a2.38 2.38 0 0 1 .22-.986zM15.207 13.414l2.586 2.586-13.414 7.75c-.32.185-.68.25-1.03.25L15.207 13.414zm0-2.828L3.35 2c.35 0 .71.065 1.03.25l13.414 7.75-2.586 2.586zm1.414 1.414l3.18-1.836a1.76 1.76 0 0 1 0 3.05l-3.18 1.836V12z" />
                  </svg>
                  {t.appHub.googlePlay}
                </Link>

                <Link
                  href="/app"
                  className="btn btn-secondary py-3 px-6 rounded-xl font-semibold text-sm flex items-center gap-2.5 bg-black text-white hover:bg-slate-900"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.85.94-2.93-1 .04-2.13.67-2.77 1.43-.57.66-.99 1.75-.86 2.8 1.1.09 2.06-.53 2.69-1.3" />
                  </svg>
                  {t.appHub.appStore}
                </Link>
              </div>
            </div>

            {/* Right QR Box */}
            <div className="lg:col-span-4 flex lg:justify-end">
              <QrCodeBox
                category={t.appHub.qrCategory}
                title={t.appHub.qrTitle}
                subtitle={t.appHub.qrSubtitle}
                className="bg-slate-50 border-slate-200"
              />
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
