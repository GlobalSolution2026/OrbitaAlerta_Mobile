import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { isAuthRoute, ROUTES } from '@/src/utils/routes';

/**
 * Redireciona para login se não autenticado, ou para o app se já logado.
 */
export function useAuthGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { user, hydrated } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    const inAuthGroup = isAuthRoute(segments as string[]);

    if (!user && !inAuthGroup) {
      router.replace(ROUTES.login);
    } else if (user && inAuthGroup) {
      router.replace(ROUTES.tabs);
    }
  }, [user, hydrated, segments, router]);
}
