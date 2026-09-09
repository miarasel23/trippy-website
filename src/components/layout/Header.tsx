'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { label: t.nav.home, href: '/' },
    { label: t.nav.booking, href: '/booking' },
    { label: t.nav.fleet, href: '/fleet' },
    { label: t.nav.tracking, href: '/tracking' },
    { label: t.nav.app, href: '/app' },
  ];

  return (
    <header className="site-header sticky top-0 z-50 backdrop-blur-xl bg-brand-dark/85 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="brand-logo flex items-center gap-3 group">
            <div className="relative">
              <svg className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="44" height="44" rx="12" fill="url(#logo_grad_header)"/>
                <path d="M12 16C12 14.8954 12.8954 14 14 14H30C31.1046 14 32 14.8954 32 16V18C32 19.1046 31.1046 20 30 20H24V31C24 32.1046 23.1046 33 22 33C20.8954 33 20 32.1046 20 31V20H14C12.8954 20 12 19.1046 12 18V16Z" fill="#090D16"/>
                <circle cx="22" cy="17" r="3" fill="#34D399"/>
                <defs>
                  <linearGradient id="logo_grad_header" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10B981"/>
                    <stop offset="1" stopColor="#06B6D4"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white font-heading">
              {t.common.brandName}<span className="text-brand-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold tracking-wide transition-all duration-200 relative py-2 ${
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1 gap-1 text-xs">
              <Globe className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  language === 'en'
                    ? 'bg-brand-primary text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all font-heading ${
                  language === 'bn'
                    ? 'bg-brand-primary text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>

            <Link
              href="/booking"
              className="btn btn-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl hover:border-brand-primary/40"
            >
              {t.common.onlineBooking}
            </Link>
            <Link
              href="/app"
              className="btn btn-primary btn-glow px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-glow"
            >
              <Download className="w-4 h-4" />
              {t.common.getTheApp}
            </Link>
          </div>

          {/* Mobile Menu Button & Quick Language Switcher */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Lang Button */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-brand-primary-light flex items-center gap-1"
              aria-label="Toggle language"
            >
              <Globe className="w-3 h-3" />
              {language === 'en' ? 'বাংলা' : 'EN'}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-brand-card/95 backdrop-blur-2xl rounded-2xl mb-4 px-4 shadow-modal animate-fade-in">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-brand-primary/15 text-brand-primary border border-brand-primary/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Language Switcher Row */}
              <div className="flex items-center justify-between px-4 py-2 mt-1 bg-black/30 rounded-xl border border-white/5">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-brand-primary" /> {t.common.switchLanguage}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      language === 'en' ? 'bg-brand-primary text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      language === 'bn' ? 'bg-brand-primary text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
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
