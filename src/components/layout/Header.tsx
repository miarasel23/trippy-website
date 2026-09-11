'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Menu, X, Globe, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { openLoginModal, logout } from '@/redux/features/authSlice';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { language, setLanguage, t } = useLanguage();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

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

  const navLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.booking, href: '/booking' },
    { label: t.nav.fleet, href: '/fleet' },
    { label: t.nav.tracking, href: '/tracking' },
    { label: t.nav.app, href: '/app' },
  ];

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
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 gap-1 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
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
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  language === 'bn'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                বাংলা
              </button>
            </div>

            {/* Login Button OR Authenticated User Dropdown */}
            {!isAuthenticated ? (
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
                  <div className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center font-heading flex-shrink-0">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
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
            {/* Quick Auth icon for mobile */}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => dispatch(openLoginModal())}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1"
                aria-label="Login"
              >
                <User className="w-3.5 h-3.5" />
                {t.auth.login}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center font-heading"
                aria-label="User Profile"
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </button>
            )}

            {/* Mobile Lang Button */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1"
              aria-label="Toggle language"
            >
              <Globe className="w-3 h-3" />
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>

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

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 bg-white rounded-2xl mb-4 px-4 shadow-xl animate-fade-in">
            <nav className="flex flex-col gap-2">
              {/* If authenticated in mobile, show profile header */}
              {isAuthenticated && user && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{user.full_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{user.phone_number}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(logout());
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t.auth.logout}
                  </button>
                </div>
              )}

              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-slate-100 text-black font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-black'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Language Switcher Row */}
              <div className="flex items-center justify-between px-4 py-2 mt-1 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-black" /> {t.common.switchLanguage}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      language === 'en' ? 'bg-black text-white' : 'text-slate-600'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      language === 'bn' ? 'bg-black text-white' : 'text-slate-600'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-200 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      dispatch(openLoginModal());
                    }}
                    className="btn btn-secondary w-full py-2.5 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {t.auth.login}
                  </button>
                ) : null}

                <Link
                  href="/booking"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-secondary w-full py-2.5 text-sm font-semibold rounded-xl text-center"
                >
                  {t.common.onlineBooking}
                </Link>
                <Link
                  href="/app"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn btn-primary w-full py-2.5 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t.common.getTheApp}
                </Link>
              </div>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};

