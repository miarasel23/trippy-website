import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://3.209.161.158/api';

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
      return `${BACKEND_URL}/v1/global-api/search-location`;
    case 'rental/info':
      return `${BACKEND_URL}/v1/rental-trip/rental-info`;
    case 'rental/price-details':
      return `${BACKEND_URL}/v1/rental-trip/trip-price-details-customer`;
    case 'rental/create-trip':
      return `${BACKEND_URL}/v1/rental-trip/create-rental-trip`;
    case 'rental/bids':
      return `${BACKEND_URL}/v1/rental-trip/rental-bid-trip-list_for_customer`;
    case 'rental/accept-bid':
      return `${BACKEND_URL}/v1/rental-trip/accept_trip_for_customer`;
    case 'rental/cancel-trip':
      return `${BACKEND_URL}/v1/rental-trip/cancel-trip-driver-or-customer-admin`;
    case 'rental/cancel-bid':
      return `${BACKEND_URL}/v1/rental-trip/cancel-rent-bid-driver-or-customer-admin`;
    case 'rental/update-offer':
      return `${BACKEND_URL}/v1/rental-trip/update-trip-offer-amount`;
    case 'tracking/driver-location':
      return `${BACKEND_URL}/v1/customer-driver-track/get`;
    case 'customer/profile':
      return reqMethod === 'GET'
        ? `${BACKEND_URL}/v1/customer/get-current-customer-user`
        : `${BACKEND_URL}/v1/customer/profile-update`;
    case 'customer/locations':
      return reqMethod === 'GET'
        ? `${BACKEND_URL}/v1/customer/get-locations`
        : `${BACKEND_URL}/v1/customer/save-location`;
    case 'customer/review':
      return `${BACKEND_URL}/v1/rental-trip/give-review`;
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
  return 'admin_login';
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
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

    const data = await response.json();
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
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const targetUrl = resolveBackendUrl(pathSegments, 'POST');
    const fullPathStr = pathSegments.join('/');

    // Parse incoming payload
    let bodyObj: Record<string, any> = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      bodyObj = await req.json().catch(() => ({}));
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
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

    // Format into URLSearchParams as required by the backend API
    const formParams = new URLSearchParams();
    for (const [key, val] of Object.entries(bodyObj)) {
      if (val === undefined || val === null) continue;
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        formParams.append(key, JSON.stringify(val));
      } else {
        formParams.append(key, String(val));
      }
    }

    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: formParams.toString(),
    });

    const data = await response.json();
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
