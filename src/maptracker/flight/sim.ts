import { LAUNCH, LAUNCH_ELEV_FT } from '../geo/chatfield';
import { bearingDeg, distanceMeters, type LatLon } from '../geo/projection';
import { elevationFt } from '../geo/terrain';

/**
 * A simulated sunrise flight from the Balloon Port. There is no live GPS feed yet, so the
 * track is scripted to match a typical Chatfield morning: a south drainage breeze low down
 * carries the balloon across the reservoir (with a splash-and-dash), then winds aloft push it
 * north-east over C-470 to a landing in the South Platte Park open space.
 */

interface Waypoint {
  min: number;
  at: LatLon;
  aglFt: number;
}

const FLIGHT: readonly Waypoint[] = [
  { min: 0, at: LAUNCH, aglFt: 0 },
  { min: 2, at: [39.5462, -105.0858], aglFt: 350 },
  { min: 5, at: [39.548, -105.083], aglFt: 600 },
  { min: 9, at: [39.55, -105.079], aglFt: 250 },
  { min: 12, at: [39.5512, -105.076], aglFt: 12 },
  { min: 14, at: [39.5522, -105.0742], aglFt: 140 },
  { min: 18, at: [39.5545, -105.0712], aglFt: 900 },
  { min: 24, at: [39.5585, -105.068], aglFt: 1500 },
  { min: 30, at: [39.5625, -105.065], aglFt: 1350 },
  { min: 36, at: [39.5668, -105.0612], aglFt: 1100 },
  { min: 42, at: [39.5712, -105.056], aglFt: 900 },
  { min: 48, at: [39.5755, -105.0505], aglFt: 600 },
  { min: 53, at: [39.579, -105.0462], aglFt: 300 },
  { min: 57, at: [39.5812, -105.044], aglFt: 70 },
  { min: 60, at: [39.5822, -105.043], aglFt: 0 },
];

/** Chase truck: Wadsworth to C-470, waits east of the dam, then Santa Fe Dr north to the field. */
const CHASE: readonly Waypoint[] = [
  { min: 0, at: LAUNCH, aglFt: 0 },
  { min: 4, at: [39.5448, -105.0905], aglFt: 0 },
  { min: 8, at: [39.5555, -105.0836], aglFt: 0 },
  { min: 14, at: [39.5648, -105.0692], aglFt: 0 },
  { min: 22, at: [39.5668, -105.0624], aglFt: 0 },
  { min: 31, at: [39.5648, -105.0349], aglFt: 0 },
  { min: 40, at: [39.5714, -105.0297], aglFt: 0 },
  { min: 47, at: [39.5806, -105.0255], aglFt: 0 },
  { min: 55, at: [39.5818, -105.0405], aglFt: 0 },
  { min: 60, at: [39.5819, -105.0412], aglFt: 0 },
];

export const FLIGHT_SECONDS = 60 * 60;
const STEP_S = 15;

export interface Sample {
  t: number;
  at: LatLon;
  aglFt: number;
  mslFt: number;
  groundFt: number;
  speedMph: number;
  trackDeg: number;
  climbFpm: number;
}

export interface FlightTrack {
  samples: Sample[];
  chase: LatLon[];
  launchElevFt: number;
  maxAglFt: number;
  distanceMi: number;
}

const catmull = (p0: number, p1: number, p2: number, p3: number, t: number): number =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

function smooth(points: readonly Waypoint[], sec: number): { at: LatLon; aglFt: number } {
  const m = sec / 60;
  let i = points.findIndex((_w, k) => k < points.length - 1 && m <= points[k + 1]!.min);
  if (i < 0) i = points.length - 2;
  const a = points[Math.max(0, i - 1)]!;
  const b = points[i]!;
  const c = points[i + 1]!;
  const d = points[Math.min(points.length - 1, i + 2)]!;
  const t = (m - b.min) / (c.min - b.min);
  return {
    at: [catmull(a.at[0], b.at[0], c.at[0], d.at[0], t), catmull(a.at[1], b.at[1], c.at[1], d.at[1], t)],
    aglFt: Math.max(0, catmull(a.aglFt, b.aglFt, c.aglFt, d.aglFt, t)),
  };
}

function linear(points: readonly Waypoint[], sec: number): LatLon {
  const m = sec / 60;
  const i = Math.max(0, points.findIndex((_w, k) => k < points.length - 1 && m <= points[k + 1]!.min));
  const b = points[i]!;
  const c = points[i + 1] ?? b;
  const t = c.min === b.min ? 0 : Math.min(1, (m - b.min) / (c.min - b.min));
  return [b.at[0] + (c.at[0] - b.at[0]) * t, b.at[1] + (c.at[1] - b.at[1]) * t];
}

export function buildTrack(): FlightTrack {
  const samples: Sample[] = [];
  const chase: LatLon[] = [];
  let distanceM = 0;
  for (let t = 0; t <= FLIGHT_SECONDS; t += STEP_S) {
    const { at, aglFt } = smooth(FLIGHT, t);
    const prev = samples[samples.length - 1];
    const groundFt = t === 0 ? LAUNCH_ELEV_FT : Math.round(elevationFt(at));
    const legM = prev ? distanceMeters(prev.at, at) : 0;
    distanceM += legM;
    samples.push({
      t,
      at,
      aglFt: Math.round(aglFt),
      mslFt: Math.round(groundFt + aglFt),
      groundFt,
      speedMph: prev ? (legM / STEP_S) * 2.23694 : 0,
      trackDeg: prev ? bearingDeg(prev.at, at) : 0,
      climbFpm: prev ? ((aglFt - prev.aglFt) / STEP_S) * 60 : 0,
    });
    chase.push(linear(CHASE, t));
  }
  return {
    samples,
    chase,
    launchElevFt: LAUNCH_ELEV_FT,
    maxAglFt: Math.max(...samples.map((s) => s.aglFt)),
    distanceMi: distanceM / 1609.344,
  };
}

/** Sample index for a time in seconds, clamped to the track. */
export const sampleIndex = (track: FlightTrack, sec: number): number =>
  Math.min(track.samples.length - 1, Math.max(0, Math.round(sec / STEP_S)));
