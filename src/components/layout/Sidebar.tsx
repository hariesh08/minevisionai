import React from 'react';
import {
  LayoutDashboard,
  Video,
  Activity,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  ClipboardCheck,
  FileText,
  Bot,
  History,
  ShieldAlert,
  X,
} from 'lucide-react';
import StatusIndicator from '../common/StatusIndicator';
import { getRelativeDate } from '../../utils/dateUtils';
import { useRealTime } from '../../hooks/useRealTime';


export interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'cctv', name: 'CCTV AI', icon: Video, badge: 'LIVE' },
  { id: 'environment', name: 'Environment', icon: Activity, badge: 'ALERT' },
  { id: 'compliance', name: 'Compliance', icon: ShieldCheck },
  { id: 'violations', name: 'Violations', icon: AlertTriangle, badge: '4' },
  { id: 'risk-ai', name: 'Risk AI', icon: BrainCircuit },
  { id: 'corrective-actions', name: 'Corrective Actions', icon: ClipboardCheck },
  { id: 'reports', name: 'Reports', icon: FileText },
  { id: 'ai-assistant', name: 'AI Assistant', icon: Bot },
  { id: 'audit-log', name: 'Audit Log', icon: History },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { formattedTimeWithSeconds } = useRealTime();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0b132b] text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800/80 shadow-xl lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b132b] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">MineVision</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight leading-tight mt-0.5">
                Smart Mine Governance Platform
              </p>
            </div>
          </div>

          {/* Close for mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'LIVE'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        : item.badge === 'ALERT'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom System Status */}
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <StatusIndicator status="online" pulse size="sm" />
              <span className="text-xs font-semibold text-emerald-400">System Online</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              v2.4.8
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-medium space-y-0.5">
            <p className="text-slate-300 font-semibold">{getRelativeDate(0, 'full')}</p>
            <p className="text-slate-400 font-mono text-[10px]">{formattedTimeWithSeconds} IST</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
