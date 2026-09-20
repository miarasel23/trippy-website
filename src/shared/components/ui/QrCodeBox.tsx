'use client';

import React from 'react';

interface QrCodeBoxProps {
  title?: string;
  subtitle?: string;
  category?: string;
  className?: string;
  /** The URL to encode in the QR code */
  url?: string;
  /** Optional href to make the entire card clickable */
  link?: string;
}

// Android robot icon SVG matching the user's reference image
const AndroidRobotIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-black" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.523 15.341c-.49 0-.887-.399-.887-.89s.397-.89.887-.89c.49 0 .887.399.887.89s-.397.89-.887.89zm-11.046 0c-.49 0-.887-.399-.887-.89s.397-.89.887-.89c.49 0 .887.399.887.89s-.397.89-.887.89zm11.41-6.009l1.77-3.067a.368.368 0 0 0-.135-.503.368.368 0 0 0-.503.135L17.233 9c-1.543-.707-3.274-1.101-5.133-1.101-1.86 0-3.59.394-5.133 1.101L5.18 5.897a.368.368 0 0 0-.503-.135.368.368 0 0 0-.135.503l1.77 3.067C3.948 10.723 2.4 13.201 2.4 16h19.2c0-2.799-1.548-5.277-3.713-6.668z" />
  </svg>
);

export const QrCodeBox: React.FC<QrCodeBoxProps> = ({
  title = 'Install on Phone Instantly',
  subtitle = 'Works with any camera QR scanner',
  category = 'POINT CAMERA & SCAN',
  className = '',
  url = 'https://trippybd.com/get-app',
  link,
}) => {
  // Generate real QR code via qrserver API with high error correction (ecc=H)
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&ecc=H&data=${encodeURIComponent(url)}`;

  const innerContent = (
    <div className="w-full flex items-center gap-4 bg-white border border-slate-300 p-4 shadow-sm hover:border-black hover:shadow-md transition-all cursor-pointer">
      {/* QR Code with Android icon overlay - zero border radius */}
      <div className="relative flex-shrink-0 w-[72px] h-[72px] border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrSrc}
          alt="QR code to download Trippy app"
          width={72}
          height={72}
          className="w-full h-full object-contain block"
          loading="lazy"
        />
        {/* Center Android Icon with sharp square white backing matching reference */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[20px] h-[20px] bg-white border border-slate-200 flex items-center justify-center shadow-xs">
            <div className="w-[14px] h-[14px]">
              <AndroidRobotIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="text-left flex-1 min-w-0">
        <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-[0.16em] block">
          {category}
        </span>
        <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-tight truncate">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{subtitle}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className={`block ${className}`}>
        {innerContent}
      </a>
    );
  }

  return (
    <div className={`block ${className}`}>
      {innerContent}
    </div>
  );
};
