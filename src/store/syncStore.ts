import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService } from '@/src/services/syncService';
import { getQueueCount, getSyncQueue } from '@/src/storage/offlineQueue';
import { STORAGE_KEYS } from '@/src/storage/keys';
import type { SyncQueueItem } from '@/src/types';

type SyncState = {
  queue: SyncQueueItem[];
  pendingCount: number;
  syncing: boolean;
  lastSyncAt: string | null;
  lastResult: string | null;
  refreshQueue: () => Promise<void>;
  syncNow: () => Promise<void>;
};

export const useSyncStore = create<SyncState>((set) => ({
  queue: [],
  pendingCount: 0,
  syncing: false,
  lastSyncAt: null,
  lastResult: null,

  refreshQueue: async () => {
    const queue = await getSyncQueue();
    const count = await getQueueCount();
    const lastSyncAt = await AsyncStorage.getItem(STORAGE_KEYS.lastSyncAt);
    set({ queue, pendingCount: count, lastSyncAt });
  },

  syncNow: async () => {
    set({ syncing: true, lastResult: null });
    const result = await syncService.pushQueue();
    const now = new Date().toISOString();
    await AsyncStorage.setItem(STORAGE_KEYS.lastSyncAt, now);
    await getQueueCount().then((pendingCount) => getSyncQueue().then((queue) => {
      set({
        syncing: false,
        lastSyncAt: now,
        pendingCount,
        queue,
        lastResult:
          result.synced > 0
            ? `${result.synced} item(ns) sincronizado(s)`
            : result.failed > 0
              ? `Falha: ${result.errors.join(', ')}`
              : 'Nada pendente para sincronizar',
      });
    }));
  },
}));
