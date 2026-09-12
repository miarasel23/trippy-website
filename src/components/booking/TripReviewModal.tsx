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
  carPlate?: string;
  serviceName?: string;
  totalFare?: number | string;
  onReviewSubmitted?: () => void;
}

export const TripReviewModal: React.FC<TripReviewModalProps> = ({
  isOpen,
  onClose,
  tripUuid,
  driverUuid,
  driverName = 'Driver',
  driverPhoto,
  carPlate,
  serviceName,
  totalFare,
  onReviewSubmitted,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { token, user } = useAppSelector((state) => state.auth);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const complimentChips = [
    { en: 'Great music', bn: 'চমৎকার গান', icon: '🎵' },
    { en: 'Professional driver', bn: 'পেশাদার চালক', icon: '👔' },
    { en: 'Polite & friendly', bn: 'বিনয়ী আচরণ', icon: '🤝' },
    { en: 'Clean & fresh car', bn: 'পরিচ্ছন্ন গাড়ি', icon: '🚗' },
    { en: 'On time', bn: 'সঠিক সময়ে আগমন', icon: '⏱️' },
    { en: 'Safe driving', bn: 'নিরাপদ ড্রাইভিং', icon: '🛡️' },
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

  const getRatingLabel = (r: number) => {
    switch (r) {
      case 5:
        return isBn ? 'অসাধারণ অভিজ্ঞতা!' : 'Excellent Ride!';
      case 4:
        return isBn ? 'খুব ভালো' : 'Very Good';
      case 3:
        return isBn ? 'মোটামুটি' : 'Average';
      case 2:
        return isBn ? 'সন্তোষজনক নয়' : 'Below Average';
      case 1:
        return isBn ? 'খুবই অসন্তোষজনক' : 'Poor Experience';
      default:
        return '';
    }
  };

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
      comments: combinedComments || 'Good ride',
      customerUuid: user?.uuid,
      languageCode: language,
      token: token || undefined,
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden border border-slate-100">
        
        {/* Success celebratory screen */}
        {isSuccess ? (
          <div className="py-10 text-center space-y-3 animate-scaleUp">
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
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Trip Completed Badge & Title */}
            <div className="text-center space-y-1 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-1 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? 'ট্রিপ সফলভাবে সম্পন্ন হয়েছে' : 'Trip Completed Successfully'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-heading">
                {isBn ? 'আপনার রাইড কেমন ছিল?' : 'How Was Your Ride?'}
              </h2>
              <p className="text-xs text-slate-500">
                {isBn ? 'চালকের সাথে আপনার অভিজ্ঞতা রেট করুন' : 'Rate your experience with your driver'}
              </p>
            </div>

            {/* Driver Profile Summary Pill */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-200 flex-shrink-0 relative shadow-xs">
                  <Image
                    src={getImageUrl(driverPhoto)}
                    alt={driverName}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {driverName}
                    </h4>
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ✓
                    </span>
                  </div>
                  <p className="text-xs font-mono font-medium text-slate-500 truncate">
                    {carPlate || 'Verified Vehicle'}
                  </p>
                </div>
              </div>

              {totalFare ? (
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isBn ? 'পরিশোধিত' : 'Paid'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-heading">
                    {typeof totalFare === 'number' ? `৳ ${totalFare}` : totalFare}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Interactive 5-Star Rating Section */}
            <div className="text-center space-y-2 py-1">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starIdx) => {
                  const isFilled = (hoverRating !== null ? hoverRating : rating) >= starIdx;
                  return (
                    <button
                      key={starIdx}
                      type="button"
                      onClick={() => setRating(starIdx)}
                      onMouseEnter={() => setHoverRating(starIdx)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 text-slate-300 hover:scale-125 transition-transform duration-150 active:scale-95 focus:outline-hidden"
                      aria-label={`${starIdx} Star`}
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-400 filter drop-shadow-sm'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Rating Label text (e.g. "Excellent Ride!") */}
              <p className="text-xs font-bold text-amber-600 transition-all font-heading">
                {getRatingLabel(hoverRating !== null ? hoverRating : rating)}
              </p>
            </div>

            {/* Preset Compliment Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 block">
                {isBn ? 'আপনার যা ভালো লেগেছে (নির্বাচন করুন):' : 'What went great? (Select tags)'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {complimentChips.map((chip, idx) => {
                  const label = isBn ? chip.bn : chip.en;
                  const isSelected = selectedTags.has(chip.en);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleTag(chip.en)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{chip.icon}</span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Comments Textarea */}
            <div className="space-y-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  isBn
                    ? 'আপনার চালক বা রাইড সম্পর্কে অতিরিক্ত মন্তব্য লিখুন (ঐচ্ছিক)...'
                    : 'Add extra comments or suggestions for the driver (optional)...'
                }
                rows={2}
                maxLength={300}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black/10 transition-all resize-none"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 text-center font-medium bg-red-50 p-2 rounded-xl border border-red-200">
                {errorMessage}
              </p>
            )}

            {/* Action Buttons: Submit & Skip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {isBn ? 'এখন নয়' : 'Skip for Now'}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitReview}
                className="py-3 px-4 rounded-xl bg-black hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{isBn ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <span>{isBn ? 'রিভিউ জমা দিন' : 'Submit Review'}</span>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default TripReviewModal;
