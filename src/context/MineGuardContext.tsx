import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getRelativeDate } from '../utils/dateUtils';
import {
  recentViolations,
  environmentalParams,
  mineZones,
  SafetyAlert,
  ViolationRecord,
} from '../data/mockData';

// Interfaces for Compliance
export interface ComplianceItem {
  id: string;
  title: string;
  category: string;
  status: 'Compliant' | 'Warning' | 'Violation';
  violationsCount: number;
  lastInspection: string;
  correctiveAction: string;
  responsibleOfficer: string;
  dueDate: string;
  details: string;
  dgmsStandard: string;
}

// Interfaces for Corrective Actions
export type CorrectiveStatus =
  | 'Pending'
  | 'Assigned'
  | 'In Progress'
  | 'Verification'
  | 'Resolved'
  | 'Overdue';

export interface CorrectiveActionRecord {
  id: string;
  violation: string;
  zone: string;
  assignedOfficer: string;
  correctiveAction: string;
  deadline: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: CorrectiveStatus;
  notes?: string;
  initiatedAt: string;
  resolvedAt?: string;
}

// Interfaces for Audit Log
export type AuditEventType =
  | 'AI Detection'
  | 'Violation'
  | 'Alert'
  | 'Officer Assignment'
  | 'Corrective Action'
  | 'Resolution'
  | 'Inspection';

export interface AuditLogEvent {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  eventType: AuditEventType;
  description: string;
  systemOrUser: string;
  zone: string;
  relatedViolation?: string;
  worker?: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL';
  action?: string;
  hash: string;
}

// Interfaces for Risk AI
export interface ZoneRiskData {
  zone: string;
  name: string;
  riskScore: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  mainRiskFactor: string;
  recommendedAction: string;
  factors: {
    dust: number;
    temperature: number;
    previousEvents: number;
    workerDensity: number;
    gasLevel: number;
  };
}

interface MineGuardContextType {
  // Compliance
  complianceItems: ComplianceItem[];
  updateComplianceStatus: (id: string, status: 'Compliant' | 'Warning' | 'Violation') => void;
  recordInspection: (id: string) => void;

  // Corrective Actions
  correctiveActions: CorrectiveActionRecord[];
  updateActionStatus: (id: string, newStatus: CorrectiveStatus) => void;
  assignOfficer: (id: string, officerName: string) => void;
  createActionTicket: (ticket: Omit<CorrectiveActionRecord, 'id' | 'initiatedAt'>) => void;

  // Audit Log
  auditEvents: AuditLogEvent[];
  addAuditEvent: (event: Omit<AuditLogEvent, 'id' | 'hash'>) => void;

  // Risk AI
  zoneRiskList: ZoneRiskData[];
  predictedRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  isPredicting: boolean;
  runRiskPrediction: () => Promise<void>;
  lastPredictionTimestamp: string;
}

const MineGuardContext = createContext<MineGuardContextType | undefined>(undefined);

export const MineGuardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initial Compliance Items
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    {
      id: 'comp-1',
      title: 'Worker PPE',
      category: 'Occupational Safety',
      status: 'Warning',
      violationsCount: 7,
      lastInspection: getRelativeDate(0, 'dash'),
      correctiveAction: 'Conduct PPE inspection & enforce hardhat protocol in Zone B',
      responsibleOfficer: 'Safety Officer Harini N',
      dueDate: getRelativeDate(1, 'dash'),
      details: 'AI CCTV vision detected 7 instances of helmet removal near excavator drilling lines.',
      dgmsStandard: 'DGMS Standard CMR 2017 Reg 190 (Mandatory Personal Protective Equipment)',
    },
    {
      id: 'comp-2',
      title: 'Dust Monitoring',
      category: 'Environmental Controls',
      status: 'Warning',
      violationsCount: 4,
      lastInspection: getRelativeDate(0, 'dash'),
      correctiveAction: 'Inspect ventilation & continuous mist suppression system at Zone C',
      responsibleOfficer: 'Environmental Officer Patel',
      dueDate: getRelativeDate(1, 'dash'),
      details: 'PM10 continuous particulate telemetry reached 92 µg/m³ exceeding statutory threshold of 75 µg/m³.',
      dgmsStandard: 'DGMS Circular No. 04 / Coal Mines Dust Norms (CPEMS)',
    },
    {
      id: 'comp-3',
      title: 'Safety Inspection',
      category: 'Statutory Operations',
      status: 'Compliant',
      violationsCount: 1,
      lastInspection: getRelativeDate(0, 'dash'),
      correctiveAction: 'Routine shift audit scheduled for Afternoon Shift B',
      responsibleOfficer: 'Shift Incharge Verma',
      dueDate: getRelativeDate(2, 'dash'),
      details: 'Shift statutory inspections logged without structural non-compliance.',
      dgmsStandard: 'CMR 2017 Reg 104 (Shift-wise mine inspections by Overman)',
    },
    {
      id: 'comp-4',
      title: 'Restricted Zone Control',
      category: 'High-Hazard Geofencing',
      status: 'Violation',
      violationsCount: 3,
      lastInspection: getRelativeDate(0, 'dash'),
      correctiveAction: 'Reinforce highwall blast perimeter demarcations and audible sirens',
      responsibleOfficer: 'Safety Officer Harini N',
      dueDate: getRelativeDate(0, 'dash'),
      details: 'AI Geofence flagged unauthorized personnel entry within 20m highwall blast buffer.',
      dgmsStandard: 'CMR 2017 Reg 164 (Danger Zone & Blasting Exclusion Controls)',
    },
    {
      id: 'comp-5',
      title: 'Emergency Equipment',
      category: 'Disaster Preparedness',
      status: 'Compliant',
      violationsCount: 0,
      lastInspection: getRelativeDate(-1, 'dash'),
      correctiveAction: 'Monthly fire suppressant hydrostatic testing scheduled',
      responsibleOfficer: 'Technical Officer Rao',
      dueDate: '22-09-2026',
      details: 'All automated fire hydrants, foam extinguishers, and emergency trip-wires operational.',
      dgmsStandard: 'DGMS Tech Circular 02 (Fire Prevention & Mine Rescue Apparatus)',
    },
  ]);

  // 2. Initial Corrective Actions
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveActionRecord[]>([
    {
      id: 'CA-201',
      violation: 'High Dust',
      zone: 'C',
      assignedOfficer: 'Environmental Officer Patel',
      correctiveAction: 'Inspect dust suppression system and conveyor mist nozzles',
      deadline: getRelativeDate(1, 'full'),
      priority: 'High',
      status: 'In Progress',
      notes: 'Water pressure pump manifold #3 valve replaced; testing spray pattern.',
      initiatedAt: `${getRelativeDate(0, 'shortYear')}, 12:15 PM`,
    },
    {
      id: 'CA-202',
      violation: 'No Helmet (Worker W102)',
      zone: 'B',
      assignedOfficer: 'Safety Officer Harini N',
      correctiveAction: 'Conduct PPE inspection & safety counseling at Face 3',
      deadline: getRelativeDate(1, 'full'),
      priority: 'Critical',
      status: 'Assigned',
      notes: 'Worker summoned to pit office for mandatory safety equipment briefing.',
      initiatedAt: `${getRelativeDate(0, 'shortYear')}, 10:45 AM`,
    },
    {
      id: 'CA-203',
      violation: 'Restricted Zone Entry',
      zone: 'A',
      assignedOfficer: 'Blast Area Marshal Singh',
      correctiveAction: 'Re-demarcate exclusion perimeter tape and verify optical beacon',
      deadline: getRelativeDate(0, 'full'),
      priority: 'High',
      status: 'Pending',
      notes: 'Personnel escorted out safely; reviewing physical barricade placement.',
      initiatedAt: `${getRelativeDate(0, 'shortYear')}, 11:20 AM`,
    },
    {
      id: 'CA-204',
      violation: 'Conveyor Pull-Cord Trip Wire',
      zone: 'D',
      assignedOfficer: 'Mechanical Officer Rao',
      correctiveAction: 'Recalibrate emergency stop switch tension on overland conveyor',
      deadline: getRelativeDate(-1, 'full'),
      priority: 'Medium',
      status: 'Verification',
      notes: 'Mechanical repair executed; awaiting independent safety audit sign-off.',
      initiatedAt: `${getRelativeDate(-1, 'shortYear')}, 02:30 PM`,
    },
    {
      id: 'CA-205',
      violation: 'PPE Issue (Vest Unzipped)',
      zone: 'D',
      assignedOfficer: 'Shift Supervisor Verma',
      correctiveAction: 'Immediate verbal correction and issued high-visibility harness',
      deadline: getRelativeDate(0, 'full'),
      priority: 'Low',
      status: 'Resolved',
      notes: 'Worker inspected on CAM 02; full compliance confirmed.',
      initiatedAt: `${getRelativeDate(0, 'shortYear')}, 12:35 PM`,
      resolvedAt: `${getRelativeDate(0, 'shortYear')}, 01:05 PM`,
    },
  ]);

  // 3. Initial Audit Log Events
  const [auditEvents, setAuditEvents] = useState<AuditLogEvent[]>([
    {
      id: 'AUD-891',
      timestamp: `${getRelativeDate(0, 'short')} 10:42 AM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '10:42 AM',
      eventType: 'AI Detection',
      description: 'AI computer vision detected worker W102 without required helmet near Loader L-04',
      systemOrUser: 'MineVision Edge CV v2.4',
      zone: 'Zone B',
      relatedViolation: 'V1023',
      worker: 'W102 (Ramesh K.)',
      severity: 'HIGH',
      action: 'Violation V1023 created automatically',
      hash: '0x8f2e91a4b',
    },
    {
      id: 'AUD-892',
      timestamp: `${getRelativeDate(0, 'short')} 10:43 AM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '10:43 AM',
      eventType: 'Violation',
      description: 'Violation V1023 recorded in master statutory compliance register',
      systemOrUser: 'Governance Engine',
      zone: 'Zone B',
      relatedViolation: 'V1023',
      severity: 'HIGH',
      action: 'Flagged for Shift Officer inspection',
      hash: '0x3c71a9901',
    },
    {
      id: 'AUD-893',
      timestamp: `${getRelativeDate(0, 'short')} 10:43 AM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '10:43 AM',
      eventType: 'Alert',
      description: 'Urgent mobile push alert dispatched to Safety Officer terminal',
      systemOrUser: 'Dispatcher Daemon',
      zone: 'Zone B',
      relatedViolation: 'V1023',
      severity: 'HIGH',
      action: 'Audible siren triggered in Zone B kiosk',
      hash: '0x6e24177ef',
    },
    {
      id: 'AUD-894',
      timestamp: `${getRelativeDate(0, 'short')} 10:45 AM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '10:45 AM',
      eventType: 'Officer Assignment',
      description: 'Safety Officer Harini N assigned to violation V1023',
      systemOrUser: 'Shift Incharge Verma',
      zone: 'Zone B',
      relatedViolation: 'V1023',
      severity: 'HIGH',
      action: 'Ticket CA-202 generated with 24h deadline',
      hash: '0x99a134b22',
    },
    {
      id: 'AUD-895',
      timestamp: `${getRelativeDate(0, 'short')} 11:20 AM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '11:20 AM',
      eventType: 'Corrective Action',
      description: 'Corrective action started: Field counseling and PPE replacement at Face 3',
      systemOrUser: 'Harini N (Safety Officer)',
      zone: 'Zone B',
      relatedViolation: 'V1023',
      severity: 'HIGH',
      action: 'Status updated to In Progress',
      hash: '0x12b09a55c',
    },
    {
      id: 'AUD-896',
      timestamp: `${getRelativeDate(0, 'short')} 12:05 PM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '12:05 PM',
      eventType: 'Alert',
      description: 'Continuous PM10 dust sensor #C-14 registered 92 µg/m³ peak exceedance',
      systemOrUser: 'IoT Telemetry Mesh',
      zone: 'Zone C',
      relatedViolation: 'V1024',
      severity: 'MEDIUM',
      action: 'Auto-triggered water mist cannon relay',
      hash: '0x44d1880ca',
    },
    {
      id: 'AUD-897',
      timestamp: `${getRelativeDate(0, 'short')} 12:10 PM`,
      date: getRelativeDate(0, 'shortYear'),
      time: '12:10 PM',
      eventType: 'Resolution',
      description: 'Violation V1022 (Vest Unzipped) resolved and verified via CCTV stream',
      systemOrUser: 'Harini N (Safety Officer)',
      zone: 'Zone D',
      relatedViolation: 'V1022',
      severity: 'NORMAL',
      action: 'Ticket CA-205 marked Resolved',
      hash: '0x71e3b092a',
    },
  ]);

  // 4. Initial Risk AI state
  const [zoneRiskList, setZoneRiskList] = useState<ZoneRiskData[]>([
    {
      zone: 'Zone B',
      name: 'Zone B - Deep Extraction Face',
      riskScore: 78,
      riskLevel: 'HIGH',
      mainRiskFactor: 'Elevated Dust (32%) & PPE Non-compliance',
      recommendedAction: 'Inspect ventilation & enforce PPE checks',
      factors: {
        dust: 32,
        temperature: 21,
        previousEvents: 18,
        workerDensity: 15,
        gasLevel: 14,
      },
    },
    {
      zone: 'Zone A',
      name: 'Zone A - Western Excavation Pit',
      riskScore: 24,
      riskLevel: 'LOW',
      mainRiskFactor: 'Haul Road Speed Adherence',
      recommendedAction: 'Continue scheduled shift rotation. Routine blast check at 15:00.',
      factors: {
        dust: 12,
        temperature: 15,
        previousEvents: 8,
        workerDensity: 18,
        gasLevel: 10,
      },
    },
    {
      zone: 'Zone C',
      name: 'Zone C - Crushing & Conveyor Hub',
      riskScore: 68,
      riskLevel: 'MEDIUM',
      mainRiskFactor: 'High Dust Level (92 µg/m³ exceedance)',
      recommendedAction: 'Inspect ventilation and dust suppression misting system.',
      factors: {
        dust: 44,
        temperature: 24,
        previousEvents: 14,
        workerDensity: 12,
        gasLevel: 16,
      },
    },
    {
      zone: 'Zone D',
      name: 'Zone D - Coal Stockpile & Rail Siding',
      riskScore: 19,
      riskLevel: 'LOW',
      mainRiskFactor: 'Conveyor Pull-Cord Maintenance',
      recommendedAction: 'Execute routine mechanical inspection before shift handover.',
      factors: {
        dust: 10,
        temperature: 12,
        previousEvents: 6,
        workerDensity: 14,
        gasLevel: 8,
      },
    },
  ]);

  const [predictedRisk, setPredictedRisk] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [isPredicting, setIsPredicting] = useState(false);
  const [lastPredictionTimestamp, setLastPredictionTimestamp] = useState(`${getRelativeDate(0, 'shortYear')}, 10:42 AM`);

  // Helpers
  const addAuditEvent = (event: Omit<AuditLogEvent, 'id' | 'hash'>) => {
    const newEvent: AuditLogEvent = {
      ...event,
      id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
      hash: `0x${Math.random().toString(16).substring(2, 11)}`,
    };
    setAuditEvents((prev) => [newEvent, ...prev]);
  };

  const updateComplianceStatus = (id: string, status: 'Compliant' | 'Warning' | 'Violation') => {
    setComplianceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const recordInspection = (id: string) => {
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getFullYear()}`;

    setComplianceItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, lastInspection: dateStr, status: 'Compliant' } : item
      )
    );

    const target = complianceItems.find((i) => i.id === id);
    if (target) {
      addAuditEvent({
        timestamp: `${dateStr} ${today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        date: dateStr,
        time: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        eventType: 'Inspection',
        description: `Statutory compliance inspection completed for ${target.title}`,
        systemOrUser: 'Safety Officer Harini N',
        zone: 'Zone B',
        severity: 'NORMAL',
        action: 'Item status updated to Compliant',
      });
    }
  };

  const updateActionStatus = (id: string, newStatus: CorrectiveStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCorrectiveActions((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            resolvedAt: newStatus === 'Resolved' ? `${getRelativeDate(0, 'shortYear')}, ${timeStr}` : item.resolvedAt,
          };
        }
        return item;
      })
    );

    const action = correctiveActions.find((a) => a.id === id);
    if (action) {
      addAuditEvent({
        timestamp: `${getRelativeDate(0, 'short')} ${timeStr}`,
        date: getRelativeDate(0, 'shortYear'),
        time: timeStr,
        eventType: newStatus === 'Resolved' ? 'Resolution' : 'Corrective Action',
        description: `Ticket ${action.id} (${action.violation}) transitioned to: ${newStatus}`,
        systemOrUser: 'Safety Officer Harini N',
        zone: `Zone ${action.zone}`,
        severity: newStatus === 'Resolved' ? 'NORMAL' : 'MEDIUM',
        action: `Workflow updated to ${newStatus}`,
      });
    }
  };

  const assignOfficer = (id: string, officerName: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCorrectiveActions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignedOfficer: officerName } : item))
    );

    addAuditEvent({
      timestamp: `${getRelativeDate(0, 'short')} ${timeStr}`,
      date: getRelativeDate(0, 'shortYear'),
      time: timeStr,
      eventType: 'Officer Assignment',
      description: `Assigned officer ${officerName} to corrective action ticket #${id}`,
      systemOrUser: 'Harini N (Safety Officer)',
      zone: 'Zone B',
      severity: 'NORMAL',
      action: 'Officer assignment logged',
    });
  };

  const createActionTicket = (ticket: Omit<CorrectiveActionRecord, 'id' | 'initiatedAt'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newId = `CA-${Math.floor(200 + Math.random() * 800)}`;

    const newRecord: CorrectiveActionRecord = {
      ...ticket,
      id: newId,
      initiatedAt: `${getRelativeDate(0, 'shortYear')}, ${timeStr}`,
    };

    setCorrectiveActions((prev) => [newRecord, ...prev]);

    addAuditEvent({
      timestamp: `${getRelativeDate(0, 'short')} ${timeStr}`,
      date: getRelativeDate(0, 'shortYear'),
      time: timeStr,
      eventType: 'Corrective Action',
      description: `Created new corrective action ticket #${newId} for ${ticket.violation}`,
      systemOrUser: 'Safety Officer Harini N',
      zone: `Zone ${ticket.zone}`,
      severity: ticket.priority === 'Critical' || ticket.priority === 'High' ? 'HIGH' : 'MEDIUM',
      action: 'Ticket queued for execution',
    });
  };

  const runRiskPrediction = async () => {
    setIsPredicting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Prototype simulated recalculation with real multi-sensor weightings
    const updatedZoneBScore = 78;
    setZoneRiskList((prev) =>
      prev.map((item) => {
        if (item.zone === 'Zone B') {
          return {
            ...item,
            riskScore: updatedZoneBScore,
            riskLevel: 'HIGH',
            factors: {
              dust: 32,
              temperature: 21,
              previousEvents: 18,
              workerDensity: 15,
              gasLevel: 14,
            },
          };
        }
        return item;
      })
    );

    setPredictedRisk('HIGH');
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastPredictionTimestamp(`${getRelativeDate(0, 'shortYear')}, ${timeStr}`);
    setIsPredicting(false);

    addAuditEvent({
      timestamp: `${getRelativeDate(0, 'short')} ${timeStr}`,
      date: getRelativeDate(0, 'shortYear'),
      time: timeStr,
      eventType: 'AI Detection',
      description: 'Automated predictive risk modeling completed across Zones A-D (Zone B: 78/100 HIGH)',
      systemOrUser: 'Risk AI Ensemble v3.1',
      zone: 'Zone B',
      severity: 'HIGH',
      action: 'Predictive alert refreshed in central dashboard',
    });
  };

  return (
    <MineGuardContext.Provider
      value={{
        complianceItems,
        updateComplianceStatus,
        recordInspection,
        correctiveActions,
        updateActionStatus,
        assignOfficer,
        createActionTicket,
        auditEvents,
        addAuditEvent,
        zoneRiskList,
        predictedRisk,
        isPredicting,
        runRiskPrediction,
        lastPredictionTimestamp,
      }}
    >
      {children}
    </MineGuardContext.Provider>
  );
};

export const useMineGuard = () => {
  const context = useContext(MineGuardContext);
  if (!context) {
    throw new Error('useMineGuard must be used within a MineGuardProvider');
  }
  return context;
};
