import { h, s, replaceChildren } from '../../dashboard/lib/dom';
import type { FlightClock } from '../flight/clock';
import { RATES } from '../flight/clock';
import { FLIGHT_SECONDS, sampleIndex, type FlightTrack } from '../flight/sim';
import { clockAt, fmtElapsed } from './time';

/** Moments worth marking on the cross-section, minutes after launch. */
const EVENTS: readonly { min: number; text: string }[] = [
  { min: 12, text: 'Splash and dash' },
  { min: 24, text: 'Top of climb' },
  { min: 33.5, text: 'Over C-470' },
  { min: 60, text: 'Landing' },
];

const PAD = { l: 52, r: 16, t: 22, b: 26 };

/** Altitude cross-section with the replay scrubber. The range input is the accessible control. */
export class MtProfile extends HTMLElement {
  #track: FlightTrack | null = null;
  #clock: FlightClock | null = null;
  #launch = '';
  #svg = s('svg', { class: 'profile__chart', 'aria-hidden': 'true' });
  #range = h('input', { type: 'range', class: 'profile__range', min: 0, max: FLIGHT_SECONDS, step: 15, 'aria-label': 'Flight time' });
  #play = h('button', { type: 'button', class: 'tool tool--play' });
  #readout = h('p', { class: 'profile__clock' });
  #rates = new Map<number, HTMLButtonElement>();
  #size = { w: 600, h: 160 };
  #cursor: SVGGElement | null = null;
  #flown: SVGPathElement | null = null;
  #ro = new ResizeObserver(([e]) => {
    if (!e) return;
    this.#size = { w: e.contentRect.width, h: e.contentRect.height };
    this.#draw();
  });

  init(track: FlightTrack, clock: FlightClock, launchLocal: string): void {
    this.#track = track;
    this.#clock = clock;
    this.#launch = launchLocal;
    this.#play.addEventListener('click', () => clock.toggle());
    this.#range.addEventListener('input', () => {
      clock.pause();
      clock.seek(Number(this.#range.value));
    });
    const rateGroup = h('div', { class: 'tool-seg', role: 'group', 'aria-label': 'Replay speed' },
      ...RATES.map((r) => {
        const b = h('button', { type: 'button', class: 'tool', 'aria-pressed': 'false' }, `${r}×`);
        b.addEventListener('click', () => clock.setRate(r));
        this.#rates.set(r, b);
        return b;
      }));
    const plot = h('div', { class: 'profile__plot' }, this.#svg, this.#range);
    replaceChildren(
      this,
      h('div', { class: 'profile__bar' },
        h('h2', { class: 'profile__title' }, 'Altitude'),
        this.#play, this.#readout, rateGroup),
      plot,
    );
    this.#ro.observe(plot);
    clock.subscribe((st) => this.#sync(st.sec, st.playing, st.rate));
  }

  /** Launch time changes when live sunrise arrives; only the time labels move. */
  setLaunch(launchLocal: string): void {
    this.#launch = launchLocal;
    this.#draw();
  }

  disconnectedCallback(): void {
    this.#ro.disconnect();
  }

  #x = (sec: number): number => PAD.l + (sec / FLIGHT_SECONDS) * (this.#size.w - PAD.l - PAD.r);
  #yRange = { lo: 5300, hi: 7200 };
  #y = (ft: number): number =>
    PAD.t + (1 - (ft - this.#yRange.lo) / (this.#yRange.hi - this.#yRange.lo)) * (this.#size.h - PAD.t - PAD.b);

  #draw(): void {
    const track = this.#track;
    if (!track) return;
    const { w, h: ht } = this.#size;
    const top = Math.max(...track.samples.map((p) => p.mslFt));
    this.#yRange = { lo: 5300, hi: Math.ceil((top + 250) / 250) * 250 };
    this.#svg.setAttribute('viewBox', `0 0 ${w.toFixed(0)} ${ht.toFixed(0)}`);
    const pts = track.samples;
    const line = (key: 'mslFt' | 'groundFt'): string =>
      pts.map((p, i) => `${i ? 'L' : 'M'}${this.#x(p.t).toFixed(1)} ${this.#y(p[key]).toFixed(1)}`).join('');
    const base = this.#y(this.#yRange.lo);
    const ground = `${line('groundFt')}L${this.#x(FLIGHT_SECONDS).toFixed(1)} ${base}L${PAD.l} ${base}Z`;

    const yTicks: SVGElement[] = [];
    for (let ft = 5500; ft < this.#yRange.hi; ft += 500) {
      const y = this.#y(ft).toFixed(1);
      yTicks.push(s('line', { class: 'grid', x1: PAD.l, x2: w - PAD.r, y1: y, y2: y }));
      yTicks.push(s('text', { class: 'axis', x: PAD.l - 8, y, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ft.toLocaleString('en-US')));
    }
    const xTicks: SVGElement[] = [];
    const every = w < 520 ? 20 : 10;
    for (let m = 0; m <= 60; m += every) {
      const x = this.#x(m * 60).toFixed(1);
      xTicks.push(s('text', { class: 'axis', x, y: ht - 6, 'text-anchor': m === 0 ? 'start' : m === 60 ? 'end' : 'middle' }, clockAt(this.#launch, m * 60)));
    }
    const events = EVENTS.map((ev) => {
      const p = pts[sampleIndex(track, ev.min * 60)]!;
      const x = this.#x(p.t);
      const y = this.#y(p.mslFt);
      return s('g', { class: 'event' },
        s('line', { x1: x.toFixed(1), x2: x.toFixed(1), y1: (y - 6).toFixed(1), y2: (y - 16).toFixed(1) }),
        s('text', { x: x.toFixed(1), y: (y - 19).toFixed(1), 'text-anchor': ev.min >= 60 ? 'end' : 'middle' }, ev.text));
    });

    this.#flown = s('path', { class: 'alt alt--flown' });
    this.#cursor = s('g', { class: 'cursor' },
      s('line', { y1: PAD.t, y2: base }),
      s('circle', { r: 5 }));
    this.#svg.replaceChildren(
      s('text', { class: 'axis axis--unit', x: 4, y: 12 }, 'ft MSL'),
      ...yTicks,
      s('path', { class: 'ground', d: ground }),
      s('path', { class: 'alt alt--planned', d: line('mslFt') }),
      this.#flown,
      ...events,
      ...xTicks,
      this.#cursor,
    );
    const st = this.#clock?.get();
    if (st) this.#sync(st.sec, st.playing, st.rate);
  }

  #sync(sec: number, playing: boolean, rate: number): void {
    const track = this.#track;
    if (!track) return;
    const i = sampleIndex(track, sec);
    const p = track.samples[i]!;
    this.#range.value = String(p.t);
    const clock = clockAt(this.#launch, p.t);
    this.#range.setAttribute('aria-valuetext', `${clock}, ${fmtElapsed(p.t)} after launch, ${p.aglFt.toLocaleString('en-US')} feet above ground`);
    this.#readout.textContent = `${clock}  T+${fmtElapsed(p.t)}`;
    this.#play.textContent = playing ? 'Pause' : sec >= FLIGHT_SECONDS ? 'Replay' : 'Play';
    this.#play.setAttribute('aria-pressed', String(playing));
    for (const [r, b] of this.#rates) b.setAttribute('aria-pressed', String(r === rate));
    if (this.#flown) {
      this.#flown.setAttribute('d', track.samples.slice(0, i + 1)
        .map((q, k) => `${k ? 'L' : 'M'}${this.#x(q.t).toFixed(1)} ${this.#y(q.mslFt).toFixed(1)}`).join(''));
    }
    this.#cursor?.setAttribute('transform', `translate(${this.#x(p.t).toFixed(1)} 0)`);
    this.#cursor?.querySelector('circle')?.setAttribute('cy', this.#y(p.mslFt).toFixed(1));
  }
}

customElements.define('mt-profile', MtProfile);
