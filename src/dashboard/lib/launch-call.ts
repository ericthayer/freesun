import type { WeatherReport } from '../data/types';

/** Surface-wind limits in mph. Club guidance: no launch above 15 mph; under 8 is ideal. */
export const IDEAL_MPH = 8;
export const LIMIT_MPH = 15;

export type LaunchCall = { kind: 'go' | 'caution' | 'nogo'; label: string; reason: string };

/** Judge the hour before sunrise through two hours after, when the crew would be inflating and flying. */
export function launchCall(w: WeatherReport): LaunchCall {
  const sunriseHour = w.nextSunrise.slice(0, 13);
  const idx = w.hours.findIndex((hr) => hr.time.slice(0, 13) === sunriseHour);
  const window = idx >= 0 ? w.hours.slice(Math.max(0, idx - 1), idx + 3) : w.hours.slice(0, 4);
  if (!window.length) return { kind: 'caution', label: 'No forecast', reason: 'No hourly forecast for the launch window.' };
  const maxWind = Math.max(...window.map((hr) => hr.windMph));
  const maxGust = Math.max(...window.map((hr) => hr.gustMph));
  const spread = Math.max(...window.map((hr) => hr.gustMph - hr.windMph));
  const detail = `Launch window winds peak at ${maxWind.toFixed(0)} mph, gusting ${maxGust.toFixed(0)}.`;
  if (maxWind >= LIMIT_MPH || maxGust >= LIMIT_MPH + 5)
    return { kind: 'nogo', label: 'No-go', reason: `${detail} Above the ${LIMIT_MPH} mph club limit.` };
  if (maxWind >= IDEAL_MPH || spread >= 10)
    return { kind: 'caution', label: 'Marginal', reason: `${detail} Pilot's call at the field.` };
  return { kind: 'go', label: 'Looks flyable', reason: `${detail} Under the ${IDEAL_MPH} mph comfort line.` };
}
