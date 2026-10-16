import type { ChatMessage } from '../data/types';
import { h } from '../lib/dom';
import { TileElement } from './tile-element';

/**
 * Crew WhatsApp thread. WhatsApp offers no read API for group chats, so this tile
 * renders whatever messages it is handed (a bot relay or exported chat) and links
 * out to the group when an `invite-url` attribute is set.
 */
export class FsChat extends TileElement<ChatMessage[]> {
  static observedAttributes = ['invite-url'];
  protected readonly eyebrow = 'WhatsApp thread';
  protected readonly heading = 'Crew chat';

  attributeChangedCallback(): void {
    this.refresh();
  }

  protected headerAside(): Node | null {
    const url = this.getAttribute('invite-url');
    return url ? h('a', { class: 'link-chip', href: url, target: '_blank', rel: 'noopener' }, 'Open group') : null;
  }

  protected renderBody(messages: ChatMessage[]): Node[] {
    const isExample = this.data?.source.kind === 'example';
    const notice = h('p', { class: 'notice', role: 'note' }, 'Example messages. Connect the crew group through a WhatsApp bot or chat export to show the real thread.');
    return [
      ...(isExample ? [notice] : []),
      h(
        'ol',
        { class: 'chat', 'aria-live': 'polite' },
        ...messages.map((m) =>
          h(
            'li',
            { class: m.mine ? 'bubble bubble--mine' : 'bubble' },
            h('p', { class: 'bubble__author' }, m.author),
            h('p', { class: 'bubble__text' }, m.text),
            h('p', { class: 'bubble__time' }, m.time),
          ),
        ),
      ),
    ];
  }
}

customElements.define('fs-chat', FsChat);
