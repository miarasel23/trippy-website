'use client';

import React from 'react';
import { Badge } from '../common/Badge';
import { useLanguage } from '@/context/LanguageContext';

export const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="amber" className="mb-3">{t.howItWorks.badge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
            {t.howItWorks.title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t.howItWorks.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.howItWorks.steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-brand-card/75 border border-white/10 rounded-2xl p-7 relative hover:border-white/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark font-extrabold text-lg flex items-center justify-center mb-5 font-heading shadow-md">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2.5">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
