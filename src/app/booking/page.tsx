import React from 'react';
import type { Metadata } from 'next';
import { RideBookingGuide } from '@/components/booking/RideBookingGuide';

export const metadata: Metadata = {
  title: 'How to Book a Car Step-by-Step | Trippy Bangladesh',
  description:
    'Learn how to book a car with Trippy step-by-step. Choose service, set pickup and dropoff on Google Maps, propose your fare, and connect directly with verified drivers in Bangladesh.',
};

export default function BookingPage() {
  return <RideBookingGuide />;
}

