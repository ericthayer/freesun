import type { DataSource } from '../data/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-02-15" -> "Feb 15, 2026". Parsed by hand so the date never shifts across timezones. */
export function fmtDate(iso: string, withYear = true): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return iso;
  return withYear ? `${MONTHS[m - 1]} ${d}, ${y}` : `${MONTHS[m - 1]} ${d}`;
}

/** "2026-10-17T07:12" or "06:30" -> "7:12 AM" */
export function fmtClock(value: string): string {
  const hm = value.includes('T') ? value.split('T')[1] : value;
  const [hh, mm] = hm.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return value;
  const suffix = hh >= 12 ? 'PM' : 'AM';
  return `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${suffix}`;
}

export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
}

export const fmtInt = (n: number): string => n.toLocaleString('en-US');

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
export const compass = (deg: number): string => COMPASS[Math.round(((deg % 360) / 22.5)) % 16];

export const metersToFeet = (m: number): number => Math.round(m * 3.28084);

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** Short provenance line shown on each tile. */
export function sourceLabel(src: DataSource): string {
  switch (src.kind) {
    case 'live':
      return `Live · ${src.label}`;
    case 'snapshot':
      return `Snapshot ${fmtDate(src.capturedAt, false)} · ${src.label}`;
    case 'example':
      return `Example · ${src.label}`;
  }
}

/** WMO weather code -> short sky description. */
export function skyFromCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Mostly clear';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Thunderstorms';
}
