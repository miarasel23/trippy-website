'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  MapPin,
  CalendarClock,
  Radio,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Users,
  Compass,
  CreditCard,
  PhoneCall,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/common/Badge';

export const RideBookingGuide: React.FC = () => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const steps = [
    {
      num: '01',
      icon: Car,
      titleBn: 'সার্ভিস ও গাড়ি নির্বাচন করুন',
      titleEn: 'Choose Your Service & Vehicle',
      descBn:
        'আপনার ভ্রমণের ধরন অনুযায়ী সার্ভিস বেছে নিন—রাইড শেয়ার, দূরপাল্লার ইন্টারসিটি, রিটার্ন ট্রিপ, ঘন্টায় রেন্টাল বা এয়ারপোর্ট ট্রান্সফার। যাত্রীর সংখ্যা অনুযায়ী সেডান (৪ সিট), নোয়া (৭ সিট), বা বড় দলের জন্য হায়েস (১১ সিট) সিলেক্ট করুন।',
      descEn:
        'Select the right service category for your trip—Ride Share, Intercity, Return Trip, Hourly Rental, or Airport Transfer. Choose from 4-seater Sedans, 7-seater Noah, or 11-seater Hiace microbuses to match your group size.',
      tipBn: 'টিপস: একই চালকের সাথে নিশ্চিত ডিসকাউন্টের জন্য ‘রিটার্ন ট্রিপ’ বেছে নিন।',
      tipEn: 'Pro Tip: Select ‘Return Trip’ to enjoy guaranteed discounts with the same verified driver.',
      tagBn: 'ধাপ ১: গাড়ি ও সার্ভিস',
      tagEn: 'Step 1: Service & Car',
    },
    {
      num: '02',
      icon: MapPin,
      titleBn: 'পিকআপ ও ড্রপঅফ লোকেশন ইনপুট দিন',
      titleEn: 'Set Pickup & Destination on Google Map',
      descBn:
        'গুগল ম্যাপে আপনার পিকআপ পয়েন্ট ও গন্তব্য লিখুন। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে সঠিক সড়ক দূরত্ব (আনুমানিক কিমি) এবং লাইভ রুট ম্যাপ প্রদর্শন করবে। প্রয়োজন হলে পথে একাধিক পিকআপ বা ড্রপঅফ স্টপও যোগ করতে পারবেন।',
      descEn:
        'Type your pickup location and destination using Google Places autocomplete. Trippy calculates the exact road distance (Est. km) and displays the live route map. You can also add multiple passenger pickup stops along the way.',
      tipBn: 'টিপস: একাধিক বন্ধুকে একসাথে তুলতে ‘পিকআপ যোগ করুন’ বাটনে ক্লিক করুন।',
      tipEn: 'Pro Tip: Click ‘Add Pickup Stop’ to pick up friends or family along your route.',
      tagBn: 'ধাপ ২: রুট ও লোকেশন',
      tagEn: 'Step 2: Route & Stops',
    },
    {
      num: '03',
      icon: CalendarClock,
      titleBn: 'সময় নির্ধারণ করুন ও নিজের ভাড়া প্রস্তাব করুন',
      titleEn: 'Set Schedule & Propose Your Own Fare',
      descBn:
        'এখনই রওনা হবেন নাকি আগামীকালের জন্য শিডিউল করবেন? তারিখ ও সময় নির্ধারণ করুন। ট্রিপিতে কোনো হিডেন চার্জ বা সার্জনিরপেক্ষ ন্যায্য ভাড়ার রেঞ্জ দেখে নিজের পছন্দমত ভাড়া প্রস্তাব করুন।',
      descEn:
        'Need to leave right now or schedule for tomorrow? Select your exact date and time. Trippy gives you total price transparency—view the fair estimated range and propose your own fare directly to drivers.',
      tipBn: 'টিপস: ন্যায্য ভাড়া প্রস্তাব করলে চালকরা দ্রুততম সময়ে বিড গ্রহণ করেন।',
      tipEn: 'Pro Tip: Fair proposed fares get accepted by top-rated drivers within seconds.',
      tagBn: 'ধাপ ৩: শিডিউল ও প্রস্তাবিত ভাড়া',
      tagEn: 'Step 3: Time & Fare',
    },
    {
      num: '04',
      icon: Radio,
      titleBn: 'চালকদের লাইভ বিড দেখুন ও সেরাটি গ্রহণ করুন',
      titleEn: 'Receive Real-Time Driver Bids & Accept',
      descBn:
        'আপনার ট্রিপ প্রস্তাবটি নিকটবর্তী ভেরিফাইড চালকদের কাছে সরাসরি চলে যাবে। চালকদের রেটিং, গাড়ির মডেল এবং তাদের প্রস্তাবিত ভাড়া দেখে আপনার সবচেয়ে পছন্দের চালককে নির্বাচন করুন।',
      descEn:
        'Your trip offer broadcasts instantly to verified nearby drivers. Compare multiple driver bids based on their driver ratings, vehicle model, and agreed fare, then accept your preferred driver with one tap.',
      tipBn: 'টিপস: চালকের পূর্ববর্তী রেটিং ও গাড়ির ছবি দেখে সিদ্ধান্ত নিন।',
      tipEn: 'Pro Tip: Check driver reviews, completed trips, and car model before accepting.',
      tagBn: 'ধাপ ৪: চালক নির্বাচন',
      tagEn: 'Step 4: Driver Selection',
    },
    {
      num: '05',
      icon: CheckCircle2,
      titleBn: 'লাইভ ট্র্যাক করুন ও নিরাপদে পৌঁছে পেমেন্ট দিন',
      titleEn: 'Live GPS Tracking & Safe Arrival Payment',
      descBn:
        'চালক আপনার দরজায় পৌঁছানো পর্যন্ত ম্যাপে লাইভ ট্র্যাক করুন। ট্রিপ লিংক প্রিয়জনদের সাথে শেয়ার করতে পারেন। আরামদায়ক এসি ভ্রমণ শেষে নিরাপদে পৌঁছে চালককে সরাসরি ক্যাশে পেমেন্ট করুন।',
      descEn:
        'Watch your driver arrive in real-time on the live map. Share your trip tracking link with loved ones for safety. Enjoy your comfortable AC ride and pay the driver directly via cash upon safe arrival.',
      tipBn: 'টিপস: কোনো অনলাইন অগ্রিম ফি নেই, যাত্রা শেষে সরাসরি চালককে ভাড়া দিন।',
      tipEn: 'Pro Tip: No advance fees needed—pay the agreed fare in cash after arriving safely.',
      tagBn: 'ধাপ ৫: নিরাপদ ভ্রমণ',
      tagEn: 'Step 5: Ride & Pay',
    },
  ];

  const highlights = [
    {
      icon: Zap,
      titleBn: '১০০% ডিরেক্ট বিডিং',
      titleEn: 'Direct Driver Bidding',
      descBn: 'কোনো থার্ড-পার্টি দালাল নেই, নিজের ভাড়ায় চালকের সাথে সরাসরি সমঝোতা।',
      descEn: 'No middlemen commission or hidden markups. Negotiate directly with drivers.',
    },
    {
      icon: ShieldCheck,
      titleBn: '১০০% যাচাইকৃত চালক ও গাড়ি',
      titleEn: 'Verified Fleet & Drivers',
      descBn: 'বিআরটিএ রেজিস্ট্রেশন, ড্রাইভিং লাইসেন্স ও ব্যাকগ্রাউন্ড যাচাইকৃত চালক।',
      descEn: 'BRTA registered vehicles and vetted professional drivers for total safety.',
    },
    {
      icon: Compass,
      titleBn: 'সারা বাংলাদেশে লাইভ গুগল রুট',
      titleEn: 'Nationwide Route Map',
      descBn: 'ঢাকা, চট্টগ্রাম, সিলেট, কক্সবাজারসহ দেশের যেকোনো প্রান্তে ভ্রমণ।',
      descEn: 'Travel anywhere from city streets to remote mountain trails with live GPS.',
    },
    {
      icon: CreditCard,
      titleBn: 'যাত্রা শেষে ক্যাশ পেমেন্ট',
      titleEn: 'Pay Cash Upon Safe Arrival',
      descBn: 'অগ্রিম কোনো ফি ছাড়াই বুকিং নিশ্চিত করুন এবং যাত্রা শেষে পেমেন্ট দিন।',
      descEn: 'Book with zero advance fees and pay directly in cash after safe arrival.',
    },
  ];

  return (
    <div className="py-10 lg:py-16 bg-slate-50/60 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Hero Showcase Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3.5">
            <Badge variant="primary">
              <Sparkles className="w-3.5 h-3.5" />
              {isBn ? 'ধাপ অনুযায়ী বুকিং নির্দেশিকা' : 'Step-by-Step Booking Guide'}
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-heading mb-5 leading-tight">
            {isBn
              ? 'ট্রিপিতে যেভাবে খুব সহজেই গাড়ি বুক করবেন'
              : 'How to Book a Car with Trippy Step-by-Step'}
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-2xl mx-auto">
            {isBn
              ? 'কোনো হিডেন চার্জ বা অতিরিক্ত কমিশন ছাড়া নিজের প্রস্তাবিত ভাড়ায় বাংলাদেশের যেকোনো প্রান্তে গাড়ি বুক করুন মাত্র ৫টি সহজ ধাপে।'
              : 'Experience transparent, direct driver-bidded ride booking across Bangladesh in 5 simple steps. Set your own fare with zero hidden fees.'}
          </p>

          {/* Primary Action to Book on Homepage */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/#home-booking"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-black text-white hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isBn ? 'এখনই গাড়ি বুক করুন' : 'Book a Ride Now'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/fleet"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4 text-slate-600" />
              {isBn ? 'গাড়ির বহর দেখুন' : 'Explore Vehicles'}
            </Link>
          </div>
        </div>

        {/* 5 Visual Step Cards */}
        <div className="space-y-6 mb-20">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 hover:border-slate-300 hover:shadow-md transition-all duration-300 relative group overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  
                  {/* Step Number + Icon Badge */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div className="md:hidden">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                        {isBn ? step.tagBn : step.tagEn}
                      </span>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="hidden md:inline-block text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {isBn ? step.tagBn : step.tagEn}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">
                        STEP {step.num}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading mb-2">
                      {isBn ? step.titleBn : step.titleEn}
                    </h2>

                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3">
                      {isBn ? step.descBn : step.descEn}
                    </p>

                    {/* Pro Tip Box */}
                    <div className="inline-flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 rounded-lg px-3 py-1.5 text-xs text-amber-900 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>{isBn ? step.tipBn : step.tipEn}</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Why Trippy Highlights */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mb-3">
              {isBn ? 'কেন ট্রিপিতে রাইড বুক করবেন?' : 'Why Book with Trippy?'}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              {isBn
                ? 'অনলাইন ড্রাইভার বিডিংয়ের মাধ্যমে সাশ্রয়ী, নিরাপদ ও স্বাচ্ছন্দ্যময় ভ্রমণ।'
                : 'Direct bidding delivers transparency, speed, and safety on every journey.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-slate-900" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading mb-1.5">
                      {isBn ? item.titleBn : item.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isBn ? item.descBn : item.descEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Booking CTA Banner (Directs to Homepage Booking) */}
        <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto relative z-10">
            <span className="badge badge-warning mb-3.5 inline-flex items-center gap-1 text-xs">
              <Zap className="w-3 h-3" />
              {isBn ? 'চালকরা প্রস্তত' : 'Drivers Ready To Bid'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading mb-4 text-white tracking-tight">
              {isBn
                ? 'এখনই আপনার পছন্দের গাড়ি বুক করতে চান?'
                : 'Ready to Book Your Ride with Your Own Fare?'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-8 max-w-xl mx-auto">
              {isBn
                ? 'আমাদের হোমপেজ বুকিং পোর্টালে গিয়ে রুট নির্বাচন করুন এবং চালকদের সাথে সরাসরি যুক্ত হোন।'
                : 'Head straight to our homepage booking portal, pick your Google route, and connect directly with verified drivers.'}
            </p>
            <Link
              href="/#home-booking"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-lg hover:scale-[1.02]"
            >
              {isBn ? 'হোমপেজ বুকিং অপশনে যান' : 'Go to Homepage Booking'}
              <ArrowRight className="w-4 h-4 text-black" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RideBookingGuide;
