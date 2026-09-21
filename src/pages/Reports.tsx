import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileCheck,
  Clock,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useMineGuard } from '../context/MineGuardContext';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getRelativeDate } from '../utils/dateUtils';
import { downloadPdf } from '../utils/reportPdf';
import { useChartTheme } from '../hooks/useChartTheme';


export const Reports: React.FC = () => {
  const { correctiveActions, complianceItems } = useMineGuard();
  const theme = useChartTheme();

  const [activeReportType, setActiveReportType] = useState<string>('Safety Compliance');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Data for preview charts
  const complianceTrend = [
    { day: '01 Sep', score: 86 },
    { day: '04 Sep', score: 88 },
    { day: '08 Sep', score: 90 },
    { day: '12 Sep', score: 89 },
    { day: '15 Sep', score: 93 },
    { day: getRelativeDate(0, 'short'), score: 92 },
  ];

  const violationsByType = [
    { name: 'PPE Violations', count: 18, color: '#ef4444' },
    { name: 'Environmental Alerts', count: 9, color: '#f97316' },
    { name: 'Restricted Zone', count: 6, color: '#eab308' },
    { name: 'Inspection Issues', count: 5, color: '#3b82f6' },
  ];

  const violationsByZone = [
    { zone: 'Zone A', count: 5 },
    { zone: 'Zone B', count: 18 },
    { zone: 'Zone C', count: 11 },
    { zone: 'Zone D', count: 4 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 45, color: '#10b981' },
    { name: 'Medium Risk', value: 35, color: '#f97316' },
    { name: 'High Risk', value: 20, color: '#ef4444' },
  ];

  const handleGenerateReport = (type: string) => {
    setActiveReportType(type);
    setIsGenerating(true);
    setGenerationNotice(`Synthesizing ${type} Report from edge telemetry...`);

    setTimeout(() => {
      setIsGenerating(false);
      setGenerationNotice(`Generated ${type} Report successfully! Preview updated.`);
      setTimeout(() => setGenerationNotice(null), 4000);
    }, 800);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Period\n' +
      `Overall Compliance,92%,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `Total Violations,38,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `Resolved Violations,31,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `Open Violations,7,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `PPE Violations,18,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `Environmental Alerts,9,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `Restricted Zone Violations,6,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      `Inspection Issues,5,01 Sep - ${getRelativeDate(0, 'shortYear')}\n` +
      'High-Risk Zones,"Zone B, Zone C",Current\n' +
      'Pending Corrective Actions,7,Current\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MineGuard_${activeReportType.replace(/\s+/g, '_')}_${getRelativeDate(0, 'file')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadPdf({
      title: `${activeReportType} Report`,
      subtitle: 'Statutory shift auditing, predictive trend analytics, and DGMS compliance reporting',
      period: `01 September - ${getRelativeDate(0, 'full')}`,
      mine: 'Demo Coal Mine • Morning Shift A',
      overallCompliance: '92% (Tier 1 Gold)',
      fileName: `MineGuard_${activeReportType.replace(/\s+/g, '_')}_${getRelativeDate(0, 'file')}`,
      stats: [
        { label: 'Total Violations', value: '38' },
        { label: 'Resolved', value: '31' },
        { label: 'Open', value: '7' },
        { label: 'Pending Corrective Actions', value: '7' },
        { label: 'High-Risk Zones', value: 'Zone B, Zone C' },
        { label: 'Active Workforce', value: '218' },
      ],
      sections: [
        {
          title: 'Violations by Type',
          lines: [
            'PPE Violations: 18',
            'Environmental Alerts: 9',
            'Restricted Zone Violations: 6',
            'Inspection Issues: 5',
          ],
        },
        {
          title: 'Violations by Zone',
          lines: [
            'Zone A: 5 violations',
            'Zone B: 18 violations',
            'Zone C: 11 violations',
            'Zone D: 4 violations',
          ],
        },
        {
          title: 'Identified High-Risk Zones',
          highlight: true,
          lines: [
            'Zone B - Deep Extraction Face (Risk Score: 78/100)',
            'Zone C - Crushing & Conveyor Hub (Dust: 92 µg/m³ exceeding 75 µg/m³ limit)',
          ],
        },
        {
          title: 'Mine Risk Distribution',
          lines: [
            'Low Risk: 45%',
            'Medium Risk: 35%',
            'High Risk: 20%',
          ],
        },
        {
          title: 'Recommended Actions',
          lines: [
            'Deploy secondary water sprinkler cannons in Zone C and verify conveyor hood sealing.',
            'Mandate PPE refresher training and helmet enforcement in Zone B Extraction Face.',
            'Complete bi-weekly DGMS statutory conveyor fire hydrant audit before shift handover.',
          ],
        },
      ],
      footer: 'Verification Token: MG-DGMS-0918-7F2A | Certified Shift Incharge: Verma K. (Overman CMR #9411)',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              REPORTS & ANALYTICS
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Statutory shift auditing, predictive trend analytics, and DGMS compliance reporting
          </p>
        </div>

        {/* Export / Print Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Generator Button Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Quick Report Generators:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            'Generate Daily Report',
            'Generate Safety Report',
            'Generate Environmental Report',
            'Generate Monthly Report',
            'Generate Compliance Report',
          ].map((title) => (
            <button
              key={title}
              onClick={() => handleGenerateReport(title.replace('Generate ', ''))}
              disabled={isGenerating}
              className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notification banner */}
      {generationNotice && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{generationNotice}</span>
        </div>
      )}

      {/* Report Preview Document */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-600 font-extrabold block">
              Official Shift Dossier
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              MINE SAFETY COMPLIANCE REPORT
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
              <span>Mine: <strong className="text-slate-900">Demo Coal Mine</strong></span>
              <span>•</span>
              <span>Period: <strong className="text-slate-900">01 September – {getRelativeDate(0, 'full')}</strong></span>
              <span>•</span>
              <span>Shift: <strong className="text-slate-900">Morning Shift A</strong></span>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl flex items-center gap-3 self-start sm:self-auto">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700 block">
                Overall Compliance
              </span>
              <div className="text-2xl font-black text-purple-950 font-mono">92%</div>
            </div>
            <Badge variant="purple" size="md">
              Tier 1
            </Badge>
          </div>
        </div>

        {/* Statutory Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-400 block font-medium">Total Violations</span>
            <div className="text-2xl font-black font-mono text-slate-900 mt-1">38</div>
            <span className="text-[10px] text-slate-400 mt-1 block">Full inspection period</span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
            <span className="text-[11px] text-emerald-800 block font-medium">Resolved</span>
            <div className="text-2xl font-black font-mono text-emerald-700 mt-1">31</div>
            <span className="text-[10px] text-emerald-600 mt-1 block">Remediated & closed</span>
          </div>

          <div className="p-3 bg-red-50/70 rounded-lg border border-red-200">
            <span className="text-[11px] text-red-800 block font-medium">Open</span>
            <div className="text-2xl font-black font-mono text-red-700 mt-1">7</div>
            <span className="text-[10px] text-red-600 mt-1 block">Active investigation</span>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
            <span className="text-[11px] text-blue-800 block font-medium">Pending Corrective Actions</span>
            <div className="text-2xl font-black font-mono text-blue-700 mt-1">7</div>
            <span className="text-[10px] text-blue-600 mt-1 block">Assigned tickets</span>
          </div>
        </div>

        {/* High Risk Zones & Violations by Type cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Violations by Type */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Violations by Type
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">PPE Violations</span>
                <span className="font-mono font-bold text-red-600">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Environmental Alerts</span>
                <span className="font-mono font-bold text-amber-600">9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Restricted Zone Violations</span>
                <span className="font-mono font-bold text-yellow-600">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Inspection Issues</span>
                <span className="font-mono font-bold text-blue-600">5</span>
              </div>
            </div>
          </div>

          {/* High-Risk Zones */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Identified High-Risk Zones
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-red-950 block">Zone B</span>
                  <span className="text-[11px] text-red-800">Deep Extraction Face (Score: 78/100)</span>
                </div>
                <Badge variant="danger" size="sm">
                  HIGH RISK
                </Badge>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">Zone C</span>
                  <span className="text-[11px] text-amber-800">Crushing Hub (Dust: 92 µg/m³)</span>
                </div>
                <Badge variant="warning" size="sm">
                  WARNING
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Charts Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-slate-900">
            Statistical Distribution & Visual Telemetry
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Chart 1: Compliance Trend */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Compliance Trend (September 2026)
              </span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={theme.grid} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 9, fill: theme.tick }}
                      axisLine={{ stroke: theme.axis }}
                      tickLine={{ stroke: theme.axis }}
                    />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 9, fill: theme.tick }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={theme.tooltipStyle}
                      labelStyle={{ color: theme.tooltipText }}
                      itemStyle={{ color: theme.tooltipText }}
                      cursor={{ stroke: theme.cursorStroke }}
                    />
                    <Line type="monotone" dataKey="score" name="Compliance Score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Violations by Zone */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Violations by Zone
              </span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={violationsByZone} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke={theme.grid} />
                    <XAxis
                      dataKey="zone"
                      tick={{ fontSize: 9, fill: theme.tick }}
                      axisLine={{ stroke: theme.axis }}
                      tickLine={{ stroke: theme.axis }}
                    />
                    <YAxis tick={{ fontSize: 9, fill: theme.tick }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={theme.tooltipStyle}
                      labelStyle={{ color: theme.tooltipText }}
                      itemStyle={{ color: theme.tooltipText }}
                      cursor={{ fill: theme.cursorFill }}
                    />
                    <Bar dataKey="count" name="Violations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Violations by Type (Bar) */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Violations by Classification
              </span>
              <div className="w-full h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={violationsByType}
                    margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke={theme.grid} />
                    <XAxis type="number" tick={{ fontSize: 9, fill: theme.tick }} axisLine={{ stroke: theme.axis }} tickLine={{ stroke: theme.axis }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 9, fill: theme.tick }}
                      width={90}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={theme.tooltipStyle}
                      labelStyle={{ color: theme.tooltipText }}
                      itemStyle={{ color: theme.tooltipText }}
                      cursor={{ fill: theme.cursorFill }}
                    />
                    <Bar dataKey="count" name="Violations" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Risk Distribution */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-2">
                Mine Risk Distribution
              </span>
              <div className="w-full h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={theme.tooltipStyle}
                      labelStyle={{ color: theme.tooltipText }}
                      itemStyle={{ color: theme.tooltipText }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', color: theme.legendText }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer sign-off */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Certified Shift Incharge: <strong>Verma K. (Overman CMR #9411)</strong></span>
          <span className="font-mono text-[10px]">Verification Token: MG-DGMS-0918-7F2A</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
