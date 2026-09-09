'use client';

import React from 'react';
import { Badge } from '../common/Badge';
import { useLanguage } from '@/context/LanguageContext';

export const FeaturesGrid: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="primary" className="mb-3">{t.features.badge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mb-4">
            {t.features.title}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-7 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl mb-5 shadow-xs">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-2.5">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
