import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/storage/keys';
import type { SyncQueueItem } from '@/src/types';

async function readQueue(): Promise<SyncQueueItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.syncQueue);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SyncQueueItem[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: SyncQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(queue));
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return readQueue();
}

export async function enqueueSyncItem(
  item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retries'>
): Promise<SyncQueueItem> {
  const queue = await readQueue();
  const newItem: SyncQueueItem = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  queue.push(newItem);
  await writeQueue(queue);
  return newItem;
}

export async function removeFromSyncQueue(id: string): Promise<void> {
  const queue = await readQueue();
  await writeQueue(queue.filter((i) => i.id !== id));
}

export async function getQueueCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}
