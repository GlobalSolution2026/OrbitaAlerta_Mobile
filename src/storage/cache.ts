import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/storage/keys';

export async function saveCache<T>(key: string, data: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify({ data, savedAt: new Date().toISOString() }));
}

export async function loadCache<T>(key: string): Promise<{ data: T; savedAt: string } | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { data: T; savedAt: string };
  } catch {
    return null;
  }
}

export { STORAGE_KEYS };
