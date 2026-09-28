'use client';

import { useState, useCallback } from 'react';
import { RentalDriverBid, RentalTrip } from '@/features/trips/types/customerApi';

export interface UseBiddingModalsReturn {
  // Photo Gallery Modal
  isGalleryOpen: boolean;
  setIsGalleryOpen: (open: boolean) => void;
  galleryImages: string[];
  galleryCarName: string;
  galleryRegNumber: string;
  openGallery: (bid: RentalDriverBid, fallbackVehicleName?: string) => void;

  // Driver Reviews Modal
  reviewsModalBid: RentalDriverBid | null;
  setReviewsModalBid: (bid: RentalDriverBid | null) => void;

  // Completed Trip Review Modal
  completedTripForReview: RentalTrip | null;
  setCompletedTripForReview: (trip: RentalTrip | null) => void;
  isTripCompletedReviewOpen: boolean;
  setIsTripCompletedReviewOpen: (open: boolean) => void;

  // Raise Offer Modal
  isRaiseOfferOpen: boolean;
  setIsRaiseOfferOpen: (open: boolean) => void;

  // Accept Bid Confirmation Dialog
  bidToAccept: RentalDriverBid | null;
  setBidToAccept: (bid: RentalDriverBid | null) => void;

  // Cancel Trip Dialog
  showCancelDialog: boolean;
  setShowCancelDialog: (show: boolean) => void;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  isCancellingTrip: boolean;
  setIsCancellingTrip: (cancelling: boolean) => void;

  // Collapsible Bottom Drawer
  isDrawerExpanded: boolean;
  setIsDrawerExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;
}

/**
 * Custom hook to manage all modal, popup, and drawer states for the live bidding view.
 * Keeping UI dialog states separated ensures core trip/bid business logic stays concise and clean.
 */
export function useBiddingModals(): UseBiddingModalsReturn {
  // Photo Gallery Modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryCarName, setGalleryCarName] = useState<string>('');
  const [galleryRegNumber, setGalleryRegNumber] = useState<string>('');

  const openGallery = useCallback((bid: RentalDriverBid, fallbackVehicleName = '') => {
    const rawPhotos = bid.car_photos || bid.carPhotos || [];
    const photos =
      rawPhotos.length > 0
        ? rawPhotos
        : bid.profile_picture || bid.profilePicture || bid.driver_photo
          ? [bid.profile_picture || bid.profilePicture || bid.driver_photo!]
          : ['/images/car-placeholder.png'];

    setGalleryImages(photos);
    setGalleryCarName(bid.car_model || bid.name || bid.driver_name || fallbackVehicleName);
    setGalleryRegNumber(bid.car_reg_number || bid.carRegNumber || bid.car_plate || '');
    setIsGalleryOpen(true);
  }, []);

  // Driver Reviews Modal
  const [reviewsModalBid, setReviewsModalBid] = useState<RentalDriverBid | null>(null);

  // Completed Trip Review Modal
  const [completedTripForReview, setCompletedTripForReview] = useState<RentalTrip | null>(null);
  const [isTripCompletedReviewOpen, setIsTripCompletedReviewOpen] = useState(false);

  // Raise Offer Modal
  const [isRaiseOfferOpen, setIsRaiseOfferOpen] = useState(false);

  // Accept Bid Confirmation Dialog
  const [bidToAccept, setBidToAccept] = useState<RentalDriverBid | null>(null);

  // Cancel Trip Dialog
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isCancellingTrip, setIsCancellingTrip] = useState(false);

  // Collapsible Bottom Drawer
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);

  return {
    isGalleryOpen,
    setIsGalleryOpen,
    galleryImages,
    galleryCarName,
    galleryRegNumber,
    openGallery,
    reviewsModalBid,
    setReviewsModalBid,
    completedTripForReview,
    setCompletedTripForReview,
    isTripCompletedReviewOpen,
    setIsTripCompletedReviewOpen,
    isRaiseOfferOpen,
    setIsRaiseOfferOpen,
    bidToAccept,
    setBidToAccept,
    showCancelDialog,
    setShowCancelDialog,
    cancelReason,
    setCancelReason,
    isCancellingTrip,
    setIsCancellingTrip,
    isDrawerExpanded,
    setIsDrawerExpanded,
  };
}
