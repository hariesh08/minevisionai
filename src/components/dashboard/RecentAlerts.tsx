import React, { useState } from 'react';
import { Bell, ChevronRight, AlertTriangle, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { SafetyAlert, recentAlerts } from '../../data/mockData';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export interface RecentAlertsProps {
  onViewAll?: () => void;
  onSelectAlert?: (alert: SafetyAlert) => void;
  searchQuery?: string;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({
  onViewAll,
  onSelectAlert,
  searchQuery = '',
}) => {
  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [alertsList, setAlertsList] = useState<SafetyAlert[]>(recentAlerts);

  const query = searchQuery.trim().toLowerCase();
  const filteredAlerts = query
    ? alertsList.filter((a) =>
        [a.id, a.title, a.zone, a.severity, a.status, a.time, a.category]
          .join(' ')
          .toLowerCase()
          .includes(query)
      )
    : alertsList;

  const handleAlertClick = (alert: SafetyAlert) => {
    setSelectedAlert(alert);
    if (onSelectAlert) onSelectAlert(alert);
  };

  const handleAcknowledge = (id: string) => {
    setAlertsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Acknowledged' } : a))
    );
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert({ ...selectedAlert, status: 'Acknowledged' });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent Alerts</h2>
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

      {/* Alert List */}
      <div className="p-3 sm:p-4 divide-y divide-slate-100 flex-1 flex flex-col justify-between">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-slate-500">
              No alerts match "{searchQuery.trim()}"
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try a zone, alert title, or severity.
            </p>
          </div>
        ) : (
        filteredAlerts.map((alert) => {
          const isHigh = alert.severity === 'HIGH';
          const isMedium = alert.severity === 'MEDIUM';

          const dotColor = isHigh
            ? 'bg-red-500'
            : isMedium
            ? 'bg-amber-500'
            : 'bg-emerald-500';

          const badgeVariant = isHigh
            ? 'danger'
            : isMedium
            ? 'warning'
            : 'low';

          return (
            <div
              key={alert.id}
              onClick={() => handleAlertClick(alert)}
              className="py-2.5 sm:py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                    {alert.title}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                    <span>{alert.time}</span>
                    {alert.status === 'Acknowledged' && (
                      <span className="text-[10px] text-emerald-600 font-sans font-medium">
                        • Acknowledged
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Badge variant={badgeVariant} size="sm">
                  {alert.severity === 'HIGH' ? 'High' : alert.severity === 'MEDIUM' ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
          );
        })
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Modal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          title={selectedAlert.title}
          subtitle={`Zone: ${selectedAlert.zone} • Timestamp: ${selectedAlert.time}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-slate-500">
                Alert ID: <span className="font-mono">{selectedAlert.id}</span>
              </span>
              <div className="flex items-center gap-2">
                {selectedAlert.status !== 'Acknowledged' && (
                  <button
                    onClick={() => handleAcknowledge(selectedAlert.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledge Alert</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-xs text-slate-500">Severity</span>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedAlert.severity === 'HIGH'
                        ? 'danger'
                        : selectedAlert.severity === 'MEDIUM'
                        ? 'warning'
                        : 'low'
                    }
                  >
                    {selectedAlert.severity} PRIORITY
                  </Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Category</span>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {selectedAlert.category}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">Status</span>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  {selectedAlert.status}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <div className="text-xs font-semibold text-slate-800 mb-1">
                Incident Description:
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedAlert.description}
              </p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-lg">
              <div className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                <span>Mandatory Action Protocol:</span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                {selectedAlert.actionRequired}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* View All Modal */}
      {showAllModal && (
        <Modal
          isOpen={showAllModal}
          onClose={() => setShowAllModal(false)}
          title="All Active Safety Alerts"
          subtitle="Real-time incident stream from MineGuard AI Computer Vision and IoT sensors"
          maxWidth="2xl"
          footer={
            <button
              onClick={() => setShowAllModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          }
        >
          <div className="space-y-3">
            {alertsList.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                    <Badge
                      variant={
                        alert.severity === 'HIGH'
                          ? 'danger'
                          : alert.severity === 'MEDIUM'
                          ? 'warning'
                          : 'low'
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                  <p className="text-[11px] text-blue-700 font-medium mt-1">
                    Action: {alert.actionRequired}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono text-slate-500">{alert.time}</span>
                  <div className="mt-2">
                    {alert.status !== 'Acknowledged' ? (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="text-[11px] px-2 py-1 bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 rounded font-medium"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-medium">
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecentAlerts;
