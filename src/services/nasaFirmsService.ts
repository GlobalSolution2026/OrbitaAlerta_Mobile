import type { FireAlert, PriorityLevel } from '@/src/types';

const NASA_API_KEY = process.env.EXPO_PUBLIC_NASA_API_KEY ?? '6374db90548f9fff5a26ebf995ebac5d';
const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';

const BRAZIL_BBOX = {
  minLon: -73.9831,
  minLat: -33.7681,
  maxLon: -34.7931,
  maxLat: 5.2719,
};

const DEFAULT_SOURCE = 'MODIS_NRT';
const DAY_RANGE = 2;
const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { alerts: FireAlert[]; timestamp: number } | null = null;

function parseConfidence(value: string): number {
  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'h' || trimmed === 'high') return 0.9;
  if (trimmed === 'n' || trimmed === 'nominal') return 0.6;
  if (trimmed === 'l' || trimmed === 'low') return 0.3;
  const num = parseFloat(trimmed);
  return isNaN(num) ? 0.5 : Math.min(num / 100, 1);
}

function calculatePriority(frp: number, confidence: number): { score: number; level: PriorityLevel } {
  const frpScore = Math.min(frp / 120, 1) * 60;
  const confScore = confidence * 40;
  const score = Math.round(frpScore + confScore);
  let level: PriorityLevel;
  if (score >= 70) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 25) level = 'medium';
  else level = 'low';
  return { score, level };
}

function parseCSV(csvText: string): FireAlert[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const requiredCols = ['latitude', 'longitude', 'acq_date', 'acq_time', 'satellite', 'confidence', 'frp'];
  const hasAll = requiredCols.every((c) => headers.includes(c));
  if (!hasAll) return [];

  const records: FireAlert[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length < headers.length) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim();
    });

    const lat = parseFloat(row.latitude);
    const lon = parseFloat(row.longitude);
    if (isNaN(lat) || isNaN(lon)) continue;

    const confidence = parseConfidence(row.confidence);
    const frp = parseFloat(row.frp) || 0;
    const { score, level } = calculatePriority(frp, confidence);

    const timeStr = row.acq_time.toString().padStart(4, '0');
    const detectedAt = new Date(`${row.acq_date}T${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:00Z`).toISOString();

    const satellite = row.satellite || DEFAULT_SOURCE;

    records.push({
      id: `firms-${i}-${row.acq_date}-${lat.toFixed(4)}-${lon.toFixed(4)}`,
      title: `Foco FIRMS — ${satellite}`,
      municipality: '—',
      state: 'BR',
      coordinates: { latitude: lat, longitude: lon },
      detectedAt,
      updatedAt: detectedAt,
      source: 'NASA_FIRMS',
      status: 'pending_validation',
      priorityScore: score,
      priorityLevel: level,
      description: `Detecção ${satellite} — FRP ${frp.toFixed(1)} MW, confiança ${(confidence * 100).toFixed(0)}%`,
      shapFactors: [
        { feature: 'frp', contribution: Math.min(frp / 120, 0.6), description: 'Fire Radiative Power' },
        { feature: 'confidence', contribution: confidence * 0.4, description: 'Confiança da detecção' },
      ],
      weather: {
        temperatureC: 0,
        humidityPercent: 0,
        windSpeedKmh: 0,
        fireWeatherIndex: 0,
        riskLabel: 'moderado',
      },
    });
  }

  return records.sort((a, b) => b.priorityScore - a.priorityScore);
}

function buildUrl(): string {
  const { minLon, minLat, maxLon, maxLat } = BRAZIL_BBOX;
  return `${FIRMS_BASE_URL}/${NASA_API_KEY}/${DEFAULT_SOURCE}/${minLon},${minLat},${maxLon},${maxLat}/${DAY_RANGE}`;
}

async function fetchFromAPI(): Promise<FireAlert[]> {
  const url = buildUrl();
  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`NASA FIRMS API error: ${response.status} ${response.statusText}`);
  }
  const csvText = await response.text();
  return parseCSV(csvText);
}

export const nasaFirmsService = {
  async fetchAlerts(): Promise<FireAlert[]> {
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_TTL_MS) {
      return [...cache.alerts];
    }
    try {
      const alerts = await fetchFromAPI();
      cache = { alerts, timestamp: now };
      return [...alerts];
    } catch {
      console.warn('NASA FIRMS API indisponível, retornando dados vazios.');
      return [];
    }
  },

  invalidateCache(): void {
    cache = null;
  },
};
