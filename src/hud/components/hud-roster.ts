import type { DashboardData, DataSource } from '../../dashboard/data/types';
import { h } from '../../dashboard/lib/dom';
import { fmtClock, fmtDate, fmtDuration, fmtInt, initials } from '../../dashboard/lib/format';
import type { PanelView } from './hud-panel';
import { HudPanel } from './hud-panel';

type Tab = 'crew' | 'log' | 'calendar' | 'chat';
const TABS: readonly [Tab, string][] = [
  ['crew', 'Crew'],
  ['log', 'Flight log'],
  ['calendar', 'Calendar'],
  ['chat', 'Chat'],
];
const AVAIL: Record<string, string> = { available: 'Available', busy: 'Busy', unavailable: 'Out' };

/** Crew, log, calendar and chat behind one tab strip (WAI-ARIA tabs, arrow keys move focus). */
export class HudRoster extends HudPanel {
  #tab: Tab = 'crew';
  #focusAfterRender = false;

  protected view(d: DashboardData): PanelView {
    const tabs = h(
      'div',
      { class: 'tabs', role: 'tablist', 'aria-label': 'Crew information' },
      ...TABS.map(([key, label]) => {
        const selected = key === this.#tab;
        const b = h(
          'button',
          {
            type: 'button',
            role: 'tab',
            class: 'tabs__tab',
            id: `${this.headingId}-tab-${key}`,
            'aria-selected': String(selected),
            'aria-controls': `${this.headingId}-panel`,
            tabindex: selected ? 0 : -1,
          },
          label,
        );
        b.addEventListener('click', () => this.#select(key, false));
        b.addEventListener('keydown', (e) => this.#onKey(e));
        if (selected && this.#focusAfterRender) queueMicrotask(() => b.focus());
        return b;
      }),
    );
    this.#focusAfterRender = false;
    const [content, source] = this.#content(d);
    return {
      title: 'Crew room',
      aside: null,
      body: [
        tabs,
        h(
          'div',
          { class: 'tabpanel', role: 'tabpanel', id: `${this.headingId}-panel`, 'aria-labelledby': `${this.headingId}-tab-${this.#tab}`, tabindex: 0 },
          content,
        ),
      ],
      sources: [source],
    };
  }

  #select(tab: Tab, focus: boolean): void {
    this.#tab = tab;
    this.#focusAfterRender = focus;
    this.refresh();
  }

  #onKey(e: KeyboardEvent): void {
    const i = TABS.findIndex(([k]) => k === this.#tab);
    const move: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: TABS.length - 1 - i };
    const step = move[e.key];
    if (step === undefined) return;
    e.preventDefault();
    this.#select(TABS[(i + step + TABS.length) % TABS.length]![0], true);
  }

  #content(d: DashboardData): [Node, DataSource] {
    switch (this.#tab) {
      case 'crew':
        return [
          h(
            'ul',
            { class: 'roster' },
            ...d.crew.value.map((c) =>
              h(
                'li',
                { class: 'roster__row' },
                h('span', { class: `avatar avatar--${c.role === 'Pilot' ? 'pilot' : 'crew'}`, 'aria-hidden': 'true' }, initials(c.name)),
                h(
                  'div',
                  { class: 'roster__who' },
                  h('p', { class: 'roster__name' }, c.name),
                  h('p', { class: 'roster__meta' }, [c.role, c.specialty].filter(Boolean).join(', ')),
                  c.bio ? h('details', { class: 'roster__bio' }, h('summary', {}, 'Bio'), h('p', {}, c.bio)) : null,
                ),
                h(
                  'div',
                  { class: 'roster__stats' },
                  h('p', { class: 'roster__flights' }, fmtInt(c.flights), h('small', {}, ' flights')),
                  h('p', { class: `avail avail--${c.availability}` }, AVAIL[c.availability] ?? c.availability),
                ),
              ),
            ),
          ),
          d.crew.source,
        ];
      case 'log':
        return [
          h(
            'ol',
            { class: 'log' },
            ...d.logs.value.map((l) =>
              h(
                'li',
                { class: 'log__row' },
                h('p', { class: 'log__head' }, h('span', {}, `Log ${l.logNumber}`), h('span', {}, fmtDate(l.date))),
                h('p', { class: 'log__line' }, `${fmtDuration(l.durationMinutes)} to ${l.site}`),
                h('p', { class: 'log__notes' }, l.notes),
              ),
            ),
          ),
          d.logs.source,
        ];
      case 'calendar':
        return [
          h(
            'ol',
            { class: 'log' },
            ...[...d.schedule.value]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((i) =>
                h(
                  'li',
                  { class: 'log__row' },
                  h('p', { class: 'log__head' }, h('span', {}, i.title), h('span', {}, fmtDate(i.date, false))),
                  h('p', { class: 'log__line' }, [i.time ? fmtClock(i.time) : null, i.location].filter(Boolean).join(', ')),
                  h('p', { class: 'log__notes' }, i.description),
                ),
              ),
          ),
          d.schedule.source,
        ];
      case 'chat':
        return [
          h(
            'ol',
            { class: 'chat' },
            ...d.chat.value.map((m) =>
              h(
                'li',
                { class: `chat__msg${m.mine ? ' chat__msg--mine' : ''}` },
                h('p', { class: 'chat__meta' }, `${m.author}, ${m.time}`),
                h('p', {}, m.text),
              ),
            ),
          ),
          d.chat.source,
        ];
    }
  }
}

customElements.define('hud-roster', HudRoster);
