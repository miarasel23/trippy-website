/**
 * Utilities for managing and purging trip-related local and session storage.
 * Ensures consistent cleanup across Booking, Radar, Tracking, and Review modals.
 */

export function clearAllTripRelatedStorage(tripUuid?: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('trippy_booking_active_trip');
    sessionStorage.removeItem('trippy_booking_active_trip');
    localStorage.removeItem('trippy_active_trip_cache');
    sessionStorage.removeItem('trippy_active_trip_cache');
    localStorage.removeItem('trippy_has_active_ride');
    sessionStorage.removeItem('trippy_has_active_ride');
    if (tripUuid) {
      localStorage.removeItem(`trippy_trip_created_${tripUuid}`);
      sessionStorage.removeItem(`trippy_trip_created_${tripUuid}`);
    }
  } catch {}
}

export function markTripReviewed(tripUuid: string) {
  if (typeof window === 'undefined' || !tripUuid) return;
  try {
    localStorage.setItem(`trippy_review_done_${tripUuid}`, 'true');
    sessionStorage.setItem(`trippy_review_done_${tripUuid}`, 'true');
  } catch {}
}

/**
 * Checks whether a trip has already been reviewed across all potential API keys,
 * casing variants, typo formats ('given_revew', 'review_status:truee'), and local storage.
 */
export function isTripReviewed(trip?: any, fallbackTripUuid?: string): boolean {
  if (!trip && !fallbackTripUuid) return false;

  const targetUuid = trip?.uuid || fallbackTripUuid;
  if (typeof window !== 'undefined' && targetUuid) {
    try {
      if (
        localStorage.getItem(`trippy_review_done_${targetUuid}`) === 'true' ||
        sessionStorage.getItem(`trippy_review_done_${targetUuid}`) === 'true'
      ) {
        return true;
      }
    } catch {}
  }

  if (!trip) return false;

  // 1. Check given_review / given_revew
  const gr = trip.given_review ?? trip.given_revew ?? trip.accepted_driver?.given_review;
  if (gr === true || gr === 1 || String(gr).toLowerCase() === 'true') {
    return true;
  }

  // 2. Check review_status
  const rs = trip.review_status ?? trip.accepted_driver?.review_status;
  if (
    rs === true ||
    rs === 1 ||
    String(rs).toLowerCase() === 'true' ||
    String(rs).toLowerCase() === 'truee' // handles backend typo 'truee'
  ) {
    return true;
  }

  return false;
}
