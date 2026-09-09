import React from 'react';
import type { Metadata } from 'next';
import { FleetView } from '@/components/fleet/FleetView';

export const metadata: Metadata = {
  title: 'Vehicle Fleet & Bangladesh Intercity Travel Corridors',
  description:
    "Explore Tripyy's versatile fleet: Sedan Premium, Toyota Noah 7-seater, Toyota Hiace 11-seater microbus, Mountain Chander Gari for Sajek, and city bikes. Intercity fares across Bangladesh.",
};

export default function FleetPage() {
  return <FleetView />;
}
