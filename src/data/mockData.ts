import { getRelativeDate } from '../utils/dateUtils';

export interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  comparison: string;
  iconName: 'Users' | 'UserCheck' | 'AlertTriangle' | 'ShieldCheck' | 'AlertOctagon' | 'FileWarning' | 'ClipboardList';
  color: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'cyan' | 'indigo';
}

export interface MineZone {
  id: string;
  code: string;
  name: string;
  status: 'Normal' | 'High Risk' | 'Warning' | 'Environmental Warning';
  statusColor: string;
  polygon: [number, number][]; // Relative SVG percentages [x, y]
  center: [number, number];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  workers: number;
  activeViolations: number;
  environmentalStatus: string;
  mainIssue: string;
  recommendedAction: string;
  temperature: string;
  dustLevel: string;
  cctvActive: boolean;
}

export interface SafetyAlert {
  id: string;
  title: string;
  zone: string;
  time: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'PPE' | 'Restricted Area' | 'Environmental' | 'Inspection';
  description: string;
  actionRequired: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
}

export interface RiskTrendPoint {
  time: string;
  low: number;
  medium: number;
  high: number;
}

export interface EnvironmentParam {
  parameter: string;
  current: string | number;
  status: 'Normal' | 'Warning' | 'Critical';
  unit?: string;
  threshold?: string;
}

export interface DustHourlyPoint {
  time: string;
  value: number;
}

export interface ViolationRecord {
  id: string;
  time: string;
  zone: string;
  violation: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved';
  workerId?: string;
  workerName?: string;
  camera?: string;
  reportedBy: string;
  notes?: string;
  actionTaken?: string;
}

export interface SystemComponentStatus {
  name: string;
  status: 'Active' | 'Connected' | 'Standby' | 'Degraded';
  healthScore: number;
  latency: string;
}

export const dashboardStats: DashboardStat[] = [
  {
    id: 'total-workers',
    title: 'Total Workers',
    value: 245,
    change: '↑ 5%',
    trend: 'up',
    comparison: 'vs. yesterday',
    iconName: 'Users',
    color: 'blue',
  },
  {
    id: 'active-workers',
    title: 'Active Workers',
    value: 218,
    change: '↑ 3%',
    trend: 'up',
    comparison: 'vs. yesterday',
    iconName: 'UserCheck',
    color: 'green',
  },
  {
    id: 'active-alerts',
    title: 'Active Alerts',
    value: 8,
    change: '↑ 2',
    trend: 'up',
    comparison: 'vs. yesterday',
    iconName: 'AlertTriangle',
    color: 'red',
  },
  {
    id: 'compliance-score',
    title: 'Compliance Score',
    value: '92%',
    change: '↑ 2%',
    trend: 'up',
    comparison: 'vs. yesterday',
    iconName: 'ShieldCheck',
    color: 'purple',
  },
  {
    id: 'high-risk-zones',
    title: 'High-Risk Zones',
    value: 2,
    change: '— 0',
    trend: 'neutral',
    comparison: 'vs. yesterday',
    iconName: 'AlertOctagon',
    color: 'orange',
  },
  {
    id: 'open-violations',
    title: 'Open Violations',
    value: 12,
    change: '↓ 3',
    trend: 'down',
    comparison: 'vs. yesterday',
    iconName: 'FileWarning',
    color: 'cyan',
  },
  {
    id: 'pending-inspections',
    title: 'Pending Inspections',
    value: 3,
    change: '↓ 1',
    trend: 'down',
    comparison: 'vs. yesterday',
    iconName: 'ClipboardList',
    color: 'indigo',
  },
];

export const mineZones: MineZone[] = [
  {
    id: 'zone-a',
    code: 'ZONE A',
    name: 'Zone A - Western Excavation Pit',
    status: 'Normal',
    statusColor: '#10b981',
    // Polygons for realistic open-pit benches map visualization
    polygon: [
      [15, 25],
      [38, 22],
      [35, 68],
      [12, 70],
    ],
    center: [24, 45],
    riskLevel: 'LOW',
    riskScore: 24,
    workers: 48,
    activeViolations: 1,
    environmentalStatus: 'Optimal (Dust: 38 PM10, Gas: Safe)',
    mainIssue: 'Minor speed limit caution on haul route',
    recommendedAction: 'Continue scheduled shift rotation. Routine blast check at 15:00.',
    temperature: '31°C',
    dustLevel: '38 µg/m³',
    cctvActive: true,
  },
  {
    id: 'zone-b',
    code: 'ZONE B',
    name: 'Zone B - Deep Extraction Face',
    status: 'High Risk',
    statusColor: '#ef4444',
    polygon: [
      [42, 14],
      [78, 12],
      [72, 45],
      [44, 46],
    ],
    center: [58, 28],
    riskLevel: 'HIGH',
    riskScore: 87,
    workers: 56,
    activeViolations: 4,
    environmentalStatus: 'Elevated particulate & diesel fumes',
    mainIssue: 'PPE violations (No helmet detected at Face 3)',
    recommendedAction: 'Inspect Zone B immediately. Dispatch safety marshals to Haul Road B-4.',
    temperature: '36°C',
    dustLevel: '78 µg/m³',
    cctvActive: true,
  },
  {
    id: 'zone-c',
    code: 'ZONE C',
    name: 'Zone C - Crushing & Conveyor Hub',
    status: 'Environmental Warning',
    statusColor: '#f97316',
    polygon: [
      [36, 52],
      [68, 50],
      [64, 88],
      [32, 85],
    ],
    center: [50, 68],
    riskLevel: 'MEDIUM',
    riskScore: 68,
    workers: 62,
    activeViolations: 2,
    environmentalStatus: 'High Dust Level (92 exceeded threshold)',
    mainIssue: 'Conveyor mist suppression nozzle pressure drop',
    recommendedAction: 'Inspect ventilation and dust suppression misting system. Check conveyor skirt.',
    temperature: '35°C',
    dustLevel: '92 µg/m³',
    cctvActive: true,
  },
  {
    id: 'zone-d',
    code: 'ZONE D',
    name: 'Zone D - Coal Stockpile & Rail Siding',
    status: 'Normal',
    statusColor: '#10b981',
    polygon: [
      [74, 38],
      [96, 36],
      [94, 80],
      [72, 78],
    ],
    center: [84, 58],
    riskLevel: 'LOW',
    riskScore: 19,
    workers: 52,
    activeViolations: 0,
    environmentalStatus: 'Compliant with DGMS safety norms',
    mainIssue: 'Scheduled conveyor belt maintenance due',
    recommendedAction: 'Execute routine mechanical inspection before shift handover.',
    temperature: '32°C',
    dustLevel: '42 µg/m³',
    cctvActive: true,
  },
];

export const recentAlerts: SafetyAlert[] = [
  {
    id: 'alert-1',
    title: 'No Helmet – Zone B',
    zone: 'Zone B',
    time: '10:42 AM',
    severity: 'HIGH',
    category: 'PPE',
    description: 'AI Computer Vision detected worker W102 without required safety helmet near Loader L-04.',
    actionRequired: 'Sound auditory proximity alert and dispatch field safety officer to enforce PPE compliance.',
    status: 'Active',
  },
  {
    id: 'alert-2',
    title: 'Restricted Zone Entry – Zone A',
    zone: 'Zone A',
    time: '11:17 AM',
    severity: 'HIGH',
    category: 'Restricted Area',
    description: 'Unauthorized personnel detected entering highwall blast perimeter demarcated as exclusion zone.',
    actionRequired: 'Halt blast preparation sequence immediately and escort personnel outside the safety perimeter.',
    status: 'Active',
  },
  {
    id: 'alert-3',
    title: 'High Dust – Zone C',
    zone: 'Zone C',
    time: '12:05 PM',
    severity: 'MEDIUM',
    category: 'Environmental',
    description: 'Continuous PM10 dust sensor #C-14 triggered 92 µg/m³ alert (exceeding permissible limit of 75 µg/m³).',
    actionRequired: 'Activate secondary water sprinkler cannon and verify conveyor belt hood sealing.',
    status: 'Active',
  },
  {
    id: 'alert-4',
    title: 'Inspection Due – Zone D',
    zone: 'Zone D',
    time: '12:30 PM',
    severity: 'LOW',
    category: 'Inspection',
    description: 'Bi-weekly DGMS statutory conveyor fire hydrant and emergency trip wire audit due by 14:00.',
    actionRequired: 'Safety officer Harini N to complete digital audit checklist in MineVision AI.',
    status: 'Active',
  },
];

export const riskTrendData: RiskTrendPoint[] = [
  { time: '10 AM', low: 7, medium: 14, high: 18 },
  { time: '2 PM', low: 9, medium: 16, high: 23 },
  { time: '6 PM', low: 11, medium: 21, high: 28 },
  { time: '10 PM', low: 8, medium: 17, high: 22 },
  { time: '2 AM', low: 7, medium: 15, high: 23 },
  { time: '6 AM', low: 13, medium: 23, high: 36 }, // Early morning spike
  { time: '10 AM', low: 8, medium: 18, high: 28 },
];

export const environmentalParams: EnvironmentParam[] = [
  { parameter: 'Dust', current: '72', status: 'Warning', unit: 'µg/m³', threshold: '75' },
  { parameter: 'Temperature', current: '34°C', status: 'Normal', unit: '°C', threshold: '38°C' },
  { parameter: 'Gas', current: '18 ppm', status: 'Normal', unit: 'ppm (CH4/CO)', threshold: '50 ppm' },
  { parameter: 'Noise', current: '82 dB', status: 'Warning', unit: 'dB(A)', threshold: '85 dB' },
  { parameter: 'Water Quality', current: '91%', status: 'Normal', unit: 'TSS/pH index', threshold: '>80%' },
];

export const dustHourlyTrend: DustHourlyPoint[] = [
  { time: '10 AM', value: 46 },
  { time: '11 AM', value: 54 },
  { time: '12 PM', value: 68 },
  { time: '1 PM', value: 76 },
  { time: '2 PM', value: 92 },
];

export const recentViolations: ViolationRecord[] = [
  {
    id: 'v-101',
    time: '10:42 AM',
    zone: 'B',
    violation: 'No Helmet',
    severity: 'High',
    status: 'Open',
    workerId: 'W102',
    workerName: 'Ramesh K. (Drill Operator)',
    camera: 'ZONE B - CAM 01',
    reportedBy: 'MineVision Computer Vision v2.4',
    notes: 'Worker removed helmet while servicing hydraulic coupler near rear tracks.',
    actionTaken: 'Audio siren triggered. Safety marshal notified via handheld terminal.',
  },
  {
    id: 'v-102',
    time: '11:17 AM',
    zone: 'A',
    violation: 'Restricted Zone Entry',
    severity: 'High',
    status: 'Open',
    workerId: 'W084',
    workerName: 'Sunil M. (Haulage Driver)',
    camera: 'ZONE A - CAM 03',
    reportedBy: 'AI Geofence Sentry',
    notes: 'Crossed red hazard perimeter tape 15m from active highwall rockfall ledge.',
    actionTaken: 'Geofence breach registered. Excavation foreman notified to intercept.',
  },
  {
    id: 'v-103',
    time: '12:05 PM',
    zone: 'C',
    violation: 'High Dust',
    severity: 'Medium',
    status: 'Investigating',
    workerId: 'CONV-C4',
    workerName: 'Transfer Station 4 Crew',
    camera: 'ZONE C - SENSOR 07',
    reportedBy: 'IoT PM10 Telemetry Unit',
    notes: 'Dust concentration sustained above 90 µg/m³ for 18 minutes.',
    actionTaken: 'Suppression misting automated override activated. Pressure inspection underway.',
  },
  {
    id: 'v-104',
    time: '12:30 PM',
    zone: 'D',
    violation: 'PPE Issue',
    severity: 'Low',
    status: 'Resolved',
    workerId: 'W144',
    workerName: 'Vikram S. (Siding Attendant)',
    camera: 'ZONE D - CAM 02',
    reportedBy: 'MineVision Camera Feeds v2.4',
    notes: 'High-visibility vest unzipped and retro-reflective strip obscured.',
    actionTaken: 'Resolved immediately on verbal reminder by Shift Supervisor.',
  },
];

export const liveCCTVViolation = {
  workerId: 'W102',
  workerName: 'Ramesh K.',
  role: 'Excavation Drill Operator',
  zone: 'B',
  zoneName: 'Zone B - Deep Extraction Face',
  camera: 'ZONE B - CAM 01',
  timestamp: `${getRelativeDate(0, 'iso')} 10:42:17`,
  violation: 'No Helmet',
  severity: 'HIGH',
  confidence: 98.4,
  coordinates: 'Bench #4, Face Section 12-B',
  detectionBox: {
    worker1: { label: 'No Helmet', confidence: 98, status: 'danger', x: 28, y: 56, w: 12, h: 36 },
    worker2: { label: 'Helmet', confidence: 96, status: 'safe', x: 48, y: 52, w: 10, h: 32 },
  },
};

export const systemStatusList: SystemComponentStatus[] = [
  { name: 'CCTV AI', status: 'Active', healthScore: 99.4, latency: '18ms' },
  { name: 'Environmental Sensors', status: 'Active', healthScore: 98.7, latency: '120ms' },
  { name: 'Database', status: 'Connected', healthScore: 100, latency: '8ms' },
  { name: 'ML Models', status: 'Active', healthScore: 99.1, latency: '42ms' },
];

export const aiComplianceQA = [
  {
    question: 'Why is Zone B high risk?',
    answer:
      'Zone B currently has an elevated risk score of 87/100 due to multiple recent PPE infractions (specifically No Helmet detections near active excavation), higher particulate concentration (78 µg/m³), and historical slope stability alerts on Bench #4.',
  },
  {
    question: "Show today's violations",
    answer:
      "Today, MineVision AI registered 4 key violations: 1) 10:42 AM - No Helmet in Zone B (Open, High); 2) 11:17 AM - Restricted Zone Entry in Zone A (Open, High); 3) 12:05 PM - Dust spike in Zone C (Investigating, Medium); 4) 12:30 PM - PPE Issue in Zone D (Resolved, Low). 2 violations require immediate officer sign-off.",
  },
  {
    question: 'Generate safety report',
    answer:
      'MineVision AI has synthesized the shift safety audit report: Overall Mine Compliance: 92%. Active Workers: 218. Zero fatal lost-time injuries (LTI) in the last 418 days. High-priority recommendations: Deploy water cannons in Zone C and mandate PPE refresher in Zone B.',
  },
  {
    question: 'What is the standard DGMS guideline for coal dust suppression?',
    answer:
      'Under DGMS Circular No. 04 and Coal Mines Regulations (CMR 2017), respirable coal dust must not exceed 2 mg/m³ for 8-hour TWA, and ambient PM10 must stay under 75 µg/m³. Continuous water atomization mist nozzles must be active during all cutting and conveying operations.',
  },
];
