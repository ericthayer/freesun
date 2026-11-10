import { h } from '../lib/dom';

type ThemeChoice = 'system' | 'light' | 'dark';
const ORDER: readonly ThemeChoice[] = ['system', 'light', 'dark'];
const LABEL: Record<ThemeChoice, string> = { system: 'Auto', light: 'Day', dark: 'Night' };
const KEY = 'freesun-theme';

function read(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function apply(choice: ThemeChoice): void {
  const root = document.documentElement;
  if (choice === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', choice);
  try {
    if (choice === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {
    /* storage unavailable: theme still applies for this view */
  }
}

/** Cycles Auto → Day → Night. Auto follows prefers-color-scheme. */
export class FsThemeToggle extends HTMLElement {
  #choice: ThemeChoice = read();
  #button: HTMLButtonElement | null = null;

  connectedCallback(): void {
    apply(this.#choice);
    this.#button = h('button', { type: 'button', class: 'theme-toggle' });
    this.#button.addEventListener('click', this.#cycle);
    this.replaceChildren(this.#button);
    this.#sync();
  }

  disconnectedCallback(): void {
    this.#button?.removeEventListener('click', this.#cycle);
  }

  #cycle = (): void => {
    this.#choice = ORDER[(ORDER.indexOf(this.#choice) + 1) % ORDER.length]!;
    apply(this.#choice);
    this.#sync();
  };

  #sync(): void {
    if (!this.#button) return;
    const next = ORDER[(ORDER.indexOf(this.#choice) + 1) % ORDER.length]!;
    this.#button.textContent = `Theme: ${LABEL[this.#choice]}`;
    this.#button.setAttribute('aria-label', `Theme ${LABEL[this.#choice]}. Switch to ${LABEL[next]}`);
  }
}

customElements.define('fs-theme-toggle', FsThemeToggle);
