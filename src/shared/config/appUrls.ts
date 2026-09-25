/**
 * Centralized API Endpoints and Base Path Configuration
 * Maintained centrally for the entire Trippy web application.
 */

// development
// export const API_BASE_URL =
//   process.env.BACKEND_API_BASE_URL ||
//   process.env.NEXT_PUBLIC_API_BASE_URL ||
//   'http://3.209.161.158/api';

// production


export const API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://apitrippy.online';

/**
 * Socket.IO Real-time WebSockets Endpoint Resolution
 * Automatically resolves the proper host and path based on environment or API URL.
 */
function resolveSocketUrl(): string {
  // If explicitly provided via environment and non-empty, use that URL
  if (
    typeof process.env.NEXT_PUBLIC_SOCKET_URL === 'string' &&
    process.env.NEXT_PUBLIC_SOCKET_URL.trim() !== ''
  ) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.trim();
  }
  const base = API_BASE_URL || 'https://apitrippy.online';
  return base.endsWith('/api') ? base.slice(0, -4) : base;
}

function resolveSocketPath(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_PATH) {
    return process.env.NEXT_PUBLIC_SOCKET_PATH;
  }
  return API_BASE_URL.includes('/api') ? '/api/socket.io' : '/socket.io';
}

export const SOCKET_URL = resolveSocketUrl();
export const SOCKET_PATH = resolveSocketPath();

export const SocketEvents = {
  // Client emitting events
  JOIN_TRIP: 'join_trip',
  LEAVE_TRIP: 'leave_trip',
  JOIN_USER: 'join_user',
  LEAVE_USER: 'leave_user',
  PING: 'ping',

  // Server emitted events
  RENTAL_BID_TRIP_SINGLE: 'rental_bid_trip_single_for_customer',
  TRIP_UPDATED: 'trip_updated',
  JOINED_TRIP: 'joined_trip',
  LEFT_TRIP: 'left_trip',
  JOINED_USER: 'joined_user',
  LEFT_USER: 'left_user',
  PONG: 'pong',
} as const;

export const IMAGE_BASE_URL = `${API_BASE_URL}/assets/uploads/images`;
export const CHAT_IMAGE_BASE_URL = `${API_BASE_URL}/`;

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAYf-MPMgwHhXT2h-kKSchXFH5GiwuURcw';

/**
 * All Application API Endpoints
 * All endpoints direct straight to the backend without any proxy.
 */
const backendEndpoints = {
  sendOtpCustomer: `${API_BASE_URL}/v1/customer/send-otp-for-signup-or-login`,
  verifyOtpCustomer: `${API_BASE_URL}/v1/customer/otp-verification-with-login`,
  getCurrentCustomerUser: `${API_BASE_URL}/v1/customer/get-current-customer-user`,
  customerProfileUpdate: `${API_BASE_URL}/v1/customer/profile-update`,
  customerProfilePictureUpdate: `${API_BASE_URL}/v1/customer/customer-profile-picture-update`,
  rentalInfo: `${API_BASE_URL}/v1/rental-trip/rental-info`,
  searchLocation: `${API_BASE_URL}/v1/global-api/search-location`,
  getCustomerLocations: `${API_BASE_URL}/v1/customer/get-locations`,
  saveCustomerLocation: `${API_BASE_URL}/v1/customer/save-location`,
  deleteCustomerLocation: `${API_BASE_URL}/v1/customer/delete-location`,
  tripPriceDetailsCustomer: `${API_BASE_URL}/v1/rental-trip/trip-price-details-customer`,
  createRentalTrip: `${API_BASE_URL}/v1/rental-trip/create-rental-trip`,
  rentalBidTripListForCustomer: `${API_BASE_URL}/v1/rental-trip/rental-bid-trip-list_for_customer`,
  rentalBidTripSingleForCustomer: `${API_BASE_URL}/v1/rental-trip/rental-bid-trip-single_for_customer`,
  acceptTripForCustomer: `${API_BASE_URL}/v1/rental-trip/accept_trip_for_customer`,
  cancelTripDriverOrCustomerAdmin: `${API_BASE_URL}/v1/rental-trip/cancel-trip-driver-or-customer-admin`,
  cancelRentBidDriverOrCustomerAdmin: `${API_BASE_URL}/v1/rental-trip/cancel-rent-bid-driver-or-customer-admin`,
  updateTripOfferAmount: `${API_BASE_URL}/v1/rental-trip/update-trip-offer-amount`,
  rentalTripGiveReview: `${API_BASE_URL}/v1/rental-trip/give-review`,
  customerDriverTrackGet: `${API_BASE_URL}/v1/customer-driver-track/get`,
  saveCustomerDriverTrack: `${API_BASE_URL}/v1/customer-driver-track/create`,
  privacyPolicyTermsCondition: `${API_BASE_URL}/v1/global-api/privacy-policy-terms-condition/list`,
  liveChatSend: `${API_BASE_URL}/v1/live-chat/send`,
  liveChatConversation: `${API_BASE_URL}/v1/live-chat/conversation`,
};

export const AppUrls = {
  baseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL,
  socketPath: SOCKET_PATH,
  imageBaseUrl: IMAGE_BASE_URL,
  googleApiKey: GOOGLE_MAPS_API_KEY,

  ...backendEndpoints,
  backend: backendEndpoints,
};

/**
 * Resolves full CDN/backend image URL for a given relative avatar or filename.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path || path.trim() === '') return '/images/car-placeholder.png';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `${IMAGE_BASE_URL}/${path}`;
}

export default AppUrls;
