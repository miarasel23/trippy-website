'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RentalDriverBid, RentalTrip } from '@/features/trips/types/customerApi';
import {
  customerTripService,
  getActiveCustomerUuid,
  clearTripDataFromLocalStorage,
} from '@/features/trips/services/customerTripService';
import { useAppDispatch } from '@/store/hooks';
import { setTripCreatedAtOnce, forceTripCreatedAt } from '@/features/trips/store/tripTimerSlice';

export interface UseBiddingActionsParams {
  currentTripUuid: string;
  customerUuid?: string;
  userUuid?: string;
  token?: string | null;
  language: string;
  isBn: boolean;
  internalServiceName: string;
  pickupAddress: string;
  dropoffAddress: string;
  proposedFare: number;
  bidToAccept: RentalDriverBid | null;
  cancelReason: string;
  setCurrentTripUuid: (uuid: string) => void;
  setBids: (bids: RentalDriverBid[]) => void;
  setSeenDrivers: (drivers: any[]) => void;
  setSeenDriverCount: (count: number) => void;
  setHiddenBidUuids: React.Dispatch<React.SetStateAction<Set<string>>>;
  setProposedFare: (fare: number) => void;
  setTripCreatedAt: (createdAt: string) => void;
  resetCountdownFromCreatedAt: (createdAt: string) => void;
  restartCountdown: () => void;
  setActiveTripManually: (trip: RentalTrip) => void;
  dismissOverlay: () => void;
  setBidToAccept: (bid: RentalDriverBid | null) => void;
  setIsAccepting: (id: string | null) => void;
  setShowCancelDialog: (show: boolean) => void;
  setIsCancellingTrip: (cancelling: boolean) => void;
  onTripUuidUpdated?: (newUuid: string) => void;
  onCancelTrip: () => void;
}

export interface UseBiddingActionsReturn {
  bottomOfferPrice: number;
  setBottomOfferPrice: (price: number) => void;
  isUpdatingBottomOffer: boolean;
  offerUpdatedNotice: boolean;
  handleBottomDecrement: () => void;
  handleBottomIncrement: () => void;
  handleBottomRaiseFare: () => Promise<void>;
  handleDeclineBid: (bid: RentalDriverBid, comment?: string) => Promise<void>;
  handleConfirmAcceptBid: () => Promise<void>;
  handleConfirmCancelTrip: () => Promise<void>;
  handleRaiseOfferUpdated: (newFare: number, newTripUuid?: string) => Promise<void>;
  handleKeepTrying: (newTripUuid?: string) => void;
}

/**
 * Custom hook containing all user-triggered asynchronous action handlers:
 * - Raising/updating offer amount
 * - Accepting a driver's bid
 * - Declining a driver's bid
 * - Cancelling the trip request
 */
export function useBiddingActions({
  currentTripUuid,
  customerUuid,
  userUuid,
  token,
  language,
  isBn,
  internalServiceName,
  pickupAddress,
  dropoffAddress,
  proposedFare,
  bidToAccept,
  cancelReason,
  setCurrentTripUuid,
  setBids,
  setSeenDrivers,
  setSeenDriverCount,
  setHiddenBidUuids,
  setProposedFare,
  setTripCreatedAt,
  resetCountdownFromCreatedAt,
  restartCountdown,
  setActiveTripManually,
  dismissOverlay,
  setBidToAccept,
  setIsAccepting,
  setShowCancelDialog,
  setIsCancellingTrip,
  onTripUuidUpdated,
  onCancelTrip,
}: UseBiddingActionsParams): UseBiddingActionsReturn {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Bottom Stepper Price state
  const [bottomOfferPrice, setBottomOfferPrice] = useState<number>(proposedFare);
  const [isUpdatingBottomOffer, setIsUpdatingBottomOffer] = useState(false);
  const [offerUpdatedNotice, setOfferUpdatedNotice] = useState<boolean>(false);

  const handleBottomDecrement = useCallback(() => {
    setBottomOfferPrice((prev) => (prev > 10 ? Math.max(10, prev - 10) : prev));
  }, []);

  const handleBottomIncrement = useCallback(() => {
    setBottomOfferPrice((prev) => prev + 10);
  }, []);

  const effectiveCustomerUuid = customerUuid || userUuid || getActiveCustomerUuid();

  /**
   * Action: Raise Proposed Fare from Bottom Stepper
   * Calls /v1/rental-trip/update-trip-offer-amount to spawn a new trip offer
   */
  const handleBottomRaiseFare = async () => {
    setIsUpdatingBottomOffer(true);
    clearTripDataFromLocalStorage();

    const res = await customerTripService.updateOfferAmount(
      effectiveCustomerUuid,
      currentTripUuid,
      bottomOfferPrice,
      language,
      token || undefined
    );

    let newTripUuid = '';
    if (res && res.status !== false) {
      if (res.data && typeof res.data === 'object') {
        if (Array.isArray(res.data) && res.data.length > 0) {
          newTripUuid = res.data[0]?.uuid || res.data[0]?.trip_uuid || '';
        } else {
          newTripUuid = res.data.uuid || res.data.trip_uuid || res.data.rental_trip_uuid || '';
        }
      }
      if (!newTripUuid) {
        newTripUuid = (res as any).uuid || (res as any).trip_uuid || '';
      }
    }

    const effectiveNewTripUuid = newTripUuid || currentTripUuid;
    setCurrentTripUuid(effectiveNewTripUuid);
    if (onTripUuidUpdated && newTripUuid) {
      onTripUuidUpdated(effectiveNewTripUuid);
    }

    setBids([]);
    setSeenDrivers([]);
    setHiddenBidUuids(new Set());
    setProposedFare(bottomOfferPrice);
    setOfferUpdatedNotice(true);
    setTimeout(() => setOfferUpdatedNotice(false), 4000);

    if (effectiveNewTripUuid) {
      try {
        const singleRes = await customerTripService.fetchSingleTripBids(
          effectiveCustomerUuid,
          effectiveNewTripUuid,
          language,
          'ALL',
          token || undefined
        );
        if (singleRes.status && singleRes.data) {
          const trip = singleRes.data;
          const freshFare = Number(trip.offer_amount || (trip as any).offer_ammount || bottomOfferPrice);
          setProposedFare(freshFare);
          setBottomOfferPrice(freshFare);
          if (trip.created_at) {
            dispatch(setTripCreatedAtOnce({ tripUuid: effectiveNewTripUuid, createdAt: trip.created_at }));
            setTripCreatedAt(trip.created_at);
            resetCountdownFromCreatedAt(trip.created_at);
          } else {
            restartCountdown();
          }
          if (trip.drivers && Array.isArray(trip.drivers)) {
            setBids(trip.drivers);
          }
          if (trip.seen_drivers && Array.isArray(trip.seen_drivers)) {
            setSeenDrivers(trip.seen_drivers);
          }
          const freshSeenCount =
            typeof trip.seen_driver_count === 'number'
              ? trip.seen_driver_count
              : (trip.seen_drivers?.length ?? 0);
          setSeenDriverCount(freshSeenCount);
          setActiveTripManually(trip);
        } else {
          setActiveTripManually({
            uuid: effectiveNewTripUuid,
            customer_uuid: effectiveCustomerUuid,
            service_name: internalServiceName || '',
            offer_amount: bottomOfferPrice,
            trip_status: 'REQUESTED',
            pickup_locations: [{ address: pickupAddress }],
            dropoff_locations: [{ address: dropoffAddress }],
            drivers: [],
            created_at: new Date().toISOString(),
          } as any);
          restartCountdown();
        }
      } catch {}
    }

    setIsUpdatingBottomOffer(false);
  };

  /**
   * Action: Decline a Driver Bid (manual user click only)
   * Calls /v1/rental-trip/cancel-rent-bid-driver-or-customer-admin
   */
  const handleDeclineBid = useCallback(
    async (bid: RentalDriverBid, comment = 'cancel_rent_bid_driver_or_customer_admin') => {
      const bidUuid =
        bid.bid_uuid ||
        (bid as any).bidUuid ||
        bid.rent_bid_uuid ||
        bid.rentBidUuid ||
        bid.uuid ||
        bid.driver_uuid ||
        bid.driverUuid ||
        '';

      const allIds = [
        bid.bid_uuid,
        (bid as any).bidUuid,
        bid.rent_bid_uuid,
        bid.rentBidUuid,
        bid.uuid,
        bid.driver_uuid,
        bid.driverUuid,
      ].filter(Boolean) as string[];

      if (bidUuid) {
        setHiddenBidUuids((prev) => {
          const next = new Set(prev);
          allIds.forEach((id) => next.add(id));
          return next;
        });
        await customerTripService.cancelRentBid(bidUuid, comment, language, token || undefined);
      }
    },
    [language, token, setHiddenBidUuids]
  );

  /**
   * Action: Confirm Accepting a Driver Bid
   * Calls /v1/rental-trip/accept_trip_for_customer and redirects to tracking
   */
  const handleConfirmAcceptBid = useCallback(async () => {
    if (!bidToAccept) return;
    const bidUuid =
      bidToAccept.rent_bid_uuid ||
      bidToAccept.rentBidUuid ||
      bidToAccept.uuid ||
      bidToAccept.bid_uuid ||
      (bidToAccept as any).bidUuid ||
      bidToAccept.driver_uuid ||
      bidToAccept.driverUuid ||
      '';

    setIsAccepting(bidUuid);

    try {
      const res = await customerTripService.acceptBid(
        effectiveCustomerUuid,
        bidUuid,
        currentTripUuid,
        language,
        token || undefined
      );

      if (res.status) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('trippy_has_active_ride', 'true');
          } catch {}
        }
        dismissOverlay();
        const driverId = bidToAccept.driver_uuid || bidToAccept.driverUuid || '';
        router.push(`/tracking?trip_uuid=${currentTripUuid}&driver_uuid=${driverId}`);
      } else {
        setIsAccepting(null);
        setBidToAccept(null);
        alert(res.message || (isBn ? 'ড্রাইভারের বিড গ্রহণে সমস্যা হয়েছে।' : 'Failed to accept driver bid.'));
      }
    } catch (err: any) {
      setIsAccepting(null);
      setBidToAccept(null);
      alert(err?.message || (isBn ? 'ড্রাইভারের বিড গ্রহণে সমস্যা হয়েছে।' : 'Failed to accept driver bid.'));
    }
  }, [bidToAccept, currentTripUuid, effectiveCustomerUuid, language, token, isBn, router, dismissOverlay, setIsAccepting, setBidToAccept]);

  /**
   * Action: Confirm Cancelling Trip Request
   */
  const handleConfirmCancelTrip = useCallback(async () => {
    setIsCancellingTrip(true);
    await customerTripService.cancelTrip(currentTripUuid, cancelReason, language);
    setIsCancellingTrip(false);
    setShowCancelDialog(false);
    onCancelTrip();
  }, [currentTripUuid, cancelReason, language, onCancelTrip, setIsCancellingTrip, setShowCancelDialog]);

  /**
   * Action: Handle Raise Offer from Modal
   */
  const handleRaiseOfferUpdated = useCallback(
    async (newFare: number, newTripUuid?: string) => {
      const effectiveNewUuid = newTripUuid || currentTripUuid;
      setCurrentTripUuid(effectiveNewUuid);
      if (onTripUuidUpdated && newTripUuid) {
        onTripUuidUpdated(effectiveNewUuid);
      }

      clearTripDataFromLocalStorage();
      setBids([]);
      setSeenDrivers([]);
      setHiddenBidUuids(new Set());
      setProposedFare(newFare);
      setBottomOfferPrice(newFare);
      setOfferUpdatedNotice(true);
      setTimeout(() => setOfferUpdatedNotice(false), 4000);

      if (effectiveNewUuid) {
        try {
          const singleRes = await customerTripService.fetchSingleTripBids(
            effectiveCustomerUuid,
            effectiveNewUuid,
            language,
            'ALL',
            token || undefined
          );
          if (singleRes.status && singleRes.data) {
            const trip = singleRes.data;
            const freshFare = Number(trip.offer_amount || (trip as any).offer_ammount || newFare);
            setProposedFare(freshFare);
            setBottomOfferPrice(freshFare);
            if (trip.created_at) {
              dispatch(setTripCreatedAtOnce({ tripUuid: effectiveNewUuid, createdAt: trip.created_at }));
              setTripCreatedAt(trip.created_at);
              resetCountdownFromCreatedAt(trip.created_at);
            } else {
              restartCountdown();
            }
            if (trip.drivers && Array.isArray(trip.drivers)) {
              setBids(trip.drivers);
            }
            if (trip.seen_drivers && Array.isArray(trip.seen_drivers)) {
              setSeenDrivers(trip.seen_drivers);
            }
            const modalSeenCount =
              typeof trip.seen_driver_count === 'number'
                ? trip.seen_driver_count
                : (trip.seen_drivers?.length ?? 0);
            setSeenDriverCount(modalSeenCount);
            setActiveTripManually(trip);
          } else {
            setActiveTripManually({
              uuid: effectiveNewUuid,
              customer_uuid: effectiveCustomerUuid,
              service_name: internalServiceName || '',
              offer_amount: newFare,
              trip_status: 'REQUESTED',
              pickup_locations: [{ address: pickupAddress }],
              dropoff_locations: [{ address: dropoffAddress }],
              drivers: [],
              created_at: new Date().toISOString(),
            } as any);
          }
        } catch {}
      }
    },
    [currentTripUuid, effectiveCustomerUuid, language, token, internalServiceName, pickupAddress, dropoffAddress, onTripUuidUpdated, setCurrentTripUuid, setBids, setSeenDrivers, setHiddenBidUuids, setProposedFare, dispatch, setTripCreatedAt, resetCountdownFromCreatedAt, restartCountdown, setSeenDriverCount, setActiveTripManually]
  );

  /**
   * Action: Keep Trying / Reset countdown from modal
   */
  const handleKeepTrying = useCallback((newTripUuid?: string) => {
    if (newTripUuid && newTripUuid !== currentTripUuid) {
      setCurrentTripUuid(newTripUuid);
      if (onTripUuidUpdated) {
        onTripUuidUpdated(newTripUuid);
      }
    }
    const newTs = new Date().toISOString();
    if (newTripUuid) {
      dispatch(forceTripCreatedAt({ tripUuid: newTripUuid, createdAt: newTs }));
    }
    setTripCreatedAt(newTs);
    restartCountdown();
  }, [currentTripUuid, onTripUuidUpdated, setCurrentTripUuid, dispatch, setTripCreatedAt, restartCountdown]);

  return {
    bottomOfferPrice,
    setBottomOfferPrice,
    isUpdatingBottomOffer,
    offerUpdatedNotice,
    handleBottomDecrement,
    handleBottomIncrement,
    handleBottomRaiseFare,
    handleDeclineBid,
    handleConfirmAcceptBid,
    handleConfirmCancelTrip,
    handleRaiseOfferUpdated,
    handleKeepTrying,
  };
}
