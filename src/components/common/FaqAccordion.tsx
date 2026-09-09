'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How does the 'Set Your Own Fare' bidding work?",
    answer: "When you request a ride on Tripyy, you enter your pickup and destination and propose an initial fare based on our intelligent estimate guide. Nearby verified drivers receive your offer in real time and can accept it immediately or offer a fair counter-bid. You review driver ratings, vehicle photos, and prices, and select the best ride with zero surge price spikes.",
  },
  {
    question: "What vehicle options are available across Bangladesh?",
    answer: "Tripyy features 4 specialized vehicle classes for every budget and trip size: Sedan Premium (Toyota Axio, Allion, Premio for 4 pax), Toyota Noah (spacious 7-seater for family and holiday luggage), Toyota Hiace Microbus (11-seater for corporate and group events), and Mountain Chander Gari (rugged 4x4 offroad jeep for hilly terrains like Sajek Valley, Nilgiri, and Bandarban).",
  },
  {
    question: "How does Public Live Tracking protect passengers and family members?",
    answer: "During any active journey, passengers can tap 'Share Trip Link' to generate a secure live monitoring link. Family and friends can track the vehicle's exact turn-by-turn route, live speed, driver photo, car license plate, and estimated arrival countdown on any web browser without needing to install the app.",
  },
  {
    question: "How are payments handled on Tripyy?",
    answer: "Tripyy offers 100% transparent payment settlement. You pay your agreed fare directly to the driver upon reaching your destination using Cash or Instant Mobile Banking (bKash or Nagad). The fare agreed upon during the bidding phase is the final fare, with zero hidden service commissions.",
  },
  {
    question: "What safety measures are implemented in case of emergency?",
    answer: "Every active trip is monitored by our background telemetry system. In case of emergency, passengers have instant one-tap access to Bangladesh National Emergency Police SOS (999) which broadcasts live GPS coordinates, as well as our 24/7 dedicated Tripyy hotline (16223).",
  },
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {FAQ_ITEMS.map((item, index) => {
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
              <span>{item.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-brand-primary transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
