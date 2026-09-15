'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  initializeAuth,
  openLoginModal,
  setLastPromptTimestamp,
} from '@/redux/features/authSlice';

// 20 minutes in milliseconds
const TWENTY_MINUTES_MS = 20 * 60 * 1000;
const LAST_PROMPT_KEY = 'trippy_last_login_prompt';

export const AuthPromptManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoginModalOpen, lastPromptTimestamp } = useAppSelector(
    (state) => state.auth
  );

  // Initialize auth from localStorage on mount
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Recurring 20-minute check for unauthenticated users
  useEffect(() => {
    if (isAuthenticated) return;

    // Check interval every 15 seconds
    const interval = setInterval(() => {
      if (isAuthenticated || isLoginModalOpen) return;

      const now = Date.now();
      let promptTime = lastPromptTimestamp;

      if (!promptTime && typeof window !== 'undefined') {
        const stored = localStorage.getItem(LAST_PROMPT_KEY) || localStorage.getItem('tripyy_last_login_prompt');
        if (stored) {
          promptTime = parseInt(stored, 10) || 0;
        }
      }

      if (!promptTime) {
        // First session initiation - set baseline timestamp
        dispatch(setLastPromptTimestamp(now));
        return;
      }

      // If 20 minutes elapsed since last prompt, open login modal
      if (now - promptTime >= TWENTY_MINUTES_MS) {
        dispatch(openLoginModal());
        dispatch(setLastPromptTimestamp(now));
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoginModalOpen, lastPromptTimestamp, dispatch]);

  return null;
};
