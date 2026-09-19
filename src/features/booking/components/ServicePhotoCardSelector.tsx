'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ServiceCategory } from '@/features/trips/types/customerApi';
import { getImageUrl } from '@/features/trips/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';
import { Car, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServicePhotoCardSelectorProps {
  services: Record<string, ServiceCategory>;
  selectedService: string;
  onSelectService: (serviceName: string) => void;
  isLoading?: boolean;
}

const SERVICE_LABELS: Record<string, { bn: string; en: string }> = {
  RIDE_SHARE: { bn: 'রাইড শেয়ার', en: 'Ride Share' },
  INTER_CITY_RENTER: { bn: 'ইন্টারসিটি', en: 'Intercity' },
  RETURN: { bn: 'রিটার্ন', en: 'Return' },
  HOURLY: { bn: 'ঘন্টায়', en: 'Hourly' },
  AIRPORT_RENTER: { bn: 'এয়ারপোর্ট', en: 'Airport' },
  WEDDING_CAR: { bn: 'ওয়েডিং কার', en: 'Wedding' },
  PACKAGE_DELIVERY: { bn: 'ডেলিভারি', en: 'Delivery' },
};

export const ServicePhotoCardSelector: React.FC<ServicePhotoCardSelectorProps> = ({
  services,
  selectedService,
  onSelectService,
  isLoading = false,
}) => {
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const serviceEntries = Object.entries(services);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 260;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="aspect-[4/3] w-32 sm:w-40 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            <div className="w-20 h-3.5 bg-slate-100 animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Arrows (Desktop) */}
      <button
        type="button"
        onClick={() => scroll('left')}
        title={language === 'bn' ? 'বামে স্ক্রোল করুন' : 'Scroll left'}
        aria-label="Previous services"
        className="absolute -left-3 top-14 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-0"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        title={language === 'bn' ? 'ডানে স্ক্রোল করুন' : 'Scroll right'}
        aria-label="Next services"
        className="absolute -right-3 top-14 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-opacity opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Horizontal Slider */}
      <div
        ref={scrollRef}
        className="flex items-start gap-3.5 overflow-x-auto no-scrollbar scroll-smooth snap-x py-1 px-1"
      >
        {serviceEntries.map(([key, service]) => {
          const isSelected = selectedService === key;
          const meta = SERVICE_LABELS[key] || {
            bn: key.replace(/_/g, ' '),
            en: key.replace(/_/g, ' '),
          };

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectService(key)}
              className="flex-shrink-0 flex flex-col items-center text-center snap-start group/card cursor-pointer focus:outline-none"
            >
              {/* Photo Container Box: Photo fills full card height and width */}
              <div
                className={`aspect-[4/3] w-32 sm:w-40 rounded-2xl flex items-center justify-center transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'border-2 border-black shadow-lg scale-[1.03] ring-2 ring-black/10'
                    : 'bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {service.avatar ? (
                  <Image
                    src={getImageUrl(service.avatar)}
                    alt={language === 'bn' ? meta.bn : meta.en}
                    fill
                    className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                    sizes="(max-width: 640px) 130px, 160px"
                    priority={key === 'RIDE_SHARE' || key === 'RETURN'}
                  />
                ) : (
                  <Car
                    className={`w-8 h-8 ${
                      isSelected ? 'text-black' : 'text-slate-400'
                    }`}
                  />
                )}

                {/* Selected Check Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-black text-white p-1 rounded-full shadow-md z-10">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Service Label Below Card */}
              <span
                className={`mt-2 text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                  isSelected
                    ? 'text-slate-950 font-extrabold'
                    : 'text-slate-600 group-hover/card:text-slate-900'
                }`}
              >
                {language === 'bn' ? meta.bn : meta.en}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServicePhotoCardSelector;
