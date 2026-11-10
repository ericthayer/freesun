import { h, s } from '../../dashboard/lib/dom';
import { fmtClock } from '../../dashboard/lib/format';
import type { ClockState, FlightClock } from '../lib/clock';
import type { FlightTrack } from '../lib/sim';
import { clockAt } from '../lib/sim';

const PLAY = 'M8 5v14l11-7z';
const PAUSE = 'M7 5h4v14H7zM13 5h4v14h-4z';

/** Play/pause and a native range scrubber for the simulated flight. */
export class HudReplay extends HTMLElement {
  #clock: FlightClock | null = null;
  #track: FlightTrack | null = null;
  #unsubscribe: (() => void) | null = null;
  readonly #icon = s('path', { d: PLAY });
  readonly #button = h('button', { type: 'button', class: 'replay__play', 'aria-label': 'Play simulated flight' }, s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, this.#icon));
  readonly #range = h('input', { type: 'range', class: 'replay__range', min: 0, max: 66, step: 0.5, value: 0, id: 'replay-range' });
  readonly #elapsed = h('output', { class: 'replay__elapsed', for: 'replay-range' }, 'T+0 min');
  readonly #start = h('span', { class: 'replay__end' });
  readonly #end = h('span', { class: 'replay__end' });

  set clock(next: FlightClock) {
    this.#unsubscribe?.();
    this.#clock = next;
    this.#unsubscribe = next.subscribe((st) => this.#sync(st));
  }

  set track(next: FlightTrack) {
    this.#track = next;
    this.#range.max = String(next.durationMin);
    this.#start.textContent = fmtClock(next.launchAt);
    this.#end.textContent = fmtClock(clockAt(next, next.durationMin));
    if (this.#clock) this.#sync(this.#clock.get());
  }

  connectedCallback(): void {
    this.classList.add('replay');
    this.replaceChildren(
      this.#button,
      h(
        'div',
        { class: 'replay__scrub' },
        h('label', { class: 'replay__label', for: 'replay-range' }, 'Simulated sunrise flight'),
        h('div', { class: 'replay__row' }, this.#start, this.#range, this.#end),
      ),
      this.#elapsed,
    );
    this.#button.addEventListener('click', this.#toggle);
    this.#range.addEventListener('input', this.#scrub);
  }

  disconnectedCallback(): void {
    this.#unsubscribe?.();
    this.#button.removeEventListener('click', this.#toggle);
    this.#range.removeEventListener('input', this.#scrub);
  }

  #toggle = (): void => {
    const c = this.#clock;
    if (!c) return;
    if (c.get().playing) c.pause();
    else c.play();
  };

  #scrub = (): void => {
    this.#clock?.pause();
    this.#clock?.seek(Number(this.#range.value));
  };

  #sync(st: ClockState): void {
    const t = this.#track;
    const minute = Math.round(st.minute);
    this.#icon.setAttribute('d', st.playing ? PAUSE : PLAY);
    this.#button.setAttribute('aria-label', st.playing ? 'Pause simulated flight' : 'Play simulated flight');
    if (document.activeElement !== this.#range || st.playing) this.#range.value = String(st.minute);
    const clock = t ? fmtClock(clockAt(t, st.minute)) : '';
    this.#range.setAttribute('aria-valuetext', `${minute} minutes after launch${clock ? `, ${clock}` : ''}`);
    this.#elapsed.textContent = `T+${minute} min`;
  }
}

customElements.define('hud-replay', HudReplay);
