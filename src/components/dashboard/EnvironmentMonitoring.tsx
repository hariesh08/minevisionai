import React, { useState } from 'react';
import {
  Activity,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Wind,
  Droplets,
  Thermometer,
  Volume2,
  Gauge,
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
import { environmentalParams, dustHourlyTrend } from '../../data/mockData';
import EnvironmentalAlert from './EnvironmentalAlert';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export interface EnvironmentMonitoringProps {
  onViewDetails?: () => void;
}

export const EnvironmentMonitoring: React.FC<EnvironmentMonitoringProps> = ({ onViewDetails }) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const handleOpenDetails = () => {
    setDetailsModalOpen(true);
    if (onViewDetails) onViewDetails();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Environmental Monitoring
          </h2>
        </div>
        <button
          onClick={handleOpenDetails}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        {/* Table matching reference image */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200/70 text-slate-400 font-medium">
                <th className="pb-2 font-medium">Parameter</th>
                <th className="pb-2 font-medium">Current</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {environmentalParams.map((param) => {
                const isWarning = param.status === 'Warning';
                return (
                  <tr key={param.parameter} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 font-semibold text-slate-800">{param.parameter}</td>
                    <td className="py-2 font-mono font-medium text-slate-700">{param.current}</td>
                    <td className="py-2 text-right">
                      {isWarning ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Warning</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Normal</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Lower section: Dust trend chart + Environmental Alert card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 items-stretch">
          {/* Dust Level Chart */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800">
                Dust Level <span className="text-slate-400 font-normal text-[11px]">(Last 5 Hours)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-red-600 bg-red-100/70 px-1.5 py-0.5 rounded">
                Peak: 92
              </span>
            </div>

            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dustHourlyTrend}
                  margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tick={{ fontSize: 9, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white px-2 py-1 rounded text-[10px] shadow font-mono">
                            <span>{label}: </span>
                            <span className="text-cyan-400 font-bold">{payload[0].value} µg/m³</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#0284c7', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Environmental Alert card */}
          <EnvironmentalAlert onViewDetails={handleOpenDetails} />
        </div>
      </div>

      {/* Environmental Telemetry Inspection Modal */}
      {detailsModalOpen && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="Mine Environmental Telemetry & DGMS Norms"
          subtitle="Continuous Emission & Particulate Monitoring System (CPEMS)"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Data Source: Central Mining Research Institute (CIMFR) Calibrated Nodes
              </span>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Wind className="w-4 h-4 text-blue-600" />
                  <span>Respirable Dust (PM10)</span>
                </div>
                <div className="text-xl font-bold font-mono text-amber-600">72 / 75 µg/m³</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Permissible: 75 µg/m³ (Zone C peak: 92 µg/m³)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  <span>Methane / CO</span>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-600">18 ppm</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Permissible limit: &lt; 50 ppm (Safe)
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>Noise Exposure</span>
                </div>
                <div className="text-xl font-bold font-mono text-amber-600">82 dB(A)</div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Threshold: 85 dB (Ear muffs mandatory in Zone C)
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-bold text-amber-900 mb-1">
                DGMS Compliance Recommendation:
              </h4>
              <p className="text-amber-800 leading-relaxed">
                Zone C continuous suppression misters have suffered a 14% line pressure reduction.
                Water tankers have been routed to secondary haul roads B-4 and C-2 to dampen airborne
                coal particulates until the automated mist nozzle manifold is serviced.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EnvironmentMonitoring;
