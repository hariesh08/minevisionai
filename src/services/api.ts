/**
 * MineVision AI - Service Layer for API Communication
 * Prepared for future integration with Python Flask backend,
 * Coal India public environmental feeds, DGMS safety records,
 * and Computer Vision telemetry endpoints.
 */

import { getRelativeDate } from '../utils/dateUtils';
import {  dashboardStats,
  mineZones,
  recentAlerts,
  riskTrendData,
  environmentalParams,
  dustHourlyTrend,
  recentViolations,
  liveCCTVViolation,
  systemStatusList,
  DashboardStat,
  MineZone,
  SafetyAlert,
  RiskTrendPoint,
  EnvironmentParam,
  DustHourlyPoint,
  ViolationRecord,
  SystemComponentStatus,
} from '../data/mockData';

export interface DashboardPayload {
  stats: DashboardStat[];
  zones: MineZone[];
  alerts: SafetyAlert[];
  riskTrend: RiskTrendPoint[];
  environmental: {
    parameters: EnvironmentParam[];
    dustTrend: DustHourlyPoint[];
    alertExceeded: boolean;
  };
  violations: ViolationRecord[];
  cctvFeed: typeof liveCCTVViolation;
  systemStatus: SystemComponentStatus[];
  metadata: {
    lastUpdated: string;
    mineLocation: string;
    shift: string;
    safetyOfficer: string;
    dgmsComplianceTier: string;
  };
}

export async function getDashboardData(): Promise<DashboardPayload> {
  // Simulate rapid non-blocking async fetch
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        stats: dashboardStats,
        zones: mineZones,
        alerts: recentAlerts,
        riskTrend: riskTrendData,
        environmental: {
          parameters: environmentalParams,
          dustTrend: dustHourlyTrend,
          alertExceeded: true,
        },
        violations: recentViolations,
        cctvFeed: liveCCTVViolation,
        systemStatus: systemStatusList,
        metadata: {
          lastUpdated: `${getRelativeDate(0, 'full')} | 10:42 AM`,
          mineLocation: 'Pit #3 Northern Block, Singrauli Coalfield',
          shift: 'Morning Shift A (06:00 - 14:00)',
          safetyOfficer: 'Harini N',
          dgmsComplianceTier: 'Tier 1 DGMS Gold Certified',
        },
      });
    }, 120);
  });
}

export async function getZones(): Promise<MineZone[]> {
  return Promise.resolve(mineZones);
}

export async function getAlerts(): Promise<SafetyAlert[]> {
  return Promise.resolve(recentAlerts);
}

export async function getViolations(): Promise<ViolationRecord[]> {
  return Promise.resolve(recentViolations);
}

export async function getRiskData(): Promise<RiskTrendPoint[]> {
  return Promise.resolve(riskTrendData);
}

export async function getEnvironmentData(): Promise<{
  parameters: EnvironmentParam[];
  dustTrend: DustHourlyPoint[];
}> {
  return Promise.resolve({
    parameters: environmentalParams,
    dustTrend: dustHourlyTrend,
  });
}

export async function acknowledgeAlert(alertId: string): Promise<{ success: boolean; alertId: string }> {
  return Promise.resolve({ success: true, alertId });
}

export async function updateViolationStatus(
  violationId: string,
  newStatus: 'Open' | 'Investigating' | 'Resolved',
  actionNote?: string
): Promise<{ success: boolean; id: string; status: string }> {
  return Promise.resolve({
    success: true,
    id: violationId,
    status: newStatus,
  });
}

export async function submitCorrectiveAction(data: {
  zone: string;
  targetId: string;
  actionType: string;
  priority: string;
  assignedOfficer: string;
  instructions: string;
}): Promise<{ success: boolean; actionTicketId: string; timestamp: string }> {
  return Promise.resolve({
    success: true,
    actionTicketId: `CA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });
}

export async function generateSafetyReport(): Promise<{
  reportId: string;
  generatedAt: string;
  complianceRate: string;
  totalIncidents: number;
  downloadUrl: string;
}> {
  return Promise.resolve({
    reportId: 'MG-REP-2026-0918',
    generatedAt: `${getRelativeDate(0, 'full')}, 10:42 AM`,
    complianceRate: '92.4%',
    totalIncidents: 4,
    downloadUrl: '#download-report',
  });
}
