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
};

/**
 * Send OTP for Login or Signup
 * Calls direct backend API using URLSearchParams (form-urlencoded).
 */
export async function sendOtpApi(
  payload: SendOtpPayload
): Promise<AuthResponse<SendOtpSuccessData>> {
  const formParams = new URLSearchParams({
    platform: payload.platform || 'web',
    language_code: payload.language_code || 'en',
    action_when: payload.action_when || 'admin_login',
    phone_number: payload.phone_number,
    country_code: payload.country_code || 'BD',
  });

  const response = await fetch(AppUrls.backend.sendOtpCustomer, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formParams.toString(),
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
  const formParams = new URLSearchParams({
    platform: payload.platform || 'web',
    language_code: payload.language_code || 'en',
    action_when: payload.action_when || 'admin_login',
    phone_number: payload.phone_number,
    country_code: payload.country_code || 'BD',
    otp: payload.otp,
  });

  const response = await fetch(AppUrls.backend.verifyOtpCustomer, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formParams.toString(),
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
