import React from 'react';
import type { Metadata } from 'next';
import { FleetCatalog } from '@/components/fleet/FleetCatalog';
import { IntercityRoutes } from '@/components/fleet/IntercityRoutes';
import { Badge } from '@/components/common/Badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Vehicle Fleet & Bangladesh Intercity Travel Corridors',
  description:
    "Explore Tripyy's versatile fleet: Sedan Premium, Toyota Noah 7-seater, Toyota Hiace 11-seater microbus, Mountain Chander Gari for Sajek, and city bikes. Intercity fares across Bangladesh.",
};

export default function FleetPage() {
  return (
    <div className="pt-8 pb-16">
      {/* Fleet Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <Badge variant="cyan" className="mb-4">Bangladesh Fleet Showcase</Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-heading mb-4 leading-tight">
          Diverse Fleet For Every Journey <br className="hidden sm:inline" /> Across Bangladesh
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          From fuel-efficient city sedans to 11-seater Hiace microbuses and 4WD mountain beasts, choose the exact ride you need at your agreed fare.
        </p>
      </div>

      {/* Filterable Vehicle Catalog */}
      <FleetCatalog
        showFilterBar={true}
        title="Explore Vehicle Specifications"
        subtitle="Transparent seat counts, luggage capacities, and negotiable base fare estimates."
      />

      {/* Intercity Routes Guide */}
      <IntercityRoutes />

      {/* Round Trip Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-gradient-to-r from-emerald-900/40 via-brand-surface to-cyan-900/40 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl">
          <Badge variant="primary" className="mb-3">SAVE UP TO 25%</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading mb-3">
            Planning a Round Trip or Weekend Getaway?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-6">
            Book return journeys with the same verified driver and unlock guaranteed round-trip discounts on Cox&apos;s Bazar, Sylhet, and Gazipur routes.
          </p>
          <Link
            href="/booking"
            className="btn btn-primary py-3 px-8 text-sm font-bold rounded-xl shadow-glow"
          >
            Book Round Trip Now
          </Link>
        </div>
      </div>
    </div>
  );
}
