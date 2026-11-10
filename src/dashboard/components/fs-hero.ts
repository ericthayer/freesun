import { CHATFIELD } from '../data/snapshot';
import type { Balloon } from '../data/types';
import { h, s } from '../lib/dom';
import { TileElement } from './tile-element';

/** Signature tile: the Free Sun envelope, its specs and the home field. */
export class FsHero extends TileElement<Balloon[]> {
  protected readonly eyebrow = 'Since 1978 · Chatfield, Colorado';
  protected readonly heading = 'Free Sun';

  protected headerAside(fleet: Balloon[]): Node {
    const ship = flagship(fleet);
    const status = ship?.status ?? 'active';
    return h('span', { class: `chip chip--${status === 'active' ? 'go' : 'muted'}` }, status === 'active' ? 'In service' : status[0]!.toUpperCase() + status.slice(1));
  }

  protected renderBody(fleet: Balloon[]): Node[] {
    const ship = flagship(fleet);
    const others = fleet.filter((b) => b !== ship);
    return [
      h(
        'div',
        { class: 'hero' },
        h(
          'div',
          { class: 'hero__copy' },
          h(
            'p',
            { class: 'hero__lede' },
            'Owned and flown by ',
            h('strong', {}, 'Doug Lorenz'),
            ', the 43rd balloon owner registered in Colorado, out of the Montgolfier Balloon Port at Chatfield State Park.',
          ),
          ship
            ? h(
                'dl',
                { class: 'specs' },
                spec('Envelope', ship.volume),
                spec('Make', ship.type),
                spec('Burner', ship.burner),
                spec('Basket', ship.capacity),
              )
            : null,
          h(
            'p',
            { class: 'hero__coords' },
            `${CHATFIELD.field} · N ${CHATFIELD.lat.toFixed(4)}° W ${Math.abs(CHATFIELD.lon).toFixed(4)}°`,
          ),
          others.length
            ? h(
                'p',
                { class: 'hero__fleet' },
                'Also in the hangar: ',
                ...others.map((b, i) => [i ? ', ' : '', `${b.name} (${b.status})`]).flat(),
              )
            : null,
        ),
        balloonArt(),
      ),
    ];
  }
}

const flagship = (fleet: Balloon[]): Balloon | undefined =>
  fleet.find((b) => b.name.toLowerCase() === 'free sun') ?? fleet[0];

function spec(label: string, value: string): Node {
  return h('div', { class: 'specs__row' }, h('dt', {}, label), h('dd', {}, value || '—'));
}

/** Free Sun envelope: lens-shaped gores and a sunburst crest, drawn in theme tokens. */
function balloonArt(): SVGSVGElement {
  const envelope = 'M82 196 C44 160 22 130 22 95 A78 78 0 0 1 178 95 C178 130 156 160 118 196 Z';
  const gores = [78, 58, 38, 18].map((rx, i) =>
    s('ellipse', { cx: 100, cy: 100, rx, ry: 130, class: i % 2 ? 'gore gore--b' : 'gore gore--a' }),
  );
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    return s('line', {
      x1: 100 + Math.cos(a) * 26,
      y1: 88 + Math.sin(a) * 26,
      x2: 100 + Math.cos(a) * 36,
      y2: 88 + Math.sin(a) * 36,
      class: 'sun-ray',
    });
  });
  return s(
    'svg',
    { class: 'hero__art', viewBox: '0 0 200 260', role: 'img', 'aria-label': 'Illustration of the Free Sun balloon' },
    s('defs', {}, s('clipPath', { id: 'fs-envelope' }, s('path', { d: envelope }))),
    s(
      'g',
      { class: 'hero__float' },
      s('path', { d: envelope, class: 'gore gore--base' }),
      s('g', { 'clip-path': 'url(#fs-envelope)' }, ...gores, ...rays, s('circle', { cx: 100, cy: 88, r: 20, class: 'sun-disc' })),
      s('path', { d: envelope, class: 'envelope-edge' }),
      s('path', { d: 'M86 196 L92 222 M114 196 L108 222', class: 'rigging' }),
      s('path', { d: 'M100 204 q-5 8 0 14 q5 -6 0 -14 Z', class: 'flame' }),
      s('rect', { x: 88, y: 222, width: 24, height: 18, rx: 3, class: 'basket' }),
    ),
  );
}

customElements.define('fs-hero', FsHero);
