import { s } from '../../dashboard/lib/dom';
import { fmtInt } from '../../dashboard/lib/format';
import type { Pt } from '../lib/geo';
import type { FlightSample, FlightTrack } from '../lib/sim';
import { sampleAt } from '../lib/sim';

/** Screen-space overlay: altitude curtain, tether line, balloon and its altitude tag. */

/** Plane-local point plus height in plane units -> viewport point. */
export type ToScreen = (p: Pt, height: number) => Pt;

/** World px per foot (zoom 14 at Chatfield), exaggerated so a 1,500 ft hop reads on screen. */
const HEIGHT_PX_PER_FT = (1 / 24) * 1.8;

export interface AirLayer {
  root: SVGSVGElement;
  draw(track: FlightTrack, minute: number, toLocal: (s: FlightSample) => Pt, toScreen: ToScreen, lifted: boolean): void;
  resize(width: number, height: number): void;
}

const pts = (list: Pt[]): string => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

export function createAirLayer(): AirLayer {
  const curtain = s('polygon', { class: 'air__curtain' });
  const planned = s('polyline', { class: 'air__planned' });
  const flown = s('polyline', { class: 'air__flown' });
  const tether = s('line', { class: 'air__tether' });
  const shadow = s('ellipse', { class: 'air__shadow', rx: 12, ry: 5 });
  const balloon = s(
    'g',
    { class: 'air__balloon' },
    s('path', {
      class: 'balloon__envelope',
      d: 'M0 -40 C17 -40 23 -27 21 -17 C19 -7 9 1 5 7 L-5 7 C-9 1 -19 -7 -21 -17 C-23 -27 -17 -40 0 -40 Z',
    }),
    s('path', { class: 'balloon__gores', d: 'M0 -40 C-9 -30 -8 -6 -3 7 M0 -40 C9 -30 8 -6 3 7 M0 -40 V7' }),
    s('path', { class: 'balloon__lines', d: 'M-5 7 L-4 12 M5 7 L4 12' }),
    s('rect', { class: 'balloon__basket', x: -4.5, y: 12, width: 9, height: 7, rx: 1.5 }),
  );
  const tagText = s('text', { class: 'air__tag', x: 0, y: 0 });
  const root = s(
    'svg',
    { class: 'map__air', 'aria-hidden': 'true' },
    planned,
    curtain,
    flown,
    tether,
    shadow,
    balloon,
    tagText,
  );

  return {
    root,
    resize(width, height) {
      root.setAttribute('viewBox', `0 0 ${width} ${height}`);
    },
    draw(track, minute, toLocal, toScreen, lifted) {
      const now = sampleAt(track, minute);
      const h = (a: number) => (lifted ? a * HEIGHT_PX_PER_FT : 0);
      const done = track.samples.filter((x) => x.minute < minute).concat(now);

      const groundNow = toScreen(toLocal(now), 0);
      const airNow = toScreen(toLocal(now), h(now.altFt));
      const ref = toScreen({ x: toLocal(now).x + 20, y: toLocal(now).y }, 0);
      const scale = Math.max(0.55, Math.min(1.6, Math.hypot(ref.x - groundNow.x, ref.y - groundNow.y) / 20));

      planned.setAttribute('points', lifted ? pts(track.samples.map((x) => toScreen(toLocal(x), h(x.altFt)))) : '');
      if (lifted && done.length > 1) {
        const air = done.map((x) => toScreen(toLocal(x), h(x.altFt)));
        const ground = done.map((x) => toScreen(toLocal(x), 0));
        curtain.setAttribute('points', pts([...ground, ...[...air].reverse()]));
        flown.setAttribute('points', pts(air));
      } else {
        curtain.setAttribute('points', '');
        flown.setAttribute('points', '');
      }

      tether.setAttribute('x1', groundNow.x.toFixed(1));
      tether.setAttribute('y1', groundNow.y.toFixed(1));
      tether.setAttribute('x2', airNow.x.toFixed(1));
      tether.setAttribute('y2', airNow.y.toFixed(1));
      shadow.setAttribute('cx', groundNow.x.toFixed(1));
      shadow.setAttribute('cy', groundNow.y.toFixed(1));
      shadow.setAttribute('rx', (12 * scale).toFixed(1));
      shadow.setAttribute('ry', ((lifted ? 4.5 : 12) * scale).toFixed(1));

      const anchorY = lifted ? 19 : -6;
      balloon.setAttribute(
        'transform',
        `translate(${airNow.x.toFixed(1)} ${airNow.y.toFixed(1)}) scale(${scale.toFixed(2)}) translate(0 ${-anchorY})`,
      );
      tagText.setAttribute('x', (airNow.x + 26 * scale).toFixed(1));
      tagText.setAttribute('y', (airNow.y - 26 * scale).toFixed(1));
      tagText.textContent = now.altFt < 5 ? (minute > 1 ? 'Landed' : 'On the field') : `${fmtInt(Math.round(now.altFt / 10) * 10)} ft`;
    },
  };
}
