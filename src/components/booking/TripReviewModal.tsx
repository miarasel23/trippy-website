'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, CheckCircle2, Loader2, X, Sparkles, ThumbsUp, ShieldCheck } from 'lucide-react';
import { customerTripService, getImageUrl } from '@/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/redux/hooks';

export interface TripReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripUuid: string;
  driverUuid: string;
  driverName?: string;
  driverPhoto?: string;
  carType?: string;
  carPlate?: string;
  serviceName?: string;
  totalFare?: number | string;
  pickupAddress?: string;
  dropoffAddress?: string;
  startTime?: string;
  paymentMethod?: string;
  onReviewSubmitted?: () => void;
}

export const TripReviewModal: React.FC<TripReviewModalProps> = ({
  isOpen,
  onClose,
  tripUuid,
  driverUuid,
  driverName = 'Md Rasel Mia',
  driverPhoto,
  carType = 'Hiace',
  carPlate,
  serviceName = 'Ride share',
  totalFare = 1597,
  pickupAddress = 'Senpara Parbata, Mirpur 10, Dhaka',
  dropoffAddress = 'Gazipur, Bangladesh',
  startTime,
  paymentMethod = 'CASH',
  onReviewSubmitted,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { token, user } = useAppSelector((state) => state.auth);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(['Great music']));
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const complimentChips = [
    { en: 'Clean car', bn: 'পরিচ্ছন্ন গাড়ি' },
    { en: 'Great music', bn: 'চমৎকার গান' },
    { en: 'Professional driver', bn: 'পেশাদার চালক' },
    { en: 'Polite & friendly', bn: 'বিনয়ী আচরণ' },
    { en: 'Safe driving', bn: 'নিরাপদ ড্রাইভিং' },
    { en: 'On time', bn: 'সঠিক সময়ে আগমন' },
  ];

  const toggleTag = (tagText: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tagText)) {
        next.delete(tagText);
      } else {
        next.add(tagText);
      }
      return next;
    });
  };

  const formattedDate = (() => {
    if (!startTime) {
      const now = new Date();
      return now.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
    try {
      const d = new Date(startTime);
      return d.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '12 Sep, 2026';
    }
  })();

  const formattedTime = (() => {
    if (!startTime) {
      return '12:55 PM';
    }
    try {
      const d = new Date(startTime);
      return d.toLocaleTimeString(isBn ? 'bn-BD' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '12:55 PM';
    }
  })();

  const handleSubmitReview = async () => {
    if (!tripUuid || !driverUuid) {
      setErrorMessage(isBn ? 'ট্রিপ বা চালকের তথ্য পাওয়া যায়নি।' : 'Trip or driver info missing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // Combine compliment tags and optional written text
    const tagsArr = Array.from(selectedTags);
    const combinedComments = [
      tagsArr.join(', '),
      commentText.trim(),
    ].filter(Boolean).join(' - ');

    const res = await customerTripService.giveReview({
      tripUuid,
      driverUuid,
      rating,
      comments: combinedComments || 'Excellent trip experience',
      customerUuid: user?.uuid,
      languageCode: language,
      token: token || undefined,
      given_by: 'CUSTOMER',
    });

    setIsSubmitting(false);

    if (res && res.status) {
      setIsSuccess(true);
      setTimeout(() => {
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }, 1600);
    } else {
      setErrorMessage(res?.message || (isBn ? 'রিভিউ জমা দিতে ব্যর্থ হয়েছে।' : 'Failed to submit review.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-[32px] max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto relative overflow-hidden border border-slate-100">
        
        {/* Success celebratory screen */}
        {isSuccess ? (
          <div className="py-12 text-center space-y-3 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 font-heading">
              {isBn ? 'ধন্যবাদ আপনার মতামতের জন্য!' : 'Thank You For Your Feedback!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {isBn
                ? 'আপনার মূল্যবান রেটিং চালকদের সেবার মান উন্নত করতে সাহায্য করবে।'
                : 'Your feedback helps maintain quality and rewards top-rated drivers.'}
            </p>
          </div>
        ) : (
          <>
            {/* Top Bar: Back/Close & Trip Details Header */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Back"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-sm font-black text-slate-900 font-heading">
                {isBn ? 'ট্রিপ বিবরণ' : 'Trip Details'}
              </span>

              <button
                type="button"
                onClick={() => alert(isBn ? 'সহায়তার জন্য কল করুন: ০১৯৯৭৭০৯৯৯০' : 'Help & Support: 01997709990')}
                className="w-8 h-8 rounded-full border border-slate-300 text-slate-600 flex items-center justify-center text-xs font-bold hover:bg-slate-100 transition-colors"
                title="Help"
              >
                ?
              </button>
            </div>

            {/* Trip Completed Heading */}
            <div className="text-center pt-1 pb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
                {isBn ? 'ট্রিপ সম্পন্ন হয়েছে' : 'Trip Completed'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBn ? 'আশা করি আপনার যাত্রাটি ভালো লেগেছে!' : 'Hope you enjoyed the ride!'}
              </p>
            </div>

            {/* Card 1: Final Fare (Matches Image 4) */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1.5 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                {isBn ? 'সর্বমোট ভাড়া' : 'FINAL FARE'}
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                BDT {totalFare}
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-[11px] font-bold">
                  <span>💳 {isBn ? 'ক্যাশে পরিশোধিত' : `Paid via ${paymentMethod}`}</span>
                </span>
              </div>
            </div>

            {/* Card 2: Date & Route (Matches Image 4) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span>📅</span> {formattedDate}
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span>🕒</span> {formattedTime}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Pickup */}
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      {isBn ? 'পিকআপ' : 'Pickup'}
                    </span>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1" title={pickupAddress}>
                      {pickupAddress}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="border-l border-slate-300 ml-1 h-3" />

                {/* Destination */}
                <div className="flex items-start gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-black mt-1 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                      {isBn ? 'গন্তব্য' : 'Destination'}
                    </span>
                    <p className="text-xs font-bold text-slate-800 line-clamp-1" title={dropoffAddress}>
                      {dropoffAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Driver Profile & 5-Star Compliments (Matches Image 4) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs text-center">
              {/* Driver Avatar */}
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 mx-auto relative shadow-sm">
                <Image
                  src={getImageUrl(driverPhoto)}
                  alt={driverName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">{driverName}</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {carType} • {rating ? `${rating}.0` : '5.0'}★
                </p>
              </div>

              {/* 5 Big Stars */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((starIdx) => {
                  const isFilled = (hoverRating !== null ? hoverRating : rating) >= starIdx;
                  return (
                    <button
                      key={starIdx}
                      type="button"
                      onClick={() => setRating(starIdx)}
                      onMouseEnter={() => setHoverRating(starIdx)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 hover:scale-125 transition-transform duration-150 active:scale-95 cursor-pointer focus:outline-hidden"
                      aria-label={`${starIdx} Star`}
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled
                            ? 'fill-black text-black'
                            : 'text-slate-300 stroke-[1.5]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* GIVE A COMPLIMENT Header */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 block mb-2">
                  {isBn ? 'প্রশংসা দিন' : 'GIVE A COMPLIMENT'}
                </span>

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {complimentChips.map((chip, idx) => {
                    const label = isBn ? chip.bn : chip.en;
                    const isSelected = selectedTags.has(chip.en);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleTag(chip.en)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Additional Comments Textarea */}
              <div className="pt-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isBn
                      ? 'অতিরিক্ত মন্তব্য লিখুন (ঐচ্ছিক)...'
                      : 'Add additional comments (optional)...'
                  }
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-black resize-none"
                />
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-slate-800 disabled:opacity-60 text-white font-black text-sm shadow-xl shadow-black/15 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{isBn ? 'জমা দেওয়া হচ্ছে...' : 'Submitting Review...'}</span>
                </>
              ) : (
                <span>{isBn ? 'রিভিউ জমা দিন' : 'Submit Review'}</span>
              )}
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default TripReviewModal;
