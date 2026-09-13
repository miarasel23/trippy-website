import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import tripTimerReducer from './features/tripTimerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tripTimer: tripTimerReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
