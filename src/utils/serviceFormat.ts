/**
 * Utilities for formatting trip service names and extracting hourly durations
 * Handles: RIDE_SHARE, INTER_CITY_RENTER / INTERCITY, HOURLY (with duration hours),
 * AIRPORT_RENTER, RETURN, WEDDING_CAR, PACKAGE_DELIVERY, etc.
 */

export interface FormattedServiceInfo {
  name: string;
  rawKey: string;
  isHourly: boolean;
  isIntercity: boolean;
  isRideShare: boolean;
  hoursCount?: number;
  hoursText?: string;
  badgeColor: string;
}

export function formatTripServiceType(
  rawServiceName?: string | null,
  hoursBooked?: string | number | null,
  language: 'en' | 'bn' = 'en'
): FormattedServiceInfo {
  const isBn = language === 'bn';
  const raw = (rawServiceName || '').toUpperCase().trim();

  // 1. Hourly check
  if (raw.includes('HOURLY') || raw.includes('HOUR')) {
    const hoursStr = hoursBooked ? String(hoursBooked).trim() : '4';
    const hoursNum = parseInt(hoursStr, 10) || 4;
    const hoursText = isBn
      ? `${hoursNum} ঘণ্টা`
      : `${hoursNum} ${hoursNum === 1 ? 'Hour' : 'Hours'}`;

    return {
      name: isBn
        ? `ঘণ্টাভিত্তিক (${hoursText})`
        : `Hourly (${hoursText})`,
      rawKey: 'HOURLY',
      isHourly: true,
      isIntercity: false,
      isRideShare: false,
      hoursCount: hoursNum,
      hoursText,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    };
  }

  // 2. Intercity check
  if (
    raw.includes('INTER_CITY') ||
    raw.includes('INTERCITY') ||
    raw.includes('INTER CITY')
  ) {
    return {
      name: isBn ? 'ইন্টারসিটি' : 'Intercity',
      rawKey: 'INTER_CITY_RENTER',
      isHourly: false,
      isIntercity: true,
      isRideShare: false,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  // 3. Ride Share check
  if (
    raw === 'RIDE_SHARE' ||
    raw === 'RIDESHARE' ||
    raw === 'RIDE SHARE' ||
    raw.includes('RIDE_SHARE') ||
    raw.includes('RIDESHARE') ||
    raw.includes('RIDE')
  ) {
    return {
      name: isBn ? 'রাইড শেয়ার' : 'Ride Share',
      rawKey: 'RIDE_SHARE',
      isHourly: false,
      isIntercity: false,
      isRideShare: true,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  // 4. Return Trip check
  if (
    raw.includes('RETURN') ||
    raw.includes('ROUND') ||
    raw.includes('TWO_WAY')
  ) {
    return {
      name: isBn ? 'রিটার্ন ট্রিপ' : 'Return Trip',
      rawKey: 'RETURN',
      isHourly: false,
      isIntercity: false,
      isRideShare: false,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  // 5. Airport check
  if (raw.includes('AIRPORT')) {
    return {
      name: isBn ? 'এয়ারপোর্ট ট্রান্সফার' : 'Airport Transfer',
      rawKey: 'AIRPORT_RENTER',
      isHourly: false,
      isIntercity: false,
      isRideShare: false,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    };
  }

  // 6. Wedding car check
  if (raw.includes('WEDDING')) {
    return {
      name: isBn ? 'ওয়েডিং কার' : 'Wedding Car',
      rawKey: 'WEDDING_CAR',
      isHourly: false,
      isIntercity: false,
      isRideShare: false,
      badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
    };
  }

  // 7. Package delivery check
  if (raw.includes('DELIVERY') || raw.includes('PACKAGE')) {
    return {
      name: isBn ? 'প্যাকেজ ডেলিভারি' : 'Package Delivery',
      rawKey: 'PACKAGE_DELIVERY',
      isHourly: false,
      isIntercity: false,
      isRideShare: false,
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
    };
  }

  // Fallback: If empty, default to Ride Share
  if (!raw) {
    return {
      name: isBn ? 'রাইড শেয়ার' : 'Ride Share',
      rawKey: 'RIDE_SHARE',
      isHourly: false,
      isIntercity: false,
      isRideShare: true,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }

  const clean = raw.replace(/_/g, ' ').toLowerCase();
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  return {
    name: capitalized,
    rawKey: raw,
    isHourly: false,
    isIntercity: false,
    isRideShare: false,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
  };
}

export function extractTripServiceInfo(trip?: any): {
  rawServiceName: string;
  hoursBooked?: string | null;
} {
  if (!trip) return { rawServiceName: 'RIDE_SHARE' };

  const rawServiceName =
    trip.service_name ||
    trip.service_type ||
    trip.servive_type ||
    trip.serviceName ||
    trip.serviceType ||
    trip.car_service?.service_name ||
    'RIDE_SHARE';

  const hoursBooked =
    trip.hours_booked ||
    trip.hoursBooked ||
    trip.hours ||
    trip.rental_duration ||
    trip.duration_hours ||
    null;

  return {
    rawServiceName: String(rawServiceName),
    hoursBooked: hoursBooked ? String(hoursBooked) : null,
  };
}

/**
 * Parses a date string or timestamp in Asia/Dhaka (Bangladesh Standard Time, UTC+6).
 * Handles:
 * - '2026-09-12 21:40:00' (no timezone -> treated as Asia/Dhaka +06:00)
 * - '2026-09-12T21:40:00+06:00'
 * - '2026-09-12T15:40:00Z'
 * - numeric timestamps or ISO formats
 */
export function parseAsiaBangladeshTimestamp(raw?: string | number | null): number {
  if (!raw) return Date.now();
  if (typeof raw === 'number') return raw;

  try {
    const str = String(raw).trim();
    if (!str) return Date.now();

    // If it already has an explicit timezone offset (+06:00, -05:00, Z)
    if (str.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(str)) {
      const ts = new Date(str).getTime();
      if (!isNaN(ts)) return ts;
    }

    // String without timezone, e.g. '2026-09-12 21:40:00' or '2026-09-12T21:40:00'
    const formatted = str.includes('T') ? str : str.replace(' ', 'T');
    // Parse explicitly as Asia/Dhaka (+06:00)
    const bdIso = `${formatted}+06:00`;
    const ts = new Date(bdIso).getTime();
    if (!isNaN(ts)) return ts;

    const fallbackTs = new Date(formatted).getTime();
    if (!isNaN(fallbackTs)) return fallbackTs;
  } catch (e) {
    console.warn('Error parsing Asia/Dhaka timestamp:', e);
  }

  return Date.now();
}
