'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Download,
  Menu,
  X,
  Globe,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Car,
  Compass,
  Home,
  Radio,
  Smartphone,
  Phone,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { openLoginModal, logout } from '@/features/auth/store/authSlice';
import { useActiveTrip } from '@/features/trips/context/ActiveTripContext';
import { isTripReviewed } from '@/shared/utils/tripStorage';
import { getImageUrl } from '@/shared/config/appUrls';


export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t } = useLanguage();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { activeTrip, bidsCount } = useActiveTrip();

  // Prevent SSR/client hydration mismatch for client-only state
  // (activeTrip from storage, isAuthenticated from persisted Redux)
  useEffect(() => {
    setMounted(true);
  }, []);

  const isUserAuth = mounted && isAuthenticated;
  const userPhoto =
    user?.profile_picture ||
    (user as any)?.profile_image ||
    (user as any)?.avatar ||
    (user as any)?.image;

  const showActiveTripPill = Boolean(
    mounted &&
    activeTrip &&
    activeTrip.trip_status !== 'CANCELLED' &&
    activeTrip.trip_status !== 'CANCELED' &&
    !(
      (activeTrip.trip_status === 'COMPLETED' ||
        activeTrip.trip_status === 'FINISHED' ||
        activeTrip.trip_status === 'TRIP_COMPLETED') &&
      isTripReviewed(activeTrip, activeTrip.uuid)
    )
  );

  // Close user dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isUserMenuOpen]);

  const navLinks = useMemo(() => [
    { label: t.nav.home, href: '/', icon: Home },
    { label: t.nav.booking, href: '/booking', icon: Car },
    { label: t.nav.fleet, href: '/fleet', icon: Compass },
    { label: t.nav.tracking, href: '/tracking', icon: Radio },
    { label: t.nav.app, href: '/app', icon: Smartphone },
  ], [t.nav, language]);

  return (
    <header className="site-header sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo + Desktop Navigation */}
          <div className="flex items-center gap-10 xl:gap-14 flex-shrink-0">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center py-1 flex-shrink-0" aria-label="Trippy">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/trippy_logo.svg"
                alt="Trippy"
                width={140}
                height={38}
                loading="lazy"
                className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ width: '135px', height: '36px' }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 xl:gap-7 mr-2 lg:mr-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm tracking-normal transition-all duration-200 relative py-2 whitespace-nowrap ${
                      isActive ? 'text-black font-extrabold' : 'text-slate-600 hover:text-black font-semibold'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Action CTAs, Language Switcher & Authentication */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 flex-shrink-0 ml-auto pl-6 lg:pl-10">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-slate-100 border border-slate-300 p-1 gap-1 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 font-bold transition-all ${
                  language === 'en'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 font-bold transition-all ${
                  language === 'bn'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Active Trip Pill in Header for all trip lifecycle states */}
            {showActiveTripPill && activeTrip && (
              <Link
                href={
                  activeTrip.trip_status === 'REQUESTED'
                    ? `/trips?trip_uuid=${activeTrip.uuid}`
                    : `/tracking?trip_uuid=${activeTrip.uuid}`
                }
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold transition-all shadow-xs animate-pulse"
                title={
                  activeTrip.trip_status === 'REQUESTED'
                    ? language === 'bn'
                      ? 'চলমান ট্রিপ রাডার দেখুন'
                      : 'View live bidding radar'
                    : language === 'bn'
                    ? 'লাইভ ট্রিপ ট্র্যাকিং দেখুন'
                    : 'View live trip tracking'
                }
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>
                  {activeTrip.trip_status === 'REQUESTED'
                    ? language === 'bn'
                      ? 'চলমান ট্রিপ'
                      : 'Active Trip'
                    : activeTrip.trip_status === 'COMPLETED' ||
                      activeTrip.trip_status === 'FINISHED'
                    ? language === 'bn'
                      ? 'রিভিউ দিন'
                      : 'Rate Driver'
                    : language === 'bn'
                    ? 'লাইভ ট্র্যাকিং'
                    : 'Live Tracking'}
                  {activeTrip.trip_status === 'REQUESTED' && bidsCount > 0 ? ` (${bidsCount})` : ''}
                </span>
              </Link>
            )}

            {/* Login Button OR Authenticated User Dropdown */}
            {!isUserAuth ? (
              <button
                type="button"
                onClick={() => dispatch(openLoginModal())}
                className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition-all flex items-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                {t.auth.login}
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left shadow-xs whitespace-nowrap"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center font-heading flex-shrink-0 relative overflow-hidden">
                    <span className="select-none">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    {userPhoto && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={getImageUrl(userPhoto)}
                        alt={user?.full_name || 'User'}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 max-w-[150px] truncate">
                    {user?.full_name || 'User'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5 flex-shrink-0" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-50 animate-fade-in">
                    <div className="pb-3 border-b border-slate-100 px-2">
                      <div className="text-xs font-bold text-slate-900">{user?.full_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{user?.phone_number}</div>
                      {user?.email && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</div>
                      )}
                    </div>
                    <div className="py-2 border-b border-slate-100 space-y-1">
                      <Link
                        href="/trips"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Car className="w-3.5 h-3.5 text-slate-600" />
                          <span>{language === 'bn' ? 'আমার ট্রিপসমূহ' : 'My Trips'}</span>
                        </div>
                        {activeTrip && activeTrip.trip_status === 'REQUESTED' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        )}
                      </Link>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(logout());
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t.auth.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/app"
              className="btn btn-primary px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              {t.common.getTheApp}
            </Link>
          </div>

          {/* Mobile Menu Button, Mobile Auth & Quick Language Switcher */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Language Switcher Tab */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-900 flex items-center gap-1.5 transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Quick Auth icon for mobile */}
            {!isUserAuth ? (
              <button
                type="button"
                onClick={() => dispatch(openLoginModal())}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 flex items-center gap-1 transition-colors"
                aria-label="Login"
              >
                <User className="w-3.5 h-3.5" />
                {t.auth.login}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-7 h-7 bg-black text-white text-xs font-bold flex items-center justify-center font-heading border border-black relative overflow-hidden flex-shrink-0"
                aria-label="User Profile"
              >
                <span className="select-none">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </span>
                {userPhoto && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={getImageUrl(userPhoto)}
                    alt={user?.full_name || 'User'}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-black focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu (Sharp, Professional Executive Style) */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 bg-white mb-4 px-4 sm:px-5 shadow-xl animate-fade-in border border-slate-200">
            <div className="flex flex-col gap-3">
              {/* 1. Authenticated User Profile Card */}
              {isUserAuth && user ? (
                <div className="p-4 bg-slate-900 text-white shadow-md relative overflow-hidden border border-slate-800">
                  <div className="flex items-center justify-between relative z-10 pb-3 border-b border-slate-700/70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white text-slate-950 font-black text-base flex items-center justify-center font-heading border border-emerald-400/40 relative overflow-hidden flex-shrink-0">
                        <span className="select-none">
                          {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                        </span>
                        {userPhoto && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={getImageUrl(userPhoto)}
                            alt={user.full_name || 'User'}
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5 font-heading">
                          <span>{user.full_name}</span>
                          <span className="inline-block w-2 h-2 bg-emerald-400" />
                        </div>
                        <div className="text-xs text-slate-300 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{user.phone_number}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        dispatch(logout());
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                      title={t.auth.logout}
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-[11px] text-red-300 font-bold">{t.auth.logout}</span>
                    </button>
                  </div>

                  {/* My Trips Action Bar inside User Card */}
                  <Link
                    href="/trips"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-3 py-2 px-3 bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-between text-xs font-bold text-white transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-500/30 text-white flex items-center justify-center">
                        <Car className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>{language === 'bn' ? 'আমার ট্রিপসমূহ ও হিস্ট্রি' : 'My Trips & History'}</span>
                    </div>
                    {activeTrip && activeTrip.trip_status === 'REQUESTED' ? (
                      <span className="px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase animate-pulse">
                        {language === 'bn' ? 'চলমান বিড' : 'Active'}
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    )}
                  </Link>
                </div>
              ) : (
                /* Guest Sign-in Card */
                <div className="p-4 bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 font-heading">
                        {language === 'bn' ? 'স্বাগতম!' : 'Welcome to Trippy'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'লগইন করে আপনার ট্রিপ দেখুন' : 'Sign in to view your rides'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      dispatch(openLoginModal());
                    }}
                    className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.auth.login}</span>
                  </button>
                </div>
              )}

              {/* 2. Active Trip Banner (if any) */}
              {showActiveTripPill && activeTrip && (
                <Link
                  href={
                    activeTrip.trip_status === 'REQUESTED'
                      ? `/trips?trip_uuid=${activeTrip.uuid}`
                      : `/tracking?trip_uuid=${activeTrip.uuid}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 flex items-center justify-between text-emerald-950 font-bold text-xs transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-bold">
                      {activeTrip.trip_status === 'REQUESTED'
                        ? language === 'bn'
                          ? 'চলমান ট্রিপ রাডার'
                          : 'Live Trip Bidding Radar'
                        : activeTrip.trip_status === 'COMPLETED' ||
                          activeTrip.trip_status === 'FINISHED'
                        ? language === 'bn'
                          ? 'ট্রিপ সম্পন্ন • রিভিউ দিন'
                          : 'Trip Completed • Rate Driver'
                        : language === 'bn'
                        ? 'লাইভ ট্রিপ ট্র্যাকিং'
                        : 'Live Trip Tracking'}
                      {activeTrip.trip_status === 'REQUESTED' && bidsCount > 0 ? ` (${bidsCount})` : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-black flex items-center gap-0.5">
                    {language === 'bn' ? 'দেখুন' : 'View'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              )}

              {/* 3. Navigation List (Unified, Sharp Rows with Exact Left & Right Alignment) */}
              <nav className="flex flex-col border border-slate-200 divide-y divide-slate-100 bg-white">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full px-4 py-3 flex items-center justify-between text-sm transition-all group ${
                        isActive
                          ? 'bg-slate-900 text-white font-bold'
                          : 'text-slate-800 hover:bg-slate-50 hover:text-black font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 flex items-center justify-center border transition-colors ${
                            isActive
                              ? 'border-white/20 bg-white/10 text-white'
                              : 'border-slate-200 bg-slate-50 text-slate-600 group-hover:border-slate-300 group-hover:text-black'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="tracking-tight text-sm">{link.label}</span>
                      </div>

                      {isActive ? (
                        <span className="w-2 h-2 bg-emerald-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* 4. Bottom Controls: Exact Same Left-Right Alignment */}
              <div className="flex flex-col gap-2.5 pt-1">

                {/* Quick 24/7 Helpline & SOS strip */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:01997709990"
                    className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-3 text-xs font-bold text-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-700 flex-shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="truncate tracking-tight">{language === 'bn' ? 'হেল্পলাইন' : 'Helpline'}</span>
                  </a>

                  <a
                    href="tel:999"
                    className="w-full px-4 py-2.5 bg-red-50/50 hover:bg-red-100/70 border border-red-200 flex items-center gap-3 text-xs font-bold text-red-700 transition-colors"
                  >
                    <div className="w-8 h-8 flex items-center justify-center border border-red-200 bg-red-100/60 text-red-600 flex-shrink-0">
                      <Shield className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="truncate tracking-tight">{language === 'bn' ? 'জরুরী ৯৯৯' : 'SOS 999'}</span>
                  </a>
                </div>

                {/* Download App CTA */}
                <Link
                  href="/app"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 px-4 bg-black hover:bg-neutral-900 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{t.common.getTheApp}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};

