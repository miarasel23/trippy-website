import React from 'react';
import type { Metadata } from 'next';
import { AppHubPortal } from '@/components/app-hub/AppHubPortal';

export const metadata: Metadata = {
  title: 'Tripyy App - Mobile Experience, Driver Chat & Downloads',
  description:
    'Download the Tripyy customer app for Android & iOS. Direct in-app driver chat, transparent fare receipts, 5-star ratings, trip history, and live GPS tracking.',
};

export default function AppHubPage() {
  return <AppHubPortal />;
}
