import type { ScheduleItem } from '../data/types';
import { h } from '../lib/dom';
import { fmtClock, fmtDate } from '../lib/format';
import { TileElement } from './tile-element';

export const todayISO = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Upcoming flights and club events, with the most recent past items beneath. */
export class FsSchedule extends TileElement<ScheduleItem[]> {
  protected readonly eyebrow = 'Flight schedule';
  protected readonly heading = 'Next up';

  protected renderBody(items: ScheduleItem[]): Node[] {
    const today = todayISO();
    const upcoming = items.filter((i) => i.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    const past = items.filter((i) => i.date < today).sort((a, b) => b.date.localeCompare(a.date));
    const [next, ...later] = upcoming;

    return [
      next
        ? h(
            'div',
            { class: 'next' },
            dateBlock(next.date),
            h(
              'div',
              { class: 'next__copy' },
              h('p', { class: 'next__title' }, next.title),
              h('p', { class: 'next__meta' }, [next.time ? fmtClock(next.time) : null, next.location].filter(Boolean).join(' · ')),
              h('p', { class: 'next__desc' }, next.description),
            ),
          )
        : h(
            'div',
            { class: 'empty' },
            h('p', { class: 'empty__title' }, `Nothing on the books after ${fmtDate(today)}`),
            h('p', { class: 'empty__body' }, 'Add the next sunrise flight in the club app and it shows up here.'),
          ),
      ...(later.length ? [h('h3', { class: 'subhead' }, 'Later'), list(later)] : []),
      ...(past.length ? [h('h3', { class: 'subhead' }, 'Recently'), list(past.slice(0, 3))] : []),
    ];
  }
}

function dateBlock(iso: string): Node {
  const [month, day] = fmtDate(iso, false).split(' ');
  return h('p', { class: 'date-block' }, h('span', {}, month), h('strong', {}, day), h('span', { class: 'visually-hidden' }, iso.slice(0, 4)));
}

function list(items: ScheduleItem[]): Node {
  return h(
    'ul',
    { class: 'rows' },
    ...items.map((i) =>
      h(
        'li',
        { class: 'row' },
        h('span', { class: `kind kind--${i.kind}` }, i.kind === 'flight' ? 'Flight' : 'Event'),
        h('span', { class: 'row__main' }, i.title),
        h('time', { class: 'row__end', datetime: i.date }, fmtDate(i.date, false)),
      ),
    ),
  );
}

customElements.define('fs-schedule', FsSchedule);
