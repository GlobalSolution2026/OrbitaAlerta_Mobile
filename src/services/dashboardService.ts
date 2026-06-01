import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import { API_CONFIG } from '@/src/config/api';
import { mockDashboard } from '@/src/mocks/dashboard';
import type { DashboardSummary } from '@/src/types';
import { delay } from '@/src/utils/delay';

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    if (API_CONFIG.useMockData) {
      await delay(350);
      return { ...mockDashboard };
    }
    return apiClient.get<DashboardSummary>(ENDPOINTS.dashboard.summary);
  },
};
