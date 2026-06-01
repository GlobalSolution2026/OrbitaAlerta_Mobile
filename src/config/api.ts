/**
 * Configuração central da API.
 * Quando o backend estiver pronto, defina EXPO_PUBLIC_USE_MOCK=false
 * e EXPO_PUBLIC_API_URL com a URL do serviço do grupo.
 */
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.orbitaalerta.local',
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK !== 'false',
  timeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 15000),
};
