import type { DashboardData, DataSource } from '../../dashboard/data/types';
import { h, replaceChildren } from '../../dashboard/lib/dom';
import { sourceLabel } from '../../dashboard/lib/format';

let uid = 0;

export interface PanelView {
  title: string;
  aside?: Node | null;
  body: Node[];
  sources: DataSource[];
}

/**
 * Glass panel floating over the map. Takes the whole dashboard state and renders its own
 * slice, batched to one animation frame per update. Light DOM so the HUD token sheet themes it.
 */
export abstract class HudPanel extends HTMLElement {
  protected abstract view(data: DashboardData): PanelView;

  #data: DashboardData | null = null;
  #frame = 0;
  protected readonly headingId = `hud-h-${++uid}`;

  set data(next: DashboardData) {
    this.#data = next;
    this.refresh();
  }

  get data(): DashboardData | null {
    return this.#data;
  }

  connectedCallback(): void {
    this.classList.add('panel');
    this.refresh();
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  protected refresh(): void {
    if (this.#frame || !this.isConnected || !this.#data) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      if (this.#data) this.#render(this.view(this.#data));
    });
  }

  #render(v: PanelView): void {
    const unique = [...new Map(v.sources.map((src) => [sourceLabel(src), src])).values()];
    replaceChildren(
      this,
      h(
        'section',
        { class: 'panel__inner', 'aria-labelledby': this.headingId },
        h('header', { class: 'panel__head' }, h('h2', { class: 'panel__title', id: this.headingId }, v.title), v.aside ?? null),
        h('div', { class: 'panel__body' }, ...v.body),
        h(
          'footer',
          { class: 'panel__source' },
          ...unique.map((src) =>
            h('span', { class: 'src' }, h('span', { class: `src__dot src__dot--${src.kind}`, 'aria-hidden': 'true' }), sourceLabel(src)),
          ),
        ),
      ),
    );
  }
}
