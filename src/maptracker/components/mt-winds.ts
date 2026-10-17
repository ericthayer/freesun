import { h, s, replaceChildren } from '../../dashboard/lib/dom';
import { compass, sourceLabel } from '../../dashboard/lib/format';
import type { Sourced } from '../../dashboard/data/types';
import { clockAt } from './time';
import type { WindsAloft } from '../data/winds';

/** Winds-aloft ladder for the launch hour, highest level on top like a sounding. */
export class MtWinds extends HTMLElement {
  #rows: { el: HTMLLIElement; aglFt: number }[] = [];

  set data(src: Sourced<WindsAloft>) {
    const w = src.value;
    const levels = [...w.levels].sort((a, b) => b.aglFt - a.aglFt);
    this.#rows = levels.map((lvl) => {
      const toDeg = (lvl.fromDeg + 180) % 360;
      const el = h(
        'li',
        { class: 'wind' },
        h('span', { class: 'wind__alt' }, lvl.label),
        s('svg', { class: 'wind__arrow', viewBox: '-10 -10 20 20', 'aria-hidden': 'true', style: `--rot:${toDeg}deg` },
          s('path', { d: 'M0 8V-7M-4.5 -2.5L0 -7L4.5 -2.5' })),
        h('span', { class: 'wind__speed' }, `${Math.round(lvl.mph)} mph`),
        h('span', { class: 'wind__dir' }, `from ${compass(lvl.fromDeg)}`),
      );
      return { el, aglFt: lvl.aglFt };
    });
    replaceChildren(
      this,
      h('h2', { class: 'panel__title' }, 'Winds aloft'),
      h('p', { class: 'panel__sub' }, `Forecast for the ${clockAt(w.hour, 0)} launch hour. Arrows point where the wind carries you.`),
      h('ol', { class: 'winds' }, ...this.#rows.map((r) => r.el)),
      h('p', { class: 'provenance' }, sourceLabel(src.source)),
    );
  }

  /** Highlight the level closest to the balloon's height. */
  highlight(aglFt: number): void {
    if (!this.#rows.length) return;
    const near = this.#rows.reduce((a, b) => (Math.abs(b.aglFt - aglFt) < Math.abs(a.aglFt - aglFt) ? b : a));
    for (const r of this.#rows) r.el.classList.toggle('is-near', r === near);
  }
}

customElements.define('mt-winds', MtWinds);
