import React from 'react';

interface BadgeProps {
  variant?: 'primary' | 'cyan' | 'amber' | 'danger';
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
  const variantStyles = {
    primary: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/10 text-red-400 border-red-500/30',
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
