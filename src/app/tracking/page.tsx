import React from 'react';
import type { Metadata } from 'next';
import { TrackingPortal } from '@/components/tracking/TrackingPortal';

export const metadata: Metadata = {
  title: 'Live Trip Tracking & Passenger Safety Portal',
  description:
    'Track your ongoing Trippy ride in real-time. Turn-by-turn route tracking, driver details, live speed, arrival countdown, and 24/7 emergency safety support.',
};

export default function TrackingPage() {
  return <TrackingPortal />;
}
