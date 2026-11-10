import type { Sourced } from '../data/types';
import { h, replaceChildren } from '../lib/dom';
import { sourceLabel } from '../lib/format';

let uid = 0;

/**
 * Base class for every bento tile. Light DOM so the shared token sheet themes it;
 * renders are batched to one animation frame per data change.
 */
export abstract class TileElement<T> extends HTMLElement {
  protected abstract readonly eyebrow: string;
  protected abstract readonly heading: string;
  protected abstract renderBody(value: T): Node[];

  #data: Sourced<T> | null = null;
  #frame = 0;
  readonly #headingId = `tile-h-${++uid}`;

  set data(next: Sourced<T>) {
    this.#data = next;
    this.#schedule();
  }

  get data(): Sourced<T> | null {
    return this.#data;
  }

  connectedCallback(): void {
    this.classList.add('tile');
    this.#schedule();
  }

  disconnectedCallback(): void {
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  /** Optional element placed at the right of the tile header (status chip, link). */
  protected headerAside?(value: T): Node | null;

  /** Re-render with current data, e.g. after an observed attribute changes. */
  protected refresh(): void {
    this.#schedule();
  }

  #schedule(): void {
    if (this.#frame || !this.isConnected || !this.#data) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#render();
    });
  }

  #render(): void {
    const data = this.#data;
    if (!data) return;
    const { value, source } = data;
    const section = h(
      'section',
      { class: 'tile__inner', 'aria-labelledby': this.#headingId },
      h(
        'header',
        { class: 'tile__head' },
        h(
          'div',
          { class: 'tile__titles' },
          h('p', { class: 'eyebrow' }, this.eyebrow),
          h('h2', { class: 'tile__title', id: this.#headingId }, this.heading),
        ),
        this.headerAside?.(value) ?? null,
      ),
      h('div', { class: 'tile__body' }, ...this.renderBody(value)),
      h(
        'footer',
        { class: 'tile__source' },
        h('span', { class: `source-dot source-dot--${source.kind}`, 'aria-hidden': 'true' }),
        sourceLabel(source),
      ),
    );
    this.dataset.source = source.kind;
    replaceChildren(this, section);
  }
}
