import { h, s } from '../../dashboard/lib/dom';
import { UNITS_PER_METER, WORLD, type Point } from '../geo/projection';
import type { FlightTrack } from '../flight/sim';
import type { WindsAloft } from '../data/winds';
import { buildChart, renderTiles, type ChartLayers } from './chart-layers';
import { FlightOverlay, VERTICAL_EXAGGERATION } from './flight-overlay';

/** Satellite tiles need the open web; the artifact build turns them off. */
const TILES_ENABLED = import.meta.env.VITE_MT_TILES !== 'off';
const TILT_SCALE = 1.35;

interface View {
  cx: number;
  cy: number;
  /** World units per screen pixel. */
  upp: number;
}

type LayerKey = 'satellite' | 'drift' | 'contours' | 'chase' | 'rose';
const LAYERS: readonly { key: LayerKey; label: string; on: boolean }[] = [
  ...(TILES_ENABLED ? [{ key: 'satellite' as const, label: 'Satellite imagery', on: false }] : []),
  { key: 'drift', label: 'Wind drift, 20 min', on: true },
  { key: 'contours', label: 'Contours', on: true },
  { key: 'chase', label: 'Chase truck', on: true },
  { key: 'rose', label: 'Compass rose and range rings', on: true },
];

/** The chart: sectional-style vector map, flight overlay, pan/zoom and a 2D/3D tilt. */
export class MtMap extends HTMLElement {
  #view: View = { cx: WORLD.width / 2, cy: WORLD.height / 2, upp: 6 };
  #size = { w: 1, h: 1 };
  #is3d = false;
  #follow = false;
  #satellite = false;
  #chart: ChartLayers | null = null;
  #overlay: FlightOverlay | null = null;
  #svg: SVGSVGElement | null = null;
  #viewport: HTMLDivElement | null = null;
  #scaleBar: HTMLDivElement | null = null;
  #buttons = new Map<string, HTMLButtonElement>();
  #resize = new ResizeObserver(([entry]) => {
    if (!entry) return;
    this.#size = { w: entry.contentRect.width || 1, h: entry.contentRect.height || 1 };
    if (!this.#fitted) {
      this.#fitted = true;
      this.fit();
    } else this.#render();
  });
  #drag: { id: number; x: number; y: number } | null = null;
  #fitted = false;

  init(track: FlightTrack): void {
    this.#chart = buildChart();
    this.#overlay = new FlightOverlay(track);
    this.#svg = s('svg', { class: 'chart', role: 'presentation', preserveAspectRatio: 'xMidYMid slice' },
      this.#chart.root, this.#overlay.svg, this.#chart.labels);

    this.#viewport = h(
      'div',
      {
        class: 'map__viewport',
        tabindex: 0,
        role: 'region',
        'aria-label': 'Flight chart of Chatfield State Park. Arrow keys pan, plus and minus zoom.',
      },
      h('div', { class: 'map__plane' }, this.#svg, this.#overlay.html),
    );
    this.#scaleBar = h('div', { class: 'map__scale', 'aria-hidden': 'true' });

    const btn = (key: string, label: string, onClick: () => void, attrs: Record<string, string> = {}): HTMLButtonElement => {
      const b = h('button', { type: 'button', class: 'tool', ...attrs }, label);
      b.addEventListener('click', onClick);
      this.#buttons.set(key, b);
      return b;
    };
    const tools = h(
      'div',
      { class: 'map__tools', role: 'toolbar', 'aria-label': 'Map view' },
      h('div', { class: 'tool-seg', role: 'group', 'aria-label': 'Perspective' },
        btn('2d', '2D', () => this.#setTilt(false), { 'aria-pressed': 'true' }),
        btn('3d', '3D', () => this.#setTilt(true), { 'aria-pressed': 'false' })),
      btn('follow', 'Follow balloon', () => this.#setFollow(!this.#follow), { 'aria-pressed': 'false' }),
      btn('fit', 'Fit flight', () => this.fit()),
      h('div', { class: 'tool-seg', role: 'group', 'aria-label': 'Zoom' },
        btn('in', '+', () => this.#zoom(1 / 1.4), { 'aria-label': 'Zoom in' }),
        btn('out', '−', () => this.#zoom(1.4), { 'aria-label': 'Zoom out' })),
    );

    const layers = h('details', { class: 'map__layers' }, h('summary', {}, 'Layers'),
      ...LAYERS.map(({ key, label, on }) => {
        const input = h('input', { type: 'checkbox', checked: on, id: `mt-layer-${key}` });
        input.addEventListener('change', () => this.#setLayer(key, input.checked));
        return h('div', { class: 'layer-row' }, input, h('label', { for: `mt-layer-${key}` }, label));
      }));

    this.#attribution = h('p', { class: 'map__attr', hidden: true }, 'Imagery Esri, Maxar, Earthstar Geographics');
    this.#exaggeration = h('p', { class: 'map__exag', hidden: true }, `Altitude drawn ${VERTICAL_EXAGGERATION}× true scale`);
    this.replaceChildren(this.#viewport, tools, layers, this.#scaleBar, this.#exaggeration, this.#attribution);
    this.#bindInput(this.#viewport);
    this.#resize.observe(this.#viewport);
  }

  #attribution: HTMLParagraphElement | null = null;
  #exaggeration: HTMLParagraphElement | null = null;

  set winds(w: WindsAloft) {
    this.#overlay?.setDrift(w);
  }

  setIndex(index: number): void {
    this.#overlay?.setIndex(index);
    if (this.#follow && this.#overlay) {
      const b = this.#overlay.balloonWorld;
      this.#view = { ...this.#view, cx: b.x, cy: b.y };
      this.#render();
    }
  }

  /** Frame the whole track with some breathing room. */
  fit(): void {
    const box = this.#overlay ? this.#trackBox() : { x: 0, y: 0, w: WORLD.width, h: WORLD.height };
    const pad = 1.5;
    const upp = Math.max((box.w * pad) / this.#size.w, (box.h * pad) / this.#size.h, 0.4);
    // Nudge down a little so the toolbar never sits on the landing field.
    this.#view = { cx: box.x + box.w / 2, cy: box.y + box.h / 2 - 20 * upp, upp: this.#clampUpp(upp) };
    this.#render();
  }

  disconnectedCallback(): void {
    this.#resize.disconnect();
  }

  #trackBox(): { x: number; y: number; w: number; h: number } {
    const svg = this.#overlay!.svg.querySelector<SVGPathElement>('.track--planned');
    const chase = this.#overlay!.svg.querySelector<SVGPathElement>('.chase-route');
    const a = svg!.getBBox();
    const b = chase!.getBBox();
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    return { x, y, w: Math.max(a.x + a.width, b.x + b.width) - x, h: Math.max(a.y + a.height, b.y + b.height) - y };
  }

  #clampUpp = (upp: number): number => Math.min(Math.max(upp, 0.35), Math.max(WORLD.width / this.#size.w, WORLD.height / this.#size.h) * 1.1);

  #zoom(factor: number): void {
    this.#view = { ...this.#view, upp: this.#clampUpp(this.#view.upp * factor) };
    this.#render();
  }

  #setTilt(on: boolean): void {
    this.#is3d = on;
    this.toggleAttribute('data-3d', on);
    this.#buttons.get('2d')?.setAttribute('aria-pressed', String(!on));
    this.#buttons.get('3d')?.setAttribute('aria-pressed', String(on));
    if (this.#exaggeration) this.#exaggeration.hidden = !on;
  }

  #setFollow(on: boolean): void {
    this.#follow = on;
    this.#buttons.get('follow')?.setAttribute('aria-pressed', String(on));
    if (on && this.#overlay) {
      const b = this.#overlay.balloonWorld;
      this.#view = { ...this.#view, cx: b.x, cy: b.y };
      this.#render();
    }
  }

  #setLayer(key: LayerKey, on: boolean): void {
    if (key === 'satellite') {
      this.#satellite = on;
      this.toggleAttribute('data-satellite', on);
      if (this.#attribution) this.#attribution.hidden = !on;
      if (!on) this.#chart?.tiles.replaceChildren();
      this.#render();
      return;
    }
    this.toggleAttribute(`data-hide-${key}`, !on);
  }

  #bindInput(vp: HTMLElement): void {
    vp.addEventListener('pointerdown', (e) => {
      this.#drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
      vp.setPointerCapture(e.pointerId);
    });
    vp.addEventListener('pointermove', (e) => {
      if (!this.#drag || this.#drag.id !== e.pointerId) return;
      this.#pan(this.#drag.x - e.clientX, this.#drag.y - e.clientY);
      this.#drag = { ...this.#drag, x: e.clientX, y: e.clientY };
    });
    const end = (): void => {
      this.#drag = null;
    };
    vp.addEventListener('pointerup', end);
    vp.addEventListener('pointercancel', end);
    vp.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.#zoom(Math.exp(e.deltaY * 0.0015));
    }, { passive: false });
    vp.addEventListener('keydown', (e) => {
      const step = 60;
      const keys: Record<string, () => void> = {
        ArrowLeft: () => this.#pan(-step, 0),
        ArrowRight: () => this.#pan(step, 0),
        ArrowUp: () => this.#pan(0, -step),
        ArrowDown: () => this.#pan(0, step),
        '+': () => this.#zoom(1 / 1.4),
        '=': () => this.#zoom(1 / 1.4),
        '-': () => this.#zoom(1.4),
      };
      const fn = keys[e.key];
      if (!fn) return;
      e.preventDefault();
      fn();
    });
  }

  #pan(dxPx: number, dyPx: number): void {
    if (this.#follow) this.#setFollow(false);
    const k = this.#is3d ? 1 / TILT_SCALE : 1;
    const ky = this.#is3d ? k / Math.cos((56 * Math.PI) / 180) / 1.6 : 1;
    this.#view = { ...this.#view, cx: this.#view.cx + dxPx * this.#view.upp * k, cy: this.#view.cy + dyPx * this.#view.upp * ky };
    this.#render();
  }

  #frame = 0;
  #render(): void {
    cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(() => this.#paint());
  }

  /** Keep the chart edge out of view whenever the viewport is smaller than the chart. */
  #clampCenter(): void {
    const { upp } = this.#view;
    const halfW = (this.#size.w * upp) / 2;
    const halfH = (this.#size.h * upp) / 2;
    const clamp = (v: number, half: number, total: number): number =>
      half * 2 >= total ? total / 2 : Math.min(Math.max(v, half), total - half);
    this.#view = { ...this.#view, cx: clamp(this.#view.cx, halfW, WORLD.width), cy: clamp(this.#view.cy, halfH, WORLD.height) };
  }

  #paint(): void {
    if (!this.#svg || !this.#overlay || !this.#chart) return;
    if (!this.#is3d) this.#clampCenter();
    const { cx, cy, upp } = this.#view;
    const vb = { x: cx - (this.#size.w * upp) / 2, y: cy - (this.#size.h * upp) / 2, w: this.#size.w * upp, h: this.#size.h * upp };
    this.#svg.setAttribute('viewBox', `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`);
    this.#svg.style.setProperty('--s', upp.toFixed(4));
    const toPct = (p: Point): Point => ({ x: ((p.x - vb.x) / vb.w) * 100, y: ((p.y - vb.y) / vb.h) * 100 });
    this.#overlay.layout(toPct, UNITS_PER_METER / upp);
    if (this.#satellite) renderTiles(this.#chart.tiles, vb, upp);
    this.#paintScale(upp);
  }

  #paintScale(upp: number): void {
    if (!this.#scaleBar) return;
    const metersPerPx = upp / UNITS_PER_METER;
    const target = 110 * metersPerPx; // meters under ~110px
    const miles = [0.1, 0.25, 0.5, 1, 2, 3, 5].reduce((best, m) =>
      Math.abs(m * 1609.344 - target) < Math.abs(best * 1609.344 - target) ? m : best);
    const px = (miles * 1609.344) / metersPerPx;
    this.#scaleBar.style.setProperty('--w', `${px.toFixed(0)}px`);
    this.#scaleBar.textContent = `${miles} mi`;
  }
}

customElements.define('mt-map', MtMap);
