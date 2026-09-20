import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, AppUrls } from '@/shared/config/appUrls';

const BACKEND_URL = API_BASE_URL;

/**
 * Maps incoming path segments to the corresponding backend endpoint.
 */
function resolveBackendUrl(pathSegments: string[], reqMethod: string): string {
  const fullPath = pathSegments.join('/');

  // Direct /v1/... endpoints
  if (pathSegments[0] === 'v1') {
    return `${BACKEND_URL}/${fullPath}`;
  }

  // Friendly aliases
  switch (fullPath) {
    case 'locations/search':
      return AppUrls.backend.searchLocation;
    case 'rental/info':
      return AppUrls.backend.rentalInfo;
    case 'rental/price-details':
      return AppUrls.backend.tripPriceDetailsCustomer;
    case 'rental/create-trip':
      return AppUrls.backend.createRentalTrip;
    case 'rental/bids':
      return AppUrls.backend.rentalBidTripListForCustomer;
    case 'rental/single-bid':
      return AppUrls.backend.rentalBidTripSingleForCustomer;
    case 'rental/accept-bid':
      return AppUrls.backend.acceptTripForCustomer;
    case 'rental/cancel-trip':
      return AppUrls.backend.cancelTripDriverOrCustomerAdmin;
    case 'rental/cancel-bid':
      return AppUrls.backend.cancelRentBidDriverOrCustomerAdmin;
    case 'rental/update-offer':
      return AppUrls.backend.updateTripOfferAmount;
    case 'tracking/driver-location':
      return AppUrls.backend.customerDriverTrackGet;
    case 'customer/profile':
      return reqMethod === 'GET'
        ? AppUrls.backend.getCurrentCustomerUser
        : AppUrls.backend.customerProfileUpdate;
    case 'customer/locations':
      return reqMethod === 'GET'
        ? AppUrls.backend.getCustomerLocations
        : AppUrls.backend.saveCustomerLocation;
    case 'customer/review':
      return AppUrls.backend.rentalTripGiveReview;
    default:
      return `${BACKEND_URL}/${fullPath}`;
  }
}

function getDefaultActionWhen(pathStr: string): string {
  if (pathStr.includes('search-location') || pathStr.includes('locations/search')) {
    return 'search_locations';
  }
  if (pathStr.includes('rental-info') || pathStr.includes('rental/info')) {
    return 'admin_login';
  }
  if (pathStr.includes('trip-price-details') || pathStr.includes('price-details')) {
    return 'trip_details_customer_admin';
  }
  if (pathStr.includes('create-rental-trip') || pathStr.includes('create-trip')) {
    return 'create_rental_trip';
  }
  if (pathStr.includes('rental-bid-trip-single') || pathStr.includes('rental/single-bid')) {
    return 'rental_bid_trip_single_for_customer';
  }
  if (pathStr.includes('rental-bid-trip-list') || pathStr.includes('rental/bids')) {
    return 'rental_bid_trip_list_for_customer';
  }
  if (pathStr.includes('accept_trip') || pathStr.includes('accept-bid')) {
    return 'accept_trip_for_customer';
  }
  if (pathStr.includes('cancel-trip')) {
    return 'cancel_trip_driver_or_customer_admin';
  }
  if (pathStr.includes('cancel-rent-bid') || pathStr.includes('cancel-bid')) {
    return 'cancel_rent_bid_driver_or_customer_admin';
  }
  if (pathStr.includes('update-trip-offer') || pathStr.includes('update-offer')) {
    return 'update_trip_offer_amount';
  }
  if (pathStr.includes('customer-driver-track') || pathStr.includes('driver-location')) {
    return 'track_location_get';
  }
  if (pathStr.includes('give-review') || pathStr.includes('customer/review')) {
    return 'give_review';
  }
  if (pathStr.includes('privacy-policy') || pathStr.includes('terms-condition')) {
    return 'privacy_policy_terms_condition';
  }
  return 'admin_login';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = (await params) || ({} as any);
    const pathSegments = resolvedParams.path || [];
    const targetUrl = new URL(resolveBackendUrl(pathSegments, 'GET'));
    const fullPathStr = pathSegments.join('/');

    // Forward and enrich query params (always enforce platform=web)
    const reqUrl = new URL(req.url);
    reqUrl.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });
    targetUrl.searchParams.set('platform', 'web');

    if (!targetUrl.searchParams.has('language_code')) {
      targetUrl.searchParams.set('language_code', 'bn');
    }
    if (!targetUrl.searchParams.has('country_code')) {
      const activeLang = targetUrl.searchParams.get('language_code');
      targetUrl.searchParams.set('country_code', activeLang === 'en' ? 'GB' : 'BD');
    }
    if (!targetUrl.searchParams.has('action_when')) {
      targetUrl.searchParams.set('action_when', getDefaultActionWhen(fullPathStr));
    }

    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        status: response.ok,
        message: text || `Backend responded with HTTP ${response.status}`,
        data: null,
      };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: error?.message || 'Proxy GET request failed',
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = (await params) || ({} as any);
    const pathSegments = resolvedParams.path || [];
    const targetUrl = resolveBackendUrl(pathSegments, 'POST');
    const fullPathStr = pathSegments.join('/');

    // Parse incoming payload
    let bodyObj: Record<string, any> = {};
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (contentType.includes('application/json')) {
      bodyObj = await req.json().catch(() => ({}));
    } else if (contentType.includes('application/x-www-form-urlencoded') || isMultipart) {
      const formData = await req.formData();
      formData.forEach((val, key) => {
        bodyObj[key] = val;
      });
    }

    // Always enforce platform=web
    bodyObj.platform = 'web';
    if (!bodyObj.language_code) {
      bodyObj.language_code = 'bn';
    }
    if (!bodyObj.action_when) {
      bodyObj.action_when = getDefaultActionWhen(fullPathStr);
    }

    // Backend compatibility aliases
    if (bodyObj.search_location === undefined && bodyObj.input) {
      bodyObj.search_location = bodyObj.input;
    }
    if (bodyObj.serviceType && !bodyObj.servive_type) {
      bodyObj.servive_type = bodyObj.serviceType;
    }
    if (bodyObj.service_name && !bodyObj.servive_type) {
      bodyObj.servive_type = bodyObj.service_name;
    }
    if (bodyObj.serviceType && !bodyObj.service_name) {
      bodyObj.service_name = bodyObj.serviceType;
    }
    if (bodyObj.offerAmount !== undefined && bodyObj.offer_ammount === undefined) {
      bodyObj.offer_ammount = bodyObj.offerAmount;
    }
    if (bodyObj.offer_amount !== undefined && bodyObj.offer_ammount === undefined) {
      bodyObj.offer_ammount = bodyObj.offer_amount;
    }
    if (bodyObj.offer_ammount !== undefined && bodyObj.offer_amount === undefined) {
      bodyObj.offer_amount = bodyObj.offer_ammount;
    }
    if (bodyObj.trip_uuid && !bodyObj.rental_trip_uuid) {
      bodyObj.rental_trip_uuid = bodyObj.trip_uuid;
    }
    if (bodyObj.rental_trip_uuid && !bodyObj.trip_uuid) {
      bodyObj.trip_uuid = bodyObj.rental_trip_uuid;
    }
    if (bodyObj.bid_uuid && !bodyObj.rent_bid_uuid) {
      bodyObj.rent_bid_uuid = bodyObj.bid_uuid;
    }
    if (bodyObj.rent_bid_uuid && !bodyObj.bid_uuid) {
      bodyObj.bid_uuid = bodyObj.rent_bid_uuid;
    }
    if (bodyObj.driverUuid && !bodyObj.driver_uuid) {
      bodyObj.driver_uuid = bodyObj.driverUuid;
    }
    if (bodyObj.driver_id && !bodyObj.driver_uuid) {
      bodyObj.driver_uuid = bodyObj.driver_id;
    }
    if (
      (fullPathStr.includes('give-review') || fullPathStr.includes('customer/review')) &&
      !bodyObj.given_by
    ) {
      bodyObj.given_by = 'CUSTOMER';
    }

    let finalBody: any;
    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
    };

    if (isMultipart) {
      const form = new FormData();
      for (const [key, val] of Object.entries(bodyObj)) {
        if (val === undefined || val === null) continue;
        form.append(key, val as any);
      }
      finalBody = form;
      // Do NOT set Content-Type header for multipart/form-data, fetch sets it with boundary automatically
    } else {
      // Format into URLSearchParams as required by the backend API
      const formParams = new URLSearchParams();
      for (const [key, val] of Object.entries(bodyObj)) {
        if (val === undefined || val === null) continue;
        if (Array.isArray(val)) {
          // Send arrays as repeated params: key=val1&key=val2
          // For single-element arrays (common for location UUIDs), send the value directly
          if (val.length === 1) {
            formParams.append(key, String(val[0]));
          } else {
            for (const item of val) {
              formParams.append(key, String(item));
            }
          }
        } else if (typeof val === 'object' && val !== null && !(val instanceof File) && !(val instanceof Blob)) {
          formParams.append(key, JSON.stringify(val));
        } else {
          formParams.append(key, String(val));
        }
      }
      finalBody = formParams.toString();
      requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      requestHeaders.Authorization = authHeader;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: finalBody,
    });

    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        status: response.ok,
        message: text || `Backend responded with HTTP ${response.status}`,
        data: null,
      };
    }
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: false,
        message: error?.message || 'Proxy POST request failed',
        data: null,
      },
      { status: 500 }
    );
  }
}
