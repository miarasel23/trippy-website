'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, CheckCircle2, Car, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { customerTripService, getImageUrl } from '@/services/customerTripService';
import { ServiceCategory, CarInfo } from '@/types/customerApi';

interface FleetCatalogProps {
  showFilterBar?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

const SERVICE_META: Record<
  string,
  { bn: string; en: string; tagBn: string; tagEn: string; descBn: string; descEn: string }
> = {
  RIDE_SHARE: {
    bn: 'রাইড শেয়ার',
    en: 'Ride Share',
    tagBn: 'দৈনিক যাতায়াত',
    tagEn: 'Daily Commute',
    descBn: 'শহরের মধ্যে দ্রুত ও সাশ্রয়ী দৈনিক যাতায়াত',
    descEn: 'Quick & affordable daily city commute',
  },
  INTER_CITY_RENTER: {
    bn: 'ইন্টারসিটি রেন্টাল',
    en: 'Intercity Rental',
    tagBn: 'দূরপাল্লার ভ্রমণ',
    tagEn: 'Long Distance',
    descBn: 'বাংলাদেশের যেকোনো জেলায় নিরাপদ ও আরামদায়ক ভ্রমণ',
    descEn: 'Safe & comfortable travel to any district across Bangladesh',
  },
  RETURN: {
    bn: 'রিটার্ন ট্রিপ',
    en: 'Return Trip',
    tagBn: 'আসা-যাওয়া সাশ্রয়ী',
    tagEn: 'Round Trip Savings',
    descBn: 'একই চালকের সাথে আসা-যাওয়া ও নিশ্চিত রিটার্ন ডিসকাউন্ট',
    descEn: 'Same verified driver for return trips with round-trip savings',
  },
  HOURLY: {
    bn: 'ঘন্টায় রেন্টাল',
    en: 'Hourly Rental',
    tagBn: 'প্যাকেজ রেন্টাল',
    tagEn: 'Flexible Hours',
    descBn: 'ব্যক্তিগত কাজ ও মিটিংয়ের জন্য প্রয়োজন অনুযায়ী প্রতি ঘন্টায় রেন্টাল',
    descEn: 'Hourly car rental tailored for shopping, business & day tours',
  },
  AIRPORT_RENTER: {
    bn: 'এয়ারপোর্ট ট্রান্সফার',
    en: 'Airport Transfer',
    tagBn: 'সময়মত পৌঁছানো',
    tagEn: 'On-Time Guaranteed',
    descBn: 'লাগেজসহ সঠিক সময়ে বিমানবন্দরে যাওয়া ও আসা',
    descEn: 'Stress-free airport pickups & drop-offs with luggage assistance',
  },
  WEDDING_CAR: {
    bn: 'ওয়েডিং কার',
    en: 'Wedding Fleet',
    tagBn: 'বিশেষ ইভেন্ট',
    tagEn: 'Special Events',
    descBn: 'বিয়ে ও বিশেষ পারিবারিক উৎসবের জন্য প্রিমিয়াম গাড়ি',
    descEn: 'Decorated premium vehicles for weddings & celebrations',
  },
  PACKAGE_DELIVERY: {
    bn: 'পার্সেল ডেলিভারি',
    en: 'Package Delivery',
    tagBn: 'এক্সপ্রেস ডেলিভারি',
    tagEn: 'Express Courier',
    descBn: 'শহরের মধ্যে দ্রুত পার্সেল ও ডকুমেন্ট পরিবহন',
    descEn: 'Fast & secure document and parcel courier service',
  },
};

const CAR_META: Record<
  string,
  {
    bn: string;
    en: string;
    tagBn: string;
    tagEn: string;
    descBn: string;
    descEn: string;
    featuresBn: string[];
    featuresEn: string[];
  }
> = {
  SEDAN_ECONOMY: {
    bn: 'সেডান ইকোনমি',
    en: 'Sedan Economy',
    tagBn: 'সাশ্রয়ী সিটি রাইড',
    tagEn: 'Budget City Ride',
    descBn: 'সাশ্রয়ী মূল্যে আরামদায়ক এসি যাত্রা, ছোট পরিবার বা দৈনিক যাতায়াতের জন্য সেরা।',
    descEn: 'Affordable & comfortable AC travel, best for small families and daily commute.',
    featuresBn: ['৪ জনের আসন', 'এসি কার', 'যাচাইকৃত চালক'],
    featuresEn: ['4 Seats', 'Full AC', 'Verified Driver'],
  },
  SEDAN: {
    bn: 'সেডান স্ট্যান্ডার্ড',
    en: 'Sedan Standard',
    tagBn: 'আরামদায়ক রাইড',
    tagEn: 'Popular Choice',
    descBn: 'আরামদায়ক আধুনিক সেডান (Axio, Allion), দৈনিক যাতায়াত ও দূরপাল্লার জন্য সেরা।',
    descEn: 'Comfortable modern sedan (Axio, Allion), ideal for city & intercity trips.',
    featuresBn: ['৪ জনের আসন', 'লাগেজ স্পেস', 'এসি কার'],
    featuresEn: ['4 Seats', 'Luggage Space', 'Full AC'],
  },
  SEDAN_PREMIUM: {
    bn: 'সেডান প্রিমিয়াম',
    en: 'Sedan Premium',
    tagBn: 'বিলাসবহুল ভ্রমণ',
    tagEn: 'Executive Travel',
    descBn: 'অভিজাত ও প্রিমিয়াম এক্সিকিউটিভ কার, বিশেষ মিটিং ও ভিআইপি ভ্রমণের জন্য।',
    descEn: 'Luxury executive car with premium comfort for VIP & corporate travels.',
    featuresBn: ['৪ জনের আসন', 'লাক্সারি কেবিন', 'টপ রেটেড চালক'],
    featuresEn: ['4 Seats', 'Luxury Cabin', 'Top-Rated Driver'],
  },
  NOAH: {
    bn: 'টয়োটা নোয়া (৭ সিটার)',
    en: 'Toyota Noah (7-Seater)',
    tagBn: 'পরিবার ও ট্যুর',
    tagEn: 'Family & Group',
    descBn: 'বড় পরিবার বা ছোট দলের জন্য পারফেক্ট ৭ সিটার ভ্যান, পর্যাপ্ত লাগেজ স্পেসসহ।',
    descEn: 'Spacious 7-seater minivan tailored for family vacations & road trips with luggage.',
    featuresBn: ['৭ জনের আসন', 'ডুয়াল এসি', 'বড় লাগেজ স্পেস'],
    featuresEn: ['7 Seats', 'Dual Zone AC', 'Large Luggage Space'],
  },
  HIACE: {
    bn: 'টয়োটা হায়েস (১১ সিটার)',
    en: 'Toyota Hiace (11-Seater)',
    tagBn: 'বড় গ্রুপ ও ইভেন্ট',
    tagEn: 'Group & Events',
    descBn: '১১ সিটার বড় মাইক্রোবাস, কর্পোরেট টিম, বিয়ে ও পারিবারিক ভ্রমণের জন্য সেরা।',
    descEn: 'High-capacity 11-seater microbus for corporate teams, weddings & group tours.',
    featuresBn: ['১১ জনের আসন', 'সুপার জিএল এসি', 'গ্রুপ ট্রাভেল'],
    featuresEn: ['11 Seats', 'Super GL AC', 'Group Travel'],
  },
  MOTOR_CYCLE: {
    bn: 'মোটরসাইকেল',
    en: 'Motorcycle',
    tagBn: 'দ্রুত একক রাইড',
    tagEn: 'Fast Solo Ride',
    descBn: 'শহরের ট্রাফিক জ্যাম এড়িয়ে দ্রুত ও সাশ্রয়ী যাতায়াতের জন্য নির্ভরযোগ্য বাইক।',
    descEn: 'Beat city traffic quickly and affordably with certified bike riders.',
    featuresBn: ['১ জনের আসন', 'হেলমেট সহ', 'দ্রুত পৌঁছানো'],
    featuresEn: ['1 Seat', 'Safety Helmet', 'Fast Commute'],
  },
  MOTOR_CYCLE_SAVER: {
    bn: 'মোটরসাইকেল সেভার',
    en: 'Motorcycle Saver',
    tagBn: 'সর্বনিম্ন ভাড়া',
    tagEn: 'Super Saver',
    descBn: 'সবচেয়ে কম খরচে দ্রুততম সময়ে একক গন্তব্যে পৌঁছান।',
    descEn: 'Lowest fare solo commute for budget-conscious fast travel.',
    featuresBn: ['১ জনের আসন', 'সর্বনিম্ন খরচ', 'সহজ রাইড'],
    featuresEn: ['1 Seat', 'Lowest Cost', 'Beat Traffic'],
  },
  CHANDER_GARI: {
    bn: 'চান্দের গাড়ি (৪x৪)',
    en: 'Chander Gari (4x4)',
    tagBn: 'পাহাড় ও অ্যাডভেঞ্চার',
    tagEn: 'Mountain 4x4',
    descBn: 'সাজেক, বান্দরবান ও পার্বত্য অঞ্চলের পাহাড়ি দুর্গম রাস্তায় ভ্রমণের জন্য স্পেশাল ৪x৪ জিপ।',
    descEn: 'Specially modified 4WD safari jeep for rugged hill tracks in Sajek and Bandarban.',
    featuresBn: ['১২-১৪ আসন', '৪ হুইল ড্রাইভ', 'পাহাড় ট্রেইল'],
    featuresEn: ['12-14 Seats', '4-Wheel Drive', 'Mountain Trail'],
  },
};

export const FleetCatalog: React.FC<FleetCatalogProps> = ({
  showFilterBar = true,
  limit,
  title,
  subtitle,
}) => {
  const { language, t } = useLanguage();
  const isBn = language === 'bn';

  const [servicesData, setServicesData] = useState<Record<string, ServiceCategory>>({});
  const [selectedService, setSelectedService] = useState<string>('RIDE_SHARE');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const catalogTitle = title || t.fleet.title;
  const catalogSubtitle = subtitle || t.fleet.subtitle;

  useEffect(() => {
    let isMounted = true;
    const loadFleet = async () => {
      setIsLoading(true);
      try {
        const data = await customerTripService.fetchRentalInfo(language);
        if (isMounted && data) {
          setServicesData(data);
          const firstKey = Object.keys(data).find(
            (k) => Array.isArray(data[k]?.cars) && data[k].cars.length > 0
          );
          if (firstKey) {
            setSelectedService(firstKey);
          }
        }
      } catch (err) {
        console.error('Failed to load fleet catalog data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadFleet();
    return () => {
      isMounted = false;
    };
  }, [language]);

  // Extract service categories that contain cars
  const serviceEntries = Object.entries(servicesData).filter(
    ([, srv]) => Array.isArray(srv.cars) && srv.cars.length > 0
  );

  // Determine which category to render based on selected service
  const activeEntries = serviceEntries.filter(([key]) => key === selectedService);
  const displayedEntries = activeEntries.length > 0 ? activeEntries : serviceEntries.slice(0, 1);

  return (
    <section className="py-16 bg-white" id="fleet-showcase">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="badge badge-primary mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {t.fleet.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mb-4">
            {catalogTitle}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            {catalogSubtitle}
          </p>
        </div>

        {/* Service Type Filter Tabs (Specific Services Only - No "All" Tab) */}
        {showFilterBar && (
          <div className="flex justify-center gap-2 flex-wrap mb-12">
            {serviceEntries.map(([key, srv]) => {
              const meta = SERVICE_META[key] || {
                bn: srv.service_name || key.replace(/_/g, ' '),
                en: srv.service_name || key.replace(/_/g, ' '),
              };
              const isSelected = selectedService === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedService(key)}
                  className={`py-2.5 px-5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-black border-black text-white shadow-sm'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-black'
                  }`}
                >
                  <span>{isBn ? meta.bn : meta.en}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {srv.cars.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden animate-pulse flex flex-col"
              >
                <div className="h-44 bg-slate-100" />
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-2/3 h-5 bg-slate-100 rounded-md" />
                    <div className="w-1/3 h-4 bg-slate-100 rounded-md" />
                    <div className="w-full h-10 bg-slate-100 rounded-md" />
                  </div>
                  <div className="w-full h-10 bg-slate-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grouped Car List by Service Type */}
        {!isLoading && (
          <div className="space-y-14 mb-12">
            {displayedEntries.map(([key, service]) => {
              const serviceMeta = SERVICE_META[key] || {
                bn: service.service_name || key.replace(/_/g, ' '),
                en: service.service_name || key.replace(/_/g, ' '),
                tagBn: 'সার্ভিস',
                tagEn: 'Service',
                descBn: '',
                descEn: '',
              };

              const displayedCars: CarInfo[] = limit
                ? service.cars.slice(0, limit)
                : service.cars;

              return (
                <div key={key} className="space-y-6">
                  {/* Service Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                    <div className="flex items-center gap-3.5">
                      {service.avatar && (
                        <div className="w-12 h-12 relative rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 shadow-xs">
                          <Image
                            src={getImageUrl(service.avatar)}
                            alt={isBn ? serviceMeta.bn : serviceMeta.en}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                            {isBn ? serviceMeta.bn : serviceMeta.en}
                          </h3>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                            {isBn
                              ? `${service.cars.length}টি গাড়ি উপলব্ধ`
                              : `${service.cars.length} Vehicles Available`}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          {isBn ? serviceMeta.descBn : serviceMeta.descEn}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/#home-booking"
                      className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1.5 self-start sm:self-auto py-1"
                    >
                      {isBn ? 'এই সার্ভিসে সরাসরি বুক করুন' : 'Book this service now'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Cars Grid for this Service (NO PRICE DISPLAYED) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedCars.map((car) => {
                      const carMeta = CAR_META[car.car_type] || {
                        bn: car.car_type.replace(/_/g, ' '),
                        en: car.car_type.replace(/_/g, ' '),
                        tagBn: 'যাচাইকৃত গাড়ি',
                        tagEn: 'Verified Ride',
                        descBn: `${car.set_capacity} জন যাত্রীর জন্য আরামদায়ক যাতায়াত।`,
                        descEn: `Comfortable travel capacity for ${car.set_capacity} passengers.`,
                        featuresBn: [`${car.set_capacity} জনের আসন`, 'এসি সুবিধা', 'যাচাইকৃত চালক'],
                        featuresEn: [`${car.set_capacity} Seats`, 'AC Available', 'Verified Driver'],
                      };

                      const carTitle = isBn ? carMeta.bn : carMeta.en;
                      const carTag = isBn ? carMeta.tagBn : carMeta.tagEn;
                      const carDesc = isBn ? carMeta.descBn : carMeta.descEn;
                      const features = isBn ? carMeta.featuresBn : carMeta.featuresEn;

                      return (
                        <div
                          key={`${key}-${car.uuid}`}
                          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-lg transition-all duration-300 group"
                        >
                          {/* Vehicle Photo Container */}
                          <div className="h-44 sm:h-48 bg-slate-50/80 relative overflow-hidden flex items-center justify-center p-3 border-b border-slate-100">
                            {/* Service Type Tag */}
                            <span className="absolute top-3 left-3 bg-white/95 border border-slate-200 text-slate-800 text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full shadow-xs z-10">
                              {carTag}
                            </span>

                            {/* Seat Capacity Badge */}
                            <span className="absolute top-3 right-3 bg-slate-900/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs z-10 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {car.set_capacity} {isBn ? 'আসন' : 'Seats'}
                            </span>

                            {/* Vehicle Image */}
                            {car.car_avatar ? (
                              <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
                                <Image
                                  src={getImageUrl(car.car_avatar)}
                                  alt={carTitle}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 640px) 100vw, 320px"
                                />
                              </div>
                            ) : (
                              <Car className="w-12 h-12 text-slate-300" />
                            )}
                          </div>

                          {/* Card Content Body (NO PRICE) */}
                          <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                            <div>
                              {/* Car Name */}
                              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading mb-2 leading-snug">
                                {carTitle}
                              </h4>

                              {/* Feature Tags */}
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {features.map((feat, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[11px] font-semibold text-slate-700 bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 rounded-md flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {feat}
                                  </span>
                                ))}
                              </div>

                              {/* Description */}
                              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                                {carDesc}
                              </p>
                            </div>

                            {/* Footer Action CTA (NO PRICE) */}
                            <div className="pt-3 border-t border-slate-100">
                              <Link
                                href="/#home-booking"
                                className="w-full py-2.5 px-4 text-xs font-bold rounded-xl bg-black text-white hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                              >
                                {isBn ? 'রাইড বুক করুন' : 'Book Ride'}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Explore Fleet Button */}
        <div className="text-center pt-4">
          <Link
            href="/#home-booking"
            className="py-3.5 px-8 rounded-xl font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 bg-black text-white hover:bg-slate-900 shadow-md transition-all"
          >
            {isBn ? 'অনলাইন বুকিং পোর্টালে যান' : 'Go To Booking Portal'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FleetCatalog;
