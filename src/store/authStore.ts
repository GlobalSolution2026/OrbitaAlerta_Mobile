import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { authService } from '@/src/services/authService';
import { STORAGE_KEYS } from '@/src/storage/keys';
import type { AuthSession, AuthUser } from '@/src/types/auth';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

async function persistSession(session: AuthSession | null) {
  if (session) {
    await AsyncStorage.setItem(STORAGE_KEYS.authSession, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.authSession);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  loading: false,
  error: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.authSession);
      if (raw) {
        const session = JSON.parse(raw) as AuthSession;
        set({ user: session.user, token: session.token });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await authService.login({ email, password });
      await persistSession(session);
      set({ user: session.user, token: session.token, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Não foi possível entrar.',
      });
      throw e;
    }
  },

  register: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await authService.register({ email, password });
      await persistSession(session);
      set({ user: session.user, token: session.token, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : 'Não foi possível criar a conta.',
      });
      throw e;
    }
  },

  logout: async () => {
    await persistSession(null);
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
