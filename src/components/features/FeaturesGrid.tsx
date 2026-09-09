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
          <Badge variant="cyan" className="mb-3">{t.features.badge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
            {t.features.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t.features.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.features.items.map((item, idx) => (
            <div
              key={idx}
              className="bg-brand-card/75 border border-white/10 rounded-2xl p-7 hover:border-brand-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-card"
            >
              <div className="w-13 h-13 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-2xl mb-5">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2.5">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
