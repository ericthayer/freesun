import type { DashboardData } from '../../dashboard/data/types';
import { h, s } from '../../dashboard/lib/dom';
import { compass, fmtClock } from '../../dashboard/lib/format';
import { IDEAL_MPH, LIMIT_MPH } from '../../dashboard/lib/launch-call';
import type { PanelView } from './hud-panel';
import { HudPanel } from './hud-panel';

/** Hour-by-hour surface wind around sunrise as a horizontal ladder, plus a compass for direction. */
export class HudWinds extends HudPanel {
  protected view(d: DashboardData): PanelView {
    const w = d.weather.value;
    const max = Math.max(LIMIT_MPH + 2, ...w.hours.map((x) => x.gustMph));
    const pct = (v: number) => `${((v / max) * 100).toFixed(1)}%`;
    const sunriseHour = w.nextSunrise.slice(0, 13);

    const ladder = h(
      'ol',
      { class: 'ladder', style: `--ideal:${pct(IDEAL_MPH)};--limit:${pct(LIMIT_MPH)}` },
      ...w.hours.map((x) => {
        const level = x.windMph >= LIMIT_MPH ? 'nogo' : x.windMph >= IDEAL_MPH ? 'caution' : 'go';
        const sunrise = x.time.slice(0, 13) === sunriseHour;
        return h(
          'li',
          { class: `ladder__row${sunrise ? ' ladder__row--sunrise' : ''}` },
          h('span', { class: 'ladder__time' }, fmtClock(x.time).replace(':00', '')),
          h(
            'span',
            { class: 'ladder__track', 'aria-hidden': 'true' },
            h('span', { class: `ladder__bar ladder__bar--${level}`, style: `width:${pct(x.windMph)}` }),
            h('span', { class: 'ladder__gust', style: `left:${pct(x.gustMph)}` }),
          ),
          h('span', { class: 'ladder__value' }, `${x.windMph.toFixed(0)}`, h('small', {}, `/${x.gustMph.toFixed(0)}`)),
          h('span', { class: 'visually-hidden' }, `${x.windMph.toFixed(0)} mph, gusts ${x.gustMph.toFixed(0)}${sunrise ? ', sunrise hour' : ''}`),
        );
      }),
    );

    const rose = s(
      'svg',
      { class: 'rose', viewBox: '-40 -40 80 80', role: 'img', 'aria-label': `Wind from ${compass(w.windDirDeg)}, ${w.windDirDeg} degrees` },
      s('circle', { r: 34, class: 'rose__ring' }),
      ...[0, 90, 180, 270].map((deg) =>
        s('text', { class: 'rose__cardinal', x: 27 * Math.sin((deg * Math.PI) / 180), y: -27 * Math.cos((deg * Math.PI) / 180) + 4, 'text-anchor': 'middle' }, 'NESW'[deg / 90]!),
      ),
      s('path', { class: 'rose__arrow', d: 'M0 -20 L7 14 L0 8 L-7 14 Z', transform: `rotate(${(w.windDirDeg + 180) % 360})` }),
    );

    return {
      title: 'Launch-window winds',
      aside: rose,
      body: [
        ladder,
        h(
          'p',
          { class: 'ladder__legend' },
          h('span', { class: 'key key--bar' }, 'mph sustained/gust'),
          h('span', { class: 'key key--rule' }, `${IDEAL_MPH} comfort, ${LIMIT_MPH} club limit`),
        ),
      ],
      sources: [d.weather.source],
    };
  }
}

customElements.define('hud-winds', HudWinds);
