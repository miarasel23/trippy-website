'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const FaqAccordion: React.FC = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {t.faq.items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'bg-brand-card/90 border-brand-primary/40 shadow-glow/10'
                : 'bg-brand-card/50 border-white/10 hover:border-white/20'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full px-6 py-5 flex items-center justify-between text-left text-white font-bold text-base transition-colors"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                  isOpen ? 'rotate-180 text-brand-primary' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 pt-1 text-slate-300 text-sm leading-relaxed border-t border-white/5">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
