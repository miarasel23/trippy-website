import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Stores the original `created_at` timestamp for each trip UUID.
 * Once written, a trip's created_at is NEVER overwritten — this is the
 * source of truth for the countdown timer, immune to API polling resets.
 */
interface TripTimerState {
  /** Map of tripUuid → ISO created_at string */
  createdAtByTripUuid: Record<string, string>;
}

const initialState: TripTimerState = {
  createdAtByTripUuid: {},
};

export const tripTimerSlice = createSlice({
  name: 'tripTimer',
  initialState,
  reducers: {
    /**
     * Store the created_at for a trip UUID.
     * If a value already exists for this uuid, it is NOT overwritten
     * (write-once semantics ensures polling cannot reset the timer).
     */
    setTripCreatedAtOnce: (
      state,
      action: PayloadAction<{ tripUuid: string; createdAt: string }>
    ) => {
      const { tripUuid, createdAt } = action.payload;
      if (!tripUuid || !createdAt) return;
      // Only store the very first value — ignore subsequent API polls
      if (!state.createdAtByTripUuid[tripUuid]) {
        state.createdAtByTripUuid[tripUuid] = createdAt;
      }
    },

    /**
     * Force-update a trip's created_at (use only when intentionally creating a new trip).
     */
    forceTripCreatedAt: (
      state,
      action: PayloadAction<{ tripUuid: string; createdAt: string }>
    ) => {
      const { tripUuid, createdAt } = action.payload;
      if (!tripUuid || !createdAt) return;
      state.createdAtByTripUuid[tripUuid] = createdAt;
    },

    /**
     * Remove all stored data for a trip (e.g. on trip completion / cancellation).
     */
    clearTripTimer: (state, action: PayloadAction<string>) => {
      const tripUuid = action.payload;
      if (tripUuid) {
        delete state.createdAtByTripUuid[tripUuid];
      }
    },

    /** Remove all trip timer data (e.g. on logout). */
    clearAllTripTimers: (state) => {
      state.createdAtByTripUuid = {};
    },
  },
});

export const {
  setTripCreatedAtOnce,
  forceTripCreatedAt,
  clearTripTimer,
  clearAllTripTimers,
} = tripTimerSlice.actions;

export default tripTimerSlice.reducer;
