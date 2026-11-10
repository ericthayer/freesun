import './styles/tokens.css';
import './styles/dashboard.css';
import './styles/tiles.css';
import './styles/lists.css';
import './components/fs-hero';
import './components/fs-weather';
import './components/fs-schedule';
import './components/fs-flight-log';
import './components/fs-crew';
import './components/fs-history';
import './components/fs-chat';
import './components/fs-bacon';
import './components/fs-theme-toggle';

import { snapshot } from './data/snapshot';
import { fetchClubTables, fetchWeather } from './data/sources';
import type { DashboardData, DashboardKey } from './data/types';
import { createStore } from './lib/store';
import type { TileElement } from './components/tile-element';

const store = createStore(snapshot);

// Bind every [data-key] tile to its slice of the store.
const tiles = new Map<DashboardKey, TileElement<unknown>>();
document.querySelectorAll<HTMLElement>('[data-key]').forEach((el) => {
  tiles.set(el.dataset.key as DashboardKey, el as unknown as TileElement<unknown>);
});

store.subscribe((data: DashboardData, changed) => {
  for (const key of changed) {
    const tile = tiles.get(key);
    if (tile) tile.data = data[key];
  }
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
