import type { HistoryEvent } from '../data/types';
import { h } from '../lib/dom';
import { TileElement } from './tile-element';

/** Crew bio and the Chatfield Balloon Port story the crew flies out of. */
export class FsHistory extends TileElement<HistoryEvent[]> {
  protected readonly eyebrow = 'Crew bio & history';
  protected readonly heading = 'Same skies, new generations';

  protected renderBody(events: HistoryEvent[]): Node[] {
    return [
      h(
        'figure',
        { class: 'pull' },
        h(
          'blockquote',
          {},
          h(
            'p',
            {},
            'Doug Lorenz is one of the port’s old-timer pilots, honored on the Chatfield Balloon Port wall among the people who made a difference. Free Sun is his balloon.',
          ),
        ),
        h('figcaption', {}, 'Chatfield Montgolfier Balloon Port history'),
      ),
      h(
        'ol',
        { class: 'timeline' },
        ...events.map((e) =>
          h(
            'li',
            { class: 'timeline__item' },
            h('p', { class: 'timeline__when' }, e.when),
            h('p', { class: 'timeline__title' }, e.title),
            h('p', { class: 'timeline__detail' }, e.detail),
          ),
        ),
      ),
    ];
  }
}

customElements.define('fs-history', FsHistory);
