import type { DashboardData } from '../../dashboard/data/types';
import { h, replaceChildren } from '../../dashboard/lib/dom';
import { metersToFeet, skyFromCode } from '../../dashboard/lib/format';

/** Top-bar instrument strip: field conditions now and the bacon meter. */
export class HudReadouts extends HTMLElement {
  #data: DashboardData | null = null;
  #frame = 0;

  set data(next: DashboardData) {
    this.#data = next;
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#render();
    });
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #render(): void {
    const d = this.#data;
    if (!d) return;
    const w = d.weather.value;
    const bacon = d.bacon.value;
    const item = (label: string, value: string) => h('div', { class: 'strip__item' }, h('dt', {}, label), h('dd', {}, value));
    replaceChildren(
      this,
      h(
        'dl',
        { class: 'strip' },
        item('Field', `${metersToFeet(w.elevationM || 1661).toLocaleString('en-US')} ft`),
        item('Temp', `${Math.round(w.tempF)}°F`),
        item('Sky', skyFromCode(w.weatherCode)),
      ),
      h(
        'a',
        { class: 'bacon', href: bacon.trackerUrl, target: '_blank', rel: 'noopener' },
        h('span', { class: 'bacon__label' }, 'Bacon'),
        h(
          'span',
          { class: 'bacon__meter', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': bacon.goalLb, 'aria-valuenow': bacon.totalLb, 'aria-label': 'Bacon toward goal' },
          h('span', { class: 'bacon__fill', style: `width:${Math.min(100, (bacon.totalLb / bacon.goalLb) * 100)}%` }),
        ),
        h('span', { class: 'bacon__value' }, `${bacon.totalLb} of ${bacon.goalLb} lb`),
        h('span', { class: 'visually-hidden' }, ' (opens the Bacon Tracker in a new tab)'),
      ),
    );
  }
}

customElements.define('hud-readouts', HudReadouts);
