'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  closeLoginModal,
  sendOtp,
  verifyOtp,
  resetOtpStep,
  clearError,
} from '@/features/auth/store/authSlice';
import { useLanguage } from '@/context/LanguageContext';
import { X, Phone, Lock, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isLoginModalOpen,
    isLoading,
    error,
    otpSent,
    phoneNumber: storePhone,
  } = useAppSelector((state) => state.auth);
  const { t, language } = useLanguage();

  const [phone, setPhone] = useState(storePhone || '');
  const [countryCode, setCountryCode] = useState('BD');
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [validationError, setValidationError] = useState<string | null>(null);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Sync phone from store if provided
  useEffect(() => {
    if (storePhone) {
      setPhone(storePhone);
    }
  }, [storePhone]);

  // Focus inputs appropriately
  useEffect(() => {
    if (isLoginModalOpen) {
      if (otpSent) {
        setOtp('');
        setTimeout(() => otpInputRef.current?.focus(), 150);
      } else {
        setTimeout(() => phoneInputRef.current?.focus(), 150);
      }
    }
  }, [isLoginModalOpen, otpSent]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendTimer]);

  if (!isLoginModalOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    // Basic BD phone validation (e.g. 01XXXXXXXXX)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10 || cleaned.length > 11) {
      setValidationError(t.auth.invalidPhone);
      return;
    }

    const result = await dispatch(
      sendOtp({
        platform: 'web',
        language_code: language,
        action_when: 'admin_login',
        phone_number: cleaned,
        country_code: countryCode,
      })
    );

    if (sendOtp.fulfilled.match(result)) {
      setResendTimer(60);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    dispatch(clearError());

    const cleanedOtp = otp.trim();
    if (!cleanedOtp || cleanedOtp.length < 4) {
      setValidationError(t.auth.invalidOtp);
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    await dispatch(
      verifyOtp({
        platform: 'web',
        language_code: language,
        action_when: 'admin_login',
        phone_number: cleanedPhone,
        country_code: countryCode,
        otp: cleanedOtp,
      })
    );
  };

  const handleResend = () => {
    if (resendTimer > 0 || isLoading) return;
    setValidationError(null);
    dispatch(clearError());
    setResendTimer(60);
    const cleaned = phone.replace(/\D/g, '');
    dispatch(
      sendOtp({
        platform: 'web',
        language_code: language,
        action_when: 'admin_login',
        phone_number: cleaned,
        country_code: countryCode,
      })
    );
  };

  const handleBackToPhone = () => {
    dispatch(resetOtpStep());
    setValidationError(null);
    dispatch(clearError());
  };

  const handleClose = () => {
    dispatch(closeLoginModal());
    setValidationError(null);
    dispatch(clearError());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-xs flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/favicon.svg"
              alt="Trippy"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
              {otpSent ? t.auth.otpTitle : t.auth.loginTitle}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {otpSent ? (
                <span>
                  {t.auth.otpSubtitle}{' '}
                  <strong className="text-slate-900 font-mono">
                    {phone}
                  </strong>{' '}
                  <button
                    type="button"
                    onClick={handleBackToPhone}
                    className="text-emerald-700 hover:underline font-bold ml-1"
                  >
                    ({t.auth.changePhone})
                  </button>
                </span>
              ) : (
                t.auth.loginSubtitle
              )}
            </p>
          </div>
        </div>

        {/* Error Alert Display */}
        {(error || validationError) && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{error || validationError}</div>
          </div>
        )}

        {/* STEP 1: Phone Number Entry */}
        {!otpSent ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.auth.phoneLabel}
              </label>

              <div className="flex rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all overflow-hidden">
                {/* Country Code Pill */}
                <div className="flex items-center gap-1.5 px-3.5 bg-slate-100 border-r border-slate-200 text-slate-800 text-xs font-bold select-none">
                  <span>🇧🇩</span>
                  <span>+880</span>
                </div>

                <div className="flex-1 flex items-center px-3 gap-2">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.auth.phonePlaceholder}
                    className="w-full py-3 bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none font-mono"
                    maxLength={14}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !phone.trim()}
              className="w-full btn btn-primary py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-900 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.auth.sendingOtp}
                </>
              ) : (
                <>
                  {t.auth.sendOtp}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2">
              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                {t.auth.secureNote}
              </p>
            </div>
          </form>
        ) : (
          /* STEP 2: OTP Verification */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                {t.auth.otpLabel}
              </label>

              <div className="flex items-center px-4 rounded-xl border border-slate-200 bg-slate-50 focus-within:bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black/10 transition-all gap-3">
                <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.auth.otpPlaceholder}
                  className="w-full py-3 bg-transparent text-lg font-bold text-slate-900 tracking-widest placeholder-slate-400 focus:outline-none font-mono text-center"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !otp.trim()}
              className="w-full btn btn-primary py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-900 shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.auth.verifying}
                </>
              ) : (
                <>
                  {t.auth.verifyOtp}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Resend OTP Row */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="text-slate-600 hover:text-black font-semibold"
              >
                ← {t.auth.changePhone}
              </button>

              <div>
                {resendTimer > 0 ? (
                  <span className="text-slate-500 font-medium">
                    {t.auth.resendIn} <strong className="text-slate-900 font-mono">{resendTimer}{t.auth.seconds}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {t.auth.resendOtp}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
