import React from 'react';
import type { Metadata } from 'next';
import { BookingPortal } from '@/components/booking/BookingPortal';

export const metadata: Metadata = {
  title: 'Ride Booking & Live Fare Negotiation',
  description:
    'Book your ride online with Trippy. Propose your own fare, select Sedans, Noah, or Hiace microbus, and receive instant offers from verified drivers in Bangladesh.',
};

export default function BookingPage() {
  return <BookingPortal />;
}
