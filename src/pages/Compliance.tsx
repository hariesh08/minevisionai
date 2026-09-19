import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Filter,
  UserCheck,
  Calendar,
  ClipboardList,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMineGuard, ComplianceItem } from '../context/MineGuardContext';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getRelativeDate } from '../utils/dateUtils';
import { downloadPdf } from '../utils/reportPdf';


export const Compliance: React.FC = () => {
  const { complianceItems, updateComplianceStatus, recordInspection, assignOfficer } = useMineGuard();

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Compliant' | 'Warning' | 'Violation'>('All');
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('Safety Officer Harini N');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [inspectionSuccessMsg, setInspectionSuccessMsg] = useState<string | null>(null);

  // Filtered compliance items
  const filteredItems = complianceItems.filter((item) => {
    if (selectedFilter === 'All') return true;
    return item.status === selectedFilter;
  });

  // Dynamic counts
  const totalCount = complianceItems.length;
  const compliantCount = complianceItems.filter((i) => i.status === 'Compliant').length;
  const warningCount = complianceItems.filter((i) => i.status === 'Warning').length;
  const violationCount = complianceItems.filter((i) => i.status === 'Violation').length;
  const overallPercentage = Math.round((compliantCount / totalCount) * 100 * 0.7 + 92 * 0.3);

  // Compliance trend data
  const trendData = [
    { day: '12 Sep', score: 88 },
    { day: '13 Sep', score: 89 },
    { day: '14 Sep', score: 91 },
    { day: '15 Sep', score: 90 },
    { day: '16 Sep', score: 93 },
    { day: '17 Sep', score: 91 },
    { day: getRelativeDate(0, 'short'), score: 92 },
  ];

  const handleStartInspection = (item: ComplianceItem) => {
    recordInspection(item.id);
    setInspectionSuccessMsg(`Inspection recorded successfully for ${item.title}. Status updated to Compliant.`);
    setTimeout(() => setInspectionSuccessMsg(null), 3500);
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, status: 'Compliant', lastInspection: getRelativeDate(0, 'dash') });
    }
  };

  const handleAssignSubmit = () => {
    if (selectedItem) {
      assignOfficer(selectedItem.id, selectedOfficer);
      setSelectedItem({ ...selectedItem, responsibleOfficer: selectedOfficer });
      setAssignModalOpen(false);
      setInspectionSuccessMsg(`Assigned ${selectedOfficer} to ${selectedItem.title}.`);
      setTimeout(() => setInspectionSuccessMsg(null), 3500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              COMPLIANCE MANAGEMENT
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Directorate General of Mines Safety (DGMS CMR 2017) statutory compliance tracking
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Compliance Report</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {inspectionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{inspectionSuccessMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Overall Compliance
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-900 font-mono">92%</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Tier 1
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">CMR 2017 Benchmark: &gt; 85%</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Requirements
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {totalCount}
            </span>
            <span className="text-[10px] text-slate-400">Statutory</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Audit categories</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Compliant
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {compliantCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Safe
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">No active issues</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Warning
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {warningCount}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Action Req.
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Particulate & PPE</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Violations
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
              {violationCount}
            </span>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
              Critical
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Geofence intrusion</span>
        </div>
      </div>

      {/* Main Grid: Compliance List + Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Compliance Items List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Filter By Status:</span>
              {(['All', 'Compliant', 'Warning', 'Violation'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedFilter === tab
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredItems.length} of {complianceItems.length}
            </span>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isCompliant = item.status === 'Compliant';
              const isWarning = item.status === 'Warning';
              const isViolation = item.status === 'Violation';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="p-3.5 sm:p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isCompliant && (
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                      {isWarning && (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {isViolation && (
                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
                          <AlertOctagon className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <Badge
                          variant={
                            isCompliant ? 'success' : isWarning ? 'warning' : 'danger'
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.details}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                        <span>Violations: <strong className="text-slate-700">{item.violationsCount}</strong></span>
                        <span>•</span>
                        <span>Officer: <span className="text-slate-700">{item.responsibleOfficer}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Compliance Trend Chart & Action Center (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Trend Chart Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Compliance Trend (Last 7 Days)
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Avg: 91.2%
              </span>
            </div>

            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis domain={[80, 100]} ticks={[80, 85, 90, 95, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded text-xs shadow">
                            <p className="font-semibold">{label}</p>
                            <p className="text-purple-300 font-mono">Compliance: {payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Autonomous trend compiled from edge CCTV cameras, gas sensors, and DGMS inspection forms.
            </p>
          </div>

          {/* Quick Compliance Audit Actions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Compliance Actions</h3>
            <p className="text-xs text-slate-500">
              Direct officer dispatch and statutory sign-off commands for shift inspection.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const firstWarning = complianceItems.find((i) => i.status !== 'Compliant') || complianceItems[0];
                  handleStartInspection(firstWarning);
                }}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-xs font-semibold text-left transition-colors flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <span>Start Inspection</span>
              </button>
              <button
                onClick={() => {
                  const target = complianceItems[0];
                  setSelectedItem(target);
                  setAssignModalOpen(true);
                }}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-semibold text-left transition-colors flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Assign Officer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Item Details Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`${selectedItem.title.toUpperCase()} COMPLIANCE`}
          subtitle={selectedItem.dgmsStandard}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400">
                Item ID: <strong className="font-mono text-slate-700">{selectedItem.id}</strong>
              </span>
              <div className="flex items-center gap-2">
                {selectedItem.status !== 'Compliant' && (
                  <button
                    onClick={() => handleStartInspection(selectedItem)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Start Inspection</span>
                  </button>
                )}
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Officer</span>
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="mt-0.5">
                  <Badge
                    variant={
                      selectedItem.status === 'Compliant'
                        ? 'success'
                        : selectedItem.status === 'Warning'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {selectedItem.status}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-slate-400">Violations:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedItem.violationsCount}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Last Inspection:</span>
                <p className="font-bold text-slate-900 mt-0.5 font-mono">
                  {selectedItem.lastInspection}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Due Date:</span>
                <p className="font-bold text-red-600 mt-0.5 font-mono">
                  {selectedItem.dueDate}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Responsible Officer:</span>
                <span className="text-slate-900 font-bold">{selectedItem.responsibleOfficer}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Corrective Action Required:</span>
                <p className="text-slate-800 font-semibold bg-amber-50/70 border border-amber-200/80 p-2 rounded">
                  {selectedItem.correctiveAction}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg">
              <span className="text-blue-900 font-bold block mb-1">Operational Description:</span>
              <p className="text-blue-800 leading-relaxed">{selectedItem.details}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Assign Officer Modal */}
      {assignModalOpen && selectedItem && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title="Assign Responsible Officer"
          subtitle={`Task: ${selectedItem.title} Compliance Inspection`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Confirm Assignment
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Select the safety or operational officer responsible for statutory verification:
            </p>
            <div className="space-y-2">
              {[
                'Safety Officer Harini N',
                'Environmental Officer Patel',
                'Shift Incharge Verma',
                'Technical Officer Rao',
                'Blast Area Marshal Singh',
              ].map((officer) => (
                <label
                  key={officer}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    selectedOfficer === officer
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{officer}</span>
                  <input
                    type="radio"
                    name="officer"
                    checked={selectedOfficer === officer}
                    onChange={() => setSelectedOfficer(officer)}
                    className="text-blue-600"
                  />
                </label>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* 3. Compliance Report Modal */}
      {reportModalOpen && (
        <Modal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          title="Generate Compliance Report"
          subtitle="Directorate General of Mines Safety Shift Compliance Extract"
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] text-slate-400 font-mono">Format: PDF / Print Ready</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    downloadPdf({
                      title: 'DGMS Compliance Report',
                      subtitle: 'Directorate General of Mines Safety Shift Compliance Extract - CMR 2017',
                      period: getRelativeDate(0, 'full'),
                      mine: 'Morning Shift A | Certified Shift Incharge: Verma K.',
                      overallCompliance: '92% (Tier 1)',
                      fileName: `MineVision_Compliance_Report_${getRelativeDate(0, 'file')}`,
                      stats: [
                        { label: 'Requirements Evaluated', value: `${totalCount} Categories` },
                        { label: 'Compliant', value: `${compliantCount} Items` },
                        { label: 'Warnings', value: `${warningCount} Items` },
                        { label: 'Violations', value: `${violationCount} Items` },
                      ],
                      sections: [
                        {
                          title: 'Statutory Compliance Register',
                          lines: complianceItems.map(
                            (item) =>
                              `${item.title} [${item.status}] - Official: ${item.responsibleOfficer}`
                          ),
                        },
                        {
                          title: 'Non-Compliant Items - Action Required',
                          highlight: true,
                          lines: complianceItems
                            .filter((item) => item.status !== 'Compliant')
                            .map((item) => `[${item.status}] ${item.title}: ${item.correctiveAction}`),
                        },
                        {
                          title: 'Recommendations',
                          lines: [
                            'Conduct PPE inspection and enforce hardhat protocol in Zone B.',
                            'Inspect ventilation and continuous mist suppression at Zone C.',
                            'Reinforce highwall blast perimeter demarcations and audible sirens.',
                          ],
                        },
                      ],
                      footer: 'Includes audit trail references, CCTV vision logs, and dust sensor exceedance notes. Report format: PDF / Print Ready.',
                    });
                    setReportModalOpen(false);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Report</span>
                </button>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Overall Compliance:</span>
                <span className="font-bold text-purple-700">92% (Tier 1)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Requirements Evaluated:</span>
                <span className="font-bold text-slate-800">5 Categories</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compliant Count:</span>
                <span className="font-bold text-emerald-600">{compliantCount} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Warnings/Violations:</span>
                <span className="font-bold text-red-600">{warningCount + violationCount} items</span>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Includes comprehensive audit trail references, CCTV vision logs, and dust sensor
              exceedance notes ready for statutory submission to DGMS.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Compliance;
