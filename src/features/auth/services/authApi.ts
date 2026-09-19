import {
  SendOtpPayload,
  VerifyOtpPayload,
  AuthResponse,
  SendOtpSuccessData,
  LoginSuccessData,
} from '@/features/auth/types/auth';
import { AppUrls, API_BASE_URL } from '@/shared/config/appUrls';

export { API_BASE_URL };

export const ENDPOINTS = {
  SEND_OTP: AppUrls.backend.sendOtpCustomer,
  VERIFY_OTP: AppUrls.backend.verifyOtpCustomer,
  PROXY_SEND_OTP: AppUrls.proxy.sendOtp,
  PROXY_VERIFY_OTP: AppUrls.proxy.verifyOtp,
};

/**
 * Send OTP for Login or Signup
 * Calls Next.js API proxy to prevent browser Mixed-Content / CORS issues
 * and guarantees FormData formatting to the backend.
 */
export async function sendOtpApi(
  payload: SendOtpPayload
): Promise<AuthResponse<SendOtpSuccessData>> {
  const response = await fetch(AppUrls.proxy.sendOtp, {

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
