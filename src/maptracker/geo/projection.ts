/**
 * Web Mercator "world" coordinates at a fixed zoom, offset to the chart's north-west corner.
 * Every map layer (vector chart, satellite tiles, balloon overlay) shares this space, so
 * tiles and traced features line up without a mapping library.
 */

export type LatLon = readonly [lat: number, lon: number];
export interface Point {
  x: number;
  y: number;
}

/** World units are Mercator pixels at this zoom level. */
export const WORLD_Z = 16;
const WORLD_SIZE = 256 * 2 ** WORLD_Z;

/** Chart extent: Chatfield State Park plus the drift corridor north toward Littleton. */
export const BOUNDS = { north: 39.603, south: 39.505, west: -105.13, east: -105.0 } as const;

function mercX(lon: number): number {
  return ((lon + 180) / 360) * WORLD_SIZE;
}

function mercY(lat: number): number {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * WORLD_SIZE;
}

const ORIGIN: Point = { x: mercX(BOUNDS.west), y: mercY(BOUNDS.north) };

export const WORLD: { width: number; height: number } = {
  width: mercX(BOUNDS.east) - ORIGIN.x,
  height: mercY(BOUNDS.south) - ORIGIN.y,
};

export function project([lat, lon]: LatLon): Point {
  return { x: mercX(lon) - ORIGIN.x, y: mercY(lat) - ORIGIN.y };
}

export function unproject({ x, y }: Point): LatLon {
  const lon = ((x + ORIGIN.x) / WORLD_SIZE) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * (y + ORIGIN.y)) / WORLD_SIZE;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return [lat, lon];
}

/** World units per meter at the chart's latitude (Mercator scale factor). */
export const UNITS_PER_METER = WORLD_SIZE / (40075016.686 * Math.cos((39.55 * Math.PI) / 180));

/** Tile covering a world point at zoom z, as world-space rectangle + slippy indexes. */
export interface TileRef {
  z: number;
  tx: number;
  ty: number;
  x: number;
  y: number;
  size: number;
}

export function tilesFor(view: { x: number; y: number; w: number; h: number }, z: number): TileRef[] {
  const size = 256 * 2 ** (WORLD_Z - z);
  const x0 = Math.floor((view.x + ORIGIN.x) / size);
  const x1 = Math.floor((view.x + view.w + ORIGIN.x) / size);
  const y0 = Math.floor((view.y + ORIGIN.y) / size);
  const y1 = Math.floor((view.y + view.h + ORIGIN.y) / size);
  const out: TileRef[] = [];
  for (let tx = x0; tx <= x1; tx++) {
    for (let ty = y0; ty <= y1; ty++) {
      out.push({ z, tx, ty, x: tx * size - ORIGIN.x, y: ty * size - ORIGIN.y, size });
    }
  }
  return out;
}

const R_EARTH_M = 6371008.8;
const rad = (d: number): number => (d * Math.PI) / 180;

export function distanceMeters(a: LatLon, b: LatLon): number {
  const dLat = rad(b[0] - a[0]);
  const dLon = rad(b[1] - a[1]);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH_M * Math.asin(Math.sqrt(s));
}

/** Initial true bearing from a to b, 0–360°. */
export function bearingDeg(a: LatLon, b: LatLon): number {
  const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0]));
  const x =
    Math.cos(rad(a[0])) * Math.sin(rad(b[0])) - Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Point reached travelling `meters` on true bearing `deg` from `from` (flat-earth, fine under 20 km). */
export function offset(from: LatLon, deg: number, meters: number): LatLon {
  const dLat = (meters * Math.cos(rad(deg))) / 111320;
  const dLon = (meters * Math.sin(rad(deg))) / (111320 * Math.cos(rad(from[0])));
  return [from[0] + dLat, from[1] + dLon];
}

/** SVG path data for a world-space polyline. */
export function pathData(points: readonly Point[], closed = false): string {
  if (!points.length) return '';
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
  return closed ? `${d}Z` : d;
}
