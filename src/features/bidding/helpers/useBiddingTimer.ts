'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  setTripCreatedAtOnce,
} from '@/features/trips/store/tripTimerSlice';
import {
  formatTripServiceType,
  parseAsiaBangladeshTimestamp,
} from '@/shared/utils/serviceFormat';
import {
  getPersistedCreatedAt,
  persistCreatedAt,
  toBanglaDigits,
} from './biddingFormatters';

export interface UseBiddingTimerParams {
  serviceName?: string;
  hoursBooked?: string | number;
  effectiveTripUuid?: string;
  initialCreatedAt?: string;
  activeTripCreatedAt?: string;
  isBn: boolean;
}

export interface UseBiddingTimerReturn {
  maxTimerSeconds: number;
  remainingSeconds: number;
  topProgressPct: number;
  isTimerExpired: boolean;
  hasPromptedExpired: boolean;
  setHasPromptedExpired: (val: boolean) => void;
  tripCreatedAt?: string;
  setTripCreatedAt: (val?: string) => void;
  effectiveCreatedAt?: string;
  formatCountdown: () => string;
  restartCountdown: () => void;
  resetCountdownFromCreatedAt: (createdAtStr: string) => void;
}

/**
 * Custom hook to manage the live bidding countdown timer.
 *
 * Key Design Principles:
 * 1. Single Source of Truth: Anchors countdown to Bangladesh Standard Time (Asia/Dhaka).
 * 2. Timer Lock (timerLockedRef): Once started, HTTP API polling responses are prevented
 *    from resetting the countdown clock.
 * 3. Graceful Expiration: Smoothly transitions progress percentage without visual glitches.
 */
export function useBiddingTimer({
  serviceName,
  hoursBooked,
  effectiveTripUuid,
  initialCreatedAt,
  activeTripCreatedAt,
  isBn,
}: UseBiddingTimerParams): UseBiddingTimerReturn {
  const dispatch = useAppDispatch();

  // Resolve service type & countdown duration:
  // Ride Share: 2 minutes (120 seconds) | Rental / Intercity: 1 hour (3600 seconds)
  const serviceInfo = formatTripServiceType(serviceName, hoursBooked);
  const maxTimerSecondsRaw = serviceInfo.isRideShare ? 2 * 60 : 3600;

  // Retrieve immutable trip creation time from Redux store
  const reduxCreatedAt = useAppSelector((state) => {
    const map = (state as any).tripTimer?.createdAtByTripUuid ?? {};
    return effectiveTripUuid ? (map[effectiveTripUuid] as string | undefined) : undefined;
  });

  const [tripCreatedAt, setTripCreatedAt] = useState<string | undefined>(
    reduxCreatedAt || activeTripCreatedAt || initialCreatedAt
  );

  // Sync with active trip created_at when context updates from server
  useEffect(() => {
    if (activeTripCreatedAt && effectiveTripUuid) {
      dispatch(setTripCreatedAtOnce({ tripUuid: effectiveTripUuid, createdAt: activeTripCreatedAt }));
      if (!tripCreatedAt) {
        setTripCreatedAt(activeTripCreatedAt);
      }
    } else if (!tripCreatedAt && initialCreatedAt) {
      setTripCreatedAt(initialCreatedAt);
    }
  }, [activeTripCreatedAt, effectiveTripUuid, initialCreatedAt, dispatch, tripCreatedAt]);

  const effectiveTripKey = effectiveTripUuid || '';
  const effectiveCreatedAt =
    reduxCreatedAt ||
    tripCreatedAt ||
    activeTripCreatedAt ||
    initialCreatedAt ||
    getPersistedCreatedAt(effectiveTripKey);

  // Persist effectiveCreatedAt in storage whenever available
  useEffect(() => {
    if (effectiveCreatedAt && effectiveTripKey) {
      persistCreatedAt(effectiveTripKey, effectiveCreatedAt);
    }
  }, [effectiveCreatedAt, effectiveTripKey]);

  const tripKeyRef = useRef<string>('');
  const startTsRef = useRef<number>(0);
  const timerLockedRef = useRef<boolean>(false);
  const maxTimerSecondsRef = useRef<number>(maxTimerSecondsRaw);

  if (maxTimerSecondsRef.current !== maxTimerSecondsRaw && !timerLockedRef.current) {
    maxTimerSecondsRef.current = maxTimerSecondsRaw;
  }
  const maxTimerSeconds = maxTimerSecondsRef.current;

  // Safe start timestamp computation: calculates true elapsed time in Asia/Dhaka
  const computeSafeStartTs = useCallback(
    (dateStr?: string | null): number => {
      if (!dateStr) {
        const persisted = getPersistedCreatedAt(effectiveTripKey);
        if (persisted) {
          const rawTs = parseAsiaBangladeshTimestamp(persisted);
          return Math.min(Date.now(), rawTs);
        }
        return startTsRef.current && startTsRef.current < Date.now()
          ? startTsRef.current
          : Date.now();
      }
      const rawTs = parseAsiaBangladeshTimestamp(dateStr);
      return Math.min(Date.now(), rawTs);
    },
    [effectiveTripKey]
  );

  const [, setCycleStartTs] = useState<number>(() => {
    const initialTs = computeSafeStartTs(effectiveCreatedAt);
    startTsRef.current = initialTs;
    if (initialTs < Date.now()) {
      timerLockedRef.current = true;
    }
    return initialTs;
  });

  // Initialize start timestamp ONCE (only when timer is not yet locked)
  if (!tripKeyRef.current || (effectiveTripKey && tripKeyRef.current !== effectiveTripKey)) {
    tripKeyRef.current = effectiveTripKey;
    if (!timerLockedRef.current) {
      const safeTs = computeSafeStartTs(effectiveCreatedAt);
      if (safeTs < Date.now() || !startTsRef.current) {
        startTsRef.current = safeTs;
        timerLockedRef.current = true;
      }
    }
  } else if (!timerLockedRef.current && effectiveCreatedAt) {
    const safeTs = computeSafeStartTs(effectiveCreatedAt);
    if (safeTs < Date.now() && safeTs !== startTsRef.current) {
      startTsRef.current = safeTs;
      timerLockedRef.current = true;
    }
  }

  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [hasPromptedExpired, setHasPromptedExpired] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const now = Date.now();
    const start = computeSafeStartTs(effectiveCreatedAt);
    const elapsedSecs = Math.max(0, Math.floor((now - start) / 1000));
    return Math.max(0, maxTimerSeconds - elapsedSecs);
  });

  const [topProgressPct, setTopProgressPct] = useState<number>(() => {
    const now = Date.now();
    const start = computeSafeStartTs(effectiveCreatedAt);
    const elapsedMs = Math.max(0, now - start);
    return Math.min(100, Math.max(0, (elapsedMs / (maxTimerSeconds * 1000)) * 100));
  });

  /**
   * Restarts the countdown session from the current moment
   */
  const restartCountdown = useCallback(() => {
    const now = Date.now();
    startTsRef.current = now;
    timerLockedRef.current = true;
    setCycleStartTs(now);
    setRemainingSeconds(maxTimerSeconds);
    setTopProgressPct(0);
    setIsTimerExpired(false);
    setHasPromptedExpired(false);
  }, [maxTimerSeconds]);

  /**
   * Resets countdown anchored to a specific created_at timestamp string
   * (e.g. after raise-offer API call creates a new trip with a new created_at)
   */
  const resetCountdownFromCreatedAt = useCallback((createdAtStr: string) => {
    const parsed = parseAsiaBangladeshTimestamp(createdAtStr);
    const now = Date.now();
    const maxSecs = maxTimerSecondsRef.current;
    const elapsedMs = Math.max(0, now - parsed);
    const elapsedSecs = Math.floor(elapsedMs / 1000);
    const remaining = Math.max(0, maxSecs - elapsedSecs);
    const pct = Math.min(100, Math.max(0, (elapsedMs / (maxSecs * 1000)) * 100));

    timerLockedRef.current = false;
    startTsRef.current = parsed;
    timerLockedRef.current = true;
    setCycleStartTs(parsed);
    setRemainingSeconds(remaining);
    setTopProgressPct(pct);
    setIsTimerExpired(remaining <= 0);
    setHasPromptedExpired(false);
  }, []);

  // Smooth 1-second countdown interval
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      const maxSecs = maxTimerSecondsRef.current;
      const elapsedMs = Math.max(0, now - startTsRef.current);
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const remSecs = Math.max(0, maxSecs - elapsedSecs);
      const totalMs = maxSecs * 1000;
      const pct = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));

      setRemainingSeconds(remSecs);
      setTopProgressPct(pct);
      setIsTimerExpired(remSecs <= 0);
    };

    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Formats countdown remaining time as HH:MM:SS or MM:SS
   */
  const formatCountdown = useCallback((): string => {
    const maxSecs = maxTimerSecondsRef.current;
    const showHours = maxSecs >= 3600;
    if (remainingSeconds <= 0) {
      const zeroStr = showHours ? '00:00:00' : '00:00';
      return isBn ? toBanglaDigits(zeroStr) : zeroStr;
    }
    const hours = Math.floor(remainingSeconds / 3600);
    const mins = Math.floor((remainingSeconds % 3600) / 60);
    const secs = remainingSeconds % 60;
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(mins).padStart(2, '0');
    const sStr = String(secs).padStart(2, '0');

    const timeStr = showHours || hours > 0
      ? `${hStr}:${mStr}:${sStr}`
      : `${mStr}:${sStr}`;

    return isBn ? toBanglaDigits(timeStr) : timeStr;
  }, [remainingSeconds, isBn]);

  return {
    maxTimerSeconds,
    remainingSeconds,
    topProgressPct,
    isTimerExpired,
    hasPromptedExpired,
    setHasPromptedExpired,
    tripCreatedAt,
    setTripCreatedAt,
    effectiveCreatedAt,
    formatCountdown,
    restartCountdown,
    resetCountdownFromCreatedAt,
  };
}
