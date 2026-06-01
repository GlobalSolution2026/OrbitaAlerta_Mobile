import type { Href } from 'expo-router';

export const ROUTES = {
  login: '/(auth)/login' as Href,
  register: '/(auth)/register' as Href,
  tabs: '/(tabs)' as Href,
};

export function isAuthRoute(segments: string[]): boolean {
  return segments.includes('login') || segments.includes('register') || segments[0] === '(auth)';
}
