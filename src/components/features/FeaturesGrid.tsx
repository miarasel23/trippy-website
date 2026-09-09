import React from 'react';
import { Badge } from '../common/Badge';

interface FeatureItem {
  icon: string;
  title: string;
  desc: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: '💰',
    title: 'Set Your Own Fare',
    desc: 'No algorithm price spikes. Propose your budget, receive competitive offers from local drivers, and pick the ride that matches your pocket.',
  },
  {
    icon: '🚐',
    title: 'Specialized BD Fleet',
    desc: 'Whether you need an AC Sedan for daily city commute, a Noah for family luggage, a Hiace for weddings, or a Chander Gari for Sajek, we have it ready.',
  },
  {
    icon: '📡',
    title: 'Real-Time Live Radar',
    desc: 'Broadcast your trip request to drivers within 5km radius. Watch instant counter-offers appear in seconds with driver ratings and car photos.',
  },
  {
    icon: '🛡️',
    title: 'Foreground Safety GPS',
    desc: 'Continuous turn-by-turn tracking, 24/7 safety hotline, instant emergency SOS (999), and shareable live links for your family.',
  },
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="cyan" className="mb-3">Why Tripyy Stands Apart</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
            Built for Real Convenience in Bangladesh
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Experience a transparent, fair-price mobility ecosystem designed to overcome surge pricing and inflexible booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item, idx) => (
            <div
              key={idx}
              className="bg-brand-card/75 border border-white/10 rounded-2xl p-7 hover:border-brand-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-card"
            >
              <div className="w-13 h-13 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-2xl mb-5">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2.5">
                {item.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
