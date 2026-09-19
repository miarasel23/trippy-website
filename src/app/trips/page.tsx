import React from 'react';
import type { Metadata } from 'next';
import { TripsPortal } from '@/features/trips/components/TripsPortal';

export const metadata: Metadata = {
  title: 'My Trips & Live Bidding Radar | Trippy Bangladesh',
  description:
    'Monitor active trip requests, review real-time driver counter-offers, inspect vehicle photos, and track your booked ride across Bangladesh with Trippy.',
};

export default function TripsPage() {
  return <TripsPortal />;
}
