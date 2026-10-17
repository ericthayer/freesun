import type { DashboardData, ScheduleItem } from '../../dashboard/data/types';
import { h } from '../../dashboard/lib/dom';
import { compass, fmtClock, fmtDate } from '../../dashboard/lib/format';
import { launchCall } from '../../dashboard/lib/launch-call';
import type { PanelView } from './hud-panel';
import { HudPanel } from './hud-panel';

/** Today in Denver as yyyy-mm-dd, so "upcoming" matches the field's calendar. */
const today = (): string => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });

function calendarLine(items: ScheduleItem[]): string {
  const flights = items.filter((i) => i.kind === 'flight').sort((a, b) => a.date.localeCompare(b.date));
  const next = flights.find((f) => f.date >= today());
  if (next) return `${next.title}, ${fmtDate(next.date, false)}${next.time ? ` at ${fmtClock(next.time)}` : ''}`;
  const last = flights[flights.length - 1];
  return last ? `Nothing booked. Last was ${last.title}, ${fmtDate(last.date)}` : 'Nothing booked yet';
}

/** Sunrise launch window: the call, the numbers behind it, and who would fly. */
export class HudFlightCard extends HudPanel {
  protected view(d: DashboardData): PanelView {
    const w = d.weather.value;
    const call = launchCall(w);
    const pilot = d.crew.value.find((c) => c.role === 'Pilot' && c.availability === 'available');
    const balloon = d.fleet.value.find((b) => b.status === 'active');
    const readout = (label: string, value: string, unit = '') =>
      h('div', { class: 'readout' }, h('dt', {}, label), h('dd', {}, value, unit ? h('small', {}, unit) : null));

    return {
      title: 'Sunrise launch',
      aside: h('span', { class: `call call--${call.kind}` }, call.label),
      body: [
        h(
          'dl',
          { class: 'readouts' },
          readout('Sunrise', fmtClock(w.nextSunrise).replace(/ [AP]M/, ''), fmtClock(w.nextSunrise).slice(-2)),
          readout('Wind now', w.windMph.toFixed(0), `mph ${compass(w.windDirDeg)}`),
          readout('Gusts', w.gustMph.toFixed(0), 'mph'),
        ),
        h('p', { class: 'panel__note' }, call.reason),
        h(
          'dl',
          { class: 'facts' },
          h('div', {}, h('dt', {}, 'Pilot in charge'), h('dd', {}, pilot?.name ?? 'No pilot available')),
          h('div', {}, h('dt', {}, 'Balloon'), h('dd', {}, balloon ? `${balloon.name}, ${balloon.type} ${balloon.volume}` : 'None active')),
          h('div', {}, h('dt', {}, 'Calendar'), h('dd', {}, calendarLine(d.schedule.value))),
        ),
      ],
      sources: [d.weather.source, d.crew.source, d.schedule.source],
    };
  }
}

customElements.define('hud-flight-card', HudFlightCard);
