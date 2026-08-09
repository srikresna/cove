import { type EditorHost } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import { LitElement, nothing } from 'lit';
export declare const AFFINE_MOBILE_OUTLINE_MENU = "affine-mobile-outline-menu";
declare const MobileOutlineMenu_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileOutlineMenu extends MobileOutlineMenu_base {
    static styles: import("lit").CSSResult;
    private readonly _activeHeadingId$;
    private _highlightMaskDisposable;
    private _lockActiveHeadingId;
    private _scrollToBlock;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderItem: (item: BlockModel) => import("lit-html").TemplateResult<1> | typeof nothing;
    render(): unknown;
    accessor editor: EditorHost;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_MOBILE_OUTLINE_MENU]: MobileOutlineMenu;
    }
}
export {};
//# sourceMappingURL=mobile-outline-panel.d.ts.map