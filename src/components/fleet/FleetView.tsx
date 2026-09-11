'use client';

import React from 'react';
import { FleetCatalog } from '@/components/fleet/FleetCatalog';
import { IntercityRoutes } from '@/components/fleet/IntercityRoutes';
import { Badge } from '@/components/common/Badge';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export const FleetView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-8 pb-16">
      {/* Fleet Hero Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <Badge variant="primary" className="mb-4">{t.fleet.pageBadge}</Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-heading mb-4 leading-tight">
          {t.fleet.pageTitle}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {t.fleet.pageSubtitle}
        </p>
      </div>

      {/* Filterable Vehicle Catalog */}
      <FleetCatalog
        showFilterBar={true}
        title={t.fleet.catalogTitle}
        subtitle={t.fleet.catalogSubtitle}
      />

      {/* Intercity Routes Guide */}
      <IntercityRoutes />

      {/* Round Trip Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center shadow-lg">
          <Badge variant="primary" className="mb-3">{t.fleet.roundTripBadge}</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mb-3">
            {t.fleet.roundTripTitle}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-6">
            {t.fleet.roundTripDesc}
          </p>
          <Link
            href="/#home-booking"
            className="btn btn-primary py-3 px-8 text-sm font-bold rounded-xl bg-black text-white hover:bg-slate-900"
          >
            {t.fleet.roundTripBtn}
          </Link>
        </div>
      </div>
    </div>
  );
};
