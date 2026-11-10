import type { BaconSummary } from '../data/types';
import { h } from '../lib/dom';
import { TileElement } from './tile-element';

/** Summary of the crew's Bacon Tracker with a link to log pounds there. */
export class FsBacon extends TileElement<BaconSummary> {
  protected readonly eyebrow = 'Bacon Tracker';
  protected readonly heading = 'Crew bacon';

  protected renderBody(b: BaconSummary): Node[] {
    const pct = b.goalLb ? Math.min(100, Math.round((b.totalLb / b.goalLb) * 100)) : 0;
    return [
      h(
        'p',
        { class: 'bacon__total' },
        h('strong', {}, String(b.totalLb)),
        h('span', {}, ` of ${b.goalLb} lb this year`),
      ),
      h(
        'div',
        {
          class: 'meter',
          role: 'meter',
          'aria-valuemin': 0,
          'aria-valuemax': b.goalLb,
          'aria-valuenow': b.totalLb,
          'aria-label': 'Yearly bacon goal',
        },
        h('span', { class: 'meter__fill', style: `inline-size:${pct}%` }),
      ),
      h('p', { class: 'muted' }, `${b.crewTags.length} crew tags: ${b.crewTags.join(', ')}`),
      h('a', { class: 'button', href: b.trackerUrl, target: '_blank', rel: 'noopener' }, 'Log bacon'),
    ];
  }
}

customElements.define('fs-bacon', FsBacon);
