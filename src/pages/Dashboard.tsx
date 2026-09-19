import React, { useState, useEffect } from 'react';
import { Calendar, FileCheck, Shield, Sparkles, Download, CheckCircle2, Search } from 'lucide-react';
import { dashboardStats, mineZones, recentAlerts, recentViolations, liveCCTVViolation } from '../data/mockData';
import StatCard from '../components/dashboard/StatCard';
import MineZoneMap from '../components/dashboard/MineZoneMap';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import RiskTrend from '../components/dashboard/RiskTrend';
import LiveCCTV from '../components/dashboard/LiveCCTV';
import EnvironmentMonitoring from '../components/dashboard/EnvironmentMonitoring';
import QuickAccess from '../components/dashboard/QuickAccess';
import SystemStatus from '../components/dashboard/SystemStatus';
import RecentViolations from '../components/dashboard/RecentViolations';
import AIComplianceAssistant from '../components/dashboard/AIComplianceAssistant';
import Modal from '../components/common/Modal';
import { getRelativeDate } from '../utils/dateUtils';
import { downloadPdf } from '../utils/reportPdf';


export interface DashboardProps {
  onNavigateTab?: (tabId: string) => void;
  searchFilter?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, searchFilter = '' }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [complianceModalOpen, setComplianceModalOpen] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'reports') {
      setReportModalOpen(true);
    } else if (actionId === 'compliance') {
      setComplianceModalOpen(true);
    } else if (onNavigateTab) {
      onNavigateTab(actionId);
    }
  };

  const handleGenerateReport = () => {
    setReportGenerating(true);
    setTimeout(() => {
      setReportGenerating(false);
      setReportGenerated(true);
    }, 1200);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* 4. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome, Demo User!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here's what's happening at your mine today.
          </p>
        </div>

        {/* Small badge / calendar for mobile or right header alignment */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{currentDateTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-700 font-semibold">{currentDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}</span>
        </div>
      </div>

      {searchFilter.trim() && (
        <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 text-blue-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span>
            Filtering dashboard by "{searchFilter.trim()}" — matching zones are highlighted, alerts
            and violations filtered.
          </span>
        </div>
      )}

      {/* 5. Top 7 Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.id}
            stat={stat}
            onClick={() => {
              if (stat.id === 'compliance-score') setComplianceModalOpen(true);
              if (stat.id === 'active-alerts' && onNavigateTab) onNavigateTab('violations');
              if (stat.id === 'open-violations' && onNavigateTab) onNavigateTab('violations');
              if (stat.id === 'pending-inspections') setReportModalOpen(true);
            }}
          />
        ))}
      </div>

      {/* Main Content Grid: Row 1 */}
      {/* Mine Zone Map (42%) | Recent Alerts (28%) | Risk Trend (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-5 h-[340px] sm:h-[370px]">
          <MineZoneMap
            searchQuery={searchFilter}
            onOpenCCTV={(zone) => {
              if (onNavigateTab) onNavigateTab('cctv');
            }}
          />
        </div>
        <div className="lg:col-span-3 h-[340px] sm:h-[370px]">
          <RecentAlerts searchQuery={searchFilter} onViewAll={() => onNavigateTab && onNavigateTab('violations')} />
        </div>
        <div className="lg:col-span-4 h-[340px] sm:h-[370px]">
          <RiskTrend />
        </div>
      </div>

      {/* Main Content Grid: Row 2 */}
      {/* Live CCTV - Zone B (32%) | Environmental Monitoring (43%) | Quick Access + System Status (25%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-4 flex flex-col">
          <LiveCCTV />
        </div>

        <div className="lg:col-span-5 flex flex-col">
          <EnvironmentMonitoring
            onViewDetails={() => onNavigateTab && onNavigateTab('environment')}
          />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-3">
          <QuickAccess onAction={handleQuickAction} />
          <SystemStatus />
        </div>
      </div>

      {/* Main Content Grid: Row 3 */}
      {/* Recent Violations Table (72%) | AI Compliance Assistant (28%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <RecentViolations searchQuery={searchFilter} onViewAll={() => onNavigateTab && onNavigateTab('violations')} />
        </div>
        <div className="lg:col-span-4 flex flex-col justify-end">
          <AIComplianceAssistant onOpenAssistantModal={() => { }} />
        </div>
      </div>

      {/* Report Generator Modal */}
      {reportModalOpen && (
        <Modal
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportGenerated(false);
          }}
          title="MineVision AI Shift Governance Report"
          subtitle="Statutory Safety Inspection & DGMS CMR 2017 Audit"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500 font-mono">
                Report Code: DGMS-MG-2026-0918
              </span>
              <div className="flex items-center gap-2">
                {!reportGenerated ? (
                  <button
                    onClick={handleGenerateReport}
                    disabled={reportGenerating}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{reportGenerating ? 'Synthesizing...' : 'Generate Shift PDF'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      downloadPdf({
                        title: 'MineVision AI Shift Governance Report',
                        subtitle: 'Statutory Safety Inspection & DGMS CMR 2017 Audit',
                        period: getRelativeDate(0, 'full'),
                        mine: 'Pit #3 Northern Block, Singrauli Coalfield | Morning Shift A (06:00 - 14:00)',
                        overallCompliance: '92% (Tier 1 Gold)',
                        fileName: `MineVision_Safety_Report_${getRelativeDate(0, 'file')}`,
                        stats: [
                          { label: 'Total Workers', value: '245 Verified' },
                          { label: 'Compliance', value: '92% Tier 1' },
                          { label: 'Recorded Incidents', value: '4 Violations' },
                          { label: 'LTI Counter', value: '0 Days Lost' },
                        ],
                        sections: [
                          {
                            title: 'Morning Shift A Governance Dossier',
                            lines: [
                              'Automated compilation of CCTV worker detections, dust sensors, DGMS rule 104 inspections, and highwall rock stability parameters across Zones A through D.',
                            ],
                          },
                          {
                            title: 'Recorded Violations (Current Shift)',
                            highlight: true,
                            lines: [
                              'V-101: No Helmet - Zone B (Open, High) - Worker W102, CAM 01',
                              'V-102: Restricted Zone Entry - Zone A (Open, High) - Worker W084, CAM 03',
                              'V-103: High Dust - Zone C (Investigating, Medium) - PM10 92 µg/m³',
                              'V-104: PPE Issue - Zone D (Resolved, Low) - Worker W144, CAM 02',
                            ],
                          },
                          {
                            title: 'Recommended Actions',
                            lines: [
                              'Dispatch safety marshal to Zone B Face 3 to enforce helmet compliance.',
                              'Activate secondary water mist suppression in Zone C crushing hub.',
                              'Complete statutory conveyor fire hydrant audit for Zone D.',
                            ],
                          },
                        ],
                        footer: 'Report Code: DGMS-MG-2026-0918 | Verified with cryptographic hash #e9f2b841a',
                      });
                      setReportModalOpen(false);
                      setReportGenerated(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setReportModalOpen(false);
                    setReportGenerated(false);
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-lg flex items-start gap-2.5">
              <FileCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-blue-950">
                  Morning Shift A Governance Dossier
                </h4>
                <p className="text-blue-900 mt-1 leading-relaxed">
                  Automated compilation of CCTV worker detections, dust sensors, DGMS rule 104
                  inspections, and highwall rock stability parameters across Zones A through D.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400">Total Workers</span>
                <p className="font-bold text-slate-900 text-sm">245 Verified</p>
              </div>
              <div>
                <span className="text-slate-400">Compliance</span>
                <p className="font-bold text-purple-700 text-sm">92% Tier 1</p>
              </div>
              <div>
                <span className="text-slate-400">Recorded Incidents</span>
                <p className="font-bold text-red-600 text-sm">4 Violations</p>
              </div>
              <div>
                <span className="text-slate-400">LTI Counter</span>
                <p className="font-bold text-emerald-600 text-sm">0 Days Lost</p>
              </div>
            </div>

            {reportGenerated && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Report Compilation Successful!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Verified with digital cryptographic hash #e9f2b841a. Ready for submission to
                  Directorate General of Mines Safety (DGMS).
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Compliance Score Breakdown Modal */}
      {complianceModalOpen && (
        <Modal
          isOpen={complianceModalOpen}
          onClose={() => setComplianceModalOpen(false)}
          title="Mine Safety & DGMS Compliance Score Breakdown"
          subtitle="Score: 92% (Tier 1 Gold Standard) • DGMS CMR 2017 Audit"
          maxWidth="2xl"
          footer={
            <button
              onClick={() => setComplianceModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Close
            </button>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="text-purple-700 font-semibold uppercase text-[10px] tracking-wider">
                  Aggregated Safety Index
                </span>
                <div className="text-2xl font-black text-purple-950 font-mono">92 / 100</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-1 rounded">
                  ↑ 2% vs. yesterday
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">PPE Compliance (Helmets & Vests)</span>
                <span className="font-mono font-bold text-slate-900">89% (Zone B issue)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Geofence Restricted Zone Adherence</span>
                <span className="font-mono font-bold text-slate-900">94%</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Dust & Air Quality Adherence</span>
                <span className="font-mono font-bold text-amber-600">88% (Zone C warning)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-700 font-medium">Machinery Proximity Safety (Haul Trucks)</span>
                <span className="font-mono font-bold text-emerald-600">97%</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-700 font-medium">Statutory Shift Inspections</span>
                <span className="font-mono font-bold text-emerald-600">100% Complete</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
