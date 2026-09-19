import { getRelativeDate } from '../../utils/dateUtils';
import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Calendar,
  ChevronDown,
  Menu,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  User,
  Settings,
  LogOut,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { useRealTime } from '../../hooks/useRealTime';

export interface TopbarProps {
  onOpenMobileMenu?: () => void;
  onSearchChange?: (query: string) => void;
  onSelectAlert?: (alertId: string) => void;
  onQuickAction?: (actionId: string) => void;
  darkMode?: boolean;
  onToggleDark?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onSearchChange,
  onSelectAlert,
  onQuickAction,
  darkMode = false,
  onToggleDark,
}) => {
  const { formattedTimeWithSeconds } = useRealTime();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearchChange) onSearchChange(e.target.value);
  };

  const notificationList = [
    {
      id: 'alert-1',
      title: 'PPE Violation detected: Zone B',
      desc: 'Worker W102 flagged with No Helmet by Computer Vision CAM 01',
      time: '10:42 AM',
      type: 'high',
    },
    {
      id: 'alert-2',
      title: 'Restricted Zone Perimeter Breach',
      desc: 'Personnel entered Zone A blast perimeter buffer',
      time: '11:17 AM',
      type: 'high',
    },
    {
      id: 'alert-3',
      title: 'High PM10 Dust Concentration',
      desc: 'Zone C sensor #C-14 reached 92 µg/m³ threshold',
      time: '12:05 PM',
      type: 'warning',
    },
    {
      id: 'alert-4',
      title: 'DGMS Shift Inspection Scheduled',
      desc: 'Bi-weekly mechanical conveyor audit due in 2 hours',
      time: '12:30 PM',
      type: 'info',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 shadow-xs">
      {/* Left section: Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Large search bar */}
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search zones, workers, violations..."
            className="block w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                if (onSearchChange) onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right section: Calendar & Time, Notification Bell, User profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Calendar and Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>{getRelativeDate(0, 'full')}</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700">{formattedTimeWithSeconds}</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1 border-2 border-white shadow-xs">
              8
            </span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-800">Active Mine Alerts</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-full">
                    8 New
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    if (onQuickAction) onQuickAction('view-alerts');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notificationList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setNotificationsOpen(false);
                      if (onSelectAlert) onSelectAlert(item.id);
                    }}
                    className="p-3 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-slate-600 hover:text-slate-800 font-medium"
                >
                  Mark all as acknowledged
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left focus:outline-none"
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold text-xs flex items-center justify-center shadow-xs border border-blue-200">
                U
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-800 leading-none">User</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-none">Safety Officer</div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">User</p>
                <p className="text-[11px] text-slate-500">DGMS Cert. First Class Manager</p>
                <p className="text-[10px] text-blue-600 font-mono mt-0.5">ID: MG-SO-8492</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onQuickAction) onQuickAction('compliance');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span>Safety Credentials</span>
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onQuickAction) onQuickAction('audit-log');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>My Inspection Logs</span>
                </button>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Platform Preferences</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out (End Shift)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
