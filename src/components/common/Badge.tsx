import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'warning' | 'danger' | 'white' | 'amber' | 'cyan';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
  icon,
}) => {
  const variantStyles: Record<string, string> = {
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm',
    cyan: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    warning: 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm',
    amber: 'bg-amber-50 text-amber-800 border-amber-300',
    danger: 'bg-red-50 text-red-800 border-red-300 shadow-sm',
    white: 'bg-slate-100 text-slate-900 border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md transition-all ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {children}
    </span>
  );
};
