/** Replay clock for the simulated flight. Closures and listeners, no framework. */

export interface ClockState {
  minute: number;
  playing: boolean;
  duration: number;
}

type Listener = (state: ClockState) => void;

export interface FlightClock {
  get(): ClockState;
  seek(minute: number): void;
  play(): void;
  pause(): void;
  setDuration(duration: number): void;
  subscribe(fn: Listener): () => void;
}

/** Sim minutes per real second while playing. */
const RATE = 1.6;

export function createClock(duration: number): FlightClock {
  let state: ClockState = { minute: 0, playing: false, duration };
  let frame = 0;
  let last = 0;
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((fn) => fn(state));
  const set = (next: Partial<ClockState>) => {
    state = { ...state, ...next };
    emit();
  };

  const tick = (now: number) => {
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    const minute = Math.min(state.duration, state.minute + dt * RATE);
    if (minute >= state.duration) {
      frame = 0;
      set({ minute, playing: false });
      return;
    }
    set({ minute });
    frame = requestAnimationFrame(tick);
  };

  return {
    get: () => state,
    seek(minute) {
      set({ minute: Math.max(0, Math.min(state.duration, minute)) });
    },
    play() {
      if (state.playing) return;
      if (state.minute >= state.duration) state = { ...state, minute: 0 };
      last = 0;
      set({ playing: true });
      frame = requestAnimationFrame(tick);
    },
    pause() {
      cancelAnimationFrame(frame);
      frame = 0;
      set({ playing: false });
    },
    setDuration(next) {
      set({ duration: next, minute: Math.min(state.minute, next) });
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(state);
      return () => listeners.delete(fn);
    },
  };
}
