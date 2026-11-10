import type { WeatherReport } from '../../dashboard/data/types';
import { FIELD_ELEV_FT, LAUNCH_SITE } from '../data/chatfield-geo';
import type { LatLon } from './geo';
import { destination } from './geo';

/**
 * Simulated sunrise flight from the Montgolfier Balloon Port. There is no live balloon
 * GPS feed, so the track is built from the forecast: the balloon drifts downwind of the
 * surface wind, veering right and speeding up with height as morning winds usually do.
 */

export interface FlightSample {
  minute: number;
  at: LatLon;
  altFt: number;
  climbFpm: number;
  speedMph: number;
  headingDeg: number;
}

export interface FlightTrack {
  launchAt: string;
  durationMin: number;
  samples: FlightSample[];
  distanceMi: number;
  maxAltFt: number;
}

/** Minute, feet above the launch field. A classic hop: climb out, cruise, contour low, climb again, land. */
const PROFILE: readonly [number, number][] = [
  [0, 0], [2, 30], [13, 1500], [28, 1350], [37, 160], [47, 950], [57, 480], [66, 0],
];
const DURATION = PROFILE[PROFILE.length - 1]![0];
const MAX_MPH = 8;
const MIN_MPH = 2.5;
const MPH_TO_MPMIN = 1609.344 / 60;

const smoothstep = (t: number): number => t * t * (3 - 2 * t);

function altitudeAt(minute: number): number {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [m0, a0] = PROFILE[i]!;
    const [m1, a1] = PROFILE[i + 1]!;
    if (minute >= m0 && minute <= m1) {
      const base = a0 + (a1 - a0) * smoothstep((minute - m0) / (m1 - m0));
      return base > 200 ? base + 35 * Math.sin(minute / 2.3) : base;
    }
  }
  return 0;
}

function surfaceWindAt(w: WeatherReport, iso: string): number {
  const hour = w.hours.find((h) => h.time.slice(0, 13) === iso.slice(0, 13));
  return hour?.windMph ?? w.windMph;
}

function addMinutes(local: string, minutes: number): string {
  if (!local) return '';
  const d = new Date(`${local}:00Z`);
  d.setUTCMinutes(d.getUTCMinutes() + minutes);
  return d.toISOString().slice(0, 16);
}

export function simulateFlight(w: WeatherReport): FlightTrack {
  const launchAt = w.nextSunrise || w.observedAt;
  const samples: FlightSample[] = [];
  let at: LatLon = LAUNCH_SITE;
  let meters = 0;
  const step = 0.25;
  for (let m = 0; m <= DURATION + 1e-9; m += step) {
    const alt = altitudeAt(m);
    const frac = Math.min(1, alt / 1500);
    const surface = surfaceWindAt(w, addMinutes(launchAt, Math.floor(m)));
    const speed = alt <= 0 ? 0 : Math.max(MIN_MPH, Math.min(MAX_MPH, surface * (0.6 + 0.4 * frac)));
    const heading = (w.windDirDeg + 180 + 25 * frac + 360) % 360;
    if (Number.isInteger(m)) {
      const climb = altitudeAt(Math.min(DURATION, m + 0.5)) - altitudeAt(Math.max(0, m - 0.5));
      samples.push({ minute: m, at, altFt: alt, climbFpm: climb, speedMph: speed, headingDeg: heading });
    }
    const d = speed * MPH_TO_MPMIN * step;
    at = destination(at, heading, d);
    meters += d;
  }
  return {
    launchAt,
    durationMin: DURATION,
    samples,
    distanceMi: meters / 1609.344,
    maxAltFt: Math.max(...samples.map((s) => s.altFt)),
  };
}

/** Interpolated state at a fractional minute. */
export function sampleAt(track: FlightTrack, minute: number): FlightSample {
  const s = track.samples;
  const t = Math.max(0, Math.min(track.durationMin, minute));
  const i = Math.min(s.length - 2, Math.floor(t));
  const a = s[i]!;
  const b = s[i + 1]!;
  const k = t - i;
  const mix = (p: number, q: number) => p + (q - p) * k;
  return {
    minute: t,
    at: [mix(a.at[0], b.at[0]), mix(a.at[1], b.at[1])],
    altFt: mix(a.altFt, b.altFt),
    climbFpm: mix(a.climbFpm, b.climbFpm),
    speedMph: mix(a.speedMph, b.speedMph),
    headingDeg: b.headingDeg,
  };
}

export const mslFt = (s: FlightSample): number => Math.round(FIELD_ELEV_FT + s.altFt);
export const clockAt = (track: FlightTrack, minute: number): string => addMinutes(track.launchAt, Math.floor(minute));
