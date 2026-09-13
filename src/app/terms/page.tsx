import React from 'react';
import type { Metadata } from 'next';
import { PolicyTermsView } from '@/components/legal/PolicyTermsView';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Trippy',
  description: 'Official terms and conditions for using Trippy rental rides, ride sharing, and passenger services.',
};

export default function TermsPage() {
  return <PolicyTermsView initialTab="terms" />;
}
