export interface UserRole {
  uuid: string;
  name: string;
  description: string;
}

export interface UserPermission {
  uuid: string;
  name: string;
  code: string;
}

export interface User {
  uuid: string;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture?: string;
  is_active: boolean;
  role: UserRole;
  permissions: UserPermission[];
}

export interface SendOtpPayload {
  platform?: string;
  language_code?: string;
  action_when?: string;
  phone_number: string;
  country_code?: string;
}

export interface VerifyOtpPayload {
  platform?: string;
  language_code?: string;
  action_when?: string;
  phone_number: string;
  country_code?: string;
  otp: string;
}

export interface AuthResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

export interface LoginSuccessData {
  user: User;
  access_token: string;
  token_type: string;
}

export interface SendOtpSuccessData {
  phone_number: string;
  sms_response?: {
    request_type: string;
    campaign_uid: string;
    sms_uid: string;
    invalid_numbers: string[];
    api_response_code: number;
    api_response_message: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isLoginModalOpen: boolean;
  otpSent: boolean;
  phoneNumber: string;
  countryCode: string;
  lastPromptTimestamp: number;
}
