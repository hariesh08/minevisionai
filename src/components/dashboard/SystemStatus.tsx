import React, { useState } from 'react';
import { Server, CheckCircle2, RefreshCw } from 'lucide-react';
import { systemStatusList } from '../../data/mockData';
import StatusIndicator from '../common/StatusIndicator';

export const SystemStatus: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);

  const handleRefreshDiagnostics = () => {
    setIsChecking(true);
    setTimeout(() => setIsChecking(false), 800);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">System Status</h2>
          </div>
          <button
            onClick={handleRefreshDiagnostics}
            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
            title="Check node telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className="flex items-center gap-2 py-1 mb-2 text-xs font-semibold text-emerald-600">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>All Systems Operational</span>
        </div>

        {/* Sub-system items */}
        <div className="divide-y divide-slate-100 text-xs">
          {systemStatusList.map((item) => (
            <div key={item.name} className="py-1.5 flex items-center justify-between">
              <span className="text-slate-600">{item.name}</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{item.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>Latency: &lt; 24ms</span>
        <span>Uptime: 99.98%</span>
      </div>
    </div>
  );
};

export default SystemStatus;
