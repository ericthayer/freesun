import { FLIGHT_SECONDS } from './sim';

export interface ClockState {
  /** Seconds since launch. */
  sec: number;
  playing: boolean;
  /** Simulated seconds per real second. */
  rate: number;
}

type Listener = (state: ClockState) => void;

export interface FlightClock {
  get(): ClockState;
  seek(sec: number): void;
  play(): void;
  pause(): void;
  toggle(): void;
  setRate(rate: number): void;
  subscribe(fn: Listener): () => void;
}

export const RATES = [10, 30, 60] as const;

/** Replay clock: closure state, rAF-driven while playing, listeners notified per frame. */
export function createClock(startSec: number): FlightClock {
  let state: ClockState = { sec: startSec, playing: false, rate: 30 };
  const listeners = new Set<Listener>();
  let frame = 0;
  let last = 0;

  const emit = (): void => listeners.forEach((fn) => fn(state));
  const set = (next: Partial<ClockState>): void => {
    state = { ...state, ...next };
    emit();
  };

  const tick = (now: number): void => {
    const dt = last ? (now - last) / 1000 : 0;
    last = now;
    const sec = Math.min(FLIGHT_SECONDS, state.sec + dt * state.rate);
    if (sec >= FLIGHT_SECONDS) {
      set({ sec, playing: false });
      return;
    }
    set({ sec });
    frame = requestAnimationFrame(tick);
  };

  return {
    get: () => state,
    seek(sec) {
      set({ sec: Math.min(FLIGHT_SECONDS, Math.max(0, sec)) });
    },
    play() {
      if (state.playing) return;
      last = 0;
      set({ playing: true, sec: state.sec >= FLIGHT_SECONDS ? 0 : state.sec });
      frame = requestAnimationFrame(tick);
    },
    pause() {
      cancelAnimationFrame(frame);
      set({ playing: false });
    },
    toggle() {
      if (state.playing) this.pause();
      else this.play();
    },
    setRate(rate) {
      set({ rate });
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(state);
      return () => listeners.delete(fn);
    },
  };
}
