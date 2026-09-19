import React from 'react';

export interface StatusIndicatorProps {
  status: 'online' | 'active' | 'normal' | 'warning' | 'high' | 'critical' | 'connected' | 'offline';
  label?: string;
  pulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  pulse = false,
  size = 'sm',
  className = '',
}) => {
  const dotColorMap = {
    online: 'bg-emerald-500',
    active: 'bg-emerald-500',
    normal: 'bg-emerald-500',
    connected: 'bg-emerald-500',
    warning: 'bg-amber-500',
    high: 'bg-red-500',
    critical: 'bg-red-600',
    offline: 'bg-slate-400',
  };

  const pingColorMap = {
    online: 'bg-emerald-400',
    active: 'bg-emerald-400',
    normal: 'bg-emerald-400',
    connected: 'bg-emerald-400',
    warning: 'bg-amber-400',
    high: 'bg-red-400',
    critical: 'bg-red-500',
    offline: 'bg-slate-300',
  };

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  const currentDot = dotColorMap[status] || 'bg-slate-400';
  const currentPing = pingColorMap[status] || 'bg-slate-300';
  const dotSize = sizeMap[size];

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="relative flex items-center justify-center">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentPing}`}
          />
        )}
        <span className={`relative inline-flex rounded-full ${dotSize} ${currentDot}`} />
      </span>
      {label && <span className="font-medium text-inherit">{label}</span>}
    </span>
  );
};

export default StatusIndicator;
