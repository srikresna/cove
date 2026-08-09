import { EditorChevronDown } from '@blocksuite/affine-components/toolbar';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
export function renderCurrentMenuItemWith(items, currentValue, field) {
    return items.find(({ value }) => value === currentValue)?.[field];
}
export function renderMenu({ label, tooltip, icon, items, currentValue, onPick, }) {
    return html `
    <editor-menu-button
      aria-label="${`${label.toLowerCase()}-menu`}"
      .button=${html `
        <editor-icon-button
          aria-label="${label}"
          .tooltip="${tooltip ?? label}"
        >
          ${icon ?? renderCurrentMenuItemWith(items, currentValue, 'icon')}
          ${EditorChevronDown}
        </editor-icon-button>
      `}
    >
      ${renderMenuItems(items, currentValue, onPick)}
    </editor-menu-button>
  `;
}
export function renderMenuItems(items, currentValue, onPick) {
    return repeat(items, item => item.value, ({ key, value, icon, disabled }) => html `
      <editor-icon-button
        aria-label="${ifDefined(key)}"
        .disabled=${ifDefined(disabled)}
        .tooltip="${ifDefined(key)}"
        .active="${currentValue === value}"
        .activeMode="${'background'}"
        @click=${() => onPick(value)}
      >
        ${icon}
      </editor-icon-button>
    `);
}
export function getRootBlock(ctx) {
    const rootModel = ctx.store.root;
    if (!rootModel)
        return null;
    return ctx.view.getBlock(rootModel.id);
}
