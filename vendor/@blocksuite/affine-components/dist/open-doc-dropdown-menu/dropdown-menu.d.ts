import { type OpenDocMode, type ToolbarAction, ToolbarContext } from '@blocksuite/affine-shared/services';
import { type ReadonlySignal } from '@preact/signals-core';
import { LitElement } from 'lit';
declare const OpenDocDropdownMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OpenDocDropdownMenu extends OpenDocDropdownMenu_base {
    static styles: import("lit").CSSResult;
    accessor actions: (ToolbarAction & {
        mode: OpenDocMode;
        shortcut?: string;
    })[];
    accessor context: ToolbarContext;
    accessor openDocModeSignal: ReadonlySignal<OpenDocMode>;
    accessor updateOpenDocMode: (mode: OpenDocMode) => void;
    currentAction$: ReadonlySignal<{
        id: string;
        score?: number;
        when?: ((cx: ToolbarContext) => boolean) | boolean;
        active?: ((cx: ToolbarContext) => boolean) | boolean;
        placement?: import("@blocksuite/affine-shared/services").ActionPlacement;
    } & {
        label?: string;
        showLabel?: boolean;
        icon?: import("lit-html").TemplateResult;
        tooltip?: string | import("lit-html").TemplateResult;
        variant?: "destructive";
        disabled?: ((cx: ToolbarContext) => boolean) | boolean;
        content?: ((cx: ToolbarContext) => import("lit-html").TemplateResult | null) | (import("lit-html").TemplateResult | null);
        run?: (cx: ToolbarContext) => void;
    } & {
        mode: OpenDocMode;
        shortcut?: string;
    }>;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-open-doc-dropdown-menu': OpenDocDropdownMenu;
    }
}
export {};
//# sourceMappingURL=dropdown-menu.d.ts.map