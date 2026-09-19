import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { riskTrendData } from '../../data/mockData';

export const RiskTrend: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Risk Trend <span className="text-slate-400 font-normal text-xs">(Last 24 Hours)</span>
          </h2>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
            <span className="text-emerald-700 font-semibold">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-500 rounded-full" />
            <span className="text-amber-700 font-semibold">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-red-500 rounded-full" />
            <span className="text-red-700 font-semibold">High</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="p-3 sm:p-4 flex-1 min-h-[220px]">
        <div className="w-full h-56 sm:h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={riskTrendData}
              margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 40]}
                ticks={[0, 10, 20, 30, 40]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-xl border border-slate-700">
                        <p className="font-semibold text-slate-300 mb-1 font-mono">{label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-3 text-red-400">
                            <span>High Risk:</span>
                            <span className="font-bold font-mono">{payload[2]?.value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-amber-400">
                            <span>Medium Risk:</span>
                            <span className="font-bold font-mono">{payload[1]?.value}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-emerald-400">
                            <span>Low Risk:</span>
                            <span className="font-bold font-mono">{payload[0]?.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Lines matching reference styling */}
              <Line
                type="monotone"
                dataKey="low"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="medium"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2.5, fill: '#f59e0b', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="high"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RiskTrend;
