import './styles/hud-tokens.css';
import './styles/hud-shell.css';
import './styles/hud-map.css';
import './styles/hud-panels.css';
import './styles/hud-lists.css';
import './styles/hud-bar.css';
import '../dashboard/components/fs-theme-toggle';
import './components/hud-map';
import './components/hud-flight-card';
import './components/hud-telemetry';
import './components/hud-roster';
import './components/hud-winds';
import './components/hud-replay';
import './components/hud-readouts';

import { snapshot } from '../dashboard/data/snapshot';
import { fetchClubTables, fetchWeather } from '../dashboard/data/sources';
import type { DashboardData } from '../dashboard/data/types';
import { createStore } from '../dashboard/lib/store';
import type { HudMap } from './components/hud-map';
import type { HudReplay } from './components/hud-replay';
import type { HudTelemetry } from './components/hud-telemetry';
import { createClock } from './lib/clock';
import type { FlightTrack } from './lib/sim';
import { simulateFlight } from './lib/sim';

/** Minute the replay opens on: climbed out and cruising, so the curtain and tether read at a glance. */
const OPENING_MINUTE = 22;

if (import.meta.env.VITE_ARTIFACT === 'true') document.querySelectorAll('[data-repo-only]').forEach((el) => el.remove());

const store = createStore(snapshot);
const map = document.querySelector<HudMap>('hud-map');
const telemetry = document.querySelector<HudTelemetry>('hud-telemetry');
const replay = document.querySelector<HudReplay>('hud-replay');
const panels = document.querySelectorAll<HTMLElement & { data: DashboardData }>('hud-flight-card, hud-roster, hud-winds, hud-readouts');

let track: FlightTrack = simulateFlight(snapshot.weather.value);
const clock = createClock(track.durationMin);
clock.seek(OPENING_MINUTE);

function setTrack(next: FlightTrack): void {
  track = next;
  clock.setDuration(next.durationMin);
  if (map) map.track = next;
  if (telemetry) telemetry.track = next;
  if (replay) replay.track = next;
}

if (map) map.clock = clock;
if (telemetry) telemetry.clock = clock;
if (replay) replay.clock = clock;
setTrack(track);

store.subscribe((data, changed) => {
  panels.forEach((p) => (p.data = data));
  if (changed.includes('weather') && data.weather !== snapshot.weather) setTrack(simulateFlight(data.weather.value));
});

const status = document.getElementById('sync-status');

// Live sources replace the snapshot when reachable; failures keep the snapshot quietly.
Promise.all([fetchWeather(), fetchClubTables()]).then(([weather, club]) => {
  const next: Partial<DashboardData> = { ...club };
  if (weather) next.weather = weather;
  store.patch(next);
  if (status) {
    const live = Object.keys(next);
    status.textContent = live.length ? `Live: ${live.join(', ')}. Others from snapshot.` : 'Showing saved snapshot';
  }
});
