import { BOUNDS, project, type LatLon, type Point } from './projection';

/**
 * Stylized elevation model for the chart's terrain tints and contours. It encodes the real
 * shape of the place (reservoir floor near 5,430 ft, the Dakota hogback ridges to the west,
 * the Highlands Ranch rise to the east) but it is not survey data.
 */
export function elevationFt([lat, lon]: LatLon): number {
  // Hogback ridges run NNW–SSE, so measure across them on a tilted axis.
  const u = lon + (lat - 39.55) * 0.42;
  const ridgeA = 520 * Math.exp(-(((u + 105.1165) / 0.0042) ** 2));
  const ridgeB = 300 * Math.exp(-(((u + 105.1045) / 0.0032) ** 2));
  const foothills = Math.max(0, -(u + 105.12)) * 42000;
  const eastRise = Math.max(0, lon + 105.048) * 9800;
  const northRise = Math.max(0, lat - 39.565) * 3600;
  const roll =
    18 * Math.sin(lat * 610 + lon * 220) + 12 * Math.sin(lon * 900 - lat * 310) + 6 * Math.sin((lat + lon) * 1700);
  return 5430 + ridgeA + ridgeB + foothills + eastRise + northRise + Math.max(roll, -20);
}

export interface ContourSet {
  level: number;
  /** Separate SVG subpaths, one per marching-squares segment run. */
  d: string;
  index: boolean;
}

/** Contour lines every `step` ft via marching squares on a regular lat/lon grid. */
export function buildContours(step = 50, cols = 150, rows = 140): ContourSet[] {
  const lats = Array.from({ length: rows + 1 }, (_, j) => BOUNDS.north - ((BOUNDS.north - BOUNDS.south) * j) / rows);
  const lons = Array.from({ length: cols + 1 }, (_, i) => BOUNDS.west + ((BOUNDS.east - BOUNDS.west) * i) / cols);
  const grid = lats.map((la) => lons.map((lo) => elevationFt([la, lo])));
  const pts = lats.map((la) => lons.map((lo) => project([la, lo])));
  let min = Infinity;
  let max = -Infinity;
  for (const row of grid)
    for (const v of row) {
      min = Math.min(min, v);
      max = Math.max(max, v);
    }

  const out: ContourSet[] = [];
  for (let level = Math.ceil(min / step) * step; level < max; level += step) {
    const parts: string[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const segs = cell(grid, pts, i, j, level);
        for (const [a, b] of segs) parts.push(`M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      }
    }
    if (parts.length) out.push({ level, d: parts.join(''), index: level % (step * 5) === 0 });
  }
  return out;
}

function lerp(a: Point, b: Point, va: number, vb: number, level: number): Point {
  const t = (level - va) / (vb - va || 1);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function cell(grid: number[][], pts: Point[][], i: number, j: number, level: number): [Point, Point][] {
  const v = [grid[j]![i]!, grid[j]![i + 1]!, grid[j + 1]![i + 1]!, grid[j + 1]![i]!];
  const p = [pts[j]![i]!, pts[j]![i + 1]!, pts[j + 1]![i + 1]!, pts[j + 1]![i]!];
  const code = (v[0]! > level ? 8 : 0) | (v[1]! > level ? 4 : 0) | (v[2]! > level ? 2 : 0) | (v[3]! > level ? 1 : 0);
  if (code === 0 || code === 15) return [];
  const e = (k: number): Point => lerp(p[k]!, p[(k + 1) % 4]!, v[k]!, v[(k + 1) % 4]!, level);
  // Edges: 0 top, 1 right, 2 bottom, 3 left.
  const table: Record<number, [number, number][]> = {
    1: [[3, 2]], 2: [[2, 1]], 3: [[3, 1]], 4: [[0, 1]], 5: [[3, 0], [2, 1]], 6: [[0, 2]], 7: [[3, 0]],
    8: [[3, 0]], 9: [[0, 2]], 10: [[3, 2], [0, 1]], 11: [[0, 1]], 12: [[3, 1]], 13: [[2, 1]], 14: [[3, 2]],
  };
  return (table[code] ?? []).map(([a, b]) => [e(a), e(b)]);
}

/**
 * Two grayscale rasters used as SVG luminance masks, so theme colors stay in CSS:
 * `relief` brightens with height (hypsometric tint), `shade` brightens on slopes facing
 * away from a north-west sun (hillshade). Rows/cols follow the chart bounds linearly;
 * over 10 km the Mercator stretch is under 0.1%, invisible at this resolution.
 */
export function terrainMasks(cols = 220, rows = 240): { relief: string; shade: string } {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { relief: '', shade: '' };
  const dLat = (BOUNDS.north - BOUNDS.south) / rows;
  const dLon = (BOUNDS.east - BOUNDS.west) / cols;
  const elev = new Float32Array(cols * rows);
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) elev[j * cols + i] = elevationFt([BOUNDS.north - dLat * j, BOUNDS.west + dLon * i]);

  const paint = (fn: (i: number, j: number) => number): string => {
    const img = ctx.createImageData(cols, rows);
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const v = Math.max(0, Math.min(255, Math.round(fn(i, j) * 255)));
        const k = (j * cols + i) * 4;
        img.data[k] = img.data[k + 1] = img.data[k + 2] = v;
        img.data[k + 3] = 255;
      }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL('image/png');
  };
  const at = (i: number, j: number): number =>
    elev[Math.min(rows - 1, Math.max(0, j)) * cols + Math.min(cols - 1, Math.max(0, i))]!;

  const relief = paint((i, j) => (at(i, j) - 5430) / 900);
  // Cell size ~42 m; light from the north-west, as on a printed chart.
  const shade = paint((i, j) => {
    const dx = (at(i + 1, j) - at(i - 1, j)) / 2;
    const dy = (at(i, j + 1) - at(i, j - 1)) / 2;
    return Math.max(0, -(dx + dy) / 140);
  });
  return { relief, shade };
}
