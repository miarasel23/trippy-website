import React from 'react';
import { HeroSection } from '@/components/hero/HeroSection';
import { FeaturesGrid } from '@/components/features/FeaturesGrid';
import { FleetCatalog } from '@/components/fleet/FleetCatalog';
import { HowItWorks } from '@/components/features/HowItWorks';
import { AppDownloadBanner } from '@/components/features/AppDownloadBanner';
import { Testimonials } from '@/components/common/Testimonials';
import { FaqAccordion } from '@/components/common/FaqAccordion';
import { Badge } from '@/components/common/Badge';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* 4 Core Value Pillars */}
      <FeaturesGrid />

      {/* Vehicle Catalog Showcase */}
      <FleetCatalog
        showFilterBar={false}
        limit={4}
        title="Vehicles for Every Journey & Group Size"
        subtitle="From personal daily commutes to group tours and mountain terrain expeditions across Bangladesh."
      />

      {/* 4-Step Process Timeline */}
      <HowItWorks />

      {/* App Download Banner */}
      <AppDownloadBanner />

      {/* Rider Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="cyan" className="mb-3">Trusted Community</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
              Loved by Riders Across Bangladesh
            </h2>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="amber" className="mb-3">Got Questions?</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-heading mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <FaqAccordion />
        </div>
      </section>
    </>
  );
}
