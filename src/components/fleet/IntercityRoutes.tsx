'use client';

import React from 'react';
import Link from 'next/link';
import { INTERCITY_ROUTES } from '@/types/fleet';
import { Badge } from '../common/Badge';
import { Clock, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const IntercityRoutes: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="warning" className="mb-3">{t.intercity.badge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mb-4">
            {t.intercity.title}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            {t.intercity.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTERCITY_ROUTES.map((route, idx) => {
            const locRoute = t.intercity.routes[idx];
            const from = locRoute?.from || route.from;
            const to = locRoute?.to || route.to;
            const distance = locRoute?.distance || route.distance;
            const duration = locRoute?.duration || route.duration;

            return (
              <div
                key={route.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {from} ↔ {to}
                    </h3>
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {duration}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900">{t.intercity.distance}:</span> {distance} • N3/N1 Expressways
                  </div>

                  <div className="space-y-2.5 text-xs mb-6">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">{t.fleet.vehicles.sedan.name} (4)</span>
                      <strong className="text-slate-900">{route.prices.sedan}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">{t.fleet.vehicles.noah.name} (7)</span>
                      <strong className="text-slate-900">{route.prices.noah}</strong>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                      <span className="text-slate-600">{t.fleet.vehicles.hiace.name} (11)</span>
                      <strong className="text-slate-900 font-bold">{route.prices.hiace}</strong>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/booking?from=${route.from}&to=${route.to}`}
                  className="btn btn-primary w-full py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 bg-black text-white hover:bg-slate-900"
                >
                  {t.intercity.bookRoute} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
