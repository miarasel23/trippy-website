'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  customerTripService,
  clearTripDataFromLocalStorage,
} from '@/features/trips/services/customerTripService';
import { useLanguage } from '@/context/LanguageContext';

interface RaiseOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOffer: number;
  tripUuid: string;
  customerUuid: string;
  onOfferUpdated: (newAmount: number, newTripUuid?: string) => void;
  onKeepTrying?: (newTripUuid?: string) => void;
}

function toBanglaDigits(str: string | number): string {
  const english = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const bangla = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let res = String(str);
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(english[i], bangla[i]);
  }
  return res;
}

export const RaiseOfferModal: React.FC<RaiseOfferModalProps> = ({
  isOpen,
  onClose,
  currentOffer,
  tripUuid,
  customerUuid,
  onOfferUpdated,
  onKeepTrying,
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  // In Photo 2, the initial suggested raise is currentOffer + 50 BDT
  const [tempOfferPrice, setTempOfferPrice] = useState<number>(currentOffer + 50);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isKeepTryingLoading, setIsKeepTryingLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTempOfferPrice(currentOffer + 50);
      setIsUpdating(false);
      setIsKeepTryingLoading(false);
    }
  }, [isOpen, currentOffer]);

  if (!isOpen) return null;

  const formatPrice = (amount: number) => {
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return isBn ? `৳ ${toBanglaDigits(formatted)}` : `BDT ${formatted}`;
  };

  const handleDecrement = () => {
    if (tempOfferPrice > currentOffer) {
      setTempOfferPrice((prev) => Math.max(currentOffer, prev - 10));
    }
  };

  const handleIncrement = () => {
    setTempOfferPrice((prev) => prev + 10);
  };

  const handleRaiseOffer = async () => {
    setIsUpdating(true);
    // Remove all trip and date data from local storage before calling API
    clearTripDataFromLocalStorage();

    const res = await customerTripService.updateOfferAmount(
      customerUuid,
      tripUuid,
      tempOfferPrice,
      language
    );
    setIsUpdating(false);

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

    onOfferUpdated(tempOfferPrice, newTripUuid || tripUuid);
    onClose();
  };

  const handleKeepTrying = async () => {
    setIsKeepTryingLoading(true);
    clearTripDataFromLocalStorage();
    const res = await customerTripService.updateOfferAmount(
      customerUuid,
      tripUuid,
      currentOffer,
      language
    );
    setIsKeepTryingLoading(false);

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

    if (onKeepTrying) {
      onKeepTrying(newTripUuid || tripUuid);
    } else {
      onOfferUpdated(currentOffer, newTripUuid || tripUuid);
    }
    onClose();
  };

  const formattedTemp = formatPrice(tempOfferPrice);
  const formattedCurrent = formatPrice(currentOffer);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[380px] sm:max-w-[400px] bg-white rounded-[28px] p-6 sm:p-7 shadow-2xl border border-slate-100 text-center animate-scale-up">
        
        {/* Main Header / Explanation (Matches Photo 2) */}
        <p className="text-[13px] sm:text-sm font-medium text-slate-700 leading-relaxed max-w-xs mx-auto">
          {isBn
            ? 'গাড়িচালকদের দ্রুত প্রতিক্রিয়া পেতে আপনার অফারের দাম বাড়ান অথবা বর্তমান দামে অনুসন্ধান চালিয়ে যান।'
            : 'No driver accepted yet. Increase your offer to get responses faster, or continue trying with your current fare.'}
        </p>

        {/* Stepper Container (Matches Photo 2) */}
        <div className="my-5 p-2 sm:p-2.5 bg-[#F4F6F9] border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-2xs">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isUpdating || isKeepTryingLoading || tempOfferPrice <= currentOffer}
            className="w-14 h-11 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Decrease offer by 10"
          >
            {isBn ? '-১০' : '-10'}
          </button>

          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            {formattedTemp}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isUpdating || isKeepTryingLoading}
            className="w-14 h-11 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-40"
            aria-label="Increase offer by 10"
          >
            {isBn ? '+১০' : '+10'}
          </button>
        </div>

        {/* Action Buttons (Matches Photo 2) */}
        <div className="space-y-2.5 pt-1">
          {/* Primary: Raise Offer (Solid Black Button) */}
          <button
            type="button"
            disabled={isUpdating || isKeepTryingLoading}
            onClick={handleRaiseOffer}
            className="w-full h-12 rounded-2xl bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-md flex items-center justify-center transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>
                {isBn ? `অফার বাড়ান (${formattedTemp})` : `Raise Offer (${formattedTemp})`}
              </span>
            )}
          </button>

          {/* Secondary: Keep Trying (Light Gray Button) */}
          <button
            type="button"
            disabled={isUpdating || isKeepTryingLoading}
            onClick={handleKeepTrying}
            className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center transition-all active:scale-[0.99] disabled:opacity-60"
          >
            {isKeepTryingLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <span>
                {isBn
                  ? `বর্তমান ভাড়ায় চেষ্টা করুন (${formattedCurrent})`
                  : `Keep Trying (${formattedCurrent})`}
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RaiseOfferModal;
