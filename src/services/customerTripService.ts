import {
  LocationSearchResult,
  SearchLocationResponse,
  RentalInfoResponse,
  ServiceCategory,
  TripPriceDetailsRequest,
  CreateRentalTripPayload,
  RentalTrip,
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
        customer_uuid: customerUuid,
        bid_uuid: bidUuid,
        rent_bid_uuid: bidUuid,
        trip_uuid: tripUuid,
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
   */
  async updateOfferAmount(
    customerUuid: string,
    tripUuid: string,
    offerAmount: number | string,
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

    try {
      const res = await fetch(AppUrls.proxy.updateTripOfferAmount, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: 'web',
          customer_uuid: customerUuid,
          trip_uuid: tripUuid,
          offer_ammount: typeof offerAmount === 'string' ? parseFloat(offerAmount) || 0 : offerAmount,
          language_code: languageCode,
          action_when: 'update_trip_offer_amount',
        }),
      });

      return await res.json();
    } catch (err: any) {
      return { status: false, message: err?.message || 'Failed to update offer amount' };
    }
  },

  /**
   * Declines / cancels a driver's bid
   */
  async cancelRentBid(
    bidUuid: string,
    comment = 'system decline',
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
          comment: comment || 'system decline',
        }),
      });

      return await res.json();
    } catch (err: any) {
      return { status: false, message: err?.message || 'Failed to decline bid' };
    }
  },
};

