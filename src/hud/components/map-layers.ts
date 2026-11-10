import { s } from '../../dashboard/lib/dom';
import { LAUNCH_SITE, LINES, PLACES, RESERVOIR } from '../data/chatfield-geo';
import type { Box, Pt } from '../lib/geo';
import { boxOf, destination, imageryTiles, project, smoothPath } from '../lib/geo';
import type { FlightTrack } from '../lib/sim';
import { contours } from '../lib/terrain';

/** Static plane layers. Everything is in zoom-14 world pixels, offset so the box starts at 0,0. */

export interface PlaneGeometry {
  box: Box;
  /** Smaller box that gets satellite tiles; the chart runs on past it toward the horizon. */
  core: Box;
  width: number;
  height: number;
  /** World point -> plane-local point. */
  local: (p: Pt) => Pt;
}

const MILE_M = 1609.344;

export function planeGeometry(track: FlightTrack): PlaneGeometry {
  const pts = [
    ...RESERVOIR.map(project),
    ...track.samples.map((s) => project(s.at)),
    project(destination(LAUNCH_SITE, 0, 3.2 * MILE_M)),
    project(destination(LAUNCH_SITE, 180, 3.2 * MILE_M)),
    project(destination(LAUNCH_SITE, 90, 3.2 * MILE_M)),
    project(destination(LAUNCH_SITE, 270, 3.2 * MILE_M)),
  ];
  const box = boxOf(pts, 1500);
  return {
    box,
    core: boxOf(pts, 1000),
    width: Math.round(box.maxX - box.minX),
    height: Math.round(box.maxY - box.minY),
    local: (p) => ({ x: p.x - box.minX, y: p.y - box.minY }),
  };
}

export const landLayer = (g: PlaneGeometry): SVGRectElement => s('rect', { class: 'land', width: g.width, height: g.height });

export function chartLayer(g: PlaneGeometry): SVGGElement {
  const { minor, major } = contours(g.box);
  const shift = `translate(${-g.box.minX} ${-g.box.minY})`;
  const lake = smoothPath(RESERVOIR.map((p) => g.local(project(p))), true);
  return s(
    'g',
    { class: 'layer-chart' },
    s('g', { transform: shift }, s('path', { class: 'contour', d: minor }), s('path', { class: 'contour contour--index', d: major })),
    s('path', { class: 'water', d: lake }),
    s('path', { class: 'water-edge', d: lake }),
    ...LINES.map((line) =>
      s('path', { class: `line line--${line.kind}`, d: smoothPath(line.points.map((p) => g.local(project(p)))) }),
    ),
  );
}

/** Tile elements survive plane rebuilds (live weather moves the track) so loaded imagery never flashes. */
const tileCache = new Map<string, SVGImageElement>();
let tileError: (() => void) | null = null;

export function imageryLayer(g: PlaneGeometry, onError: () => void): SVGGElement {
  let failed = false;
  const fail = () => {
    if (failed) return;
    failed = true;
    onError();
  };
  tileError = fail;
  const { core, box } = g;
  const fade = s(
    'radialGradient',
    { id: 'imagery-fade' },
    s('stop', { offset: '0.62', 'stop-color': '#fff' }),
    s('stop', { offset: '1', 'stop-color': '#000' }),
  );
  const mask = s(
    'mask',
    { id: 'imagery-mask' },
    s('rect', { x: core.minX - box.minX, y: core.minY - box.minY, width: core.maxX - core.minX, height: core.maxY - core.minY, fill: 'url(#imagery-fade)' }),
  );
  return s(
    'g',
    { class: 'layer-imagery' },
    s('defs', {}, fade, mask),
    s(
      'g',
      { mask: 'url(#imagery-mask)' },
      ...imageryTiles(core).map((t) => {
        let img = tileCache.get(t.href);
        if (!img) {
          img = s('image', { href: t.href, width: 257, height: 257, preserveAspectRatio: 'none', decoding: 'async' });
          img.addEventListener('error', () => tileError?.(), { once: true });
          tileCache.set(t.href, img);
        }
        img.setAttribute('x', String(t.x - box.minX));
        img.setAttribute('y', String(t.y - box.minY));
        return img;
      }),
    ),
  );
}

/** Range rings, downwind arrows, launch and landing marks. Shown over both base layers. */
export function hudLayer(g: PlaneGeometry, track: FlightTrack): SVGGElement {
  const launch = g.local(project(LAUNCH_SITE));
  const last = track.samples[track.samples.length - 1]!;
  const landing = g.local(project(last.at));
  const planned = smoothPath(track.samples.map((p) => g.local(project(p.at))));

  const rings = [1, 2, 3].map((mi) => {
    const r = g.local(project(destination(LAUNCH_SITE, 0, mi * MILE_M))).y - launch.y;
    return s(
      'g',
      { class: 'ring' },
      s('circle', { cx: launch.x, cy: launch.y, r: Math.abs(r) }),
    );
  });

  const heading = track.samples[Math.floor(track.samples.length / 3)]?.headingDeg ?? 0;
  const arrows: SVGElement[] = [];
  const step = 260;
  for (let y = step / 2; y < g.height; y += step) {
    for (let x = step / 2; x < g.width; x += step) {
      arrows.push(s('path', { class: 'drift', d: 'M-9 6 L0 -8 L9 6', transform: `translate(${x} ${y}) rotate(${heading})` }));
    }
  }

  return s(
    'g',
    { class: 'layer-hud' },
    s('g', { class: 'drift-field', 'aria-hidden': 'true' }, ...arrows),
    ...rings,
    s('path', { class: 'track track--planned', d: planned }),
    s(
      'g',
      { class: 'mark mark--launch', transform: `translate(${launch.x} ${launch.y})` },
      s('circle', { r: 26, class: 'mark__halo' }),
      s('circle', { r: 9, class: 'mark__core' }),
    ),
    s(
      'g',
      { class: 'mark mark--landing', transform: `translate(${landing.x} ${landing.y})` },
      s('circle', { r: 14, class: 'mark__ring' }),
      s('path', { d: 'M-7 -7 L7 7 M7 -7 L-7 7', class: 'mark__x' }),
    ),
    s('path', { class: 'track track--flown', d: '' }),
  );
}

export interface MapLabel {
  text: string;
  at: Pt;
  kind: 'water' | 'terrain' | 'town' | 'river' | 'road' | 'ring' | 'mark';
  /** Screen offset from the anchor, so a label clears its marker. */
  dx?: number;
  anchor?: 'start' | 'middle' | 'end';
}

/** Labels are drawn upright in screen space by the overlay, so they stay readable when the plane tilts. */
export function mapLabels(g: PlaneGeometry, track: FlightTrack): MapLabel[] {
  const launch = g.local(project(LAUNCH_SITE));
  const landing = g.local(project(track.samples[track.samples.length - 1]!.at));
  return [
    ...PLACES.map((p): MapLabel => ({ text: p.name, at: g.local(project(p.at)), kind: p.kind, anchor: 'middle' })),
    ...LINES.filter((l) => l.labelAt !== undefined).map(
      (l): MapLabel => ({ text: l.name, at: g.local(project(l.points[l.labelAt!]!)), kind: l.kind, dx: 8 }),
    ),
    ...[1, 2, 3].map((mi): MapLabel => ({ text: `${mi} mi`, at: g.local(project(destination(LAUNCH_SITE, 180, mi * MILE_M))), kind: 'ring', dx: 6 })),
    { text: 'Montgolfier Balloon Port', at: launch, kind: 'mark', dx: -18, anchor: 'end' },
    { text: 'Simulated landing', at: landing, kind: 'mark', dx: 18 },
  ];
}
