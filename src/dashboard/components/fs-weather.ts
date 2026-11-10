import type { WeatherHour, WeatherReport } from '../data/types';
import { h, s } from '../lib/dom';
import { compass, fmtClock, metersToFeet, skyFromCode } from '../lib/format';
import { TileElement } from './tile-element';

/** Surface-wind limits in mph. Club guidance: no launch above 15 mph; under 8 is ideal. */
const IDEAL_MPH = 8;
const LIMIT_MPH = 15;

type Call = { kind: 'go' | 'caution' | 'nogo'; label: string; reason: string };

export class FsWeather extends TileElement<WeatherReport> {
  protected readonly eyebrow = 'Weather · Chatfield surface';
  protected readonly heading = 'Launch conditions';

  protected headerAside(w: WeatherReport): Node {
    const call = launchCall(w);
    return h('span', { class: `chip chip--${call.kind}` }, call.label);
  }

  protected renderBody(w: WeatherReport): Node[] {
    const call = launchCall(w);
    return [
      h(
        'div',
        { class: 'wx' },
        h(
          'div',
          { class: 'wx__now' },
          h(
            'p',
            { class: 'wx__wind' },
            h('span', { class: 'wx__wind-value' }, w.windMph.toFixed(0)),
            h('span', { class: 'wx__wind-unit' }, 'mph'),
            windArrow(w.windDirDeg),
          ),
          h('p', { class: 'wx__wind-meta' }, `From ${compass(w.windDirDeg)} · gusts ${w.gustMph.toFixed(0)} mph`),
        ),
        h(
          'dl',
          { class: 'wx__stats' },
          stat('Temp', `${Math.round(w.tempF)}°F`),
          stat('Sky', `${skyFromCode(w.weatherCode)}, ${w.cloudCover}% cloud`),
          stat('Humidity', `${w.humidity}%`),
          stat('Field elev.', `${metersToFeet(w.elevationM).toLocaleString('en-US')} ft`),
        ),
      ),
      h('p', { class: 'wx__call' }, h('strong', {}, `Next sunrise ${fmtClock(w.nextSunrise)}. `), call.reason),
      windChart(w.hours, w.nextSunrise),
    ];
  }
}

/** Judge the hour before sunrise through two hours after, when the crew would be inflating and flying. */
function launchCall(w: WeatherReport): Call {
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

function stat(label: string, value: string): Node {
  return h('div', { class: 'wx__stat' }, h('dt', {}, label), h('dd', {}, value));
}

/** Arrow points where the wind is blowing toward. */
function windArrow(fromDeg: number): SVGSVGElement {
  return s(
    'svg',
    { class: 'wx__arrow', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
    s('path', { d: 'M12 3 L18 19 L12 15 L6 19 Z', transform: `rotate(${(fromDeg + 180) % 360} 12 12)` }),
  );
}

/** Hourly sustained wind (bars) and gusts (ticks) against the ideal and limit lines. */
function windChart(hours: WeatherHour[], sunrise: string): Node {
  if (!hours.length) return h('p', { class: 'muted' }, 'Hourly forecast unavailable.');
  const W = 320;
  const H = 150;
  const pad = { t: 10, r: 34, b: 24, l: 8 };
  const max = Math.max(LIMIT_MPH + 3, ...hours.map((hr) => hr.gustMph + 1));
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const y = (v: number) => pad.t + plotH - (v / max) * plotH;
  const band = plotW / hours.length;
  const barW = Math.min(22, band * 0.56);
  const sunriseHour = sunrise.slice(0, 13);

  const rule = (v: number, cls: string, label: string) =>
    s(
      'g',
      { class: cls },
      s('line', { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v) }),
      s('text', { x: W - pad.r + 4, y: y(v) + 4 }, label),
    );

  const bars = hours.map((hr, i) => {
    const cx = pad.l + band * i + band / 2;
    const isSunrise = hr.time.slice(0, 13) === sunriseHour;
    const cls = hr.windMph >= LIMIT_MPH ? 'bar bar--nogo' : hr.windMph >= IDEAL_MPH ? 'bar bar--caution' : 'bar';
    return s(
      'g',
      {},
      s('title', {}, `${fmtClock(hr.time)}: ${hr.windMph.toFixed(1)} mph, gusts ${hr.gustMph.toFixed(1)} mph`),
      s('rect', { x: cx - barW / 2, y: y(hr.windMph), width: barW, height: Math.max(1, y(0) - y(hr.windMph)), rx: 3, class: cls }),
      s('line', { x1: cx - barW / 2, x2: cx + barW / 2, y1: y(hr.gustMph), y2: y(hr.gustMph), class: 'gust' }),
      s('text', { x: cx, y: H - 8, class: isSunrise ? 'axis axis--sunrise' : 'axis', 'text-anchor': 'middle' }, fmtClock(hr.time).replace(':00', '').replace(' ', '')),
    );
  });

  return h(
    'figure',
    { class: 'wx__chart' },
    s(
      'svg',
      { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Hourly surface wind around the next sunrise, with the 8 and 15 mph lines' },
      s('line', { x1: pad.l, x2: W - pad.r, y1: y(0), y2: y(0), class: 'baseline' }),
      rule(IDEAL_MPH, 'rule rule--ideal', `${IDEAL_MPH}`),
      rule(LIMIT_MPH, 'rule rule--limit', `${LIMIT_MPH}`),
      ...bars,
    ),
    h(
      'figcaption',
      {},
      h('span', { class: 'legend legend--bar' }, 'Sustained'),
      h('span', { class: 'legend legend--gust' }, 'Gust'),
      h('span', { class: 'legend legend--rule' }, 'mph lines: comfort / club limit'),
    ),
  );
}

customElements.define('fs-weather', FsWeather);
