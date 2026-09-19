import React, { useState } from 'react';
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Wind,
  Thermometer,
  Users,
  Activity,
  Gauge,
  Info,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useMineGuard, ZoneRiskData } from '../context/MineGuardContext';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export const RiskAI: React.FC = () => {
  const {
    zoneRiskList,
    predictedRisk,
    isPredicting,
    runRiskPrediction,
    lastPredictionTimestamp,
  } = useMineGuard();

  const [selectedZone, setSelectedZone] = useState<string>('Zone B');
  const [detailModalZone, setDetailModalZone] = useState<ZoneRiskData | null>(null);

  // Get currently focused zone (defaults to Zone B as requested)
  const currentZoneData =
    zoneRiskList.find((z) => z.zone === selectedZone) || zoneRiskList[0];

  // Contributing factors for the circular/horizontal breakdown
  const factors = currentZoneData.factors || {
    dust: 32,
    temperature: 21,
    previousEvents: 18,
    workerDensity: 15,
    gasLevel: 14,
  };

  const factorList = [
    { name: 'Dust', percentage: factors.dust, icon: Wind, color: 'bg-amber-500' },
    { name: 'Temperature', percentage: factors.temperature, icon: Thermometer, color: 'bg-red-500' },
    { name: 'Previous Events', percentage: factors.previousEvents, icon: AlertTriangle, color: 'bg-indigo-500' },
    { name: 'Worker Density', percentage: factors.workerDensity, icon: Users, color: 'bg-blue-500' },
    { name: 'Gas Level', percentage: factors.gasLevel, icon: Gauge, color: 'bg-emerald-500' },
  ];

  // Recommended actions for Zone B
  const recommendedActions = [
    'Inspect ventilation',
    'Check PPE compliance',
    'Reduce active worker exposure',
    'Conduct safety inspection',
    'Inspect dust suppression system',
  ];

  // Risk Trend data
  const riskTrendData = [
    { time: '04:00', zoneB: 62, zoneC: 55, zoneA: 18 },
    { time: '06:00', zoneB: 68, zoneC: 58, zoneA: 20 },
    { time: '08:00', zoneB: 74, zoneC: 64, zoneA: 22 },
    { time: '10:00', zoneB: 78, zoneC: 68, zoneA: 24 },
    { time: '12:00', zoneB: 75, zoneC: 66, zoneA: 23 },
    { time: '14:00', zoneB: 71, zoneC: 62, zoneA: 21 },
  ];

  // Circular gauge calculations
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentZoneData.riskScore / 100) * circumference;

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              RISK AI / RISK PREDICTION
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Multi-modal neural risk forecasting synthesizing computer vision, IoT microclimates & DGMS history
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => runRiskPrediction()}
            disabled={isPredicting}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPredicting ? 'animate-spin' : ''}`} />
            <span>{isPredicting ? 'Computing Predictions...' : 'Run Risk Prediction'}</span>
          </button>
        </div>
      </div>

      {/* Prototype Disclaimer Banner */}
      <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-xl flex items-center justify-between text-xs text-amber-900 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">
            Prototype Risk Prediction:
          </span>
          <span className="text-amber-800">
            Model output generated for hackathon operational simulation. Do not claim that it is a certified safety prediction under statutory DGMS mining guidelines.
          </span>
        </div>
        <span className="text-[10px] text-amber-700 font-mono shrink-0 hidden md:inline">
          Last Model Pass: {lastPredictionTimestamp}
        </span>
      </div>

      {/* Main Focus: Radial Gauge & Contributing Factors (Zone B) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Focus Card: Radial Score Gauge (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Primary High-Risk Focus
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  {currentZoneData.name}
                </h2>
              </div>
              <Badge
                variant={
                  currentZoneData.riskLevel === 'HIGH'
                    ? 'danger'
                    : currentZoneData.riskLevel === 'MEDIUM'
                    ? 'warning'
                    : 'success'
                }
                size="md"
              >
                {currentZoneData.riskLevel} RISK
              </Badge>
            </div>

            {/* Radial Visualization */}
            <div className="flex flex-col items-center justify-center my-3">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-100"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={
                      currentZoneData.riskScore > 70
                        ? '#ef4444'
                        : currentZoneData.riskScore > 40
                        ? '#f97316'
                        : '#10b981'
                    }
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>

                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                    {currentZoneData.riskScore}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400">/ 100</span>
                  <span
                    className={`text-[11px] font-extrabold tracking-wider uppercase mt-0.5 ${
                      currentZoneData.riskScore > 70
                        ? 'text-red-600'
                        : currentZoneData.riskScore > 40
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {currentZoneData.riskLevel} RISK
                  </span>
                </div>
              </div>

              <div className="text-center mt-2">
                <span className="text-xs font-semibold text-slate-500">Predicted Risk: </span>
                <span className="text-xs font-extrabold text-red-600 font-mono">
                  {predictedRisk} (P &gt; 0.84)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Model: MineVision XGBoost-Ensemble</span>
            <span className="font-mono text-purple-600 font-bold">Accuracy: 94.8%</span>
          </div>
        </div>

        {/* Right Focus Card: Contributing Factors & Recommended Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>Contributing Risk Factors (Zone B)</span>
            </h3>

            {/* Horizontal progress bars */}
            <div className="space-y-2.5">
              {factorList.map((factor) => {
                const Icon = factor.icon;
                return (
                  <div key={factor.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{factor.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        {factor.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${factor.color} rounded-full transition-all duration-700`}
                        style={{ width: `${factor.percentage * 2.5}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommended Actions */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 text-red-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Recommended Actions:</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                {recommendedActions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 font-medium">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Factors normalized across 24h mining operations</span>
            <button
              onClick={() => setSelectedZone('Zone B')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Reset to Primary Face
            </button>
          </div>
        </div>
      </div>

      {/* 4 Multi-Zone Risk Cards: Zone A, Zone B, Zone C, Zone D */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            Sector-Wise Risk Assessments
          </h3>
          <span className="text-xs text-slate-400">Click card for detailed diagnostic telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {zoneRiskList.map((z) => {
            const isHigh = z.riskLevel === 'HIGH';
            const isMedium = z.riskLevel === 'MEDIUM';

            const cardBorder = isHigh
              ? 'border-red-300 hover:border-red-500'
              : isMedium
              ? 'border-amber-300 hover:border-amber-500'
              : 'border-slate-200 hover:border-emerald-400';

            const scoreBadgeColor = isHigh
              ? 'text-red-700 bg-red-50'
              : isMedium
              ? 'text-amber-700 bg-amber-50'
              : 'text-emerald-700 bg-emerald-50';

            return (
              <div
                key={z.zone}
                onClick={() => {
                  setSelectedZone(z.zone);
                  setDetailModalZone(z);
                }}
                className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between ${cardBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black text-slate-900">{z.zone}</span>
                    <Badge
                      variant={isHigh ? 'danger' : isMedium ? 'warning' : 'success'}
                      size="sm"
                    >
                      {z.riskLevel}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-black font-mono text-slate-900">
                      {z.riskScore}
                    </span>
                    <span className="text-xs text-slate-400">/ 100 Risk Score</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Main Risk Factor:
                      </span>
                      <p className="text-slate-800 font-medium line-clamp-2">
                        {z.mainRiskFactor}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        Recommended Action:
                      </span>
                      <p className="text-slate-700 text-[11px] leading-snug line-clamp-2">
                        {z.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Trend Chart & Risk History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Risk Trend Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span>Risk Trend & Multi-Zone Shift Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400">Continuous risk probability score across 12-hour operational shift</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Zone B (High)</span>
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Zone C (Med)</span>
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Zone A (Low)</span>
              </span>
            </div>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorZoneB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorZoneC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded text-xs shadow-lg space-y-1 font-mono">
                          <p className="font-bold border-b border-slate-700 pb-1">{label}</p>
                          <p className="text-red-400">Zone B: {payload[0]?.value} / 100</p>
                          <p className="text-amber-400">Zone C: {payload[1]?.value} / 100</p>
                          <p className="text-emerald-400">Zone A: {payload[2]?.value} / 100</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="zoneB" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorZoneB)" />
                <Area type="monotone" dataKey="zoneC" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorZoneC)" />
                <Area type="monotone" dataKey="zoneA" stroke="#10b981" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk History (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Risk Event History</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-red-50/70 border border-red-200/80 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-red-950">Zone B Peak Anomaly</span>
                <span className="text-[10px] text-red-600 font-mono">10:42 AM</span>
              </div>
              <p className="text-red-800 text-[11px] leading-tight">
                Simultaneous particulate spike (78 µg/m³) and worker PPE non-compliance detected.
              </p>
            </div>

            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-950">Zone C Misting Drop</span>
                <span className="text-[10px] text-amber-600 font-mono">12:05 PM</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-tight">
                Mist water pressure dropped 14%; elevated ambient dust risk score to 68.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800">Zone A Geofence Clear</span>
                <span className="text-[10px] text-slate-500 font-mono">11:45 AM</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-tight">
                Personnel safely escorted from highwall; risk returned to baseline LOW.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Detail Modal */}
      {detailModalZone && (
        <Modal
          isOpen={!!detailModalZone}
          onClose={() => setDetailModalZone(null)}
          title={`DIAGNOSTIC TELEMETRY - ${detailModalZone.zone}`}
          subtitle={detailModalZone.name}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Risk Classification:{' '}
                <strong className="text-slate-900">{detailModalZone.riskLevel}</strong>
              </span>
              <button
                onClick={() => setDetailModalZone(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400">Risk Score:</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {detailModalZone.riskScore} / 100
                </p>
              </div>
              <div>
                <span className="text-slate-400">Classification:</span>
                <p className="text-sm font-bold text-red-600 mt-0.5">
                  {detailModalZone.riskLevel}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Primary Trigger:</span>
                <p className="text-xs text-slate-800 mt-0.5">
                  {detailModalZone.mainRiskFactor}
                </p>
              </div>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <span className="text-purple-900 font-bold block mb-1">
                AI Prescriptive Action Plan:
              </span>
              <p className="text-purple-800 leading-relaxed">
                {detailModalZone.recommendedAction}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RiskAI;
