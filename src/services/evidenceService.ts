import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/endpoints';
import { API_CONFIG } from '@/src/config/api';
import type { Coordinates, FieldEvidence } from '@/src/types';
import { delay } from '@/src/utils/delay';

export type SubmitEvidenceInput = {
  alertId: string;
  photoUri: string;
  notes?: string;
  location: Coordinates;
};

export const evidenceService = {
  async listByAlert(alertId: string): Promise<FieldEvidence[]> {
    if (API_CONFIG.useMockData) {
      await delay(200);
      return [];
    }
    return apiClient.get<FieldEvidence[]>(ENDPOINTS.evidence.listByAlert(alertId));
  },

  async submit(input: SubmitEvidenceInput): Promise<FieldEvidence> {
    if (API_CONFIG.useMockData) {
      await delay(500);
      return {
        id: `ev-${Date.now()}`,
        alertId: input.alertId,
        photoUri: input.photoUri,
        notes: input.notes,
        capturedAt: new Date().toISOString(),
        location: input.location,
        synced: true,
      };
    }

    const formData = new FormData();
    formData.append('alertId', input.alertId);
    formData.append('notes', input.notes ?? '');
    formData.append('latitude', String(input.location.latitude));
    formData.append('longitude', String(input.location.longitude));
    // Quando integrar: formData.append('photo', { uri, name, type } as any);

    return apiClient.post<FieldEvidence>(ENDPOINTS.evidence.upload, formData);
  },
};
