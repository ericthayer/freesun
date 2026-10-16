import type { FlightLog } from '../data/types';
import { h } from '../lib/dom';
import { fmtDate, fmtDuration } from '../lib/format';
import { TileElement } from './tile-element';

/** Signed-off flight log with airtime totals. */
export class FsFlightLog extends TileElement<FlightLog[]> {
  protected readonly eyebrow = 'Flight log';
  protected readonly heading = 'Time aloft';

  protected renderBody(logs: FlightLog[]): Node[] {
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
    const total = logs.reduce((sum, l) => sum + l.durationMinutes, 0);
    const avg = logs.length ? Math.round(total / logs.length) : 0;
    const longest = logs.reduce((m, l) => Math.max(m, l.durationMinutes), 0);

    return [
      h(
        'dl',
        { class: 'kpis' },
        kpi('Flights logged', String(logs.length)),
        kpi('Total airtime', fmtDuration(total)),
        kpi('Average', fmtDuration(avg)),
        kpi('Longest', fmtDuration(longest)),
      ),
      sorted.length
        ? h(
            'div',
            { class: 'table-wrap' },
            h(
              'table',
              { class: 'log' },
              h('caption', { class: 'visually-hidden' }, 'Flight log entries, newest first'),
              h(
                'thead',
                {},
                h('tr', {}, ...['Log', 'Date', 'Landing site', 'Time', 'Status'].map((c) => h('th', { scope: 'col' }, c))),
              ),
              h(
                'tbody',
                {},
                ...sorted.map((l) =>
                  h(
                    'tr',
                    {},
                    h('td', { class: 'num' }, `#${l.logNumber}`),
                    h('td', {}, h('time', { datetime: l.date }, fmtDate(l.date))),
                    h('td', {}, h('span', { class: 'log__site' }, l.site), h('span', { class: 'log__notes' }, l.notes)),
                    h('td', { class: 'num' }, fmtDuration(l.durationMinutes)),
                    h('td', {}, h('span', { class: 'chip chip--go chip--sm' }, sentenceCase(l.status))),
                  ),
                ),
              ),
            ),
          )
        : h('p', { class: 'empty__body' }, 'No flights logged yet.'),
    ];
  }
}

const sentenceCase = (v: string): string => (v ? v[0]!.toUpperCase() + v.slice(1).toLowerCase() : v);

function kpi(label: string, value: string): Node {
  return h('div', { class: 'kpi' }, h('dt', {}, label), h('dd', {}, value));
}

customElements.define('fs-flight-log', FsFlightLog);
