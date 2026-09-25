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
} from '@/features/trips/types/customerApi';
import { AppUrls, getImageUrl, IMAGE_BASE_URL } from '@/shared/config/appUrls';

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
  } catch {}
}

/**
 * Normalizes raw API or Socket.IO trip payload into a standardized RentalTrip.
 * Handles single objects, array responses, nested structures, and field aliases.
 */
export function normalizeRentalTrip(rawData: any): RentalTrip | null {
  if (!rawData) return null;

  let rawItem: any = null;
  if (Array.isArray(rawData)) {
    rawItem = rawData[0] || null;
  } else if (typeof rawData === 'object') {
    if (rawData.data) {
      return normalizeRentalTrip(rawData.data);
    }
    rawItem = rawData;
  }

  if (!rawItem) return null;

  const nested = rawItem.rental_trip || rawItem.trip || {};
  return {
    ...nested,
    ...rawItem,
    drivers: rawItem.drivers || nested.drivers || [],
    seen_drivers: rawItem.seen_drivers || nested.seen_drivers || [],
    created_at:
      rawItem.created_at ||
      nested.created_at ||
      rawItem.createdAt ||
      nested.createdAt ||
      rawItem.creation_date ||
      nested.creation_date ||
      rawItem.created_date ||
      nested.created_date,
  };
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
      const formParams = new URLSearchParams({
        platform: 'web',
        language_code: languageCode,
        action_when: 'search_locations',
        search_location: query.trim(),
      });
      const res = await fetch(AppUrls.backend.searchLocation, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formParams.toString(),
      });

      if (!res.ok) return [];
      const json: SearchLocationResponse = await res.json();
      return json.status && Array.isArray(json.data) ? json.data : [];
    } catch {
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
        `${AppUrls.backend.rentalInfo}?platform=web&language_code=${languageCode}&action_when=admin_login`
      );
      if (!res.ok) return null;
      const json: RentalInfoResponse = await res.json();
      return json.status && json.data ? json.data : null;
    } catch {
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
        'Content-Type': 'application/x-www-form-urlencoded',
      };
      if (authToken) {
        headers.Authorization = authToken.startsWith('Bearer ')
          ? authToken
          : `Bearer ${authToken}`;
      }

      const formParams = new URLSearchParams({
        platform: 'web',
        language_code: request.language_code || 'bn',
        action_when: 'trip_details_customer_admin',
        servive_type: request.servive_type,
        country_code: request.country_code || 'BD',
        start_datetime: request.start_datetime,
      });
      if (request.pickup_location_uuid) {
        if (Array.isArray(request.pickup_location_uuid)) {
          request.pickup_location_uuid.forEach((u) => formParams.append('pickup_location_uuid', u));
        } else {
          formParams.append('pickup_location_uuid', request.pickup_location_uuid);
        }
      }
      if (request.dropoff_location_uuid) {
        if (Array.isArray(request.dropoff_location_uuid)) {
          request.dropoff_location_uuid.forEach((u) => formParams.append('dropoff_location_uuid', u));
        } else {
          formParams.append('dropoff_location_uuid', request.dropoff_location_uuid);
        }
      }
      if (request.end_datetime) {
        formParams.append('end_datetime', request.end_datetime);
      }

      const res = await fetch(AppUrls.backend.tripPriceDetailsCustomer, {
        method: 'POST',
        headers,
        body: formParams.toString(),
      });

      return await res.json();
    } catch {
      return { status: false, message: 'Price calculation failed' };
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
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    const formParams = new URLSearchParams({
      platform: 'web',
      action_when: 'create_rental_trip',
      service_name: payload.service_name,
      customer_uuid: payload.customer_uuid,
      price_set_uuid: payload.price_set_uuid,
      payment_method: payload.payment_method || 'CASH',
      start_datetime: payload.start_datetime,
      country_code: payload.country_code || 'BD',
      offer_ammount: String(payload.offer_ammount ?? (payload as any).offer_amount ?? ''),
      language_code: payload.language_code || 'bn',
    });
    if (payload.end_datetime) formParams.append('end_datetime', payload.end_datetime);
    if (payload.hours_booked) formParams.append('hours_booked', String(payload.hours_booked));
    if (payload.note) formParams.append('note', payload.note);
    if (payload.pickup_location_uuid) {
      payload.pickup_location_uuid.forEach((u) => formParams.append('pickup_location_uuid', u));
    }
    if (payload.dropoff_location_uuid) {
      payload.dropoff_location_uuid.forEach((u) => formParams.append('dropoff_location_uuid', u));
    }

    const res = await fetch(AppUrls.backend.createRentalTrip, {
      method: 'POST',
      headers,
      body: formParams.toString(),
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
      const query = `platform=web&language_code=${languageCode}&customer_uuid=${customerUuid}&trip_status=${tripStatus}&action_when=rental_bid_trip_list_for_customer`;
      const directUrl = `${AppUrls.backend.rentalBidTripListForCustomer}?${query}`;
      const res = await fetch(directUrl, { headers }).catch(() => null);
      if (!res || !res.ok) return [];
      const json = await res.json().catch(() => null);
      if (json && json.status && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch {
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

      const directUrl = `${AppUrls.backend.rentalBidTripSingleForCustomer}?${query.toString()}`;
      const res = await fetch(directUrl, { headers }).catch(() => null);
      if (!res || !res.ok) {
        return { status: false, data: null, message: res ? `HTTP ${res.status}` : 'Request failed' };
      }
      const json = await res.json().catch(() => null);
      if (!json) {
        return { status: false, data: null, message: 'Invalid response' };
      }

      const trip = json.status && json.data ? normalizeRentalTrip(json.data) : null;
      return { status: Boolean(json.status), data: trip, message: json.message };
    } catch {
      return { status: false, data: null, message: 'Request failed' };
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    const formParams = new URLSearchParams({
      platform: 'web',
      language_code: languageCode || 'bn',
      action_when: 'accept_trip_for_customer',
      bid_uuid: bidUuid,
      rent_bid_uuid: bidUuid,
    });
    if (targetCustomerUuid) {
      formParams.append('customer_uuid', targetCustomerUuid);
    }
    if (tripUuid) {
      formParams.append('trip_uuid', tripUuid);
      formParams.append('rental_trip_uuid', tripUuid);
    }

    // Call direct backend base URL (http://3.209.161.158/api/...) - no proxy
    const directUrl = AppUrls.backend.acceptTripForCustomer;
    const res = await fetch(directUrl, {
      method: 'POST',
      headers,
      body: formParams.toString(),
    }).catch(() => null);

    if (!res) {
      return { status: false, message: 'Network request failed' };
    }

    try {
      return await res.json();
    } catch {
      return { status: res.ok, message: `Server responded with HTTP ${res.status}` };
    }
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    const formParams = new URLSearchParams({
      platform: 'web',
      trip_uuid: tripUuid,
      rental_trip_uuid: tripUuid,
      comment,
      language_code: languageCode,
      action_when: 'cancel_trip_driver_or_customer_admin',
    });

    const directUrl = AppUrls.backend.cancelTripDriverOrCustomerAdmin;
    const res = await fetch(directUrl, {
      method: 'POST',
      headers,
      body: formParams.toString(),
    }).catch(() => null);

    if (!res) {
      return { status: false, message: 'Request failed' };
    }
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    const targetCustomerUuid = customerUuid || getActiveCustomerUuid();
    const numAmount = typeof offerAmount === 'string' ? parseFloat(offerAmount) || 0 : offerAmount;

    try {
      const formParams = new URLSearchParams({
        platform: 'web',
        language_code: languageCode,
        action_when: 'update_trip_offer_amount',
        trip_uuid: tripUuid,
        customer_uuid: targetCustomerUuid,
        offer_ammount: String(numAmount),
      });

      const res = await fetch(AppUrls.backend.updateTripOfferAmount, {
        method: 'POST',
        headers,
        body: formParams.toString(),
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    try {
      const formParams = new URLSearchParams({
        platform: 'web',
        language_code: languageCode,
        action_when: 'cancel_rent_bid_driver_or_customer_admin',
        bid_uuid: bidUuid,
        rent_bid_uuid: bidUuid,
        comment: comment || 'cancel_rent_bid_driver_or_customer_admin',
      });

      const res = await fetch(AppUrls.backend.cancelRentBidDriverOrCustomerAdmin, {
        method: 'POST',
        headers,
        body: formParams.toString(),
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    const targetCustomerUuid = params.customerUuid || getActiveCustomerUuid();

    try {
      const formParams = new URLSearchParams({
        platform: 'web',
        action_when: 'give_review',
        language_code: params.languageCode || 'bn',
        customer_uuid: targetCustomerUuid,
        trip_uuid: params.tripUuid,
        driver_uuid: params.driverUuid,
        rating: String(params.rating),
        given_by: params.given_by || 'CUSTOMER',
      });
      if (params.comments) {
        formParams.append('comments', params.comments);
      }

      const res = await fetch(AppUrls.backend.rentalTripGiveReview, {
        method: 'POST',
        headers,
        body: formParams.toString(),
      });

      return await res.json();
    } catch (err: any) {
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
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authToken) {
      headers.Authorization = authToken.startsWith('Bearer ')
        ? authToken
        : `Bearer ${authToken}`;
    }

    try {
      const body = new URLSearchParams({
        platform: 'web',
        language_code: languageCode,
        action_when: 'track_location_get',
        driver_uuid: driverUuid,
      });

      const res = await fetch(AppUrls.backend.customerDriverTrackGet, {
        method: 'POST',
        headers,
        body: body.toString(),
      });

      if (!res.ok) return [];
      const json: DriverTrackingResponse = await res.json().catch(() => null);
      return json && json.status && Array.isArray(json.data) ? json.data : [];
    } catch {
      return [];
    }
  },

  /**
   * Fetches the live chat conversation between a customer and a driver.
   */
  async fetchLiveChatConversation(
    customerUuid: string,
    driverUuid: string,
    languageCode = 'bn',
    token?: string,
    receiverType = 'DRIVER'
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = token || getStoredAuthToken();
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const res = await fetch(AppUrls.backend.liveChatConversation, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          language_code: languageCode,
          action_when: 'live_chat_message_list',
          sender_type: 'CUSTOMER',
          user1_type: 'CUSTOMER',
          user1_uuid: customerUuid,
          user2_type: receiverType,
          user2_uuid: driverUuid,
        }),
      });

      if (!res.ok) return { status: false, message: 'Failed to fetch conversation' };
      return await res.json();
    } catch (e: any) {
      return { status: false, message: e.message || 'Error fetching conversation' };
    }
  },

  /**
   * Sends a live chat message from a customer to a driver.
   */
  async sendLiveChatMessage(
    customerUuid: string,
    driverUuid: string,
    message: string,
    languageCode = 'bn',
    token?: string,
    receiverType = 'DRIVER',
    file?: File
  ): Promise<{ status: boolean; message: string; data?: any }> {
    const authToken = token || getStoredAuthToken();
    try {
      let body: any;
      const headers: Record<string, string> = {};
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      if (file) {
        // Send as FormData for file upload
        const formData = new FormData();
        formData.append('platform', 'web');
        formData.append('language_code', languageCode);
        formData.append('action_when', 'live_chat_message_send');
        formData.append('sender_type', 'CUSTOMER');
        formData.append('sender_uuid', customerUuid);
        formData.append('receiver_type', receiverType);
        formData.append('receiver_uuid', driverUuid);
        formData.append('message', message);
        formData.append('file', file);
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          platform: 'web',
          language_code: languageCode,
          action_when: 'live_chat_message_send',
          sender_type: 'CUSTOMER',
          sender_uuid: customerUuid,
          receiver_type: receiverType,
          receiver_uuid: driverUuid,
          message: message,
          file: '',
        });
      }

      const res = await fetch(AppUrls.backend.liveChatSend, {
        method: 'POST',
        headers,
        body,
      });

      if (!res.ok) return { status: false, message: 'Failed to send message' };
      return await res.json();
    } catch (e: any) {
      return { status: false, message: e.message || 'Error sending message' };
    }
  },
};

