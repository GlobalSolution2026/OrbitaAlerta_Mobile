import { nasaFirmsService } from '@/src/services/nasaFirmsService';
import type { AlertStatus, FireAlert } from '@/src/types';

export const alertsService = {
  async list(): Promise<FireAlert[]> {
    return nasaFirmsService.fetchAlerts();
  },

  async getById(id: string): Promise<FireAlert | null> {
    const alerts = await nasaFirmsService.fetchAlerts();
    return alerts.find((a) => a.id === id) ?? null;
  },

  async updateStatus(id: string, status: AlertStatus): Promise<FireAlert> {
    const alerts = await nasaFirmsService.fetchAlerts();
    const alert = alerts.find((a) => a.id === id);
    if (!alert) throw new Error('Alerta não encontrado');
    return { ...alert, status, updatedAt: new Date().toISOString() };
  },
};
