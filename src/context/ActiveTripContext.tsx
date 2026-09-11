'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { RentalTrip } from '@/types/customerApi';
import {
  customerTripService,
  getActiveCustomerUuid,
} from '@/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';
import { useAppSelector } from '@/redux/hooks';

interface ActiveTripContextType {
  activeTrip: RentalTrip | null;
  bidsCount: number;
  isLoading: boolean;
  isOverlayVisible: boolean;
  isMinimized: boolean;
  isRadarModalOpen: boolean;
  isRadarOnPage: boolean;
  customerUuid: string;
  openRadarModal: () => void;
  closeRadarModal: () => void;
  setMinimized: (minimized: boolean) => void;
  dismissOverlay: () => void;
  showOverlay: () => void;
  setIsRadarOnPage: (active: boolean) => void;
  refreshActiveTrip: () => Promise<RentalTrip | null>;
  clearActiveTrip: () => void;
  setActiveTripManually: (trip: RentalTrip | null) => void;
}

const ActiveTripContext = createContext<ActiveTripContextType | undefined>(undefined);

export const ActiveTripProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { language } = useLanguage();
  const { user, token } = useAppSelector((state) => state.auth);

  const [activeTrip, setActiveTrip] = useState<RentalTrip | null>(null);
  const [bidsCount, setBidsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState<boolean>(false);
  const [isRadarOnPage, setIsRadarOnPage] = useState<boolean>(false);

  const customerUuid = user?.uuid || getActiveCustomerUuid();

  const refreshActiveTrip = useCallback(async (): Promise<RentalTrip | null> => {
    try {
      const trip = await customerTripService.fetchActiveRequestedTrip(
        customerUuid,
        language,
        token || undefined
      );

      if (trip && trip.trip_status === 'REQUESTED') {
        setActiveTrip(trip);
        const count =
          trip.drivers?.length ??
          trip.total_bids ??
          (trip as any).bid_summary?.total_bids ??
          0;
        setBidsCount(count);
        return trip;
      } else {
        // If trip was completed/cancelled on backend
        if (activeTrip && activeTrip.trip_status === 'REQUESTED') {
          setActiveTrip(null);
          setBidsCount(0);
        }
        return null;
      }
    } catch (err) {
      console.error('Error refreshing active trip:', err);
      return null;
    }
  }, [customerUuid, language, token, activeTrip]);

  // Initial load + interval polling every 8 seconds
  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      await refreshActiveTrip();
      if (isMounted) {
        setIsLoading(false);
      }
    };

    check();

    const interval = setInterval(() => {
      if (isMounted) {
        refreshActiveTrip();
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [refreshActiveTrip]);

  const openRadarModal = () => {
    setIsRadarModalOpen(true);
  };

  const closeRadarModal = () => {
    setIsRadarModalOpen(false);
  };

  const dismissOverlay = () => {
    setIsOverlayVisible(false);
  };

  const showOverlay = () => {
    setIsOverlayVisible(true);
    setIsMinimized(false);
  };

  const clearActiveTrip = () => {
    setActiveTrip(null);
    setBidsCount(0);
    setIsRadarModalOpen(false);
  };

  const setActiveTripManually = (trip: RentalTrip | null) => {
    setActiveTrip(trip);
    if (trip) {
      setIsOverlayVisible(true);
      setIsMinimized(false);
      const count =
        trip.drivers?.length ??
        trip.total_bids ??
        (trip as any).bid_summary?.total_bids ??
        0;
      setBidsCount(count);
    }
  };

  return (
    <ActiveTripContext.Provider
      value={{
        activeTrip,
        bidsCount,
        isLoading,
        isOverlayVisible,
        isMinimized,
        isRadarModalOpen,
        isRadarOnPage,
        customerUuid,
        openRadarModal,
        closeRadarModal,
        setMinimized: setIsMinimized,
        dismissOverlay,
        showOverlay,
        setIsRadarOnPage,
        refreshActiveTrip,
        clearActiveTrip,
        setActiveTripManually,
      }}
    >
      {children}
    </ActiveTripContext.Provider>
  );
};

export const useActiveTrip = (): ActiveTripContextType => {
  const context = useContext(ActiveTripContext);
  if (!context) {
    throw new Error('useActiveTrip must be used within an ActiveTripProvider');
  }
  return context;
};
