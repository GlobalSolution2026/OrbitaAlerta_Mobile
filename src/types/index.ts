/** Fonte do foco de calor detectado */
export type AlertSource = 'INPE' | 'NASA_FIRMS' | 'SENTINEL_CV' | 'IOT_STATION';

export type AlertStatus =
  | 'pending_validation'
  | 'validated'
  | 'dispatched'
  | 'in_field'
  | 'resolved'
  | 'false_positive';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ShapFactor {
  feature: string;
  contribution: number;
  description: string;
}

export interface WeatherRisk {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  fireWeatherIndex: number;
  riskLabel: 'extremo' | 'alto' | 'moderado' | 'baixo';
}

export interface CvValidation {
  modelVersion: string;
  confidence: number;
  sentinelPass: 'S2' | 'S1';
  validatedAt: string;
  thumbnailUrl?: string;
}

export interface IotTelemetry {
  stationId: string;
  stationName: string;
  lastReadingAt: string;
  soilMoisturePercent?: number;
  localTemperatureC?: number;
}

export interface FieldEvidence {
  id: string;
  alertId: string;
  photoUri: string;
  notes?: string;
  capturedAt: string;
  location: Coordinates;
  synced: boolean;
}

export interface FireAlert {
  id: string;
  title: string;
  municipality: string;
  state: string;
  coordinates: Coordinates;
  detectedAt: string;
  updatedAt: string;
  source: AlertSource;
  status: AlertStatus;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  shapFactors: ShapFactor[];
  weather: WeatherRisk;
  cvValidation?: CvValidation;
  iot?: IotTelemetry;
  distanceKm?: number;
  description: string;
}

export interface DashboardStats {
  activeAlerts: number;
  criticalAlerts: number;
  validatedToday: number;
  falsePositiveRate: number;
  hectaresMonitored: number;
  lastSatellitePass: string;
}

export interface DashboardSummary {
  stats: DashboardStats;
  recentAlerts: FireAlert[];
  systemStatus: 'operational' | 'degraded' | 'offline';
}

export interface SyncQueueItem {
  id: string;
  type: 'field_evidence' | 'status_update';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}
