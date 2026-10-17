import { h, replaceChildren } from '../../dashboard/lib/dom';
import { compass, fmtClock, fmtDate, initials, skyFromCode, sourceLabel } from '../../dashboard/lib/format';
import type { Balloon, CrewMember, ScheduleItem, Sourced, WeatherReport } from '../../dashboard/data/types';
import { balloonGlyph } from './flight-overlay';

export interface CrewPanelData {
  crew: Sourced<CrewMember[]>;
  fleet: Sourced<Balloon[]>;
  schedule: Sourced<ScheduleItem[]>;
  weather: Sourced<WeatherReport>;
}

/** Ground crew roles on a chase, assigned in roster order. */
const CHASE_ROLES = ['Chase driver', 'Crown line', 'Navigator', 'Retrieve'] as const;

/** Who is flying, who is chasing, and what is next on the calendar. */
export class MtCrew extends HTMLElement {
  set data(d: CrewPanelData) {
    const balloon = d.fleet.value.find((b) => b.status === 'active') ?? d.fleet.value[0];
    const pilot = d.crew.value.find((c) => c.role === 'Pilot' && c.availability === 'available');
    const chase = d.crew.value.filter((c) => c.role === 'Ground Crew' && c.availability === 'available').slice(0, CHASE_ROLES.length);
    const today = new Date().toISOString().slice(0, 10);
    const flights = d.schedule.value.filter((x) => x.kind === 'flight');
    const next = flights.filter((f) => f.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    const wx = d.weather.value;

    replaceChildren(
      this,
      h('section', { class: 'craft', 'aria-labelledby': 'mt-craft' },
        balloonGlyph('craft__glyph'),
        h('div', {},
          h('h2', { class: 'craft__name', id: 'mt-craft' }, balloon?.name ?? 'Balloon'),
          h('p', { class: 'craft__spec' }, balloon ? `${balloon.type}, ${balloon.volume}, ${balloon.burner} burner` : ''),
          pilot ? h('p', { class: 'craft__pilot' }, `Pilot in command: ${pilot.name}`) : null)),
      h('section', { class: 'panel', 'aria-labelledby': 'mt-chase' },
        h('h2', { class: 'panel__title', id: 'mt-chase' }, 'Chase crew'),
        chase.length
          ? h('ul', { class: 'roster' }, ...chase.map((c, i) =>
              h('li', { class: 'roster__row' },
                h('span', { class: 'roster__avatar', 'aria-hidden': 'true' }, initials(c.name)),
                h('span', { class: 'roster__name' }, c.name),
                h('span', { class: 'roster__role' }, CHASE_ROLES[i]))))
          : h('p', { class: 'panel__sub' }, 'No ground crew marked available. Update availability in the club app.'),
        h('p', { class: 'provenance' }, sourceLabel(d.crew.source))),
      h('section', { class: 'panel', 'aria-labelledby': 'mt-next' },
        h('h2', { class: 'panel__title', id: 'mt-next' }, 'Next flight'),
        next
          ? h('p', { class: 'next' }, h('strong', {}, next.title), ` ${fmtDate(next.date)}${next.time ? `, ${fmtClock(next.time)}` : ''}, ${next.location}`)
          : h('p', { class: 'panel__sub' }, 'Nothing scheduled. Add the next flight in the club app.'),
        h('p', { class: 'conditions' },
          `Now at the port: ${Math.round(wx.tempF)}°F, ${skyFromCode(wx.weatherCode).toLowerCase()}, wind ${compass(wx.windDirDeg)} ${Math.round(wx.windMph)} mph gusting ${Math.round(wx.gustMph)}. Sunrise ${fmtClock(wx.nextSunrise)}.`),
        h('p', { class: 'provenance' }, `Schedule: ${sourceLabel(d.schedule.source)}. Weather: ${sourceLabel(d.weather.source)}`)),
    );
  }
}

customElements.define('mt-crew', MtCrew);
