import React from 'react';
import { Badge } from '../common/Badge';

interface Step {
  num: number;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    num: 1,
    title: 'Set Route & Fare',
    desc: 'Enter your pickup point and destination. Suggest the fare you wish to pay using our price recommendation guide.',
  },
  {
    num: 2,
    title: 'Receive Driver Bids',
    desc: 'Nearby verified drivers see your request instantly and respond with bids or direct acceptance in real-time.',
  },
  {
    num: 3,
    title: 'Choose The Best Deal',
    desc: 'Compare driver ratings, arrival times, car photos, and price. Select the driver you feel most comfortable with.',
  },
  {
    num: 4,
    title: 'Track & Pay Fair',
    desc: 'Follow your driver on the live GPS map. Pay the agreed fare in cash or mobile banking with full receipt transparency.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="amber" className="mb-3">Simple 4-Step Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
            How To Ride With Tripyy
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            From setting your route to arriving safely at your destination with zero surprise fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.num}
              className="bg-brand-card/75 border border-white/10 rounded-2xl p-7 relative hover:border-white/20 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-brand-dark font-extrabold text-lg flex items-center justify-center mb-5 font-heading shadow-md">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-white font-heading mb-2.5">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
