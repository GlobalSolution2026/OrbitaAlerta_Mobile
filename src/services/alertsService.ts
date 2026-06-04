import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import { API_CONFIG } from '@/src/config/api';
import { mockAlerts } from '@/src/mocks/alerts';
import { nasaFirmsService } from '@/src/services/nasaFirmsService';
import type { AlertStatus, FireAlert } from '@/src/types';
import { delay } from '@/src/utils/delay';

export const alertsService = {
  async list(): Promise<FireAlert[]> {
    if (API_CONFIG.useMockData) {
      await delay(400);
      return [...mockAlerts];
    }
    return nasaFirmsService.fetchAlerts();
  },

  async getById(id: string): Promise<FireAlert | null> {
    if (API_CONFIG.useMockData) {
      await delay(200);
      return mockAlerts.find((a) => a.id === id) ?? null;
    }
    const alerts = await nasaFirmsService.fetchAlerts();
    return alerts.find((a) => a.id === id) ?? null;
  },

  async updateStatus(id: string, status: AlertStatus): Promise<FireAlert> {
    if (API_CONFIG.useMockData) {
      await delay(300);
      const alert = mockAlerts.find((a) => a.id === id);
      if (!alert) throw new Error('Alerta não encontrado');
      return { ...alert, status, updatedAt: new Date().toISOString() };
    }
    const alerts = await nasaFirmsService.fetchAlerts();
    const alert = alerts.find((a) => a.id === id);
    if (!alert) throw new Error('Alerta não encontrado');
    return { ...alert, status, updatedAt: new Date().toISOString() };
  },
};
