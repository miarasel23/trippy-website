/**
 * Centralized API Endpoints and Base Path Configuration
 * Maintained centrally for the entire Trippy web application.
 */

export const API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://3.209.161.158/api';

export const IMAGE_BASE_URL = `${API_BASE_URL}/assets/uploads/images`;
export const CHAT_IMAGE_BASE_URL = `${API_BASE_URL}/`;

export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  'AIzaSyAYf-MPMgwHhXT2h-kKSchXFH5GiwuURcw';

/**
 * All Application API Endpoints
 * Provides both client proxy routes and backend target endpoints.
 */
export const AppUrls = {
  baseUrl: API_BASE_URL,
  imageBaseUrl: IMAGE_BASE_URL,
  googleApiKey: GOOGLE_MAPS_API_KEY,

  // Client Proxy Endpoints (used by browser client services to avoid CORS)
  proxy: {
    sendOtp: '/api/auth/send-otp',
    verifyOtp: '/api/auth/verify-otp',
    searchLocation: '/api/v1/global-api/search-location',
    rentalInfo: '/api/v1/rental-trip/rental-info',
    tripPriceDetails: '/api/v1/rental-trip/trip-price-details-customer',
    createRentalTrip: '/api/v1/rental-trip/create-rental-trip',
    rentalBids: '/api/v1/rental-trip/rental-bid-trip-list_for_customer',
    rentalBidTripSingle: '/api/v1/rental-trip/rental-bid-trip-single_for_customer',
    acceptTrip: '/api/v1/rental-trip/accept_trip_for_customer',
    cancelTrip: '/api/v1/rental-trip/cancel-trip-driver-or-customer-admin',
    cancelRentBid: '/api/v1/rental-trip/cancel-rent-bid-driver-or-customer-admin',
    updateTripOfferAmount: '/api/v1/rental-trip/update-trip-offer-amount',
    driverLocation: '/api/tracking/driver-location',
    customerProfile: '/api/customer/profile',
    customerLocations: '/api/customer/locations',
    giveReview: '/api/customer/review',
    privacyPolicyTermsCondition: '/api/v1/global-api/privacy-policy-terms-condition/list',
    liveChatSend: '/api/v1/live-chat/send',
    liveChatConversation: '/api/v1/live-chat/conversation',
  },

  // Direct Backend API Endpoints (used by Next.js server route handlers / reverse proxies)
  backend: {
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
  },
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
