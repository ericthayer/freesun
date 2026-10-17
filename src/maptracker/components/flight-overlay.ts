import { h, s } from '../../dashboard/lib/dom';
import { LAUNCH } from '../geo/chatfield';
import { offset, pathData, project, type LatLon, type Point } from '../geo/projection';
import type { FlightTrack } from '../flight/sim';
import type { WindsAloft } from '../data/winds';

/** Altitude is drawn 3× true scale in the 3D view so a 1,500 ft flight reads at chart zoom. */
export const VERTICAL_EXAGGERATION = 3;
const DRIFT_MINUTES = 20;
const PICKET_EVERY = 4; // samples (15 s each) -> one picket per minute

export function balloonGlyph(cls: string): SVGSVGElement {
  return s(
    'svg',
    { class: cls, viewBox: '0 0 40 54', 'aria-hidden': 'true', focusable: 'false' },
    s('path', { class: 'glyph-env', d: 'M20 2C8 2 2 11 2 20c0 10 8 16 12 20h12c4-4 12-10 12-20C38 11 32 2 20 2Z' }),
    s('path', { class: 'glyph-gore', d: 'M20 2C13 12 13 30 15.5 40M20 2c7 10 7 28 4.5 38M20 2v38' }),
    s('path', { class: 'glyph-line', d: 'M14 40l2.5 6M26 40l-2.5 6' }),
    s('rect', { class: 'glyph-basket', x: 16, y: 46, width: 8, height: 6, rx: 1 }),
  );
}

export class FlightOverlay {
  readonly svg: SVGGElement;
  readonly html: HTMLDivElement;
  #track: FlightTrack;
  #world: Point[];
  #chaseWorld: Point[];
  #flown: SVGPathElement;
  #casing: SVGPathElement;
  #drift: SVGGElement;
  #balloon: HTMLDivElement;
  #tag: HTMLSpanElement;
  #truck: HTMLDivElement;
  #pickets: HTMLDivElement[];
  #index = 0;
  #toPct: (p: Point) => Point = () => ({ x: 0, y: 0 });
  #pxPerMeter = 0;

  constructor(track: FlightTrack) {
    this.#track = track;
    this.#world = track.samples.map((smp) => project(smp.at));
    this.#chaseWorld = track.chase.map(project);
    const land = this.#world[this.#world.length - 1]!;
    this.#flown = s('path', { class: 'track track--flown' });
    this.#casing = s('path', { class: 'track track--casing' });
    this.#drift = s('g', { class: 'chart-drift' });
    this.svg = s(
      'g',
      { class: 'chart-flight' },
      s('defs', {}, s('marker', { id: 'mt-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' },
        s('path', { class: 'drift-head', d: 'M0 0L10 5L0 10Z' }))),
      this.#drift,
      s('path', { class: 'chase-route', d: pathData(this.#chaseWorld) }),
      s('path', { class: 'track track--planned', d: pathData(this.#world) }),
      this.#casing,
      this.#flown,
      s(
        'g',
        { class: 'landing', transform: `translate(${land.x.toFixed(1)} ${land.y.toFixed(1)})` },
        s('g', { class: 'landing-mark' }, s('circle', { r: 1 }), s('path', { d: 'M-1.6 0H1.6M0 -1.6V1.6' })),
        s('text', { class: 'chart-label chart-label--landing' }, 'Landing'),
      ),
    );

    this.#tag = h('span', { class: 'bln__tag' });
    this.#balloon = h(
      'div',
      { class: 'bln' },
      h('div', { class: 'bln__shadow' }),
      h('div', { class: 'bln__stand' }, h('div', { class: 'bln__stalk' }), balloonGlyph('bln__glyph'), this.#tag),
    );
    this.#truck = h('div', { class: 'truck', title: 'Chase truck' }, h('span', { class: 'truck__dot' }));
    this.#pickets = [];
    for (let i = PICKET_EVERY; i < this.#world.length - 1; i += PICKET_EVERY) {
      const p = h('div', { class: 'picket' });
      p.dataset.i = String(i);
      this.#pickets.push(p);
    }
    this.html = h('div', { class: 'flight-overlay', 'aria-hidden': 'true' }, ...this.#pickets, this.#truck, this.#balloon);
  }

  /** Arrows showing where each wind level would carry the balloon in 20 minutes. */
  setDrift(winds: WindsAloft): void {
    const from = project(LAUNCH);
    this.#drift.replaceChildren(
      ...winds.levels.map((lvl, k) => {
        const toDeg = (lvl.fromDeg + 180) % 360;
        const end: LatLon = offset(LAUNCH, toDeg, lvl.mph * 0.44704 * DRIFT_MINUTES * 60);
        const p = project(end);
        return s(
          'g',
          { class: `drift drift--${k}` },
          s('path', { class: 'drift-line', d: pathData([from, p]), 'marker-end': 'url(#mt-arrow)' }),
          s('text', { class: 'chart-label chart-label--drift', x: p.x.toFixed(1), y: p.y.toFixed(1) }, lvl.label),
        );
      }),
    );
  }

  setIndex(index: number): void {
    this.#index = index;
    const d = pathData(this.#world.slice(0, index + 1));
    this.#flown.setAttribute('d', d);
    this.#casing.setAttribute('d', d);
    const smp = this.#track.samples[index]!;
    this.#tag.textContent = `${smp.aglFt.toLocaleString('en-US')} ft`;
    for (const p of this.#pickets) p.classList.toggle('is-flown', Number(p.dataset.i) <= index);
    this.#place();
  }

  /** Recompute screen placement after the view (pan, zoom, tilt) changes. */
  layout(toPct: (p: Point) => Point, pxPerMeter: number): void {
    this.#toPct = toPct;
    this.#pxPerMeter = pxPerMeter;
    for (const p of this.#pickets) {
      const i = Number(p.dataset.i);
      this.#position(p, this.#world[i]!, this.#track.samples[i]!.aglFt);
    }
    this.#place();
  }

  /** Current balloon position in world space (for follow mode). */
  get balloonWorld(): Point {
    return this.#world[this.#index]!;
  }

  #place(): void {
    const smp = this.#track.samples[this.#index]!;
    this.#position(this.#balloon, this.#world[this.#index]!, smp.aglFt);
    this.#position(this.#truck, this.#chaseWorld[this.#index]!, 0);
  }

  #position(el: HTMLElement, p: Point, aglFt: number): void {
    const pct = this.#toPct(p);
    el.style.left = `${pct.x}%`;
    el.style.top = `${pct.y}%`;
    const px = aglFt * 0.3048 * this.#pxPerMeter * VERTICAL_EXAGGERATION;
    el.style.setProperty('--h', `${px.toFixed(1)}px`);
  }
}
