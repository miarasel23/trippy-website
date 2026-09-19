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
 * Handles all backend serialization formats:
 * - UTC strings without Z: '2026-09-12 16:06:00'
 * - Asia/Dhaka local strings without Z: '2026-09-12 22:06:00'
 * - ISO with Z: '2026-09-12T16:06:00.000000Z'
 * - Asia/Dhaka ISO saved with Z: '2026-09-12T22:06:00.000000Z'
 * - Explicit offset: '2026-09-12T22:06:00+06:00'
 * - Numeric timestamps
 * Resolves the true elapsed time between created_at and now in Bangladesh time.
 */
export function parseAsiaBangladeshTimestamp(raw?: string | number | null): number {
  if (!raw) return Date.now();
  const now = Date.now();

  if (typeof raw === 'number') {
    let ts = raw;
    if (ts - now > 5 * 3600 * 1000) {
      ts -= 6 * 3600 * 1000;
    }
    return Math.min(now, ts);
  }

  try {
    const str = String(raw).trim();
    if (!str) return now;

    const formatted = str.includes('T') ? str : str.replace(' ', 'T');
    const cleanIso = formatted.replace(/\.\d+/, ''); // strip sub-second microseconds

    const candidates: number[] = [];

    // 1. Direct standard parse
    const d1 = new Date(str).getTime();
    if (!isNaN(d1)) {
      candidates.push(d1);
      // If parsed as UTC but was actually local BD time saved with Z
      candidates.push(d1 - 6 * 3600 * 1000);
    }

    // 2. Treat as UTC ('...Z')
    const utcStr = cleanIso.endsWith('Z') ? cleanIso : `${cleanIso}Z`;
    const dUtc = new Date(utcStr).getTime();
    if (!isNaN(dUtc)) {
      candidates.push(dUtc);
      candidates.push(dUtc - 6 * 3600 * 1000);
    }

    // 3. Treat as Asia/Dhaka ('...+06:00')
    const dhakaBase = cleanIso.replace(/[+-]\d{2}:?\d{2}$|Z$/, '');
    const dDhaka = new Date(`${dhakaBase}+06:00`).getTime();
    if (!isNaN(dDhaka)) {
      candidates.push(dDhaka);
      candidates.push(dDhaka + 6 * 3600 * 1000);
      candidates.push(dDhaka + 12 * 3600 * 1000);
    }

    // Find candidate that is in the past (allowing 5s clock skew)
    // Priority: smallest valid positive elapsed time (i.e. created recently)
    const unique = Array.from(new Set(candidates));
    let best: number | null = null;
    let minValidElapsed = Infinity;

    for (const c of unique) {
      const elapsed = now - c;
      // Allow up to 60s server clock skew (if slightly in the future, treat as 0s elapsed for comparison)
      const effectiveElapsed = elapsed >= -60000 && elapsed < 0 ? 0 : elapsed;
      if (effectiveElapsed >= 0 && effectiveElapsed < minValidElapsed) {
        minValidElapsed = effectiveElapsed;
        best = c; // Always return the stable candidate timestamp c, NEVER Date.now()!
      }
    }

    if (best !== null) {
      return best;
    }
  } catch {}

  return now;
}
