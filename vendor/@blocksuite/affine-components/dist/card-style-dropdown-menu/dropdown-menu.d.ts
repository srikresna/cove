import { type ToolbarAction, ToolbarContext } from '@blocksuite/affine-shared/services';
import { type ReadonlySignal, type Signal } from '@preact/signals-core';
import { LitElement } from 'lit';
import { type TemplateResult } from 'lit-html';
declare const CardStyleDropdownMenu_base: typeof LitElement;
export declare class CardStyleDropdownMenu extends CardStyleDropdownMenu_base {
    accessor actions: ToolbarAction[];
    accessor context: ToolbarContext;
    accessor styleSignal: Signal<string> | ReadonlySignal<string>;
    icons$: ReadonlySignal<Record<string, TemplateResult>>;
    render(): TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-card-style-dropdown-menu': CardStyleDropdownMenu;
    }
}
export {};
//# sourceMappingURL=dropdown-menu.d.ts.map