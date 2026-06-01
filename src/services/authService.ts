import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import { API_CONFIG } from '@/src/config/api';
import { STORAGE_KEYS } from '@/src/storage/keys';
import type { AuthSession, LoginCredentials, RegisterCredentials } from '@/src/types/auth';
import { delay } from '@/src/utils/delay';
import { isValidEmail, isValidPassword, normalizeEmail } from '@/src/utils/validation';

type StoredUser = {
  id: string;
  email: string;
  password: string;
};

async function readMockUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.mockUsers);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return [];
  }
}

async function writeMockUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.mockUsers, JSON.stringify(users));
}

function buildSession(user: { id: string; email: string }): AuthSession {
  return {
    user: { id: user.id, email: user.email },
    token: `mock-token-${user.id}`,
  };
}

function assertCredentials(email: string, password: string) {
  if (!isValidEmail(email)) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!isValidPassword(password)) {
    throw new Error('A senha deve ter no mínimo 6 caracteres.');
  }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const email = normalizeEmail(credentials.email);
    const { password } = credentials;
    assertCredentials(email, password);

    if (API_CONFIG.useMockData) {
      await delay(500);
      const users = await readMockUsers();
      const found = users.find((u) => u.email === email && u.password === password);
      if (!found) {
        throw new Error('E-mail ou senha incorretos.');
      }
      return buildSession(found);
    }

    return apiClient.post<AuthSession>(ENDPOINTS.auth.login, { email, password });
  },

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const email = normalizeEmail(credentials.email);
    const { password } = credentials;
    assertCredentials(email, password);

    if (API_CONFIG.useMockData) {
      await delay(600);
      const users = await readMockUsers();
      if (users.some((u) => u.email === email)) {
        throw new Error('Este e-mail já está cadastrado.');
      }
      const newUser: StoredUser = {
        id: `user-${Date.now()}`,
        email,
        password,
      };
      users.push(newUser);
      await writeMockUsers(users);
      return buildSession(newUser);
    }

    return apiClient.post<AuthSession>(ENDPOINTS.auth.register, { email, password });
  },
};
