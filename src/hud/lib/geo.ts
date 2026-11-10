/** Web Mercator helpers. All map geometry lives in zoom-14 world pixels so imagery tiles line up. */

export const TILE_ZOOM = 14;
const WORLD = 256 * 2 ** TILE_ZOOM;
const EARTH_M = 6_371_000;

export type LatLon = readonly [lat: number, lon: number];
export interface Pt {
  x: number;
  y: number;
}
export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function project([lat, lon]: LatLon): Pt {
  const phi = (lat * Math.PI) / 180;
  return {
    x: ((lon + 180) / 360) * WORLD,
    y: ((1 - Math.log(Math.tan(phi) + 1 / Math.cos(phi)) / Math.PI) / 2) * WORLD,
  };
}

/** Point reached after travelling `meters` on `bearingDeg` (true). Flat-earth is fine at park scale. */
export function destination([lat, lon]: LatLon, bearingDeg: number, meters: number): LatLon {
  const b = (bearingDeg * Math.PI) / 180;
  const dLat = (meters * Math.cos(b)) / EARTH_M;
  const dLon = (meters * Math.sin(b)) / (EARTH_M * Math.cos((lat * Math.PI) / 180));
  return [lat + (dLat * 180) / Math.PI, lon + (dLon * 180) / Math.PI];
}

export function boxOf(points: readonly Pt[], pad = 0): Box {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return {
    minX: Math.min(...xs) - pad,
    minY: Math.min(...ys) - pad,
    maxX: Math.max(...xs) + pad,
    maxY: Math.max(...ys) + pad,
  };
}

/** Closed or open Catmull-Rom spline through the points, as an SVG path. */
export function smoothPath(points: readonly Pt[], closed = false): string {
  if (points.length < 2) return '';
  const n = points.length;
  const at = (i: number): Pt => (closed ? points[(i + n) % n]! : points[Math.max(0, Math.min(n - 1, i))]!);
  const f = (v: number) => v.toFixed(1);
  let d = `M${f(points[0]!.x)} ${f(points[0]!.y)}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return closed ? `${d} Z` : d;
}

export interface Tile {
  href: string;
  x: number;
  y: number;
}

/** Esri World Imagery tiles covering a world-pixel box. */
export function imageryTiles(box: Box): Tile[] {
  const tiles: Tile[] = [];
  for (let ty = Math.floor(box.minY / 256); ty <= Math.floor(box.maxY / 256); ty++) {
    for (let tx = Math.floor(box.minX / 256); tx <= Math.floor(box.maxX / 256); tx++) {
      tiles.push({
        href: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${TILE_ZOOM}/${ty}/${tx}`,
        x: tx * 256,
        y: ty * 256,
      });
    }
  }
  return tiles;
}

/** World pixels per meter at a latitude (zoom 14). */
export const pxPerMeter = (lat: number): number =>
  WORLD / (2 * Math.PI * EARTH_M * Math.cos((lat * Math.PI) / 180));
