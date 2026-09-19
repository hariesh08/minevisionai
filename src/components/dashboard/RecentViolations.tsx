import React, { useState } from 'react';
import {
  FileWarning,
  ChevronRight,
  AlertOctagon,
  User,
  Camera,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { ViolationRecord, recentViolations } from '../../data/mockData';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export interface RecentViolationsProps {
  onViewAll?: () => void;
  onSelectViolation?: (violation: ViolationRecord) => void;
  searchQuery?: string;
}

export const RecentViolations: React.FC<RecentViolationsProps> = ({
  onViewAll,
  onSelectViolation,
  searchQuery = '',
}) => {
  const [violations, setViolations] = useState<ViolationRecord[]>(recentViolations);
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const query = searchQuery.trim().toLowerCase();
  const filteredViolations = query
    ? violations.filter((v) =>
        [
          v.id,
          v.zone,
          v.violation,
          v.severity,
          v.status,
          v.workerName || '',
          v.workerId || '',
          v.camera,
          v.reportedBy,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : violations;

  const handleRowClick = (item: ViolationRecord) => {
    setSelectedViolation(item);
    if (onSelectViolation) onSelectViolation(item);
  };

  const handleUpdateStatus = (
    id: string,
    newStatus: 'Open' | 'Investigating' | 'Resolved'
  ) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );
    if (selectedViolation && selectedViolation.id === id) {
      setSelectedViolation({ ...selectedViolation, status: newStatus });
    }
    setActionSuccessMessage(`Status updated to "${newStatus}" for incident #${id}`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Recent Violations
          </h2>
        </div>
        <button
          onClick={() => {
            setShowAllModal(true);
            if (onViewAll) onViewAll();
          }}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table Container */}
      <div className="p-3 sm:p-4 overflow-x-auto flex-1 flex flex-col justify-between">
        <table className="w-full text-xs text-left min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-200/70 text-slate-400 font-medium">
              <th className="pb-2.5 font-medium">Time</th>
              <th className="pb-2.5 font-medium">Zone</th>
              <th className="pb-2.5 font-medium">Violation</th>
              <th className="pb-2.5 font-medium">Severity</th>
              <th className="pb-2.5 font-medium text-right">Status</th>
            </tr>
          </thead>
          {filteredViolations.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={5} className="py-8 text-center">
                  <p className="text-sm font-semibold text-slate-500">
                    No violations match "{searchQuery.trim()}"
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try a zone, worker ID, severity, or violation type.
                  </p>
                </td>
              </tr>
            </tbody>
          ) : (
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredViolations.map((row) => {
              const isHigh = row.severity === 'High';
              const isMedium = row.severity === 'Medium';

              const severityColor = isHigh
                ? 'text-red-600'
                : isMedium
                ? 'text-orange-600'
                : 'text-amber-600';

              const severityDot = isHigh
                ? 'bg-red-500'
                : isMedium
                ? 'bg-orange-500'
                : 'bg-amber-500';

              const statusBadgeVariant =
                row.status === 'Resolved'
                  ? 'success'
                  : row.status === 'Investigating'
                  ? 'warning'
                  : 'danger';

              return (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 font-mono text-slate-600 group-hover:text-blue-600">
                    {row.time}
                  </td>
                  <td className="py-2.5 font-bold text-slate-900">{row.zone}</td>
                  <td className="py-2.5 text-slate-800 group-hover:text-slate-950">
                    {row.violation}
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1.5 ${severityColor} font-semibold`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${severityDot}`} />
                      <span>{row.severity}</span>
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <Badge variant={statusBadgeVariant} size="sm">
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          )}
        </table>
      </div>

      {/* Violation Detail Modal */}
      {selectedViolation && (
        <Modal
          isOpen={!!selectedViolation}
          onClose={() => setSelectedViolation(null)}
          title={`Violation Case #${selectedViolation.id} - ${selectedViolation.violation}`}
          subtitle={`Location: Zone ${selectedViolation.zone} • Logged at ${selectedViolation.time}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="text-xs text-slate-500">
                Current Status:{' '}
                <strong className="text-slate-800">{selectedViolation.status}</strong>
              </div>
              <div className="flex items-center gap-2">
                {selectedViolation.status !== 'Resolved' ? (
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        selectedViolation.id,
                        selectedViolation.status === 'Open' ? 'Investigating' : 'Resolved'
                      )
                    }
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {selectedViolation.status === 'Open'
                        ? 'Mark Investigating'
                        : 'Resolve & Close'}
                    </span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Case Closed</span>
                  </span>
                )}
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            {actionSuccessMessage && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium">
                {actionSuccessMessage}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400">Time</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {selectedViolation.time}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Sector</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  Zone {selectedViolation.zone}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Severity</span>
                <p className="font-bold text-red-600 mt-0.5">
                  {selectedViolation.severity}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Status</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedViolation.status}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Flagged Personnel / Asset:</span>
                <span className="font-bold text-slate-900">
                  {selectedViolation.workerName || 'Crew Asset'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Camera Sensor Source:</span>
                <span className="font-mono text-slate-800">{selectedViolation.camera}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Detected By:</span>
                <span className="text-blue-700 font-semibold">{selectedViolation.reportedBy}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium block mb-1">Inspector Notes:</span>
              <p className="text-slate-700 leading-relaxed">{selectedViolation.notes}</p>
            </div>

            <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-200">
              <span className="text-blue-900 font-semibold block mb-1">Action Logged:</span>
              <p className="text-blue-800 leading-relaxed">{selectedViolation.actionTaken}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* View All Violations Modal */}
      {showAllModal && (
        <Modal
          isOpen={showAllModal}
          onClose={() => setShowAllModal(false)}
          title="Mine Safety Violations Master Register"
          subtitle="Full DGMS CMR 2017 Audit Registry for Current Operational Shift"
          maxWidth="3xl"
          footer={
            <button
              onClick={() => setShowAllModal(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Close
            </button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="py-2">ID</th>
                    <th className="py-2">Time</th>
                    <th className="py-2">Zone</th>
                    <th className="py-2">Worker</th>
                    <th className="py-2">Violation</th>
                    <th className="py-2">Severity</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {violations.map((v) => (
                    <tr
                      key={v.id}
                      onClick={() => {
                        setSelectedViolation(v);
                        setShowAllModal(false);
                      }}
                      className="hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="py-2 font-mono text-slate-500">{v.id}</td>
                      <td className="py-2 font-mono">{v.time}</td>
                      <td className="py-2 font-bold">{v.zone}</td>
                      <td className="py-2 text-slate-700">{v.workerId || 'N/A'}</td>
                      <td className="py-2 text-slate-900 font-medium">{v.violation}</td>
                      <td className="py-2">
                        <Badge
                          variant={
                            v.severity === 'High'
                              ? 'danger'
                              : v.severity === 'Medium'
                              ? 'warning'
                              : 'low'
                          }
                        >
                          {v.severity}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <Badge
                          variant={
                            v.status === 'Resolved'
                              ? 'success'
                              : v.status === 'Investigating'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {v.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecentViolations;
