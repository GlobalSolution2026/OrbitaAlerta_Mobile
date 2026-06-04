export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://api.orbitaalerta.local',
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK === 'true',
  timeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 15000),
};
