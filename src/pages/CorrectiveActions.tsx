import React, { useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertOctagon,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Filter,
  Plus,
  Search,
  Eye,
  Send,
  AlertTriangle,
  Play,
  RotateCw,
} from 'lucide-react';
import {
  useMineGuard,
  CorrectiveActionRecord,
  CorrectiveStatus,
} from '../context/MineGuardContext';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';

export const CorrectiveActions: React.FC = () => {
  const {
    correctiveActions,
    updateActionStatus,
    assignOfficer,
    createActionTicket,
  } = useMineGuard();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedRecord, setSelectedRecord] = useState<CorrectiveActionRecord | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [assignModalRecord, setAssignModalRecord] = useState<CorrectiveActionRecord | null>(null);
  const [assigneeName, setAssigneeName] = useState('Safety Officer Harini N');

  // Form for new ticket
  const [newViolation, setNewViolation] = useState('');
  const [newZone, setNewZone] = useState('B');
  const [newAction, setNewAction] = useState('');
  const [newPriority, setNewPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');

  // Counts
  const totalCount = correctiveActions.length;
  const pendingCount = correctiveActions.filter((a) => a.status === 'Pending').length;
  const inProgressCount = correctiveActions.filter(
    (a) => a.status === 'In Progress' || a.status === 'Assigned'
  ).length;
  const overdueCount = correctiveActions.filter((a) => a.status === 'Overdue').length;
  const resolvedCount = correctiveActions.filter((a) => a.status === 'Resolved').length;

  const filteredActions = correctiveActions.filter((a) => {
    if (statusFilter === 'All') return true;
    return a.status === statusFilter;
  });

  const workflowSteps = [
    'Violation',
    'Assign Officer',
    'Corrective Action',
    'Deadline',
    'Verification',
    'Resolved',
  ];

  const handleNextStatus = (record: CorrectiveActionRecord) => {
    let next: CorrectiveStatus = record.status;
    if (record.status === 'Pending') next = 'Assigned';
    else if (record.status === 'Assigned') next = 'In Progress';
    else if (record.status === 'In Progress') next = 'Verification';
    else if (record.status === 'Verification') next = 'Resolved';

    updateActionStatus(record.id, next);
    setActionSuccessMsg(`Ticket #${record.id} status advanced to "${next}"`);
    setTimeout(() => setActionSuccessMsg(null), 3500);

    if (selectedRecord && selectedRecord.id === record.id) {
      setSelectedRecord({ ...selectedRecord, status: next });
    }
  };

  const handleDirectStatusChange = (id: string, newStatus: CorrectiveStatus) => {
    updateActionStatus(id, newStatus);
    setActionSuccessMsg(`Ticket #${id} set to "${newStatus}"`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord({ ...selectedRecord, status: newStatus });
    }
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newViolation || !newAction) return;

    createActionTicket({
      violation: newViolation,
      zone: newZone,
      assignedOfficer: 'Safety Officer Harini N',
      correctiveAction: newAction,
      deadline: '20 September 2026',
      priority: newPriority,
      status: 'Pending',
      notes: 'Logged via Corrective Action Tracking console',
    });

    setNewViolation('');
    setNewAction('');
    setNewTicketModalOpen(false);
    setActionSuccessMsg('New corrective action ticket created successfully!');
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleAssignOfficerSubmit = () => {
    if (assignModalRecord) {
      assignOfficer(assignModalRecord.id, assigneeName);
      if (assignModalRecord.status === 'Pending') {
        updateActionStatus(assignModalRecord.id, 'Assigned');
      }
      setActionSuccessMsg(`Assigned ${assigneeName} to Ticket #${assignModalRecord.id}`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
      setAssignModalRecord(null);
    }
  };

  // Helper to get step index
  const getStepIndex = (status: CorrectiveStatus) => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Assigned':
        return 1;
      case 'In Progress':
        return 2;
      case 'Verification':
        return 4;
      case 'Resolved':
        return 5;
      case 'Overdue':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              CORRECTIVE ACTION TRACKING
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            End-to-end statutory infraction remediation lifecycle and verification
          </p>
        </div>

        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Action Ticket</span>
        </button>
      </div>

      {/* Success Banner */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Workflow Visualization Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Governance Remediation Lifecycle
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">DGMS CMR 2017 Protocol</span>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-[620px] gap-2">
            {workflowSteps.map((step, idx) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs shadow-2xs">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-1.5 whitespace-nowrap">
                    {step}
                  </span>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="flex-1 flex items-center justify-center text-slate-300">
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Actions
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {totalCount}
            </span>
            <span className="text-[10px] text-slate-400">Tickets</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Across all zones</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Pending
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {pendingCount}
            </span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Unassigned
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Awaiting dispatch</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            In Progress
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
              {inProgressCount}
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Remediation underway</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Overdue
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
              {overdueCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Clear
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Zero breaches</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Resolved
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {resolvedCount}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Audit compliant</span>
        </div>
      </div>

      {/* Main Table / Cards View */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800">Filter By Status:</span>
            {['All', 'Pending', 'Assigned', 'In Progress', 'Verification', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredActions.length} Actions Listed
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left min-w-[720px]">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="p-3">ID / Violation</th>
                <th className="p-3">Zone</th>
                <th className="p-3">Assigned Officer</th>
                <th className="p-3">Corrective Action</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActions.map((record) => {
                const isResolved = record.status === 'Resolved';
                const isPending = record.status === 'Pending';
                const isAssigned = record.status === 'Assigned';
                const isInProgress = record.status === 'In Progress';
                const isVerification = record.status === 'Verification';

                const statusBadgeVariant = isResolved
                  ? 'success'
                  : isPending
                  ? 'danger'
                  : isVerification
                  ? 'purple'
                  : 'warning';

                return (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-3">
                      <div className="font-mono text-slate-400 text-[10px]">{record.id}</div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {record.violation}
                      </div>
                    </td>

                    <td className="p-3 font-bold text-slate-800">Zone {record.zone}</td>

                    <td className="p-3 text-slate-700">
                      <span className="font-medium">{record.assignedOfficer}</span>
                    </td>

                    <td className="p-3 max-w-xs truncate text-slate-600 font-medium">
                      {record.correctiveAction}
                    </td>

                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">
                      {record.deadline}
                    </td>

                    <td className="p-3">
                      <Badge
                        variant={
                          record.priority === 'Critical'
                            ? 'danger'
                            : record.priority === 'High'
                            ? 'warning'
                            : 'low'
                        }
                        size="sm"
                      >
                        {record.priority}
                      </Badge>
                    </td>

                    <td className="p-3">
                      <Badge variant={statusBadgeVariant} size="sm">
                        {record.status}
                      </Badge>
                    </td>

                    <td className="p-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <button
                            onClick={() => setAssignModalRecord(record)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded transition-colors"
                          >
                            Assign Officer
                          </button>
                        )}
                        {isAssigned && (
                          <button
                            onClick={() => handleNextStatus(record)}
                            className="px-2.5 py-1 text-xs font-semibold text-amber-700 hover:text-white bg-amber-50 hover:bg-amber-600 rounded transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Start Action</span>
                          </button>
                        )}
                        {isInProgress && (
                          <button
                            onClick={() => handleNextStatus(record)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:text-white bg-purple-50 hover:bg-purple-600 rounded transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Verification</span>
                          </button>
                        )}
                        {isVerification && (
                          <button
                            onClick={() => handleNextStatus(record)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 rounded transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Resolved</span>
                          </button>
                        )}
                        {isResolved && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Closed</span>
                          </span>
                        )}
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title={`Action Ticket #${selectedRecord.id} Details`}
          subtitle={`Violation: ${selectedRecord.violation} • Zone ${selectedRecord.zone}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-400 font-mono">
                Initiated: {selectedRecord.initiatedAt}
              </span>
              <div className="flex items-center gap-2">
                {selectedRecord.status !== 'Resolved' && (
                  <button
                    onClick={() => handleNextStatus(selectedRecord)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Advance Stage ({selectedRecord.status})</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            {/* Timeline in modal */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Action Progress Stage
              </span>
              <div className="flex items-center justify-between text-center gap-1">
                {['Pending', 'Assigned', 'In Progress', 'Verification', 'Resolved'].map(
                  (st, idx) => {
                    const currentIndex = getStepIndex(selectedRecord.status);
                    const isPassed = idx <= currentIndex;
                    return (
                      <div key={st} className="flex-1">
                        <div
                          className={`h-1.5 rounded-full mb-1 ${
                            isPassed ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-semibold block ${
                            isPassed ? 'text-blue-700 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {st}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
              <div>
                <span className="text-slate-400">Assigned Officer:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedRecord.assignedOfficer}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Deadline:</span>
                <p className="font-mono font-bold text-red-600 mt-0.5">
                  {selectedRecord.deadline}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedRecord.priority}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p className="font-bold text-blue-600 mt-0.5">
                  {selectedRecord.status}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium block mb-1">
                Remedial Action Protocol:
              </span>
              <p className="text-slate-800 font-semibold">{selectedRecord.correctiveAction}</p>
            </div>

            {selectedRecord.notes && (
              <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200/80">
                <span className="text-blue-900 font-bold block mb-1">Supervisor Notes:</span>
                <p className="text-blue-800 leading-relaxed">{selectedRecord.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Assign Officer Modal */}
      {assignModalRecord && (
        <Modal
          isOpen={!!assignModalRecord}
          onClose={() => setAssignModalRecord(null)}
          title={`Assign Officer to Ticket #${assignModalRecord.id}`}
          subtitle={`Violation: ${assignModalRecord.violation}`}
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setAssignModalRecord(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignOfficerSubmit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Assign & Dispatch
              </button>
            </div>
          }
        >
          <div className="space-y-2 text-xs">
            {[
              'Safety Officer Harini N',
              'Environmental Officer Patel',
              'Shift Incharge Verma',
              'Blast Area Marshal Singh',
            ].map((name) => (
              <label
                key={name}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer ${
                  assigneeName === name
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span>{name}</span>
                <input
                  type="radio"
                  name="assignee"
                  checked={assigneeName === name}
                  onChange={() => setAssigneeName(name)}
                />
              </label>
            ))}
          </div>
        </Modal>
      )}

      {/* Create New Action Ticket Modal */}
      {newTicketModalOpen && (
        <Modal
          isOpen={newTicketModalOpen}
          onClose={() => setNewTicketModalOpen(false)}
          title="Create Corrective Action Ticket"
          subtitle="Statutory Remediation Protocol under DGMS CMR 2017"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Violation / Hazard Description:
              </label>
              <input
                type="text"
                required
                value={newViolation}
                onChange={(e) => setNewViolation(e.target.value)}
                placeholder="e.g., Unsafe Bench Berm Height"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mine Zone:</label>
                <select
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="A">Zone A</option>
                  <option value="B">Zone B</option>
                  <option value="C">Zone C</option>
                  <option value="D">Zone D</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Priority:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Required Corrective Action:
              </label>
              <textarea
                required
                rows={3}
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Describe corrective mechanical or operational action..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewTicketModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Create Ticket
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CorrectiveActions;
