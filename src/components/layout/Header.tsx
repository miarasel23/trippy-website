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
    <header className="site-header sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="brand-logo flex items-center group py-1" aria-label="Tripyy Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/tripyy_logo.svg"
              alt="Tripyy"
              width={145}
              height={40}
              className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
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
                    isActive ? 'text-black font-bold' : 'text-slate-600 hover:text-black'
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

          {/* Action CTAs & Language Switcher */}
          <div className="hidden lg:flex items-center gap-3">
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
                className={`px-2.5 py-1 rounded-lg font-bold transition-all font-heading ${
                  language === 'bn'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-slate-600 hover:text-black'
                }`}
              >
                বাংলা
              </button>
            </div>

            <Link
              href="/booking"
              className="btn btn-secondary px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-slate-900"
            >
              {t.common.onlineBooking}
            </Link>
            <Link
              href="/app"
              className="btn btn-primary px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-2"
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
