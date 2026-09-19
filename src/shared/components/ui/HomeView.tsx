'use client';

import React from 'react';
import { HeroSection } from '@/shared/components/ui/HeroSection';
import { FeaturesGrid } from '@/shared/components/ui/FeaturesGrid';
import { FleetCatalog } from '@/features/fleet/components/FleetCatalog';
import { HowItWorks } from '@/shared/components/ui/HowItWorks';
import { AppDownloadBanner } from '@/shared/components/ui/AppDownloadBanner';
import { Testimonials } from '@/shared/components/ui/Testimonials';
import { FaqAccordion } from '@/shared/components/ui/FaqAccordion';
import { Badge } from '@/shared/components/ui/Badge';
import { useLanguage } from '@/context/LanguageContext';

export const HomeView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* 4 Core Value Pillars */}
      <FeaturesGrid />

      {/* Vehicle Catalog Showcase */}
      <FleetCatalog
        showFilterBar={true}
        title={t.fleet.title}
        subtitle={t.fleet.subtitle}
      />

      {/* 4-Step Process Timeline */}
      <HowItWorks />

      {/* App Download Banner */}
      <AppDownloadBanner />

      {/* Rider Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="primary" className="mb-3">{t.testimonials.badge}</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mb-4">
              {t.testimonials.title}
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="warning" className="mb-3">{t.faq.badge}</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading mb-4">
              {t.faq.title}
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>
    </>
  );
};
