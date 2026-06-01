import type { DashboardSummary } from '@/src/types';
import { mockAlerts } from '@/src/mocks/alerts';

export const mockDashboard: DashboardSummary = {
  stats: {
    activeAlerts: 3,
    criticalAlerts: 1,
    validatedToday: 5,
    falsePositiveRate: 0.18,
    hectaresMonitored: 125000,
    lastSatellitePass: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  recentAlerts: mockAlerts.filter((a) => a.status !== 'false_positive').slice(0, 3),
  systemStatus: 'operational',
};
