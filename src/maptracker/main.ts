import './styles/tokens.css';
import './styles/layout.css';
import './styles/map.css';
import './styles/panels.css';
import '../dashboard/components/fs-theme-toggle';
import './components/mt-map';
import './components/mt-profile';
import './components/mt-telemetry';
import './components/mt-winds';
import './components/mt-crew';

import { snapshot } from '../dashboard/data/snapshot';
import { fetchClubTables, fetchWeather } from '../dashboard/data/sources';
import { createClock } from './flight/clock';
import { buildTrack, sampleIndex } from './flight/sim';
import { WINDS_SNAPSHOT, fetchWindsAloft } from './data/winds';
import type { MtMap } from './components/mt-map';
import type { MtProfile } from './components/mt-profile';
import type { MtTelemetry } from './components/mt-telemetry';
import type { MtWinds } from './components/mt-winds';
import type { CrewPanelData, MtCraft, MtCrew } from './components/mt-crew';
import type { Sourced } from '../dashboard/data/types';
import type { WindsAloft } from './data/winds';

const $ = <T extends Element>(sel: string): T => document.querySelector(sel) as T;
const map = $<MtMap>('mt-map');
const profile = $<MtProfile>('mt-profile');
const telemetry = $<MtTelemetry>('mt-telemetry');
const winds = $<MtWinds>('mt-winds');
const crew = $<MtCrew>('mt-crew');
const craft = $<MtCraft>('mt-craft');

const track = buildTrack();
// Open at the top of the climb so the first view shows the flight in progress.
const clock = createClock(24 * 60);

let crewData: CrewPanelData = {
  crew: snapshot.crew,
  fleet: snapshot.fleet,
  schedule: snapshot.schedule,
  weather: snapshot.weather,
};

function applyWinds(src: Sourced<WindsAloft>): void {
  map.winds = src.value;
  winds.data = src;
}

map.init(track);
telemetry.init(track);
profile.init(track, clock, WINDS_SNAPSHOT.value.sunrise);
crew.data = crewData;
craft.data = crewData;
applyWinds(WINDS_SNAPSHOT);

let lastIndex = -1;
clock.subscribe(({ sec }) => {
  const i = sampleIndex(track, sec);
  if (i === lastIndex) return;
  lastIndex = i;
  map.setIndex(i);
  telemetry.setIndex(i);
  winds.highlight(track.samples[i]!.aglFt);
});

document.addEventListener('keydown', (e) => {
  // Space toggles the replay unless a control has focus and needs the key itself.
  const t = e.target as HTMLElement;
  if (e.key !== ' ' || t.closest('button, input, summary, a, [tabindex]')) return;
  e.preventDefault();
  clock.toggle();
});

const status = document.getElementById('sync-status');

Promise.all([fetchWindsAloft(), fetchWeather(), fetchClubTables()]).then(([aloft, weather, club]) => {
  const live: string[] = [];
  if (aloft) {
    applyWinds(aloft);
    profile.setLaunch(aloft.value.sunrise);
    live.push('winds aloft');
  }
  if (weather) live.push('weather');
  live.push(...Object.keys(club));
  crewData = {
    crew: club.crew ?? crewData.crew,
    fleet: club.fleet ?? crewData.fleet,
    schedule: club.schedule ?? crewData.schedule,
    weather: weather ?? crewData.weather,
  };
  crew.data = crewData;
  craft.data = crewData;
  if (status) status.textContent = live.length ? `Live: ${live.join(', ')}` : 'Showing saved snapshot';
});
