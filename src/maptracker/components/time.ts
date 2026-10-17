import { fmtClock } from '../../dashboard/lib/format';

/** Local clock label for `sec` after a "yyyy-mm-ddTHH:mm" launch time, without timezone math. */
export function clockAt(launchLocal: string, sec: number): string {
  const [hh, mm] = (launchLocal.split('T')[1] ?? '07:00').split(':').map(Number);
  const total = (hh ?? 7) * 60 + (mm ?? 0) + Math.floor(sec / 60);
  return fmtClock(`${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`);
}

export function fmtElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${m}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}
