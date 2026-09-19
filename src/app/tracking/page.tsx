import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { TrackingPortal } from '@/features/tracking/components/TrackingPortal';

export const metadata: Metadata = {
  title: 'Live Trip Tracking & Passenger Safety Portal',
  description:
    'Track your ongoing Trippy ride in real-time. Turn-by-turn route tracking, driver details, live speed, arrival countdown, and 24/7 emergency safety support.',
};

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center font-bold text-slate-500">Loading live tracking...</div>}>
      <TrackingPortal />
    </Suspense>
  );
}

