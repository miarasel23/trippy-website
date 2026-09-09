import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20">
      <span className="badge badge-amber mb-4">404 - Page Not Found</span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-heading mb-4">
        Destination Not Found
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The route you are looking for has taken a detour or does not exist. Return home to continue your journey.
      </p>
      <Link href="/" className="btn btn-primary py-3 px-6 rounded-xl font-bold text-sm shadow-glow">
        Back to Home
      </Link>
    </div>
  );
}
