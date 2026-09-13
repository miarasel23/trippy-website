import React from 'react';
import type { Metadata } from 'next';
import { PolicyTermsView } from '@/components/legal/PolicyTermsView';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms - Trippy',
  description: 'Official privacy policy, terms and conditions, and trip guidelines for Trippy users and passengers.',
};

export default function PrivacyPage() {
  return <PolicyTermsView initialTab="privacy" />;
}
