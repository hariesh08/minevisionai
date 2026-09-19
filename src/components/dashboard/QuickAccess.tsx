import React from 'react';
import {
  Video,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  FileText,
  Bot,
  Compass,
} from 'lucide-react';

export interface QuickAccessProps {
  onAction: (actionId: string) => void;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ onAction }) => {
  const actions = [
    {
      id: 'cctv',
      title: 'View CCTV',
      icon: Video,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-400',
    },
    {
      id: 'compliance',
      title: 'Check Compliance',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverBorder: 'hover:border-emerald-400',
    },
    {
      id: 'violations',
      title: 'View Violations',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverBorder: 'hover:border-red-400',
    },
    {
      id: 'risk-ai',
      title: 'Risk Prediction',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      hoverBorder: 'hover:border-indigo-400',
    },
    {
      id: 'reports',
      title: 'Generate Report',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverBorder: 'hover:border-blue-400',
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      icon: Bot,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverBorder: 'hover:border-purple-400',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <Compass className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Quick Access</h2>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onAction(act.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all duration-150 text-left group shadow-2xs ${act.hoverBorder}`}
            >
              <div
                className={`w-7 h-7 rounded-md ${act.bgColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}
              >
                <Icon className={`w-3.5 h-3.5 ${act.color}`} />
              </div>
              <span className="truncate group-hover:text-slate-900">{act.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAccess;
