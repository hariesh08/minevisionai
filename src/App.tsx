import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Dashboard from './pages/Dashboard';
import Compliance from './pages/Compliance';
import RiskAI from './pages/RiskAI';
import CorrectiveActions from './pages/CorrectiveActions';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import { MineGuardProvider, useMineGuard } from './context/MineGuardContext';
import {
  Video,
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
} from 'lucide-react';
import { recentViolations, environmentalParams, aiComplianceQA } from './data/mockData';
import Badge from './components/common/Badge';

function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('minevision-theme');
      if (saved) return saved === 'dark';
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('minevision-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Determine active tab from current URL pathname
  const getTabFromPath = (path: string): string => {
    const segment = path.replace(/^\//, '').split('/')[0];
    if (!segment || segment === 'dashboard') return 'dashboard';
    return segment;
  };

  const currentTab = getTabFromPath(location.pathname);

  const handleSelectTab = (tabId: string) => {
    if (tabId === 'dashboard') {
      navigate('/');
    } else {
      navigate(`/${tabId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] dark:bg-[#0b1220] text-slate-800 dark:text-slate-200 flex">
      {/* 2. Left Sidebar (Reused without modification) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
        {/* 3. Top Navigation Bar (Reused without modification) */}
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onSearchChange={(q) => setGlobalSearch(q)}
          onSelectAlert={(id) => handleSelectTab('violations')}
          onQuickAction={(action) => handleSelectTab(action)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode((prev) => !prev)}
        />

        {/* Main Content Area with Working Routes */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1720px] w-full mx-auto">
          <Routes>
            {/* Dashboard routes */}
            <Route
              path="/"
              element={<Dashboard onNavigateTab={handleSelectTab} searchFilter={globalSearch} />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard onNavigateTab={handleSelectTab} searchFilter={globalSearch} />}
            />

            {/* 5 Newly Implemented & Connected Pages */}
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/risk-ai" element={<RiskAI />} />
            <Route path="/corrective-actions" element={<CorrectiveActions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/audit-log" element={<AuditLog />} />

            {/* Preserved Working Pages */}
            <Route
              path="/cctv"
              element={
                <div className="space-y-4 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Dashboard</span>
                      </button>
                      <h1 className="text-xl font-bold text-slate-900">
                        CCTV AI - Intelligent Computer Vision Surveillance
                      </h1>
                      <p className="text-xs text-slate-500">
                        Real-time edge analytics tracking PPE compliance and hazardous zone intrusion
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span>3 Cameras Online</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      'ZONE B - CAM 01 (Extraction Face)',
                      'ZONE A - CAM 02 (Haul Road)',
                      'ZONE C - CAM 03 (Crusher)',
                    ].map((camName, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
                      >
                        <div className="bg-slate-900 p-2.5 flex items-center justify-between text-xs text-white">
                          <span className="font-mono font-medium">{camName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">1080p • 30fps</span>
                        </div>
                        <div className="h-48 bg-slate-950 relative flex items-center justify-center">
                          <Video className="w-8 h-8 text-slate-700" />
                          <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded">
                            LIVE AI MONITORING
                          </div>
                          {idx === 0 && (
                            <div className="absolute top-1/3 left-1/3 border-2 border-red-500 bg-red-500/20 px-2 py-1 text-[10px] text-white font-mono">
                              Worker #W102 [No Helmet]
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-slate-50 flex items-center justify-between text-xs">
                          <span className="text-slate-600">Model: YOLOv8-Safety</span>
                          <span className="text-emerald-600 font-bold">Optimal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            <Route
              path="/environment"
              element={
                <div className="space-y-4 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Dashboard</span>
                      </button>
                      <h1 className="text-xl font-bold text-slate-900">
                        Mine Environmental & DGMS Telemetry
                      </h1>
                      <p className="text-xs text-slate-500">
                        Continuous emission, particulate, ambient gas, and noise sensor networks
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {environmentalParams.map((p) => (
                      <div
                        key={p.parameter}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
                      >
                        <span className="text-xs text-slate-500 font-medium">{p.parameter}</span>
                        <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                          {p.current}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                          <span className="text-slate-400">Limit: {p.threshold}</span>
                          <Badge variant={p.status === 'Warning' ? 'warning' : 'success'}>
                            {p.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            />

            <Route
              path="/violations"
              element={
                <div className="space-y-4 pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-1"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Dashboard</span>
                      </button>
                      <h1 className="text-xl font-bold text-slate-900">
                        Safety Violations & Non-Compliance Records
                      </h1>
                      <p className="text-xs text-slate-500">
                        DGMS Coal Mines Regulations 2017 infraction management and corrective ticketing
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        Recorded Violations (Current Shift)
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Total: 4</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="p-3">Time</th>
                            <th className="p-3">Zone</th>
                            <th className="p-3">Personnel</th>
                            <th className="p-3">Violation</th>
                            <th className="p-3">Severity</th>
                            <th className="p-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {recentViolations.map((v) => (
                            <tr key={v.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono">{v.time}</td>
                              <td className="p-3 font-bold">Zone {v.zone}</td>
                              <td className="p-3 text-slate-700">{v.workerName || 'Crew Member'}</td>
                              <td className="p-3 font-medium text-slate-900">{v.violation}</td>
                              <td className="p-3">
                                <Badge variant={v.severity === 'High' ? 'danger' : 'warning'}>
                                  {v.severity}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Badge variant={v.status === 'Resolved' ? 'success' : 'danger'}>
                                  {v.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              }
            />

            <Route
              path="/ai-assistant"
              element={
                <AIAssistantPage onBack={() => navigate('/')} />
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Dedicated AI Assistant view for /ai-assistant
function AIAssistantPage({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('');
  const [chatLog, setChatLog] = useState([
    {
      sender: 'ai',
      text: 'Hello Safety Officer Harini N. I am MineVision AI, calibrated on DGMS circulars, CMR 2017, and live mine telemetry. Ask me anything regarding active zones, PPE detections, or statutory requirements.',
      time: '10:42 AM',
    },
  ]);

  const handleSend = (text?: string) => {
    const q = text || query;
    if (!q.trim()) return;

    setChatLog((prev) => [
      ...prev,
      { sender: 'user', text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setQuery('');

    setTimeout(() => {
      let ans =
        'According to DGMS CMR 2017 regulations and current shift telemetry, continuous surveillance is active across all sectors. Please ensure highwall inspections in Zone B are prioritized.';
      const lower = q.toLowerCase();
      if (lower.includes('zone b') || lower.includes('risk')) {
        ans =
          'Zone B risk score is currently 78/100 (HIGH). The primary drivers are high respirable dust count (78 µg/m³) and repeated helmet removal near Loader L-04. Recommended action: inspect misting suppression and deploy safety marshal.';
      } else if (lower.includes('violation')) {
        ans =
          'Today 4 statutory violations were logged: 1) No Helmet in Zone B (Open, High); 2) Restricted Zone Entry in Zone A (Open, High); 3) High Dust in Zone C (Investigating, Medium); 4) PPE Issue in Zone D (Resolved, Low).';
      } else if (lower.includes('report')) {
        ans =
          'Shift Safety Report ready: Overall compliance 92%. Active workforce 218. Zero lost time accidents in 418 days.';
      }

      setChatLog((prev) => [
        ...prev,
        { sender: 'ai', text: ans, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    }, 500);
  };

  return (
    <div className="space-y-4 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <span>MineVision AI Compliance Assistant</span>
          </h1>
          <p className="text-xs text-slate-500">
            Interactive natural language assistant for coal mine safety governance and DGMS rules
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col h-[520px]">
        {/* Suggested queries */}
        <div className="flex flex-wrap gap-1.5 pb-3 border-b border-slate-100">
          {['Why is Zone B risky?', "Show today's violations", 'Generate safety report'].map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full font-medium transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>{s}</span>
            </button>
          ))}
        </div>

        {/* Chat message thread */}
        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          {chatLog.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${m.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-lg p-3 rounded-xl text-xs leading-relaxed ${
                  m.sender === 'ai'
                    ? 'bg-slate-50 border border-slate-200 text-slate-800'
                    : 'bg-blue-600 text-white font-medium'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[9px] block mt-1 text-right font-mono ${
                    m.sender === 'ai' ? 'text-slate-400' : 'text-blue-200'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input box */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about safety, violations, or compliance..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MineGuardProvider>
        <AppLayout />
      </MineGuardProvider>
    </BrowserRouter>
  );
}
