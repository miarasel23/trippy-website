'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <span className="badge badge-warning mb-4">{t.notFound.badge}</span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading mb-4">
        {t.notFound.title}
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        {t.notFound.desc}
      </p>
      <Link href="/" className="btn btn-primary py-3 px-6 rounded-xl font-bold text-sm shadow-glow">
        {t.notFound.backHome}
      </Link>
    </div>
  );
}
