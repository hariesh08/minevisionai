import React, { useState } from 'react';
import {
  Video,
  AlertTriangle,
  Radio,
  ExternalLink,
  ShieldAlert,
  Camera,
  CheckCircle2,
  Send,
  UserCheck,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { liveCCTVViolation } from '../../data/mockData';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useRealTime } from '../../hooks/useRealTime';


export interface LiveCCTVProps {
  onViewViolation?: (violation: typeof liveCCTVViolation) => void;
}

export const LiveCCTV: React.FC<LiveCCTVProps> = ({ onViewViolation }) => {
  const [violationModalOpen, setViolationModalOpen] = useState(false);
  const [cameraSwitch, setCameraSwitch] = useState<'CAM 01' | 'CAM 02' | 'CAM 03'>('CAM 01');
  const [isAlertDispatched, setIsAlertDispatched] = useState(false);
  const { time, formattedTimeWithSeconds } = useRealTime();

  const handleOpenViolation = () => {
    setViolationModalOpen(true);
    if (onViewViolation) onViewViolation(liveCCTVViolation);
  };

  const handleDispatchSiren = () => {
    setIsAlertDispatched(true);
    setTimeout(() => setIsAlertDispatched(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Live CCTV – Zone B
          </h2>
        </div>

        {/* Live Pill Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-bold text-red-600 tracking-wider">LIVE</span>
        </div>
      </div>

      {/* CCTV Feed Viewport */}
      <div className="relative bg-slate-950 aspect-video w-full overflow-hidden select-none">
        {/* Realistic Coal Mine Industrial Scene (SVG & Composition) */}
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 800 450"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Dark industrial pit atmosphere */}
            <linearGradient id="cctvAtmosphere" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#292524" />
              <stop offset="40%" stopColor="#1c1917" />
              <stop offset="70%" stopColor="#44403c" />
              <stop offset="100%" stopColor="#1c1917" />
            </linearGradient>

            {/* Coal bench dust fog */}
            <radialGradient id="dustFog" cx="30%" cy="60%" r="50%">
              <stop offset="0%" stopColor="#78716c" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#1c1917" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Pit Terrace Wall */}
          <rect width="800" height="450" fill="url(#cctvAtmosphere)" />

          {/* Bench rock layers */}
          <path d="M 0,160 Q 240,140 500,170 T 800,150 L 800,240 L 0,260 Z" fill="#292524" opacity="0.8" />
          <path d="M 0,250 Q 300,230 600,260 T 800,240 L 800,450 L 0,450 Z" fill="#1c1917" />

          {/* Huge CAT-style Mining Haul Truck (Background Machinery) */}
          <g transform="translate(480, 160)" opacity="0.85">
            {/* Truck chassis & dump body */}
            <path d="M 40,80 L 190,60 L 220,130 L 20,140 Z" fill="#eab308" />
            <rect x="180" y="70" width="55" height="50" fill="#ca8a04" rx="4" />
            {/* Windshield */}
            <rect x="195" y="75" width="30" height="20" fill="#38bdf8" opacity="0.6" />
            {/* Giant wheels */}
            <circle cx="70" cy="150" r="32" fill="#0f172a" stroke="#334155" strokeWidth="8" />
            <circle cx="170" cy="150" r="32" fill="#0f172a" stroke="#334155" strokeWidth="8" />
            <circle cx="70" cy="150" r="12" fill="#475569" />
            <circle cx="170" cy="150" r="12" fill="#475569" />
          </g>

          {/* Excavator Boom / Drill Mast */}
          <g transform="translate(100, 100)" opacity="0.6">
            <line x1="80" y1="180" x2="160" y2="40" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
            <line x1="160" y1="40" x2="220" y2="160" stroke="#d97706" strokeWidth="7" />
            <circle cx="160" cy="40" r="8" fill="#1e293b" />
          </g>

          {/* Dust Fog Layer */}
          <rect width="800" height="450" fill="url(#dustFog)" />

          {/* Ground surface line */}
          <line x1="0" y1="360" x2="800" y2="360" stroke="#57534e" strokeWidth="2" strokeDasharray="6,6" opacity="0.4" />

          {/* Worker 1: Violator (No Helmet) Silhouetted figure */}
          <g transform="translate(200, 210)">
            {/* Head (No helmet - bare head/hair) */}
            <circle cx="35" cy="22" r="10" fill="#78350f" />
            {/* Torso & High-Vis Vest */}
            <path d="M 22,34 L 48,34 L 45,78 L 25,78 Z" fill="#ea580c" />
            {/* Reflective vest stripes */}
            <line x1="28" y1="36" x2="28" y2="78" stroke="#fef08a" strokeWidth="3" />
            <line x1="42" y1="36" x2="42" y2="78" stroke="#fef08a" strokeWidth="3" />
            {/* Legs */}
            <line x1="28" y1="78" x2="24" y2="128" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            <line x1="42" y1="78" x2="44" y2="128" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            {/* Arms */}
            <line x1="23" y1="38" x2="12" y2="74" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
            <line x1="47" y1="38" x2="56" y2="72" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Worker 2: Compliant (With Yellow Helmet) */}
          <g transform="translate(340, 205)">
            {/* Yellow Helmet */}
            <path d="M 23,18 Q 35,6 47,18 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="35" cy="22" r="9" fill="#78350f" />
            {/* High-Vis Vest */}
            <path d="M 24,34 L 46,34 L 43,76 L 27,76 Z" fill="#16a34a" />
            <line x1="29" y1="36" x2="29" y2="76" stroke="#fef08a" strokeWidth="2.5" />
            <line x1="41" y1="36" x2="41" y2="76" stroke="#fef08a" strokeWidth="2.5" />
            {/* Legs */}
            <line x1="29" y1="76" x2="26" y2="124" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="41" y1="76" x2="43" y2="124" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />
            {/* Arms */}
            <line x1="24" y1="38" x2="14" y2="70" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="46" y1="38" x2="54" y2="70" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* Surveillance HUD / Crosshair Grid */}
          <circle cx="400" cy="225" r="30" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
          <line x1="390" y1="225" x2="410" y2="225" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
          <line x1="400" y1="215" x2="400" y2="235" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />

          {/* Scanline CRT overlay effect */}
          <pattern id="scanlines" width="100" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="100" y2="0" stroke="#ffffff" strokeWidth="0.5" opacity="0.04" />
          </pattern>
          <rect width="800" height="450" fill="url(#scanlines)" />
        </svg>

        {/* AI Computer Vision Bounding Boxes */}
        {/* Worker 1: RED Bounding Box (No Helmet) */}
        <div
          onClick={handleOpenViolation}
          className="absolute top-[42%] left-[23.5%] w-[11%] h-[38%] border-2 border-red-500 bg-red-500/10 cursor-pointer group/box transition-all"
        >
          {/* Top label */}
          <div className="absolute -top-6 left-0 bg-red-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-t tracking-tight whitespace-nowrap shadow-md flex items-center gap-1">
            <span>No Helmet</span>
            <span className="opacity-75">[98%]</span>
          </div>
          {/* Tracking corners */}
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
        </div>

        {/* Worker 2: GREEN Bounding Box (Helmet) */}
        <div className="absolute top-[43%] left-[41.5%] w-[9%] h-[36%] border-2 border-emerald-500 bg-emerald-500/10 select-none">
          {/* Top label */}
          <div className="absolute -top-6 left-0 bg-emerald-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-t tracking-tight whitespace-nowrap shadow-md flex items-center gap-1">
            <span>Helmet</span>
            <span className="opacity-75">[96%]</span>
          </div>
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-300" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-300" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-300" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-300" />
        </div>

        {/* CCTV Top Overlay */}
        <div className="absolute top-2.5 left-3 text-[11px] font-mono text-emerald-400 bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{time.toISOString().split('T')[0]} {formattedTimeWithSeconds}</span>
        </div>

        <div className="absolute top-2.5 right-3 text-[11px] font-mono text-white bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs font-semibold">
          ZONE B - CAM 01
        </div>

        {/* Camera stream selector bottom-left */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[10px] font-mono">
          {(['CAM 01', 'CAM 02', 'CAM 03'] as const).map((cam) => (
            <button
              key={cam}
              onClick={() => setCameraSwitch(cam)}
              className={`px-2 py-0.5 rounded backdrop-blur-xs transition-colors ${
                cameraSwitch === cam
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-black/60 text-slate-300 hover:text-white'
              }`}
            >
              {cam}
            </button>
          ))}
        </div>

        <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
          FPS: 29.8 • 1080p AI Vision Edge
        </div>
      </div>

      {/* Violation Detected Info Section */}
      <div className="p-3.5 sm:p-4 bg-slate-50/50 flex-1 flex flex-col justify-between border-t border-slate-100">
        {/* Banner */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              VIOLATION DETECTED
            </span>
          </div>
          <Badge variant="high" size="sm">
            HIGH
          </Badge>
        </div>

        {/* 2-column details matching reference */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/80 mb-3 font-medium">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Worker ID</span>
            <span className="font-mono font-bold text-slate-900">: W102</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Camera</span>
            <span className="font-semibold text-slate-900">: ZONE B</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Zone</span>
            <span className="font-semibold text-slate-900">: B</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Time</span>
            <span className="font-mono font-semibold text-slate-900">: 10:42 AM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Violation</span>
            <span className="font-bold text-red-600">: No Helmet</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Severity</span>
            <span className="font-bold text-red-600">: HIGH</span>
          </div>
        </div>

        {/* View Violation Button */}
        <button
          onClick={handleOpenViolation}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>View Violation</span>
        </button>
      </div>

      {/* Violation Inspection Modal */}
      {violationModalOpen && (
        <Modal
          isOpen={violationModalOpen}
          onClose={() => setViolationModalOpen(false)}
          title="MineVision Inspection - Incident #V-101"
          subtitle="Real-time Computer Vision Edge Analytics • Frame Analysis"
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Confidence: <strong className="text-red-600 font-mono">98.4% Match</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDispatchSiren}
                  className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                    isAlertDispatched
                      ? 'bg-emerald-600'
                      : 'bg-red-600 hover:bg-red-700 shadow-xs'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>
                    {isAlertDispatched ? 'Field Siren Dispatched!' : 'Sound Local Proximity Siren'}
                  </span>
                </button>
                <button
                  onClick={() => setViolationModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">
                  Critical Safety Non-Compliance: Missing Hard Hat in Active Extraction Face
                </p>
                <p className="text-red-800 mt-1 leading-relaxed">
                  Worker W102 (Ramesh K., Drill Operator) was detected without head protection in
                  Zone B (Deep Extraction Face) within 15 meters of operating CAT 777 haulage machinery.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Worker ID</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">W102 (Ramesh K.)</p>
              </div>
              <div>
                <span className="text-slate-400">Shift</span>
                <p className="font-bold text-slate-900 mt-0.5">Morning Shift A</p>
              </div>
              <div>
                <span className="text-slate-400">Location</span>
                <p className="font-bold text-slate-900 mt-0.5">Bench #4, Face 12-B</p>
              </div>
              <div>
                <span className="text-slate-400">Detection Model</span>
                <p className="font-bold text-slate-900 mt-0.5">YOLOv8-MineSafety</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-900">Corrective Actions Required:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>Immediate radio contact with Zone B Marshal to enforce helmet compliance.</li>
                <li>Log statutory DGMS violation against Drill Rig #D-04 operations.</li>
                <li>Schedule mandatory 15-minute tailgate safety refresher at shift end.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LiveCCTV;
