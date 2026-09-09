'use client';

import React from 'react';
import { HeroBookingWidget } from './HeroBookingWidget';
import { LiveRadarMap } from './LiveRadarMap';
import { Badge } from '../common/Badge';
import { useLanguage } from '@/context/LanguageContext';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-8 pb-16 lg:py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading + Interactive Booking Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <div className="mb-4">
              <Badge variant="primary" icon="✨">
                {t.hero.badge}
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-5 font-heading">
              {t.hero.heading1} <br />
              <span className="text-gradient">{t.hero.heading2}</span> <br />
              {t.hero.heading3}
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              {t.hero.subtitle}
            </p>

            {/* Interactive Booking Widget */}
            <HeroBookingWidget />

          </div>

          {/* Right Column: Live GPS Interactive Radar Simulation */}
          <div className="lg:col-span-6 h-full min-h-[500px]">
            <LiveRadarMap />
          </div>

        </div>

      </div>
    </section>
  );
};
