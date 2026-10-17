import { h, replaceChildren } from '../../dashboard/lib/dom';
import { compass, fmtInt } from '../../dashboard/lib/format';
import { LAUNCH } from '../geo/chatfield';
import { distanceMeters } from '../geo/projection';
import type { FlightTrack } from '../flight/sim';
import type { WindsAloft } from '../data/winds';

interface Readout {
  value: HTMLElement;
  unit: HTMLElement;
  note: HTMLElement;
}

const KEYS = ['alt', 'speed', 'track', 'climb', 'range', 'chase'] as const;
type Key = (typeof KEYS)[number];
const LABEL: Record<Key, string> = {
  alt: 'Altitude above ground',
  speed: 'Ground speed',
  track: 'Track',
  climb: 'Vertical speed',
  range: 'From launch',
  chase: 'Chase truck gap',
};

/** Live readouts for the replay position. Updated per frame, so no live region here. */
export class MtTelemetry extends HTMLElement {
  #track: FlightTrack | null = null;
  #winds: WindsAloft | null = null;
  #out = new Map<Key, Readout>();
  #wind = h('p', { class: 'telemetry__wind' });

  init(track: FlightTrack): void {
    this.#track = track;
    const list = h('dl', { class: 'telemetry' });
    for (const key of KEYS) {
      const r: Readout = { value: h('span', { class: 'readout__value' }), unit: h('span', { class: 'readout__unit' }), note: h('span', { class: 'readout__note' }) };
      this.#out.set(key, r);
      list.append(h('div', { class: `readout readout--${key}` }, h('dt', {}, LABEL[key]), h('dd', {}, r.value, r.unit, r.note)));
    }
    replaceChildren(this, list, this.#wind);
  }

  set winds(w: WindsAloft) {
    this.#winds = w;
  }

  setIndex(i: number): void {
    const track = this.#track;
    if (!track) return;
    const p = track.samples[i]!;
    const set = (k: Key, value: string, unit: string, note = ''): void => {
      const r = this.#out.get(k)!;
      r.value.textContent = value;
      r.unit.textContent = unit;
      r.note.textContent = note;
    };
    set('alt', fmtInt(p.aglFt), 'ft', `${fmtInt(p.mslFt)} ft MSL`);
    set('speed', p.speedMph.toFixed(1), 'mph');
    set('track', String(Math.round(p.trackDeg)).padStart(3, '0'), '°', i ? compass(p.trackDeg) : '');
    const fpm = Math.round(p.climbFpm / 10) * 10;
    set('climb', `${fpm > 0 ? '+' : fpm < 0 ? '−' : ''}${fmtInt(Math.abs(fpm))}`, 'fpm', fpm > 50 ? 'Climbing' : fpm < -50 ? 'Descending' : 'Level');
    set('range', (distanceMeters(LAUNCH, p.at) / 1609.344).toFixed(2), 'mi');
    set('chase', (distanceMeters(track.chase[i]!, p.at) / 1609.344).toFixed(2), 'mi');

    const w = this.#winds;
    if (w && w.levels.length) {
      const near = w.levels.reduce((a, b) => (Math.abs(b.aglFt - p.aglFt) < Math.abs(a.aglFt - p.aglFt) ? b : a));
      this.#wind.textContent = `Forecast wind near this height (${near.label}): ${compass(near.fromDeg)} at ${Math.round(near.mph)} mph.`;
    }
  }
}

customElements.define('mt-telemetry', MtTelemetry);
