'use client';

import React from 'react';
import { HeroBookingWidget } from './HeroBookingWidget';
import { LiveRadarMap } from './LiveRadarMap';
import { Badge } from '../common/Badge';
import { CityDriveBackground } from '../common/CityDriveBackground';
import { useLanguage } from '@/context/LanguageContext';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-6 pb-2 lg:pt-12 lg:pb-0 overflow-hidden">
      {/* Subtle Monochrome Ambient Depth */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8 lg:mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading + Interactive Booking Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            <div className="mb-4">
              <Badge variant="primary" icon="✨">
                {t.hero.badge}
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5 font-heading">
              {t.hero.heading1} <br />
              <span className="text-gradient">{t.hero.heading2}</span> <br />
              {t.hero.heading3}
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
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

      {/* Animated City Skyline & Cruising White Sedan Highway Strip */}
      <div className="w-full relative z-0 mt-4 border-b border-slate-200">
        <CityDriveBackground variant="hero" showCar={true} />
      </div>
    </section>
  );
};
