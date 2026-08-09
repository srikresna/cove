import { VirtualKeyboardProvider } from '@blocksuite/affine-shared/services';
import { LitElement, nothing } from 'lit';
import type { LinkedDocContext } from './config.js';
export declare const AFFINE_MOBILE_LINKED_DOC_MENU = "affine-mobile-linked-doc-menu";
declare const AffineMobileLinkedDocMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AffineMobileLinkedDocMenu extends AffineMobileLinkedDocMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _expand;
    private readonly _linkedDocGroup$;
    private readonly _renderGroup;
    private readonly _renderItem;
    private readonly _scrollInputToTop;
    private readonly _updateLinkedDocGroup;
    private _updateLinkedDocGroupAbortController;
    private get _query();
    get keyboard(): VirtualKeyboardProvider | import("@blocksuite/affine-shared/services").VirtualKeyboardProviderWithAction;
    connectedCallback(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    accessor context: LinkedDocContext;
}
export {};
//# sourceMappingURL=mobile-linked-doc-menu.d.ts.map