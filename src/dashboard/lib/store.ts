import type { DashboardData, DashboardKey } from '../data/types';

type Listener = (data: DashboardData, changed: readonly DashboardKey[]) => void;

export interface DashboardStore {
  get(): DashboardData;
  patch(next: Partial<DashboardData>): void;
  subscribe(fn: Listener): () => void;
}

/** Tiny observable store: closures, no framework. */
export function createStore(initial: DashboardData): DashboardStore {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    patch(next) {
      const changed = Object.keys(next) as DashboardKey[];
      if (!changed.length) return;
      state = { ...state, ...next };
      listeners.forEach((fn) => fn(state, changed));
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(state, Object.keys(state) as DashboardKey[]);
      return () => listeners.delete(fn);
    },
  };
}
