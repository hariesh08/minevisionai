import React from 'react';
import { AlertOctagon, ChevronRight, Wind, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export interface EnvironmentalAlertProps {
  onViewDetails?: () => void;
}

export const EnvironmentalAlert: React.FC<EnvironmentalAlertProps> = ({ onViewDetails }) => {
  return (
    <div className="bg-red-50/90 border border-red-200 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between h-full shadow-xs">
      <div>
        {/* Title Header */}
        <div className="flex items-center gap-1.5 text-red-700 mb-1.5">
          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider">
            ENVIRONMENTAL ALERT
          </span>
        </div>

        <p className="text-xs font-bold text-red-950 leading-snug">
          Dust level exceeded threshold
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-2 mt-2 py-2 border-y border-red-200/80 text-xs">
          <div>
            <span className="text-[10px] text-red-700/80 block">Zone:</span>
            <span className="font-bold text-red-950">C</span>
          </div>
          <div>
            <span className="text-[10px] text-red-700/80 block">Current:</span>
            <span className="font-mono font-bold text-red-950">92</span>
          </div>
          <div>
            <span className="text-[10px] text-red-700/80 block">Status:</span>
            <span className="font-bold text-red-600">HIGH</span>
          </div>
        </div>

        {/* Action text */}
        <div className="mt-2 text-[11px] text-red-900 leading-tight">
          <span className="font-semibold">Action: </span>
          <span>Inspect ventilation and dust suppression system.</span>
        </div>
      </div>

      {/* Button */}
      <div className="mt-3">
        <button
          onClick={onViewDetails}
          className="w-full py-1.5 px-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs"
        >
          <span>View Environmental Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default EnvironmentalAlert;
