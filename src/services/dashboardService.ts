import { nasaFirmsService } from '@/src/services/nasaFirmsService';
import type { DashboardSummary, FireAlert } from '@/src/types';

function computeDashboard(alerts: FireAlert[]): DashboardSummary {
  const active = alerts.filter((a) => a.status !== 'false_positive' && a.status !== 'resolved');
  const criticalCount = active.filter((a) => a.priorityLevel === 'critical').length;

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const todayAlerts = active.filter((a) => a.detectedAt.slice(0, 10) === todayStr);

  const lastPass = active.length > 0
    ? active.reduce((latest, a) => (a.detectedAt > latest ? a.detectedAt : latest), active[0].detectedAt)
    : now.toISOString();

  return {
    stats: {
      activeAlerts: active.length,
      criticalAlerts: criticalCount,
      validatedToday: todayAlerts.length,
      falsePositiveRate: 0,
      hectaresMonitored: 851000000,
      lastSatellitePass: lastPass,
    },
    recentAlerts: active.slice(0, 3),
    systemStatus: 'operational',
  };
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const alerts = await nasaFirmsService.fetchAlerts();
    return computeDashboard(alerts);
  },
};
