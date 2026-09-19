'use client';

import React from 'react';
import { BookingPortal } from '@/features/booking/components/BookingPortal';
import { CityDriveBackground } from '@/shared/components/ui/CityDriveBackground';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-4 pb-2 lg:pt-8 lg:pb-0 overflow-hidden">
      {/* Subtle Monochrome Ambient Depth */}
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      <div id="home-booking" className="relative z-10 mb-6 lg:mb-10 scroll-mt-24">
        {/* Full Interactive Booking Portal on Homepage */}
        <BookingPortal isHero={true} />
      </div>

      {/* Animated City Skyline & Cruising Sedan Highway Strip */}
      <div className="w-full relative z-0 mt-2 border-b border-slate-200">
        <CityDriveBackground variant="hero" showCar={true} />
      </div>
    </section>
  );
};

export default HeroSection;
