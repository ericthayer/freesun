import type { CrewMember } from '../data/types';
import { h } from '../lib/dom';
import { fmtInt, initials } from '../lib/format';
import { TileElement } from './tile-element';

const AVAILABILITY_LABEL = { available: 'Available', busy: 'Busy', unavailable: 'Off' } as const;

/** Crew roster: pilots first, then by experience. Bios open in place. */
export class FsCrew extends TileElement<CrewMember[]> {
  protected readonly eyebrow = 'Crew information';
  protected readonly heading = 'Who flies';

  protected headerAside(crew: CrewMember[]): Node {
    const ready = crew.filter((c) => c.availability === 'available').length;
    return h('span', { class: 'chip chip--go' }, `${ready} of ${crew.length} available`);
  }

  protected renderBody(crew: CrewMember[]): Node[] {
    const sorted = [...crew].sort(
      (a, b) => Number(b.role === 'Pilot') - Number(a.role === 'Pilot') || b.experienceYears - a.experienceYears,
    );
    const pilots = crew.filter((c) => c.role === 'Pilot').length;
    return [
      h('p', { class: 'muted crew__summary' }, `${pilots} pilots · ${crew.length - pilots} ground crew`),
      h('ul', { class: 'crew' }, ...sorted.map(member)),
    ];
  }
}

function member(c: CrewMember): Node {
  const meta = [
    c.specialty,
    c.experienceYears ? `${c.experienceYears} yrs` : '',
    c.flights ? `${fmtInt(c.flights)} flights` : '',
  ].filter(Boolean);
  const avatar = c.photoUrl
    ? h('img', { class: 'avatar', src: c.photoUrl, alt: '', loading: 'lazy', width: 44, height: 44 })
    : h('span', { class: 'avatar avatar--mono', 'aria-hidden': 'true' }, initials(c.name));
  if (avatar instanceof HTMLImageElement) {
    // Fall back to a monogram when the photo host is blocked or the image is gone.
    avatar.addEventListener('error', () => avatar.replaceWith(h('span', { class: 'avatar avatar--mono', 'aria-hidden': 'true' }, initials(c.name))), { once: true });
  }
  const head = h(
    'div',
    { class: 'crew__row' },
    avatar,
    h(
      'div',
      { class: 'crew__who' },
      h('p', { class: 'crew__name' }, c.name, h('span', { class: `role role--${c.role === 'Pilot' ? 'pilot' : 'ground'}` }, c.role)),
      meta.length ? h('p', { class: 'crew__meta' }, meta.join(' · ')) : null,
    ),
    h(
      'span',
      { class: `avail avail--${c.availability}` },
      h('span', { class: 'avail__dot', 'aria-hidden': 'true' }),
      AVAILABILITY_LABEL[c.availability],
    ),
  );
  if (!c.bio || c.bio === 'New crew member') return h('li', { class: 'crew__item' }, head);
  return h(
    'li',
    { class: 'crew__item' },
    h('details', { class: 'crew__details' }, h('summary', {}, head), h('p', { class: 'crew__bio' }, c.bio)),
  );
}

customElements.define('fs-crew', FsCrew);
