import React, { useState } from 'react';
import {
  History,
  Bot,
  AlertOctagon,
  BellRing,
  UserCheck,
  ClipboardCheck,
  CheckCircle2,
  Search,
  Calendar,
  Filter,
  ShieldAlert,
  Hash,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useMineGuard, AuditLogEvent, AuditEventType } from '../context/MineGuardContext';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { getRelativeDate } from '../utils/dateUtils';


export const AuditLog: React.FC = () => {
  const { auditEvents } = useMineGuard();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>(getRelativeDate(0, 'shortYear'));
  const [selectedEvent, setSelectedEvent] = useState<AuditLogEvent | null>(null);

  // Icon mapping
  const getEventIcon = (type: AuditEventType) => {
    switch (type) {
      case 'AI Detection':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'Violation':
        return <AlertOctagon className="w-4 h-4 text-red-600" />;
      case 'Alert':
        return <BellRing className="w-4 h-4 text-amber-600" />;
      case 'Officer Assignment':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'Corrective Action':
        return <ClipboardCheck className="w-4 h-4 text-indigo-600" />;
      case 'Resolution':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventBgColor = (type: AuditEventType) => {
    switch (type) {
      case 'AI Detection':
        return 'bg-purple-50 border-purple-200';
      case 'Violation':
        return 'bg-red-50 border-red-200';
      case 'Alert':
        return 'bg-amber-50 border-amber-200';
      case 'Officer Assignment':
        return 'bg-blue-50 border-blue-200';
      case 'Corrective Action':
        return 'bg-indigo-50 border-indigo-200';
      case 'Resolution':
        return 'bg-emerald-50 border-emerald-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  // Filtered list
  const filteredEvents = auditEvents.filter((ev) => {
    // Type filter
    if (selectedTypeFilter === 'AI Events' && ev.eventType !== 'AI Detection') return false;
    if (selectedTypeFilter === 'Violations' && ev.eventType !== 'Violation') return false;
    if (selectedTypeFilter === 'Alerts' && ev.eventType !== 'Alert') return false;
    if (selectedTypeFilter === 'Corrective Actions' && ev.eventType !== 'Corrective Action') return false;
    if (
      selectedTypeFilter === 'User Activity' &&
      (ev.eventType === 'AI Detection' || ev.systemOrUser.includes('MineVision'))
    ) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'All' && !ev.date.includes(getRelativeDate(0, 'short'))) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        ev.description.toLowerCase().includes(q) ||
        ev.systemOrUser.toLowerCase().includes(q) ||
        ev.zone.toLowerCase().includes(q) ||
        (ev.relatedViolation && ev.relatedViolation.toLowerCase().includes(q)) ||
        (ev.worker && ev.worker.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              DIGITAL AUDIT TRAIL
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Cryptographically signed immutable timeline of all AI detections, statutory violations, and officer assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ledger Integrity: Verified</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Audit Logs by violation ID, officer, worker, or zone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Date Picker preset */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-medium">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-slate-800 text-xs font-medium focus:outline-none"
            >
              <option value={getRelativeDate(0, 'shortYear')}>Today ({getRelativeDate(0, 'shortYear')})</option>
              <option value={getRelativeDate(-1, 'shortYear')}>Yesterday ({getRelativeDate(-1, 'shortYear')})</option>
              <option value="All">All Historical Shifts</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 mr-1">Filter Events:</span>
          {[
            'All',
            'AI Events',
            'Violations',
            'Alerts',
            'Corrective Actions',
            'User Activity',
          ].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedTypeFilter === type
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chronological Shift Events ({filteredEvents.length})
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            Click any entry for immutable block verification
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-3.5 sm:before:left-4.5 before:w-0.5 before:bg-slate-200">
          {filteredEvents.map((event) => {
            const isCritical = event.severity === 'HIGH';

            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="relative group cursor-pointer"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-xs flex items-center justify-center transition-transform group-hover:scale-110 ${getEventBgColor(
                    event.eventType
                  )}`}
                >
                  {getEventIcon(event.eventType)}
                </div>

                {/* Event Card */}
                <div className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/80 transition-colors shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          event.eventType === 'Violation'
                            ? 'danger'
                            : event.eventType === 'Alert'
                            ? 'warning'
                            : event.eventType === 'Resolution'
                            ? 'success'
                            : event.eventType === 'AI Detection'
                            ? 'purple'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {event.eventType}
                      </Badge>
                      <span className="text-xs font-black text-slate-900">
                        {event.zone}
                      </span>
                      {event.relatedViolation && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          Ref: #{event.relatedViolation}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                      <span>{event.timestamp}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">{event.hash}</span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                    <div className="flex items-center gap-2">
                      <span>Operator / System: <strong className="text-slate-700">{event.systemOrUser}</strong></span>
                      {event.worker && (
                        <>
                          <span>•</span>
                          <span>Worker: <strong className="text-slate-700">{event.worker}</strong></span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-blue-600 font-semibold text-xs">
                      <span>Inspect Event</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          title="DIGITAL AUDIT TRAIL RECORD"
          subtitle={`Event ID: ${selectedEvent.id} • Hash: ${selectedEvent.hash}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 font-mono">
                DGMS Tamper-Proof Audit Standard 2017
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400">Event:</span>
                <p className="font-bold text-purple-700 mt-0.5">{selectedEvent.eventType}</p>
              </div>
              <div>
                <span className="text-slate-400">Time:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedEvent.timestamp}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Zone:</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedEvent.zone}</p>
              </div>
              <div>
                <span className="text-slate-400">Severity:</span>
                <p className="font-bold text-red-600 mt-0.5">{selectedEvent.severity || 'NORMAL'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Flagged Personnel / Worker:</span>
                <span className="font-bold text-slate-900">
                  {selectedEvent.worker || 'Stationary Equipment / Haul Asset'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Originating Subsystem:</span>
                <span className="font-mono text-slate-800">{selectedEvent.systemOrUser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Related Statutory Violation:</span>
                <span className="font-mono font-bold text-red-600">
                  {selectedEvent.relatedViolation || 'None'}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">
                Event Description & Telemetry:
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>

            {selectedEvent.action && (
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg">
                <span className="text-blue-900 font-bold block mb-1">Automated Action Taken:</span>
                <p className="text-blue-800 leading-relaxed">{selectedEvent.action}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditLog;
