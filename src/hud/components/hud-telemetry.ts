import { h, s } from '../../dashboard/lib/dom';
import { compass, fmtClock, fmtInt } from '../../dashboard/lib/format';
import type { ClockState, FlightClock } from '../lib/clock';
import type { FlightTrack } from '../lib/sim';
import { clockAt, mslFt, sampleAt } from '../lib/sim';

const W = 280;
const H = 64;

/**
 * Live readout for the simulated balloon. Structure is built once; each clock tick only
 * rewrites text nodes and one SVG attribute, so playback never re-lays out the panel.
 */
export class HudTelemetry extends HTMLElement {
  #track: FlightTrack | null = null;
  #clock: FlightClock | null = null;
  #unsubscribe: (() => void) | null = null;
  #values = new Map<string, HTMLElement>();
  #profileFlown = s('path', { class: 'profile__flown' });
  #profileAll = s('path', { class: 'profile__all' });
  #cursor = s('line', { class: 'profile__cursor', y1: 0, y2: H });

  set track(next: FlightTrack) {
    this.#track = next;
    this.#drawProfile();
    if (this.#clock) this.#update(this.#clock.get());
  }

  set clock(next: FlightClock) {
    this.#unsubscribe?.();
    this.#clock = next;
    this.#unsubscribe = next.subscribe((st) => this.#update(st));
  }

  connectedCallback(): void {
    this.classList.add('panel', 'panel--telemetry');
    const cell = (key: string, label: string) => {
      const dd = h('dd', {}, '–');
      this.#values.set(key, dd);
      return h('div', { class: 'readout' }, h('dt', {}, label), dd);
    };
    this.replaceChildren(
      h(
        'section',
        { class: 'panel__inner', 'aria-labelledby': 'telemetry-h' },
        h(
          'header',
          { class: 'panel__head' },
          h('h2', { class: 'panel__title', id: 'telemetry-h' }, 'Balloon telemetry'),
          h('span', { class: 'call call--sim' }, 'Simulated'),
        ),
        h(
          'dl',
          { class: 'readouts readouts--grid' },
          cell('alt', 'Above field'),
          cell('climb', 'Climb'),
          cell('speed', 'Ground speed'),
          cell('hdg', 'Heading'),
          cell('msl', 'Altitude MSL'),
          cell('time', 'Local time'),
        ),
        h(
          'figure',
          { class: 'profile' },
          s(
            'svg',
            { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Altitude profile of the simulated flight' },
            this.#profileAll,
            this.#profileFlown,
            this.#cursor,
          ),
        ),
        h(
          'footer',
          { class: 'panel__source' },
          h('span', { class: 'src' }, h('span', { class: 'src__dot src__dot--example', 'aria-hidden': 'true' }), 'Simulation from forecast winds. No live balloon feed.'),
        ),
      ),
    );
    this.#drawProfile();
    if (this.#clock) this.#update(this.#clock.get());
  }

  disconnectedCallback(): void {
    this.#unsubscribe?.();
  }

  #x = (minute: number): number => (minute / (this.#track?.durationMin || 1)) * W;
  #y = (alt: number): number => H - 4 - (alt / Math.max(1, this.#track?.maxAltFt ?? 1)) * (H - 10);

  #path(until: number): string {
    const t = this.#track;
    if (!t) return '';
    const pts = t.samples.filter((p) => p.minute <= until).map((p) => `${this.#x(p.minute).toFixed(1)},${this.#y(p.altFt).toFixed(1)}`);
    return pts.length ? `M${pts.join(' L')}` : '';
  }

  #drawProfile(): void {
    if (!this.#track) return;
    this.#profileAll.setAttribute('d', this.#path(Infinity));
  }

  #update(st: ClockState): void {
    const t = this.#track;
    if (!t || !this.#values.size) return;
    const now = sampleAt(t, st.minute);
    const set = (k: string, v: string) => {
      const el = this.#values.get(k);
      if (el && el.textContent !== v) el.textContent = v;
    };
    const climb = Math.round(now.climbFpm / 10) * 10;
    set('alt', `${fmtInt(Math.round(now.altFt))} ft`);
    set('climb', climb === 0 ? 'Level' : `${climb > 0 ? '+' : '−'}${fmtInt(Math.abs(climb))} fpm`);
    set('speed', `${now.speedMph.toFixed(1)} mph`);
    set('hdg', `${Math.round(now.headingDeg)}° ${compass(now.headingDeg)}`);
    set('msl', `${fmtInt(mslFt(now))} ft`);
    set('time', clockAt(t, st.minute) ? fmtClock(clockAt(t, st.minute)) : '–');
    this.#profileFlown.setAttribute('d', `${this.#path(st.minute)} L${this.#x(st.minute).toFixed(1)},${this.#y(now.altFt).toFixed(1)}`);
    this.#cursor.setAttribute('x1', this.#x(st.minute).toFixed(1));
    this.#cursor.setAttribute('x2', this.#x(st.minute).toFixed(1));
  }
}

customElements.define('hud-telemetry', HudTelemetry);
