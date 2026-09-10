import {
  SendOtpPayload,
  VerifyOtpPayload,
  AuthResponse,
  SendOtpSuccessData,
  LoginSuccessData,
} from '@/types/auth';

export const API_BASE_URL = 'http://3.209.161.158/api';

export const ENDPOINTS = {
  SEND_OTP: '/v1/customer/send-otp-for-signup-or-login',
  VERIFY_OTP: '/v1/customer/otp-verification-with-login',
  PROXY_SEND_OTP: '/api/auth/send-otp',
  PROXY_VERIFY_OTP: '/api/auth/verify-otp',
};

/**
 * Send OTP for Login or Signup
 * Calls Next.js API proxy to prevent browser Mixed-Content / CORS issues
 * and guarantees FormData formatting to the backend.
 */
export async function sendOtpApi(
  payload: SendOtpPayload
): Promise<AuthResponse<SendOtpSuccessData>> {
  const response = await fetch(ENDPOINTS.PROXY_SEND_OTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform: payload.platform || 'web',
      language_code: payload.language_code || 'en',
      action_when: payload.action_when || 'admin_login',
      phone_number: payload.phone_number,
      country_code: payload.country_code || 'BD',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Failed to send OTP. Please try again.');
  }

  return data;
}

/**
 * Verify OTP with Login
 * Submits OTP and credentials, returns user profile and access_token.
 */
export async function verifyOtpApi(
  payload: VerifyOtpPayload
): Promise<AuthResponse<LoginSuccessData>> {
  const response = await fetch(ENDPOINTS.PROXY_VERIFY_OTP, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      platform: payload.platform || 'web',
      language_code: payload.language_code || 'en',
      action_when: payload.action_when || 'admin_login',
      phone_number: payload.phone_number,
      country_code: payload.country_code || 'BD',
      otp: payload.otp,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message || 'Invalid or expired OTP. Please try again.');
  }

  return data;
}

export const authApi = {
  sendOtp: sendOtpApi,
  verifyOtp: verifyOtpApi,
};

export default authApi;
