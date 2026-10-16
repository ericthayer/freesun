import { CHATFIELD } from './snapshot';
import type {
  Availability,
  Balloon,
  CrewMember,
  CrewRole,
  FlightLog,
  ScheduleItem,
  Sourced,
  WeatherReport,
} from './types';

/** Live fetchers. Each resolves to null on any failure so callers keep the snapshot. */

const TIMEOUT_MS = 8000;

async function getJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return (await res.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

const asRecords = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null) : [];
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const nums = (v: unknown): number[] => (Array.isArray(v) ? v.map(num) : []);
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map(str) : []);
const live = (label: string) => ({ kind: 'live' as const, label, fetchedAt: new Date().toISOString() });

/* ---------- Open-Meteo: Chatfield surface conditions ---------- */

export async function fetchWeather(): Promise<Sourced<WeatherReport> | null> {
  const q = new URLSearchParams({
    latitude: String(CHATFIELD.lat),
    longitude: String(CHATFIELD.lon),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,weather_code',
    hourly: 'wind_speed_10m,wind_gusts_10m,temperature_2m',
    daily: 'sunrise,sunset',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: CHATFIELD.timezone,
    forecast_days: '2',
  });
  try {
    const raw = (await getJson(`https://api.open-meteo.com/v1/forecast?${q}`)) as Record<string, Record<string, unknown>>;
    const c = raw.current ?? {};
    const h = raw.hourly ?? {};
    const d = raw.daily ?? {};
    const sunrises = strs(d.sunrise);
    const sunsets = strs(d.sunset);
    const times = strs(h.time);
    const wind = nums(h.wind_speed_10m);
    const gust = nums(h.wind_gusts_10m);
    const temp = nums(h.temperature_2m);
    const observedAt = str(c.time);
    const nextSunrise = sunrises.find((s) => s > observedAt) ?? sunrises[sunrises.length - 1] ?? '';
    // Launch window: two hours before the next sunrise through mid-morning.
    const windowStart = shiftHours(nextSunrise, -2);
    const hours = times
      .map((time, i) => ({ time, windMph: wind[i] ?? 0, gustMph: gust[i] ?? 0, tempF: temp[i] ?? 0 }))
      .filter((hr) => hr.time >= windowStart)
      .slice(0, 8);
    return {
      source: live('Open-Meteo'),
      value: {
        observedAt,
        tempF: num(c.temperature_2m),
        humidity: num(c.relative_humidity_2m),
        windMph: num(c.wind_speed_10m),
        gustMph: num(c.wind_gusts_10m),
        windDirDeg: num(c.wind_direction_10m),
        cloudCover: num(c.cloud_cover),
        weatherCode: num(c.weather_code),
        elevationM: num((raw as Record<string, unknown>).elevation),
        sunrise: sunrises[0] ?? '',
        sunset: sunsets[0] ?? '',
        nextSunrise,
        hours,
      },
    };
  } catch {
    return null;
  }
}

/** Shift a local "yyyy-mm-ddTHH:mm" string by whole hours without timezone conversion. */
function shiftHours(local: string, delta: number): string {
  if (!local) return '';
  const d = new Date(`${local}:00Z`);
  d.setUTCHours(d.getUTCHours() + delta);
  return d.toISOString().slice(0, 16);
}

/* ---------- Club backend (public Supabase REST, read-only) ---------- */

interface ClubTables {
  crew: Sourced<CrewMember[]>;
  fleet: Sourced<Balloon[]>;
  schedule: Sourced<ScheduleItem[]>;
  logs: Sourced<FlightLog[]>;
}

const OWN_STORAGE = /\.supabase\.co\/storage\/v1\/object\/public\//;

export async function fetchClubTables(): Promise<Partial<ClubTables>> {
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!base || !key) return {};
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const get = (path: string) => getJson(`${base}/rest/v1/${path}`, headers).then(asRecords).catch(() => null);

  const [crew, fleet, schedule, logs] = await Promise.all([
    get('crew_members?select=name,role,experience_years,flights,specialty,bio,image_url,availability&deleted_at=is.null'),
    get('balloons?select=name,type,volume,capacity,burner,status,description&deleted_at=is.null'),
    get('schedule_items?select=title,type,date,time,location,description&order=date.desc&limit=12'),
    get('flight_logs?select=log_number,date,duration_minutes,site,notes,status&order=date.desc&limit=12'),
  ]);
  const out: Partial<ClubTables> = {};
  const src = live('rockymountainfly.com');
  if (crew) out.crew = { source: src, value: crew.map(toCrew) };
  if (fleet) out.fleet = { source: src, value: fleet.map(toBalloon) };
  if (schedule) out.schedule = { source: src, value: schedule.map(toSchedule) };
  if (logs) out.logs = { source: src, value: logs.map(toLog) };
  return out;
}

function toCrew(r: Record<string, unknown>): CrewMember {
  const role: CrewRole = str(r.role) === 'Pilot' ? 'Pilot' : 'Ground Crew';
  const avail = str(r.availability);
  const availability: Availability = avail === 'busy' || avail === 'unavailable' ? avail : 'available';
  const img = str(r.image_url);
  return {
    name: str(r.name),
    role,
    experienceYears: num(r.experience_years),
    flights: num(r.flights),
    specialty: str(r.specialty),
    bio: str(r.bio),
    photoUrl: OWN_STORAGE.test(img) ? img : null,
    availability,
  };
}

function toBalloon(r: Record<string, unknown>): Balloon {
  const status = str(r.status);
  return {
    name: str(r.name),
    type: str(r.type),
    volume: str(r.volume),
    capacity: str(r.capacity),
    burner: str(r.burner),
    status: status === 'retired' || status === 'maintenance' ? status : 'active',
    description: str(r.description),
  };
}

function toSchedule(r: Record<string, unknown>): ScheduleItem {
  return {
    title: str(r.title),
    kind: str(r.type) === 'flight' ? 'flight' : 'event',
    date: str(r.date),
    time: str(r.time) || null,
    location: str(r.location),
    description: str(r.description),
  };
}

function toLog(r: Record<string, unknown>): FlightLog {
  return {
    logNumber: str(r.log_number),
    date: str(r.date),
    durationMinutes: num(r.duration_minutes),
    site: str(r.site),
    notes: str(r.notes),
    status: str(r.status),
  };
}
