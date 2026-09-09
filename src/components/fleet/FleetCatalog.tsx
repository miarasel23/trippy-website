'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FLEET_VEHICLES, VehicleCategory, VehicleKey } from '@/types/fleet';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FleetCatalogProps {
  showFilterBar?: boolean;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export const FleetCatalog: React.FC<FleetCatalogProps> = ({
  showFilterBar = true,
  limit,
  title,
  subtitle,
}) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<VehicleCategory>('all');

  const catalogTitle = title || t.fleet.title;
  const catalogSubtitle = subtitle || t.fleet.subtitle;

  const vehicles = (Object.keys(FLEET_VEHICLES) as VehicleKey[])
    .map((k) => FLEET_VEHICLES[k])
    .filter((v) => {
      if (filter === 'all') return true;
      if (filter === 'family' && (v.id === 'noah' || v.id === 'hiace')) return true;
      return v.category === filter;
    });

  const displayedVehicles = limit ? vehicles.slice(0, limit) : vehicles;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="badge badge-primary mb-3">{t.fleet.badge}</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
            {catalogTitle}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {catalogSubtitle}
          </p>
        </div>

        {/* Filter Pills */}
        {showFilterBar && (
          <div className="flex justify-center gap-2.5 flex-wrap mb-12">
            {[
              { id: 'all', label: t.fleet.filterAll },
              { id: 'sedan', label: t.fleet.filterSedan },
              { id: 'family', label: t.fleet.filterFamily },
              { id: 'adventure', label: t.fleet.filterAdventure },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as VehicleCategory)}
                className={`py-2.5 px-6 rounded-full text-xs font-bold transition-all border ${
                  filter === tab.id
                    ? 'bg-gradient-to-r from-brand-primary/25 to-brand-secondary/25 border-brand-primary text-white shadow-glow/20'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayedVehicles.map((v) => {
            const locVehicle = t.fleet.vehicles[v.id];
            const name = locVehicle?.name || v.name;
            const tag = locVehicle?.tag || v.tag;
            const features = locVehicle?.features || v.features;
            const description = locVehicle?.description || v.description;

            return (
              <div
                key={v.id}
                className="bg-brand-card/85 border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-brand-primary/40 hover:-translate-y-1.5 transition-all duration-300 shadow-card group"
              >
                {/* Vehicle Image Viewport */}
                <div className="h-44 bg-[#080c16] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                  <span className="absolute top-3 left-3 bg-brand-surface/90 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full z-10 backdrop-blur-md">
                    {tag}
                  </span>
                  <div
                    className="w-full h-44 bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: "url('/selecting_page.png')",
                      backgroundPosition: v.imagePosition,
                      transform: `scale(${v.scale || 1.6})`,
                    }}
                  />
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading mb-3">
                      {name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {features.map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                      {description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        {t.fleet.estimatedBase}
                      </span>
                      <div className="text-lg font-extrabold text-brand-primary-light font-heading">
                        {t.common.currency} {v.baseFare}
                      </div>
                    </div>
                    <Link
                      href={`/booking?vehicle=${v.id}`}
                      className="btn btn-primary py-2 px-4 text-xs font-bold rounded-xl shadow-glow/20"
                    >
                      {t.fleet.bookRideBtn}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {limit && limit < 4 && (
          <div className="text-center">
            <Link
              href="/fleet"
              className="btn btn-secondary py-3 px-8 rounded-xl font-bold text-sm inline-flex items-center gap-2 border-white/20 hover:border-white/40"
            >
              {t.fleet.exploreAllBtn} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};
