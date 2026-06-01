import { create } from 'zustand';
import { alertsService } from '@/src/services/alertsService';
import { dashboardService } from '@/src/services/dashboardService';
import { loadCache, saveCache, STORAGE_KEYS } from '@/src/storage/cache';
import type { DashboardSummary, FireAlert } from '@/src/types';

type AlertsState = {
  alerts: FireAlert[];
  dashboard: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  isOfflineCache: boolean;
  fetchAll: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
};

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  dashboard: null,
  loading: false,
  error: null,
  isOfflineCache: false,

  fetchAll: async () => {
    set({ loading: true, error: null, isOfflineCache: false });
    try {
      const [alerts, dashboard] = await Promise.all([
        alertsService.list(),
        dashboardService.getSummary(),
      ]);
      await saveCache(STORAGE_KEYS.alertsCache, alerts);
      await saveCache(STORAGE_KEYS.dashboardCache, dashboard);
      set({ alerts, dashboard, loading: false });
    } catch (e) {
      const cachedAlerts = await loadCache<FireAlert[]>(STORAGE_KEYS.alertsCache);
      const cachedDashboard = await loadCache<DashboardSummary>(STORAGE_KEYS.dashboardCache);
      if (cachedAlerts && cachedDashboard) {
        set({
          alerts: cachedAlerts.data,
          dashboard: cachedDashboard.data,
          loading: false,
          isOfflineCache: true,
          error: 'Sem conexão — exibindo dados salvos',
        });
      } else {
        set({
          loading: false,
          error: e instanceof Error ? e.message : 'Erro ao carregar dados',
        });
      }
    }
  },

  refreshDashboard: async () => {
    try {
      const dashboard = await dashboardService.getSummary();
      await saveCache(STORAGE_KEYS.dashboardCache, dashboard);
      set({ dashboard, isOfflineCache: false, error: null });
    } catch {
      // mantém estado atual em falha silenciosa
    }
  },
}));
