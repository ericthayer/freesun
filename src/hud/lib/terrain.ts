import { HOGBACK } from '../data/chatfield-geo';
import type { Box, LatLon } from './geo';
import { TILE_ZOOM } from './geo';

/**
 * A plausible terrain model for the Chatfield basin: flat reservoir floor, the Dakota
 * Hogback ridge, foothills rising west of it, and the Highlands Ranch bluffs east.
 * Shaped by hand, not surveyed. It only exists to draw contour lines in chart mode.
 */

const sigmoid = (v: number): number => 1 / (1 + Math.exp(-v));

function hogbackLon(lat: number): number {
  const pts = HOGBACK;
  for (let i = 0; i < pts.length - 1; i++) {
    const [la, lo] = pts[i]!;
    const [lb, lob] = pts[i + 1]!;
    if (lat <= la && lat >= lb) return lo + ((lat - la) / (lb - la)) * (lob - lo);
  }
  return lat > pts[0]![0] ? pts[0]![1] : pts[pts.length - 1]![1];
}

export function elevationFt([lat, lon]: LatLon): number {
  const hog = hogbackLon(lat);
  const foothills = sigmoid((hog - 0.014 - lon) / 0.006);
  return (
    5440 +
    1700 * foothills +
    // Drainages cut east-west into the foothills; wobble keeps them from reading as stripes.
    240 * foothills * Math.sin(lat * 1150 + 2.2 * Math.sin(lon * 640) + 1.3 * Math.sin(lat * 410)) +
    90 * foothills * Math.sin(lon * 1700 + 1.7 * Math.cos(lat * 900)) +
    380 * Math.exp(-(((lon - hog) / 0.0028) ** 2)) +
    320 * sigmoid((lon + 105.034) / 0.008) * sigmoid((39.572 - lat) / 0.006) +
    170 * Math.exp(-(((lat - 39.524) / 0.012) ** 2 + ((lon + 105.06) / 0.011) ** 2)) +
    35 * Math.sin(lat * 900) * Math.cos(lon * 700) +
    25 * Math.sin((lat + lon) * 1500)
  );
}

const WORLD = 256 * 2 ** TILE_ZOOM;

function unproject(x: number, y: number): LatLon {
  const lon = (x / WORLD) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / WORLD;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return [lat, lon];
}

export interface ContourSet {
  /** Thin lines every `interval` feet. */
  minor: string;
  /** Index lines every fifth interval. */
  major: string;
}

/** Marching squares over the box; returns two SVG path strings. */
export function contours(box: Box, cell = 26, interval = 40): ContourSet {
  const cols = Math.ceil((box.maxX - box.minX) / cell) + 1;
  const rows = Math.ceil((box.maxY - box.minY) / cell) + 1;
  const grid = new Float32Array(cols * rows);
  let lo = Infinity;
  let hi = -Infinity;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = elevationFt(unproject(box.minX + c * cell, box.minY + r * cell));
      grid[r * cols + c] = v;
      lo = Math.min(lo, v);
      hi = Math.max(hi, v);
    }
  }
  const minor: string[] = [];
  const major: string[] = [];
  const first = Math.ceil(lo / interval) * interval;
  for (let level = first; level <= hi; level += interval) {
    const out = (level / interval) % 5 === 0 ? major : minor;
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = grid[r * cols + c]!;
        const b = grid[r * cols + c + 1]!;
        const d = grid[(r + 1) * cols + c]!;
        const e = grid[(r + 1) * cols + c + 1]!;
        const crossings: [number, number][] = [];
        const x0 = box.minX + c * cell;
        const y0 = box.minY + r * cell;
        const edge = (p: number, q: number, ax: number, ay: number, bx: number, by: number) => {
          if ((p < level) === (q < level)) return;
          const t = (level - p) / (q - p);
          crossings.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
        };
        edge(a, b, x0, y0, x0 + cell, y0);
        edge(b, e, x0 + cell, y0, x0 + cell, y0 + cell);
        edge(d, e, x0, y0 + cell, x0 + cell, y0 + cell);
        edge(a, d, x0, y0, x0, y0 + cell);
        for (let i = 0; i + 1 < crossings.length; i += 2) {
          const [p, q] = [crossings[i]!, crossings[i + 1]!];
          out.push(`M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${q[0].toFixed(0)} ${q[1].toFixed(0)}`);
        }
      }
    }
  }
  return { minor: minor.join(''), major: major.join('') };
}
