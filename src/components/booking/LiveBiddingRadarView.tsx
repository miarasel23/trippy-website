'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RentalDriverBid, RentalTrip } from '@/types/customerApi';
import { customerTripService, getImageUrl } from '@/services/customerTripService';
import {
  Radio,
  Clock,
  Star,
  Check,
  X,
  Shield,
  Loader2,
  AlertTriangle,
  Car,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LiveBiddingRadarViewProps {
  tripUuid: string;
  customerUuid: string;
  proposedFare: number;
  pickupAddress: string;
  dropoffAddress: string;
  vehicleName: string;
  onCancelTrip: () => void;
}

export const LiveBiddingRadarView: React.FC<LiveBiddingRadarViewProps> = ({
  tripUuid,
  customerUuid,
  proposedFare,
  pickupAddress,
  dropoffAddress,
  vehicleName,
  onCancelTrip,
}) => {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const formatFare = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return isBn ? `৳${num.toLocaleString('en-IN')}` : `BDT ${num.toLocaleString('en-IN')}`;
  };

  const [bids, setBids] = useState<RentalDriverBid[]>([]);
  const [isAccepting, setIsAccepting] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [newOffer, setNewOffer] = useState(proposedFare.toString());
  const [isUpdatingOffer, setIsUpdatingOffer] = useState(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'bids'>('radar');

  // 5-second polling loop matching Flutter Timer.periodic
  useEffect(() => {
    let isMounted = true;

    const pollBids = async () => {
      if (!customerUuid) return;
      const trips: RentalTrip[] = await customerTripService.fetchBids(
        customerUuid,
        'bn',
        'REQUESTED'
      );

      if (isMounted && trips.length > 0) {
        const currentTrip = trips.find((t) => t.uuid === tripUuid) || trips[0];
        if (currentTrip && currentTrip.drivers && currentTrip.drivers.length > 0) {
          setBids(currentTrip.drivers);
          setActiveTab('bids');
        }
      }
    };

    pollBids();
    const interval = setInterval(pollBids, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [customerUuid, tripUuid]);

  // Accept a driver counter-offer
  const handleAcceptBid = async (bid: RentalDriverBid) => {
    const bidUuid = bid.uuid || bid.driver_uuid || '';
    if (!bidUuid) return;

    setIsAccepting(bidUuid);
    const res = await customerTripService.acceptBid(
      customerUuid,
      bidUuid,
      tripUuid,
      'bn'
    );

    if (res.status) {
      router.push(`/tracking?trip_uuid=${tripUuid}&driver_uuid=${bid.driver_uuid || ''}`);
    } else {
      setIsAccepting(null);
      alert(res.message || 'ড্রাইভারের অফার গ্রহণে সমস্যা হয়েছে।');
    }
  };

  // Update proposed offer
  const handleUpdateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer || parseFloat(newOffer) <= 0) return;
    setIsUpdatingOffer(true);
    await customerTripService.updateOfferAmount(
      customerUuid,
      tripUuid,
      newOffer,
      'bn'
    );
    setIsUpdatingOffer(false);
  };

  // Cancel trip
  const handleCancel = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে ট্রিপ রিকোয়েস্টটি বাতিল করতে চান?')) return;
    setIsCancelling(true);
    await customerTripService.cancelTrip(tripUuid, 'ব্যবহারকারী কর্তৃক বাতিল', 'bn');
    onCancelTrip();
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 animate-fade-in max-w-4xl mx-auto mb-10">
      {/* Top Trip Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            {isBn ? 'লাইভ রেডার সক্রিয় • নিকটস্থ চালকদের কাছে আপনার প্রস্তাব পৌঁছেছে' : 'Live Radar Active • Your offer has been sent to nearby drivers'}
          </span>
          <h3 className="text-2xl font-black font-heading text-white">
            {isBn ? 'ড্রাইভার বিডিং রাডার (Live Bidding)' : 'Driver Bidding Radar (Live Bidding)'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>{isBn ? 'গাড়ির ধরণ:' : 'Vehicle:'} <strong>{vehicleName}</strong></span>
            <span>•</span>
            <span>{isBn ? 'প্রস্তাবিত ভাড়া:' : 'Offered Fare:'} <strong className="text-emerald-400">{formatFare(proposedFare)}</strong></span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isCancelling}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
        >
          {isCancelling ? (isBn ? 'বাতিল হচ্ছে...' : 'Cancelling...') : (isBn ? 'ট্রিপ বাতিল করুন' : 'Cancel Trip')}
        </button>
      </div>

      {/* Origin & Destination Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="truncate text-slate-300">
            {isBn ? 'শুরু:' : 'Pickup:'} <strong className="text-white">{pickupAddress}</strong>
          </span>
        </div>
        <div className="hidden sm:block text-slate-500">→</div>
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="truncate text-slate-300">
            {isBn ? 'গন্তব্য:' : 'Dropoff:'} <strong className="text-white">{dropoffAddress}</strong>
          </span>
        </div>
      </div>

      {/* Radar Animation Area */}
      <div className="flex flex-col items-center justify-center py-8 text-center relative overflow-hidden rounded-2xl bg-black/40 border border-white/5 mb-6">
        {/* Concentric Pulsing Radar Rings */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
          <div className="absolute inset-4 rounded-full border border-emerald-500/30 animate-pulse" />
          <div className="absolute inset-10 rounded-full border border-emerald-500/40" />
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
            <Car className="w-8 h-8" />
          </div>
        </div>

        <h4 className="text-base font-extrabold text-white mt-4">
          {bids.length > 0
            ? (isBn ? `${bids.length} জন ড্রাইভার তাদের অফার পাঠিয়েছেন!` : `${bids.length} driver(s) sent counter-offers!`)
            : (isBn ? 'নিকটস্থ যাচাইকৃত ড্রাইভারদের সন্ধান করা হচ্ছে...' : 'Searching for nearby verified drivers...')}
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          {isBn
            ? 'প্রতি ৫ সেকেন্ড পর পর সিস্টেম স্বয়ংক্রিয়ভাবে নতুন অফার চেক করছে। ড্রাইভারের অফার দেখে যেকোনো একটি গ্রহণ করতে পারেন।'
            : 'The system automatically checks for new bids every 5 seconds. You can review and accept any driver offer.'}
        </p>

        {/* Quick percentage increase chips */}
        <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap px-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block w-full text-center mb-1">
            {isBn ? 'দ্রুত ভাড়া বাড়ানোর অপশন (শতকরা হার):' : 'Quick fare increase options (%):'}
          </span>
          {[10, 25, 50, 100].map((pct) => {
            const val = Math.round(proposedFare * (1 + pct / 100));
            return (
              <button
                key={pct}
                type="button"
                onClick={() => setNewOffer(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-emerald-400 border border-emerald-400/30 transition-colors"
              >
                +{pct}% ({formatFare(val)})
              </button>
            );
          })}
        </div>

        {/* Update Fare Form */}
        <form
          onSubmit={handleUpdateOffer}
          className="mt-3 flex items-center gap-2 max-w-xs w-full px-4"
        >
          <input
            type="number"
            value={newOffer}
            onChange={(e) => setNewOffer(e.target.value)}
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-400 text-center"
            placeholder={isBn ? 'নতুন ভাড়া লিখুন' : 'Enter new fare'}
          />
          <button
            type="submit"
            disabled={isUpdatingOffer}
            className="px-4 py-2 bg-white text-black hover:bg-slate-200 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
          >
            {isUpdatingOffer ? (isBn ? 'আপডেট...' : 'Updating...') : (isBn ? 'ভাড়া বাড়ান' : 'Raise Offer')}
          </button>
        </form>
      </div>

      {/* Driver Bids Incoming Offers */}
      {bids.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
            <span>{isBn ? 'ড্রাইভারদের পাল্টা অফারসমূহ' : 'Driver Offers Received'}</span>
            <span className="bg-emerald-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {bids.length}
            </span>
          </h4>

          {bids.map((bid, idx) => {
            const bidId = bid.uuid || bid.driver_uuid || `bid-${idx}`;
            return (
              <div
                key={bidId}
                className="bg-white/10 border border-white/15 hover:border-emerald-400/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                {/* Driver Profile & Car Details */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex-shrink-0 border-2 border-emerald-400/60">
                    {bid.driver_photo ? (
                      <Image
                        src={getImageUrl(bid.driver_photo)}
                        alt={bid.driver_name || 'Driver'}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm bg-slate-800">
                        {(bid.driver_name || 'D').slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {bid.driver_name || (isBn ? 'যাচাইকৃত চালক' : 'Verified Driver')}
                      </span>
                      <span className="text-[11px] font-bold text-amber-400 flex items-center gap-0.5 bg-amber-400/10 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current" /> {bid.rating || 4.9}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-0.5">
                      {bid.car_model || vehicleName} • {bid.car_plate || (isBn ? 'ঢাকা মেট্রো' : 'Dhaka Metro')}
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>{isBn ? `পৌঁছাতে সময়: ${bid.time_away_mins || 5} মিনিট` : `Est. Arrival: ${bid.time_away_mins || 5} mins`}</span>
                    </div>
                  </div>
                </div>

                {/* Offer Price and Accept Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isBn ? 'ড্রাইভারের প্রস্তাব' : 'Driver Offer'}
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      {formatFare(bid.bid_amount || proposedFare)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAcceptBid(bid)}
                    disabled={isAccepting === bidId}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                  >
                    {isAccepting === bidId ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {isBn ? 'গ্রহণ হচ্ছে...' : 'Accepting...'}
                      </>
                    ) : (
                      <>
                        {isBn ? 'অফার গ্রহণ করুন' : 'Accept Offer'} <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
