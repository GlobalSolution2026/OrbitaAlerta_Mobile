/**
 * Endpoints da API — alinhe com o backend do grupo.
 * Cada serviço importa daqui para facilitar mudanças de rota.
 */
export const ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    me: '/api/v1/auth/me',
  },
  dashboard: {
    summary: '/api/v1/dashboard/summary',
  },
  alerts: {
    list: '/api/v1/alerts',
    detail: (id: string) => `/api/v1/alerts/${id}`,
    updateStatus: (id: string) => `/api/v1/alerts/${id}/status`,
  },
  weather: {
    byCoordinates: '/api/v1/weather/risk',
  },
  evidence: {
    upload: '/api/v1/field-evidence',
    listByAlert: (alertId: string) => `/api/v1/alerts/${alertId}/evidence`,
  },
  sync: {
    batch: '/api/v1/sync/batch',
  },
} as const;
