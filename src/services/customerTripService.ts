import {
  LocationSearchResult,
  SearchLocationResponse,
  RentalInfoResponse,
  ServiceCategory,
  TripPriceDetailsRequest,
  CreateRentalTripPayload,
  RentalTrip,
  DriverTrackingRecord,
  DriverTrackingResponse,
} from '@/types/customerApi';
import { AppUrls, getImageUrl, IMAGE_BASE_URL } from '@/config/appUrls';

export { getImageUrl, IMAGE_BASE_URL, AppUrls };
export const BACKEND_IMAGE_BASE = IMAGE_BASE_URL;

function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    localStorage.getItem('trippy_auth_token') ||
    localStorage.getItem('tripyy_auth_token')
  );
}

export function getActiveCustomerUuid(): string {
  if (typeof window === 'undefined') return '3810b347-ab60-4004-891d-81060cf4135c';
  try {
    const userStr =
      localStorage.getItem('trippy_auth_user') ||
      localStorage.getItem('tripyy_auth_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u?.uuid) return u.uuid;
    }
  } catch {}
  return (
    localStorage.getItem('trippy_customer_uuid') ||
    '3810b347-ab60-4004-891d-81060cf4135c'
  );
}

/**
 * Removes all trip, date, and booking cached data from localStorage,
 * while safely preserving user auth session tokens and language preference.
 */
export function clearTripDataFromLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const preservedKeys = new Set([
      'trippy_auth_token',
      'tripyy_auth_token',
      'trippy_auth_user',
      'tripyy_auth_user',
      'trippy_customer_uuid',
      'trippy_language_preference',
      'tripyy_language_preference',
      'trippy_last_login_prompt',
      'tripyy_last_login_prompt',
    ]);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (preservedKeys.has(key)) continue;

      const lower = key.toLowerCase();
      if (
        lower.includes('trip') ||
        lower.includes('date') ||
        lower.includes('book') ||
        lower.includes('rent') ||
        lower.includes('offer') ||
        lower.includes('bid') ||
        lower.includes('fare')
      ) {
        keysToRemove.push(key);
      }
    }

    const explicitKeys = [
      'trip_date',
      'tripDate',
      'trip_dates',
      'tripDates',
      'pickup_date',
      'dropoff_date',
      'start_datetime',
      'end_datetime',
      'booking_date',
      'rental_trip',
      'active_trip',
      'activeTrip',
      'current_trip',
      'currentTrip',
      'trippy_trip',
      'trippy_active_trip',
      'trippy_trip_data',
      'trippy_booking_data',
      'trip_data',
      'booking_data',
      'trip_offer',
      'trip_fare',
    ];

    for (const k of explicitKeys) {
      if (!preservedKeys.has(k)) {
        keysToRemove.push(k);
      }
    }

    for (const key of keysToRemove) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
  } catch (err) {
    console.warn('Failed to clear trip data from localStorage:', err);
  }
}

export const customerTripService = {
  /**
   * Search locations using Google Places backend endpoint
   */
  async searchLocations(
    query: string,
    languageCode = 'bn'
  ): Promise<LocationSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const res = await fetch(AppUrls.proxy.searchLocation, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'web',
          language_code: languageCode,
          action_when: 'search_locations',
          search_location: query.trim(),
        }),
      });

      if (!res.ok) return [];
      const json: SearchLocationResponse = await res.json();
      return json.status && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('searchLocations error:', err);
      return [];
    }
  },

  /**
   * Fetches real-time service categories and vehicle price matrix
   */
  async fetchRentalInfo(
    languageCode = 'bn'
  ): Promise<Record<string, ServiceCategory> | null> {
    try {
      const res = await fetch(
        `${AppUrls.proxy.rentalInfo}?platform=web&language_code=${languageCode}&action_when=admin_login`
      );
      if (!res.ok) return null;
      const json: RentalInfoResponse = await res.json();
      return json.status && json.data ? json.data : null;
    } catch (err) {
      console.error('fetchRentalInfo error:', err);
      return null;
    }
  },

  /**
   * Calculates live vehicle trip prices for chosen route and service
   */
  async calculateTripPrice(
    request: TripPriceDetailsRequest,
    token?: string
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = token || getStoredAuthToken();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const res = await fetch(AppUrls.proxy.tripPriceDetails, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          language_code: request.language_code || 'bn',
          action_when: 'trip_details_customer_admin',
          servive_type: request.servive_type,
          country_code: request.country_code || 'BD',
          pickup_location_uuid: request.pickup_location_uuid,
          dropoff_location_uuid: request.dropoff_location_uuid,
          start_datetime: request.start_datetime,
          ...(request.end_datetime ? { end_datetime: request.end_datetime } : {}),
        }),
      });

      return await res.json();
    } catch (err: any) {
      console.error('calculateTripPrice error:', err);
      return { status: false, message: err?.message || 'Price calculation failed' };
    }
  },

  /**
   * Submits a new rental trip with custom fare offer
   */
  async createRentalTrip(
    payload: CreateRentalTripPayload,
    token?: string
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = token || getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(AppUrls.proxy.createRentalTrip, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...payload,
        platform: 'web',
        action_when: 'create_rental_trip',
      }),
    });

    return await res.json();
  },

  /**
   * Polls driver bids for active requested trip
   */
  async fetchBids(
    customerUuid: string,
    languageCode = 'bn',
    tripStatus = 'REQUESTED',
    token?: string
  ): Promise<RentalTrip[]> {
    const authToken = token || getStoredAuthToken();
    const headers: Record<string, string> = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const url = `${AppUrls.proxy.rentalBids}?platform=web&language_code=${languageCode}&customer_uuid=${customerUuid}&trip_status=${tripStatus}&action_when=rental_bid_trip_list_for_customer`;
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      const json = await res.json();
      if (json.status && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err) {
      console.error('fetchBids error:', err);
      return [];
    }
  },

  /**
   * Fetches the current active REQUESTED trip for a customer
   */
  async fetchActiveRequestedTrip(
    customerUuid?: string,
    languageCode = 'bn',
    token?: string
  ): Promise<RentalTrip | null> {
    const targetUuid = customerUuid || getActiveCustomerUuid();
    const trips = await this.fetchBids(targetUuid, languageCode, 'REQUESTED', token);
    if (trips && trips.length > 0) {
      const active = trips.find((t) => t.trip_status === 'REQUESTED') || trips[0];
      return active || null;
    }
    return null;
  },

  /**
   * Fetches single trip with live driver bids until completed or cancelled
   * Endpoint: /v1/rental-trip/rental-bid-trip-single_for_customer
   * Query params: platform=web&language_code=bn&action_when=rental_bid_trip_single_for_customer&customer_uuid=...&trip_uuid=...&trip_status=ALL
   */
  async fetchSingleTripBids(
    customerUuid: string,
    tripUuid: string,
    languageCode = 'bn',
    tripStatus = 'ALL',
    token?: string
  ): Promise<{ status: boolean; data?: RentalTrip | null; message?: string }> {
    const authToken = token || getStoredAuthToken();
    const targetCustomerUuid = customerUuid || getActiveCustomerUuid();
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    try {
      const query = new URLSearchParams({
        platform: 'web',
        language_code: languageCode,
        action_when: 'rental_bid_trip_single_for_customer',
        customer_uuid: targetCustomerUuid,
        trip_uuid: tripUuid,
        trip_status: tripStatus,
      });

      const url = `${AppUrls.proxy.rentalBidTripSingle}?${query.toString()}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return { status: false, data: null, message: `HTTP ${res.status}` };
      }
      const json = await res.json();

      let trip: RentalTrip | null = null;
      if (json.status && json.data) {
        if (Array.isArray(json.data)) {
          trip = json.data[0] || null;
        } else if (json.data.trip) {
          trip = json.data.trip;
        } else if (typeof json.data === 'object') {
          trip = json.data;
        }
      }

      return { status: Boolean(json.status), data: trip, message: json.message };
    } catch (err: any) {
      console.error('fetchSingleTripBids error:', err);
      return { status: false, data: null, message: err?.message };
    }
  },


  /**
   * Accepts a driver's counter-offer bid
   */
  async acceptBid(
    customerUuid: string,
    bidUuid: string,
    tripUuid?: string,
    languageCode = 'bn',
    token?: string
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = token || getStoredAuthToken();
    const targetCustomerUuid = customerUuid || getActiveCustomerUuid();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(AppUrls.proxy.acceptTrip, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        platform: 'web',
        customer_uuid: targetCustomerUuid,
        bid_uuid: bidUuid,
        rent_bid_uuid: bidUuid,
        trip_uuid: tripUuid,
        rental_trip_uuid: tripUuid,
        language_code: languageCode,
        action_when: 'accept_trip_for_customer',
      }),
    });

    return await res.json();
  },

  /**
   * Cancels a trip request
   */
  async cancelTrip(
    tripUuid: string,
    comment = 'Cancelled by customer from website',
    languageCode = 'bn',
    token?: string
  ): Promise<{ status: boolean; message: string }> {
    const authToken = token || getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(
      AppUrls.proxy.cancelTrip,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          trip_uuid: tripUuid,
          rental_trip_uuid: tripUuid,
          comment,
          language_code: languageCode,
          action_when: 'cancel_trip_driver_or_customer_admin',
        }),
      }
    );

    return await res.json();
  },

  /**
   * Updates customer proposed offer amount
   * Calls /v1/rental-trip/update-trip-offer-amount
   */
  async updateOfferAmount(
    customerUuid: string,
    tripUuid: string,
    offerAmount: number | string,
    languageCode = 'bn',
    token?: string
  ): Promise<{ status: boolean; message: string; data?: any }> {
    // 1. Remove all trip and date data from local storage before calling API
    clearTripDataFromLocalStorage();

    const authToken = token || getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const targetCustomerUuid = customerUuid || getActiveCustomerUuid();
    const numAmount = typeof offerAmount === 'string' ? parseFloat(offerAmount) || 0 : offerAmount;

    try {
      const res = await fetch(AppUrls.proxy.updateTripOfferAmount, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          language_code: languageCode,
          action_when: 'update_trip_offer_amount',
          trip_uuid: tripUuid,
          rental_trip_uuid: tripUuid,
          offer_ammount: numAmount,
          offer_amount: numAmount,
          customer_uuid: targetCustomerUuid,
        }),
      });

      return await res.json();
    } catch (err: any) {
      return { status: false, message: err?.message || 'Failed to update offer amount' };
    }
  },

  /**
   * Declines / cancels a driver's bid
   * Calls /v1/rental-trip/cancel-rent-bid-driver-or-customer-admin
   */
  async cancelRentBid(
    bidUuid: string,
    comment = 'cancel_rent_bid_driver_or_customer_admin',
    languageCode = 'bn',
    token?: string
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = token || getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    try {
      const res = await fetch(AppUrls.proxy.cancelRentBid, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          language_code: languageCode,
          action_when: 'cancel_rent_bid_driver_or_customer_admin',
          bid_uuid: bidUuid,
          rent_bid_uuid: bidUuid,
          comment: comment || 'cancel_rent_bid_driver_or_customer_admin',
        }),
      });

      return await res.json();
    } catch (err: any) {
      return { status: false, message: err?.message || 'Failed to decline bid' };
    }
  },

  /**
   * Submits passenger review and star rating for a completed rental trip
   * Endpoint: /v1/rental-trip/give-review
   */
  async giveReview(params: {
    tripUuid: string;
    driverUuid: string;
    rating: number;
    comments?: string;
    customerUuid?: string;
    languageCode?: string;
    token?: string;
    given_by?: string;
  }): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = params.token || getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const targetCustomerUuid = params.customerUuid || getActiveCustomerUuid();

    try {
      const res = await fetch(AppUrls.proxy.giveReview, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          action_when: 'give_review',
          language_code: params.languageCode || 'bn',
          customer_uuid: targetCustomerUuid,
          trip_uuid: params.tripUuid,
          rental_trip_uuid: params.tripUuid,
          driver_uuid: params.driverUuid,
          rating: params.rating,
          comments: params.comments || '',
          given_by: 'CUSTOMER',
        }),
      });

      return await res.json();
    } catch (err: any) {
      console.error('giveReview error:', err);
      return { status: false, message: err?.message || 'Failed to submit review' };
    }
  },

  /**
   * Fetches real-time driver GPS tracking records
   * Endpoint: /v1/customer-driver-track/get
   * Required payload: platform, language_code, action_when: 'track_location_get', driver_uuid
   */
  async fetchDriverLocation(
    driverUuid: string,
    languageCode = 'bn',
    token?: string
  ): Promise<DriverTrackingRecord[]> {
    if (!driverUuid) return [];
    const authToken = token || getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    try {
      const res = await fetch(AppUrls.proxy.driverLocation, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          language_code: languageCode,
          action_when: 'track_location_get',
          driver_uuid: driverUuid,
        }),
      });

      if (!res.ok) return [];
      const json: DriverTrackingResponse = await res.json();
      return json.status && Array.isArray(json.data) ? json.data : [];
    } catch (err) {
      console.error('fetchDriverLocation error:', err);
      return [];
    }
  },
};

