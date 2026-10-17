import { s } from '../../dashboard/lib/dom';
import { DECLINATION_DEG, FEATURES, LABELS, LAUNCH, LAUNCH_NAME } from '../geo/chatfield';
import { WORLD, offset, pathData, project, tilesFor, type LatLon } from '../geo/projection';
import { buildContours, terrainMasks } from '../geo/terrain';

/** Static sectional-chart layers. Built once; zoom only changes the SVG viewBox. */

const line = (pts: readonly LatLon[], closed = false): string => pathData(pts.map(project), closed);

function terrain(): SVGGElement {
  const { relief, shade } = terrainMasks();
  const box = { x: 0, y: 0, width: WORLD.width, height: WORLD.height, preserveAspectRatio: 'none' };
  return s(
    'g',
    { class: 'chart-terrain' },
    s(
      'defs',
      {},
      s('mask', { id: 'mt-relief', maskUnits: 'userSpaceOnUse', ...box }, s('image', { href: relief, ...box })),
      s('mask', { id: 'mt-shade', maskUnits: 'userSpaceOnUse', ...box }, s('image', { href: shade, ...box })),
    ),
    s('rect', { class: 'chart-land', ...box }),
    s('rect', { class: 'chart-relief', mask: 'url(#mt-relief)', ...box }),
    s('rect', { class: 'chart-shade', mask: 'url(#mt-shade)', ...box }),
  );
}

function contours(): SVGGElement {
  return s(
    'g',
    { class: 'chart-contours', 'aria-hidden': 'true' },
    ...buildContours().map((c) => s('path', { d: c.d, class: c.index ? 'contour contour--index' : 'contour' })),
  );
}

function hydro(): SVGGElement {
  const f = FEATURES;
  return s(
    'g',
    { class: 'chart-hydro' },
    ...[f.platteUp, f.platteDown, f.plumCreek].map((r) => s('path', { class: 'river', d: line(r) })),
    ...[f.reservoir, f.southPond, f.pondNorth, f.pondPark].map((w) => s('path', { class: 'water', d: line(w, true) })),
  );
}

function roads(): SVGGElement {
  const f = FEATURES;
  const ways = [f.c470, f.wadsworth, f.santaFe].map((r) => line(r));
  return s(
    'g',
    { class: 'chart-roads' },
    ...ways.map((d) => s('path', { class: 'road-casing', d })),
    ...ways.map((d) => s('path', { class: 'road', d })),
  );
}

/** Compass rose at the launch site, oriented to magnetic north like a sectional VOR rose. */
function rose(): SVGGElement {
  const c = project(LAUNCH);
  const r = project(offset(LAUNCH, 90, 1150)).x - c.x;
  const ticks: string[] = [];
  const labels: SVGTextElement[] = [];
  for (let deg = 0; deg < 360; deg += 5) {
    const a = ((deg + DECLINATION_DEG - 90) * Math.PI) / 180;
    const len = deg % 30 === 0 ? 0.12 : deg % 10 === 0 ? 0.07 : 0.035;
    ticks.push(
      `M${(c.x + Math.cos(a) * r).toFixed(1)} ${(c.y + Math.sin(a) * r).toFixed(1)}` +
        `L${(c.x + Math.cos(a) * r * (1 - len)).toFixed(1)} ${(c.y + Math.sin(a) * r * (1 - len)).toFixed(1)}`,
    );
    if (deg % 30 === 0) {
      const lr = r * 0.8;
      labels.push(
        s(
          'text',
          { class: 'rose-label', x: (c.x + Math.cos(a) * lr).toFixed(1), y: (c.y + Math.sin(a) * lr).toFixed(1) },
          deg === 0 ? 'MN' : String(deg / 10),
        ),
      );
    }
  }
  const rings = [1, 2, 3].map((mi) => {
    const rr = project(offset(LAUNCH, 90, mi * 1609.344)).x - c.x;
    return s(
      'g',
      {},
      s('circle', { class: 'range-ring', cx: c.x, cy: c.y, r: rr.toFixed(1) }),
      s('text', { class: 'ring-label', x: c.x.toFixed(1), y: (c.y - rr).toFixed(1) }, `${mi} mi`),
    );
  });
  return s(
    'g',
    { class: 'chart-rose', 'aria-hidden': 'true' },
    ...rings,
    s('circle', { class: 'rose-ring', cx: c.x, cy: c.y, r: r.toFixed(1) }),
    s('path', { class: 'rose-ticks', d: ticks.join('') }),
    ...labels,
  );
}

function labels(): SVGGElement {
  const port = project(LAUNCH);
  return s(
    'g',
    { class: 'chart-labels', 'aria-hidden': 'true' },
    ...LABELS.map((l) => {
      const p = project(l.at);
      return s(
        'text',
        {
          class: `chart-label chart-label--${l.kind}`,
          x: p.x.toFixed(1),
          y: p.y.toFixed(1),
          transform: l.angle ? `rotate(${l.angle} ${p.x.toFixed(1)} ${p.y.toFixed(1)})` : null,
        },
        l.text,
      );
    }),
    s('text', { class: 'chart-label chart-label--port', x: port.x.toFixed(1), y: port.y.toFixed(1) }, LAUNCH_NAME),
  );
}

export interface ChartLayers {
  root: SVGGElement;
  tiles: SVGGElement;
  vector: SVGGElement;
  contours: SVGGElement;
  rose: SVGGElement;
  labels: SVGGElement;
}

export function buildChart(): ChartLayers {
  const tiles = s('g', { class: 'chart-tiles' });
  const ct = contours();
  const vector = s('g', { class: 'chart-vector' }, terrain(), ct, hydro(), roads());
  const r = rose();
  const l = labels();
  return { root: s('g', {}, tiles, vector, r), tiles, vector, contours: ct, rose: r, labels: l };
}

const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile';

/** Replace satellite tiles for the current view. Zoom picks ~1 tile pixel per screen pixel. */
export function renderTiles(
  layer: SVGGElement,
  view: { x: number; y: number; w: number; h: number },
  unitsPerPx: number,
): void {
  const z = Math.max(11, Math.min(17, Math.round(16 - Math.log2(unitsPerPx))));
  const want = tilesFor(view, z);
  const keep = new Set(want.map((t) => `${t.z}/${t.ty}/${t.tx}`));
  for (const img of Array.from(layer.children)) if (!keep.has(img.getAttribute('data-k') ?? '')) img.remove();
  const have = new Set(Array.from(layer.children).map((n) => n.getAttribute('data-k')));
  for (const t of want) {
    const k = `${t.z}/${t.ty}/${t.tx}`;
    if (have.has(k)) continue;
    // +0.5 overlap hides hairline seams between tiles.
    layer.append(s('image', { href: `${TILE_URL}/${k}`, 'data-k': k, x: t.x, y: t.y, width: t.size + 0.5, height: t.size + 0.5 }));
  }
}
