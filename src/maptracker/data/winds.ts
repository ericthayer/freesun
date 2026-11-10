import { CHATFIELD } from '../../dashboard/data/snapshot';
import type { Sourced } from '../../dashboard/data/types';

/** Winds at the heights a balloon actually flies, for the launch hour. */
export interface WindLevel {
  label: string;
  aglFt: number;
  mph: number;
  /** Direction the wind blows from, degrees true. */
  fromDeg: number;
}

export interface WindsAloft {
  /** Local "yyyy-mm-ddTHH:mm" of the forecast hour. */
  hour: string;
  sunrise: string;
  levels: WindLevel[];
}

const SITE_ELEV_M = 1661;

/** Captured 2026-10-16 for the Oct 17 sunrise hour. */
export const WINDS_SNAPSHOT: Sourced<WindsAloft> = {
  source: { kind: 'snapshot', label: 'Open-Meteo', capturedAt: '2026-10-16T17:15:00-06:00' },
  value: {
    hour: '2026-10-17T07:00',
    sunrise: '2026-10-17T07:12',
    levels: [
      { label: 'Surface', aglFt: 33, mph: 7.6, fromDeg: 156 },
      { label: '260 ft', aglFt: 262, mph: 9.4, fromDeg: 192 },
      { label: '590 ft', aglFt: 591, mph: 8.3, fromDeg: 232 },
      { label: '1,470 ft', aglFt: 1470, mph: 7.5, fromDeg: 222 },
      { label: '3,240 ft', aglFt: 3241, mph: 3.9, fromDeg: 285 },
    ],
  },
};

const nums = (v: unknown): number[] =>
  Array.isArray(v) ? v.map((n) => (typeof n === 'number' && Number.isFinite(n) ? n : 0)) : [];
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map((s) => (typeof s === 'string' ? s : '')) : []);

const roundFt = (ft: number): string => `${(Math.round(ft / 10) * 10).toLocaleString('en-US')} ft`;

/** Open-Meteo winds at 10/80/180 m plus the 800 and 750 hPa levels. Null on any failure. */
export async function fetchWindsAloft(): Promise<Sourced<WindsAloft> | null> {
  const q = new URLSearchParams({
    latitude: String(CHATFIELD.lat),
    longitude: String(CHATFIELD.lon),
    hourly: [
      'wind_speed_10m', 'wind_direction_10m', 'wind_speed_80m', 'wind_direction_80m',
      'wind_speed_180m', 'wind_direction_180m', 'wind_speed_800hPa', 'wind_direction_800hPa',
      'geopotential_height_800hPa', 'wind_speed_750hPa', 'wind_direction_750hPa', 'geopotential_height_750hPa',
    ].join(','),
    daily: 'sunrise',
    wind_speed_unit: 'mph',
    timezone: CHATFIELD.timezone,
    forecast_days: '2',
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, Record<string, unknown>>;
    const h = raw.hourly ?? {};
    const times = strs(h.time);
    const now = new Date();
    const nowLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    // Next sunrise still ahead of us; its hour is the launch hour.
    const sunrise = strs(raw.daily?.sunrise).find((s) => s > nowLocal) ?? strs(raw.daily?.sunrise).pop() ?? '';
    const i = Math.max(0, times.indexOf(`${sunrise.slice(0, 13)}:00`));
    const pick = (key: string): number => nums(h[key])[i] ?? 0;
    const elev = typeof raw.elevation === 'number' ? raw.elevation : SITE_ELEV_M;
    const aglFt = (gphM: number): number => Math.max(0, (gphM - elev) * 3.28084);
    const a800 = aglFt(pick('geopotential_height_800hPa'));
    const a750 = aglFt(pick('geopotential_height_750hPa'));
    return {
      source: { kind: 'live', label: 'Open-Meteo', fetchedAt: now.toISOString() },
      value: {
        hour: times[i] ?? '',
        sunrise,
        levels: [
          { label: 'Surface', aglFt: 33, mph: pick('wind_speed_10m'), fromDeg: pick('wind_direction_10m') },
          { label: '260 ft', aglFt: 262, mph: pick('wind_speed_80m'), fromDeg: pick('wind_direction_80m') },
          { label: '590 ft', aglFt: 591, mph: pick('wind_speed_180m'), fromDeg: pick('wind_direction_180m') },
          { label: roundFt(a800), aglFt: a800, mph: pick('wind_speed_800hPa'), fromDeg: pick('wind_direction_800hPa') },
          { label: roundFt(a750), aglFt: a750, mph: pick('wind_speed_750hPa'), fromDeg: pick('wind_direction_750hPa') },
        ],
      },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
