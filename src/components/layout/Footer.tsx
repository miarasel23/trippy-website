'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Shield, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="site-footer bg-white border-t border-slate-200 pt-16 pb-8 mt-24 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Col 1: Brand Bio */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <svg className="w-9 h-9" viewBox="0 0 44 44" fill="none">
                <rect width="44" height="44" rx="12" fill="url(#logo_grad_footer)"/>
                <path d="M12 16C12 14.8954 12.8954 14 14 14H30C31.1046 14 32 14.8954 32 16V18C32 19.1046 31.1046 20 30 20H24V31C24 32.1046 23.1046 33 22 33C20.8954 33 20 32.1046 20 31V20H14C12.8954 20 12 19.1046 12 18V16Z" fill="#090D16"/>
                <circle cx="22" cy="17" r="3" fill="#34D399"/>
                <defs>
                  <linearGradient id="logo_grad_footer" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#22C55E"/>
                    <stop offset="1" stopColor="#4ADE80"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-2xl font-extrabold text-slate-900 font-heading">
                {t.common.brandName}<span className="text-brand-primary">.</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed max-w-sm mb-6">
              {t.footer.bio}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Shield className="w-3.5 h-3.5 text-emerald-600" /> {t.common.verifiedDriver}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" /> {t.common.gpsProtected}
              </span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4 font-heading">
              {t.footer.colServices}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><Link href="/booking" className="hover:text-black transition-colors">{t.footer.services.daily}</Link></li>
              <li><Link href="/fleet" className="hover:text-black transition-colors">{t.footer.services.intercity}</Link></li>
              <li><Link href="/fleet" className="hover:text-black transition-colors">{t.footer.services.return}</Link></li>
              <li><Link href="/fleet" className="hover:text-black transition-colors">{t.footer.services.hourly}</Link></li>
              <li><Link href="/fleet" className="hover:text-black transition-colors">{t.footer.services.chander}</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4 font-heading">
              {t.footer.colPlatform}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li><Link href="/fleet" className="hover:text-black transition-colors">{t.footer.platform.fleet}</Link></li>
              <li><Link href="/tracking" className="hover:text-black transition-colors">{t.footer.platform.tracking}</Link></li>
              <li><Link href="/app" className="hover:text-black transition-colors">{t.footer.platform.app}</Link></li>
              <li><Link href="/app" className="hover:text-black transition-colors">{t.footer.platform.arch}</Link></li>
              <li><Link href="/app" className="hover:text-black transition-colors">{t.footer.platform.driverSignUp}</Link></li>
            </ul>
          </div>

          {/* Col 4: Safety & Support */}
          <div>
            <h4 className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4 font-heading">
              {t.footer.colSafety}
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/tracking" className="text-red-600 hover:text-red-700 transition-colors font-semibold flex items-center gap-1.5">
                  {t.footer.safety.sos}
                </Link>
              </li>
              <li><Link href="/tracking" className="hover:text-black transition-colors">{t.footer.safety.screening}</Link></li>
              <li>
                <a href="tel:16223" className="hover:text-black transition-colors flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-primary" /> {t.footer.safety.hotline}
                </a>
              </li>
              <li><Link href="/#faq" className="hover:text-black transition-colors">{t.footer.safety.faq}</Link></li>
              <li><Link href="/app" className="hover:text-black transition-colors">{t.footer.safety.privacy}</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} {t.common.brandName} Technologies Bangladesh Ltd. {t.common.allRightsReserved}</p>
          <p className="flex items-center gap-2">
            <span>{t.footer.cities}</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
