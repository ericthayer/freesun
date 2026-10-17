import { h, s } from '../../dashboard/lib/dom';
import { LAUNCH_SITE } from '../data/chatfield-geo';
import type { FlightClock } from '../lib/clock';
import type { Pt } from '../lib/geo';
import { boxOf, destination, project, smoothPath } from '../lib/geo';
import type { FlightTrack } from '../lib/sim';
import { sampleAt } from '../lib/sim';
import { createAirLayer } from './map-air';
import type { PlaneGeometry } from './map-layers';
import { chartLayer, hudLayer, imageryLayer, landLayer, planeGeometry } from './map-layers';
import { mapControls } from './map-controls';

export type ViewMode = '2d' | '3d';
export type BaseLayer = 'chart' | 'imagery';

const TILT = 56;
const MAX_TURN = 40;

/**
 * Turn the 3D camera (at most 40°) so the drift runs diagonally on screen. Straight up or down
 * the screen, the tether and the ground track would draw on top of each other.
 */
function cameraTurn(headingDeg: number): number {
  let best = 0;
  let score = -1;
  for (let rot = -MAX_TURN; rot <= MAX_TURN; rot++) {
    const s = Math.abs(Math.sin((2 * (headingDeg + rot) * Math.PI) / 180)) - Math.abs(rot) / 400;
    if (s > score) {
      score = s;
      best = rot;
    }
  }
  return best;
}
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 2.6;

/**
 * Chatfield map plane with a CSS 3D tilt and a screen-space overlay for the airborne balloon.
 * Light DOM; attributes `imagery="off"` disables satellite tiles (sandboxed builds).
 */
export class HudMap extends HTMLElement {
  #track: FlightTrack | null = null;
  #clock: FlightClock | null = null;
  #unsubscribe: (() => void) | null = null;
  #geo: PlaneGeometry | null = null;
  #flown: SVGPathElement | null = null;
  #mode: ViewMode = '3d';
  #layer: BaseLayer = 'chart';
  #zoom = 1;
  #vp = { w: 0, h: 0 };
  #frame = 0;
  #animUntil = 0;
  #resize = new ResizeObserver(([entry]) => {
    if (!entry) return;
    this.#vp = { w: entry.contentRect.width, h: entry.contentRect.height };
    this.#air.resize(this.#vp.w, this.#vp.h);
    this.#applyTransform(false);
  });

  readonly #air = createAirLayer();
  readonly #svg = s('svg', { class: 'map__svg', role: 'img' });
  readonly #plane = h('div', { class: 'map__plane' });
  readonly #viewport = h('div', { class: 'map__viewport' });
  readonly #credit = h('p', { class: 'map__credit' });
  readonly #controls = mapControls({
    zoom: (dir) => this.#setZoom(dir === 'in' ? this.#zoom * 1.25 : dir === 'out' ? this.#zoom / 1.25 : 1),
    mode: (m) => this.#setMode(m),
    layer: (l) => this.#setLayer(l),
  });

  set track(next: FlightTrack) {
    this.#track = next;
    this.#build();
  }

  set clock(next: FlightClock) {
    this.#unsubscribe?.();
    this.#clock = next;
    this.#unsubscribe = next.subscribe(() => this.#queueDraw());
  }

  connectedCallback(): void {
    this.classList.add('map');
    if (this.getAttribute('imagery') === 'off') this.#controls.disableImagery('Satellite imagery is not available in this preview');
    else this.#layer = 'imagery';
    this.#plane.append(this.#svg);
    this.#viewport.append(this.#plane, this.#air.root);
    this.replaceChildren(h('div', { class: 'map__sky', 'aria-hidden': 'true' }), this.#viewport, this.#controls.root, this.#credit);
    this.#plane.addEventListener('transitionrun', this.#onTransition);
    this.#resize.observe(this.#viewport);
    this.#build();
  }

  disconnectedCallback(): void {
    this.#resize.disconnect();
    this.#unsubscribe?.();
    cancelAnimationFrame(this.#frame);
    this.#plane.removeEventListener('transitionrun', this.#onTransition);
  }

  #build(): void {
    const track = this.#track;
    if (!track || !this.isConnected) return;
    const geo = planeGeometry(track);
    this.#geo = geo;
    Object.assign(this.#plane.style, {
      width: `${geo.width}px`,
      height: `${geo.height}px`,
      left: `calc(50% - ${geo.width / 2}px)`,
      top: `calc(50% - ${geo.height / 2}px)`,
    });
    this.#svg.setAttribute('viewBox', `0 0 ${geo.width} ${geo.height}`);
    this.#svg.setAttribute('width', String(geo.width));
    this.#svg.setAttribute('height', String(geo.height));
    this.#svg.setAttribute(
      'aria-label',
      `Map of Chatfield State Park with a simulated ${track.durationMin} minute flight from the Montgolfier Balloon Port, drifting ${track.distanceMi.toFixed(1)} miles.`,
    );
    const layers: Node[] = [landLayer(geo), chartLayer(geo), hudLayer(geo, track)];
    if (this.#layer === 'imagery') layers.splice(1, 0, imageryLayer(geo, () => this.#imageryFailed()));
    this.#svg.replaceChildren(...layers);
    this.#flown = this.#svg.querySelector('.track--flown');
    this.#syncChrome();
    this.#applyTransform(false);
  }

  #imageryFailed(): void {
    this.#controls.disableImagery('Satellite imagery could not load here');
    this.#setLayer('chart');
  }

  #setLayer(layer: BaseLayer): void {
    if (layer === this.#layer) return;
    this.#layer = layer;
    this.#build();
  }

  #setMode(mode: ViewMode): void {
    this.#mode = mode;
    this.#syncChrome();
    this.#applyTransform(true);
  }

  #setZoom(z: number): void {
    this.#zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    this.#applyTransform(true);
  }

  #syncChrome(): void {
    this.dataset.mode = this.#mode;
    this.dataset.layer = this.#layer;
    this.#controls.sync(this.#mode, this.#layer);
    this.#credit.textContent =
      this.#layer === 'imagery'
        ? 'Imagery: Esri, Maxar, Earthstar Geographics. Flight path is a simulation.'
        : 'Stylized chart, not for navigation. Flight path is a simulation.';
  }

  /**
   * Fit the whole track plus a mile around the port into the open stage between the panel
   * columns, measured in the camera's turned frame; 3D gets more room since tilt foreshortens.
   */
  #transform(): string {
    const geo = this.#geo;
    const track = this.#track;
    if (!geo || !track || !this.#vp.w) return 'none';
    const lifted = this.#mode === '3d';
    const turn = lifted ? cameraTurn(track.samples[Math.floor(track.samples.length / 2)]?.headingDeg ?? 0) : 0;
    this.#controls.north(turn);
    const rad = (turn * Math.PI) / 180;
    const turned = (p: Pt): Pt => ({
      x: p.x * Math.cos(rad) - p.y * Math.sin(rad),
      y: p.x * Math.sin(rad) + p.y * Math.cos(rad),
    });
    const local = [
      ...track.samples.map((x) => geo.local(project(x.at))),
      ...[0, 90, 180, 270].map((b) => geo.local(project(destination(LAUNCH_SITE, b, 1609.344)))),
    ];
    const box = boxOf(local.map(turned));
    const { left, right } = this.#stageInsets();
    const openW = Math.max(240, this.#vp.w - left - right);
    const fit = Math.min((openW * (lifted ? 0.9 : 0.8)) / (box.maxX - box.minX), (this.#vp.h * (lifted ? 1.25 : 0.72)) / (box.maxY - box.minY));
    const scale = fit * this.#zoom;
    this.style.setProperty('--k', Math.max(0.8, Math.min(2.6, 1 / scale)).toFixed(2));
    const mid = boxOf(local);
    const fx = (mid.minX + mid.maxX) / 2 - geo.width / 2;
    const fy = (mid.minY + mid.maxY) / 2 - geo.height / 2;
    const shiftX = (left - right) / 2;
    if (!lifted) return `translate(${shiftX}px, 0px) perspective(1200px) rotateX(0deg) rotateZ(0deg) scale(${scale}) translate(${-fx}px, ${-fy}px)`;
    return `translate(${shiftX}px, ${this.#vp.h * 0.1}px) perspective(1100px) rotateX(${TILT}deg) rotateZ(${turn}deg) scale(${scale}) translate(${-fx}px, ${-fy}px)`;
  }

  /** Width the floating panel columns cover on each side, so the flight centres in the open map. */
  #stageInsets(): { left: number; right: number } {
    if (this.#vp.w <= 980) return { left: 0, right: 0 };
    const css = getComputedStyle(this);
    const px = (name: string) => parseFloat(css.getPropertyValue(name)) || 0;
    const gap = px('--gap');
    return { left: px('--rail') + px('--col-left') + gap * 2, right: px('--col-right') + gap * 2 };
  }

  #applyTransform(animate: boolean): void {
    this.#plane.classList.toggle('is-animating', animate);
    this.#plane.style.transform = this.#transform();
    this.#queueDraw();
  }

  #onTransition = (): void => {
    this.#animUntil = performance.now() + 900;
    this.#queueDraw();
  };

  #queueDraw(): void {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#draw();
      if (performance.now() < this.#animUntil) this.#queueDraw();
    });
  }

  #draw(): void {
    const geo = this.#geo;
    const track = this.#track;
    if (!geo || !track || !this.#vp.w) return;
    const minute = this.#clock?.get().minute ?? 0;
    const css = getComputedStyle(this.#plane).transform;
    const m = new DOMMatrix(css === 'none' ? undefined : css);
    const toLocal = (x: { at: readonly [number, number] }): Pt => geo.local(project(x.at));
    const toScreen = (p: Pt, height: number): Pt => {
      const q = m.transformPoint(new DOMPoint(p.x - geo.width / 2, p.y - geo.height / 2, height, 1));
      return { x: this.#vp.w / 2 + q.x / q.w, y: this.#vp.h / 2 + q.y / q.w };
    };
    const flownPath = this.#flown;
    if (flownPath) {
      const now = sampleAt(track, minute);
      const flown = track.samples.filter((x) => x.minute < minute).concat(now);
      flownPath.setAttribute('d', smoothPath(flown.map(toLocal)));
    }
    this.#air.draw(track, minute, toLocal, toScreen, this.#mode === '3d');
  }
}

customElements.define('hud-map', HudMap);
