import React from 'react';

interface QrCodeBoxProps {
  title?: string;
  subtitle?: string;
  category?: string;
  className?: string;
}

export const QrCodeBox: React.FC<QrCodeBoxProps> = ({
  title = 'Install on Phone Instantly',
  subtitle = 'Works with any QR camera app',
  category = 'Instant QR Scan',
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-4 bg-brand-card/85 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-card ${className}`}>
      <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex-shrink-0 flex items-center justify-center shadow-md">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#ffffff" />
          <rect x="10" y="10" width="30" height="30" fill="#000000" />
          <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
          <rect x="20" y="20" width="10" height="10" fill="#000000" />
          <rect x="60" y="10" width="30" height="30" fill="#000000" />
          <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
          <rect x="70" y="20" width="10" height="10" fill="#000000" />
          <rect x="10" y="60" width="30" height="30" fill="#000000" />
          <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
          <rect x="20" y="70" width="10" height="10" fill="#000000" />
          <rect x="50" y="50" width="15" height="15" fill="#10B981" />
          <rect x="70" y="70" width="20" height="20" fill="#000000" />
        </svg>
      </div>
      <div className="text-left">
        <span className="text-[10px] uppercase font-bold text-brand-primary-light tracking-wider block">
          {category}
        </span>
        <h4 className="text-sm font-bold text-white leading-snug">
          {title}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
