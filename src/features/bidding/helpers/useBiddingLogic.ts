'use client';

import { useState, useEffect, useRef } from 'react';
import { RentalDriverBid } from '@/features/trips/types/customerApi';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveTrip } from '@/features/trips/context/ActiveTripContext';
import { useAppSelector } from '@/store/hooks';
import { formatTripServiceType } from '@/shared/utils/serviceFormat';
import { useBiddingTimer } from './useBiddingTimer';
import { useBiddingModals } from './useBiddingModals';
import { useBiddingSocketSync } from './useBiddingSocketSync';
import { useBiddingActions } from './useBiddingActions';

export interface UseBiddingLogicParams {
  tripUuid: string;
  customerUuid: string;
  serviceName?: string;
  proposedFare: number;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleName: string;
  hoursBooked?: string | number;
  note?: string;
  createdAt?: string;
  initialBids?: RentalDriverBid[];
  isModal?: boolean;
  onTripUuidUpdated?: (newUuid: string) => void;
  onCancelTrip: () => void;
}

/**
 * Master composition hook for the Live Bidding Radar View.
 *
 * Modular Architecture:
 * 1. Timer Logic: Delegated to `useBiddingTimer` (prevents polling reset, locks start timestamp).
 * 2. Real-time & Polling Sync: Delegated to `useBiddingSocketSync` (Socket.IO + HTTP fallback).
 * 3. User Actions: Delegated to `useBiddingActions` (raise fare, accept, decline, cancel).
 * 4. Modal States: Delegated to `useBiddingModals` (gallery, reviews, confirmations, drawer).
 */
export function useBiddingLogic(params: UseBiddingLogicParams) {
  const {
    tripUuid,
    customerUuid,
    serviceName,
    proposedFare: initialProposedFare,
    pickupAddress,
    dropoffAddress,
    vehicleName,
    hoursBooked,
    createdAt: initialCreatedAt,
    initialBids,
    isModal = false,
    onTripUuidUpdated,
    onCancelTrip,
  } = params;

  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { user, token } = useAppSelector((state) => state.auth);
  const {
    setIsRadarOnPage,
    activeTrip,
    setActiveTripManually,
    dismissOverlay,
    clearActiveTrip,
  } = useActiveTrip();

  // Dynamic active trip UUID state: changes when raise-offer creates a new trip
  const [currentTripUuid, setCurrentTripUuid] = useState<string>(tripUuid);
  const currentTripUuidRef = useRef<string>(tripUuid);

  useEffect(() => {
    if (tripUuid && tripUuid !== currentTripUuidRef.current) {
      setCurrentTripUuid(tripUuid);
      currentTripUuidRef.current = tripUuid;
    }
  }, [tripUuid]);

  useEffect(() => {
    currentTripUuidRef.current = currentTripUuid;
  }, [currentTripUuid]);

  // Inform global overlay that radar is mounted on page
  useEffect(() => {
    if (!isModal && setIsRadarOnPage) {
      setIsRadarOnPage(true);
      return () => {
        setIsRadarOnPage(false);
      };
    }
  }, [isModal, setIsRadarOnPage]);

  // Dynamic service name & hours booked: dynamically initialized from prop or activeTrip without static defaults
  const [internalServiceName, setInternalServiceName] = useState<string>(() => {
    return (
      serviceName ||
      activeTrip?.service_name ||
      (activeTrip as any)?.service_type ||
      (activeTrip as any)?.servive_type ||
      activeTrip?.car_service?.service_name ||
      ''
    );
  });
  const [internalHoursBooked, setInternalHoursBooked] = useState<string | number | undefined>(hoursBooked);

  useEffect(() => {
    const dynamicService =
      serviceName ||
      activeTrip?.service_name ||
      (activeTrip as any)?.service_type ||
      (activeTrip as any)?.servive_type ||
      activeTrip?.car_service?.service_name;
    if (dynamicService) {
      setInternalServiceName(dynamicService);
    }
  }, [
    serviceName,
    activeTrip?.service_name,
    (activeTrip as any)?.service_type,
    (activeTrip as any)?.servive_type,
    activeTrip?.car_service?.service_name,
  ]);

  useEffect(() => {
    if (hoursBooked !== undefined) setInternalHoursBooked(hoursBooked);
  }, [hoursBooked]);

  const [proposedFare, setProposedFare] = useState<number>(initialProposedFare);
  const [bids, setBids] = useState<RentalDriverBid[]>(() => {
    if (initialBids && initialBids.length > 0) return initialBids;
    if (activeTrip?.drivers && activeTrip.drivers.length > 0) return activeTrip.drivers;
    return [];
  });
  const [seenDrivers, setSeenDrivers] = useState<
    Array<{
      driver_uuid?: string;
      name?: string;
      profile_picture?: string;
      created_at?: string;
    }>
  >(activeTrip?.seen_drivers || []);
  const [seenDriverCount, setSeenDriverCount] = useState<number>(
    activeTrip?.seen_driver_count ?? (activeTrip?.seen_drivers?.length || 0)
  );

  const [hiddenBidUuids, setHiddenBidUuids] = useState<Set<string>>(new Set());
  const [isAccepting, setIsAccepting] = useState<string | null>(null);

  const serviceInfo = formatTripServiceType(internalServiceName, internalHoursBooked, language);
  const isRideShare = serviceInfo.isRideShare;

  // ── 1. Countdown Timer Module ─────────────────────────────────────────────
  const timer = useBiddingTimer({
    serviceName: internalServiceName,
    hoursBooked: internalHoursBooked,
    effectiveTripUuid: currentTripUuid,
    initialCreatedAt,
    activeTripCreatedAt: activeTrip?.created_at,
    isBn,
  });

  // ── 2. Modal & Dialog UI States Module ────────────────────────────────────
  const modals = useBiddingModals();

  // ── 3. Real-Time Socket & HTTP Polling Sync Module ────────────────────────
  const sync = useBiddingSocketSync({
    currentTripUuid,
    customerUuid,
    userUuid: user?.uuid,
    token,
    language,
    isBn,
    isRideShare,
    activeTrip,
    bids,
    seenDrivers,
    seenDriverCount,
    proposedFare,
    tripCreatedAt: timer.tripCreatedAt,
    setBids,
    setSeenDrivers,
    setSeenDriverCount,
    setProposedFare,
    setTripCreatedAt: timer.setTripCreatedAt,
    setInternalServiceName,
    setInternalHoursBooked,
    setCurrentTripUuid,
    setActiveTripManually,
    clearActiveTrip,
    onTripUuidUpdated,
    onCancelTrip,
    setCompletedTripForReview: modals.setCompletedTripForReview,
    setIsTripCompletedReviewOpen: modals.setIsTripCompletedReviewOpen,
  });

  // ── 4. User Action Handlers Module ────────────────────────────────────────
  const actions = useBiddingActions({
    currentTripUuid,
    customerUuid,
    userUuid: user?.uuid,
    token,
    language,
    isBn,
    internalServiceName,
    pickupAddress,
    dropoffAddress,
    proposedFare,
    bidToAccept: modals.bidToAccept,
    cancelReason: modals.cancelReason,
    setCurrentTripUuid,
    setBids,
    setSeenDrivers,
    setSeenDriverCount,
    setHiddenBidUuids,
    setProposedFare,
    setTripCreatedAt: timer.setTripCreatedAt,
    resetCountdownFromCreatedAt: timer.resetCountdownFromCreatedAt,
    restartCountdown: timer.restartCountdown,
    setActiveTripManually,
    dismissOverlay,
    setBidToAccept: modals.setBidToAccept,
    setIsAccepting,
    setShowCancelDialog: modals.setShowCancelDialog,
    setIsCancellingTrip: modals.setIsCancellingTrip,
    onTripUuidUpdated,
    onCancelTrip,
  });

  // Filter out bids that the user explicitly declined
  const visibleBids = bids.filter((b) => {
    const ids = [
      b.bid_uuid,
      (b as any).bidUuid,
      b.rent_bid_uuid,
      b.rentBidUuid,
      b.uuid,
      b.driver_uuid,
      b.driverUuid,
    ].filter(Boolean) as string[];

    return !ids.some((id) => hiddenBidUuids.has(id));
  });

  // Auto-open raise offer modal if timer expired with 0 bids
  useEffect(() => {
    if (timer.isTimerExpired && !timer.hasPromptedExpired) {
      timer.setHasPromptedExpired(true);
      if (visibleBids.length === 0) {
        modals.setIsRaiseOfferOpen(true);
      }
    }
  }, [timer, visibleBids.length, modals]);

  return {
    isBn,
    user,
    currentTripUuid,
    currentTripUuidRef,
    internalServiceName,
    proposedFare,
    bids,
    visibleBids,
    seenDrivers,
    seenDriverCount,
    isSocketConnected: sync.isSocketConnected,
    isSocketFailed: sync.isSocketFailed,
    tripCreatedAt: timer.tripCreatedAt,
    effectiveCreatedAt: timer.effectiveCreatedAt,
    remainingSeconds: timer.remainingSeconds,
    topProgressPct: timer.topProgressPct,
    isTimerExpired: timer.isTimerExpired,
    formatCountdown: timer.formatCountdown,
    bottomOfferPrice: actions.bottomOfferPrice,
    isUpdatingBottomOffer: actions.isUpdatingBottomOffer,
    offerUpdatedNotice: actions.offerUpdatedNotice,
    handleBottomDecrement: actions.handleBottomDecrement,
    handleBottomIncrement: actions.handleBottomIncrement,
    handleBottomRaiseFare: actions.handleBottomRaiseFare,
    isDrawerExpanded: modals.isDrawerExpanded,
    setIsDrawerExpanded: modals.setIsDrawerExpanded,
    isGalleryOpen: modals.isGalleryOpen,
    setIsGalleryOpen: modals.setIsGalleryOpen,
    galleryImages: modals.galleryImages,
    galleryCarName: modals.galleryCarName,
    galleryRegNumber: modals.galleryRegNumber,
    handleOpenGallery: (bid: RentalDriverBid) => modals.openGallery(bid, vehicleName),
    reviewsModalBid: modals.reviewsModalBid,
    setReviewsModalBid: modals.setReviewsModalBid,
    completedTripForReview: modals.completedTripForReview,
    setCompletedTripForReview: modals.setCompletedTripForReview,
    isTripCompletedReviewOpen: modals.isTripCompletedReviewOpen,
    setIsTripCompletedReviewOpen: modals.setIsTripCompletedReviewOpen,
    isRaiseOfferOpen: modals.isRaiseOfferOpen,
    setIsRaiseOfferOpen: modals.setIsRaiseOfferOpen,
    bidToAccept: modals.bidToAccept,
    setBidToAccept: modals.setBidToAccept,
    isAccepting,
    handleDeclineBid: actions.handleDeclineBid,
    handleConfirmAcceptBid: actions.handleConfirmAcceptBid,
    showCancelDialog: modals.showCancelDialog,
    setShowCancelDialog: modals.setShowCancelDialog,
    cancelReason: modals.cancelReason,
    setCancelReason: modals.setCancelReason,
    isCancellingTrip: modals.isCancellingTrip,
    handleConfirmCancelTrip: actions.handleConfirmCancelTrip,
    handleRaiseOfferUpdated: actions.handleRaiseOfferUpdated,
    handleKeepTrying: actions.handleKeepTrying,
    getFormattedServiceName: () => serviceInfo.name,
  };
}
