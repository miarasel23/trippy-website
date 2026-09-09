'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const GRADIENTS = [
  'from-emerald-500 to-cyan-500',
  'from-amber-500 to-red-500',
  'from-indigo-500 to-blue-500',
];

export const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {t.testimonials.items.map((review, idx) => {
        const gradient = GRADIENTS[idx % GRADIENTS.length];
        const initials = review.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2);

        return (
          <div
            key={idx}
            className="bg-brand-card/75 border border-white/10 rounded-2xl p-7 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
          >
            <div>
              <div className="flex items-center gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm italic leading-relaxed mb-6">
                &ldquo;{review.quote}&rdquo;
              </p>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-xs shadow-md`}
              >
                {initials}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-tight">
                  {review.name}
                </h4>
                <span className="text-xs text-slate-400">
                  {review.location}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
