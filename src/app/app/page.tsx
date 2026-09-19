import React from 'react';
import type { Metadata } from 'next';
import { AppHubPortal } from '@/shared/components/ui/AppHubPortal';

export const metadata: Metadata = {
  title: 'Trippy App - Mobile Experience, Driver Chat & Downloads',
  description:
    'Download the Trippy customer app for Android & iOS. Direct in-app driver chat, transparent fare receipts, 5-star ratings, trip history, and live GPS tracking.',
};

export default function AppHubPage() {
  return <AppHubPortal />;
}
