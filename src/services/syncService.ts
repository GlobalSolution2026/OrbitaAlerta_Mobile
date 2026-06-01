import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import { API_CONFIG } from '@/src/config/api';
import { getSyncQueue, removeFromSyncQueue } from '@/src/storage/offlineQueue';
import type { SyncQueueItem } from '@/src/types';
import { delay } from '@/src/utils/delay';

export type SyncResult = {
  synced: number;
  failed: number;
  errors: string[];
};

export const syncService = {
  async pushQueue(): Promise<SyncResult> {
    const queue = await getSyncQueue();

    if (queue.length === 0) {
      return { synced: 0, failed: 0, errors: [] };
    }

    if (API_CONFIG.useMockData) {
      await delay(800);
      for (const item of queue) {
        await removeFromSyncQueue(item.id);
      }
      return { synced: queue.length, failed: 0, errors: [] };
    }

    const result: SyncResult = { synced: 0, failed: 0, errors: [] };

    try {
      await apiClient.post<{ accepted: string[] }>(ENDPOINTS.sync.batch, {
        items: queue.map(toApiPayload),
      });

      for (const item of queue) {
        await removeFromSyncQueue(item.id);
        result.synced++;
      }
    } catch (e) {
      result.failed = queue.length;
      result.errors.push(e instanceof Error ? e.message : 'Erro na sincronização');
    }

    return result;
  },
};

function toApiPayload(item: SyncQueueItem) {
  return {
    id: item.id,
    type: item.type,
    payload: item.payload,
    createdAt: item.createdAt,
  };
}
