import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <span className="badge badge-warning mb-4">404</span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading mb-4">
        Page Not Found / পৃষ্ঠাটি পাওয়া যায়নি
      </h1>
      <p className="text-slate-600 text-sm max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="btn btn-primary py-3 px-6 rounded-xl font-bold text-sm bg-black text-white hover:bg-slate-900 shadow-md"
      >
        Back to Home / হোমে ফিরে যান
      </Link>
    </div>
  );
}
