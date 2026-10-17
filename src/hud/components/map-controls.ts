import { h, s } from '../../dashboard/lib/dom';
import type { BaseLayer, ViewMode } from './hud-map';

type ZoomDir = 'in' | 'out' | 'reset';

interface Handlers {
  zoom(dir: ZoomDir): void;
  mode(mode: ViewMode): void;
  layer(layer: BaseLayer): void;
}

export interface MapControls {
  root: HTMLElement;
  sync(mode: ViewMode, layer: BaseLayer): void;
  disableImagery(reason: string): void;
  /** Rotate the north needle to match the camera turn. */
  north(deg: number): void;
}

const ICONS: Record<ZoomDir, string> = {
  in: 'M12 5v14M5 12h14',
  out: 'M5 12h14',
  reset: 'M12 3v4M12 17v4M3 12h4M17 12h4M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8',
};

const icon = (d: string): SVGSVGElement =>
  s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', class: 'icon' }, s('path', { d }));

function segmented<T extends string>(label: string, options: readonly [T, string][], pick: (v: T) => void) {
  const buttons = options.map(([value, text]) => {
    const b = h('button', { type: 'button', class: 'seg__btn', 'aria-pressed': 'false', 'data-value': value }, text);
    b.addEventListener('click', () => pick(value));
    return b;
  });
  const root = h('div', { class: 'seg', role: 'group', 'aria-label': label }, ...buttons);
  return {
    root,
    buttons,
    sync(value: T) {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
    },
  };
}

/** Zoom, recenter, 2D/3D and base-layer toggles. Native buttons with aria-pressed state. */
export function mapControls(on: Handlers): MapControls {
  const zoomBtn = (dir: ZoomDir, label: string) => {
    const b = h('button', { type: 'button', class: 'map-btn', 'aria-label': label, title: label }, icon(ICONS[dir]));
    b.addEventListener('click', () => on.zoom(dir));
    return b;
  };
  const mode = segmented<ViewMode>('View', [['2d', '2D'], ['3d', '3D']], on.mode);
  const layer = segmented<BaseLayer>('Base map', [['chart', 'Chart'], ['imagery', 'Satellite']], on.layer);
  const needle = s('g', {}, s('path', { class: 'north__n', d: 'M12 3 L16 13 H8 Z' }), s('path', { class: 'north__s', d: 'M8 13 H16 L12 21 Z' }));
  const northLabel = h('span', { class: 'visually-hidden' }, 'North is up');
  const compassRose = h(
    'div',
    { class: 'north', title: 'North' },
    s('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true' }, needle),
    northLabel,
  );
  const root = h(
    'div',
    { class: 'map__controls', role: 'toolbar', 'aria-label': 'Map controls' },
    compassRose,
    h('div', { class: 'map-btn-stack' }, zoomBtn('in', 'Zoom in'), zoomBtn('out', 'Zoom out'), zoomBtn('reset', 'Fit flight')),
    mode.root,
    layer.root,
  );
  return {
    root,
    sync(m, l) {
      mode.sync(m);
      layer.sync(l);
    },
    north(deg) {
      needle.style.transform = `rotate(${deg}deg)`;
      northLabel.textContent = deg ? `North is turned ${Math.abs(deg)} degrees ${deg > 0 ? 'clockwise' : 'counterclockwise'}` : 'North is up';
    },
    disableImagery(reason) {
      const sat = layer.buttons[1];
      if (!sat) return;
      sat.disabled = true;
      sat.title = reason;
    },
  };
}
