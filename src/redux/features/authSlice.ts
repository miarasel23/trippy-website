import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, SendOtpPayload, VerifyOtpPayload } from '@/types/auth';
import { authApi } from '@/services/authApi';

const TOKEN_KEY = 'tripyy_auth_token';
const USER_KEY = 'tripyy_auth_user';
const LAST_PROMPT_KEY = 'tripyy_last_login_prompt';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isLoginModalOpen: false,
  otpSent: false,
  phoneNumber: '',
  countryCode: 'BD',
  lastPromptTimestamp: 0,
};

// Async Thunk: Send OTP
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (payload: SendOtpPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.sendOtp(payload);
      return { payload, response: res };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to send OTP');
    }
  }
);

// Async Thunk: Verify OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (payload: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.verifyOtp(payload);
      const { user, access_token } = res.data;

      // Persist in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return { user, token: access_token };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Invalid OTP code');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeAuth: (state) => {
      if (typeof window === 'undefined') return;
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const savedUser = localStorage.getItem(USER_KEY);
        const lastPrompt = localStorage.getItem(LAST_PROMPT_KEY);

        if (token && savedUser) {
          state.token = token;
          state.user = JSON.parse(savedUser) as User;
          state.isAuthenticated = true;
        }

        if (lastPrompt) {
          state.lastPromptTimestamp = parseInt(lastPrompt, 10) || 0;
        } else {
          const now = Date.now();
          state.lastPromptTimestamp = now;
          localStorage.setItem(LAST_PROMPT_KEY, now.toString());
        }
      } catch {
        // Ignore localStorage parse errors
      }
    },
    openLoginModal: (state, action: PayloadAction<string | undefined>) => {
      state.isLoginModalOpen = true;
      state.error = null;
      if (action.payload) {
        state.phoneNumber = action.payload;
      }
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
      state.error = null;
      // Record prompt timestamp when closed so 20m timer starts from dismissal
      const now = Date.now();
      state.lastPromptTimestamp = now;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_PROMPT_KEY, now.toString());
      }
    },
    resetOtpStep: (state) => {
      state.otpSent = false;
      state.error = null;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.phoneNumber = action.payload;
    },
    setCountryCode: (state, action: PayloadAction<string>) => {
      state.countryCode = action.payload;
    },
    setLastPromptTimestamp: (state, action: PayloadAction<number>) => {
      state.lastPromptTimestamp = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LAST_PROMPT_KEY, action.payload.toString());
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.phoneNumber = '';
      state.error = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // Reset prompt timestamp on logout
        const now = Date.now();
        state.lastPromptTimestamp = now;
        localStorage.setItem(LAST_PROMPT_KEY, now.toString());
      }
    },
  },
  extraReducers: (builder) => {
    // sendOtp
    builder.addCase(sendOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpSent = true;
      state.phoneNumber = action.payload.payload.phone_number;
      state.countryCode = action.payload.payload.country_code || 'BD';
      state.error = null;
    });
    builder.addCase(sendOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Failed to send OTP';
    });

    // verifyOtp
    builder.addCase(verifyOtp.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyOtp.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoginModalOpen = false;
      state.otpSent = false;
      state.error = null;
    });
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Invalid OTP code';
    });
  },
});

export const {
  initializeAuth,
  openLoginModal,
  closeLoginModal,
  resetOtpStep,
  setPhoneNumber,
  setCountryCode,
  setLastPromptTimestamp,
  clearError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
