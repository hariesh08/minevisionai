import React from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  FileWarning,
  ClipboardList,
} from 'lucide-react';
import { DashboardStat } from '../../data/mockData';

export interface StatCardProps {
  stat: DashboardStat;
  onClick?: () => void;
}

const iconMap = {
  Users,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  FileWarning,
  ClipboardList,
};

const colorStyles = {
  blue: {
    bg: 'bg-blue-500/10',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
  },
  red: {
    bg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    borderColor: 'border-red-100',
  },
  purple: {
    bg: 'bg-purple-500/10',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-100',
  },
  orange: {
    bg: 'bg-orange-500/10',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-100',
  },
  cyan: {
    bg: 'bg-teal-500/10',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-100',
  },
  indigo: {
    bg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-100',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ stat, onClick }) => {
  const IconComponent = iconMap[stat.iconName] || Users;
  const colors = colorStyles[stat.color] || colorStyles.blue;

  // Determine trend color
  const isPositiveImprovement =
    (stat.id === 'compliance-score' && stat.trend === 'up') ||
    (stat.id === 'total-workers' && stat.trend === 'up') ||
    (stat.id === 'active-workers' && stat.trend === 'up') ||
    (stat.id === 'open-violations' && stat.trend === 'down') ||
    (stat.id === 'pending-inspections' && stat.trend === 'down');

  const isAlarmingTrend =
    (stat.id === 'active-alerts' && stat.trend === 'up') ||
    (stat.id === 'high-risk-zones' && stat.trend === 'up');

  const trendColorClass = isAlarmingTrend
    ? 'text-red-600'
    : isPositiveImprovement
    ? 'text-emerald-600'
    : stat.trend === 'neutral'
    ? 'text-slate-500'
    : 'text-emerald-600';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-150 cursor-pointer flex flex-col justify-between group`}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${colors.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
        >
          <IconComponent className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${colors.iconColor}`} />
        </div>
        <span className="text-xs font-medium text-slate-600 truncate leading-tight">
          {stat.title}
        </span>
      </div>

      <div>
        <div className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight leading-none">
          {stat.value}
        </div>

        <div className="flex items-center gap-1.5 mt-2 text-[11px] leading-none">
          <span className={`font-semibold ${trendColorClass}`}>{stat.change}</span>
          <span className="text-slate-400 font-normal">{stat.comparison}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
