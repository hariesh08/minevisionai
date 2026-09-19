import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'danger' | 'warning' | 'success' | 'info' | 'purple' | 'neutral' | 'high' | 'medium' | 'low';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    danger: 'bg-red-50 text-red-600 border-red-200/80',
    high: 'bg-red-50 text-red-600 border-red-200/80',
    warning: 'bg-orange-50 text-orange-600 border-orange-200/80',
    medium: 'bg-orange-50 text-orange-600 border-orange-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    low: 'bg-amber-50 text-amber-700 border-amber-200/80',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotColors = {
    danger: 'bg-red-500',
    high: 'bg-red-500',
    warning: 'bg-orange-500',
    medium: 'bg-orange-500',
    success: 'bg-emerald-500',
    low: 'bg-amber-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    neutral: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-md',
  };

  const selectedVariant = variant.toLowerCase() as keyof typeof variantStyles;
  const currentStyle = variantStyles[selectedVariant] || variantStyles.neutral;
  const currentDot = dotColors[selectedVariant] || dotColors.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border leading-tight select-none ${currentStyle} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${currentDot}`} />}
      {children}
    </span>
  );
};

export default Badge;
