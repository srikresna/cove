import { type EditorHost, ShadowlessElement } from '@blocksuite/std';
import { nothing, type PropertyValues } from 'lit';
export declare const AFFINE_OUTLINE_VIEWER = "affine-outline-viewer";
declare const OutlineViewer_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlineViewer extends OutlineViewer_base {
    static styles: import("lit").CSSResult;
    private readonly _activeHeadingId$;
    private _highlightMaskDisposable;
    private _lockActiveHeadingId;
    private readonly _scrollPanel;
    private _scrollToBlock;
    private _toggleOutlinePanel;
    private _setContext;
    connectedCallback(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1> | typeof nothing;
    private accessor _context;
    private accessor _activeItem;
    private accessor _showViewer;
    accessor editor: EditorHost;
    accessor toggleOutlinePanel: (() => void) | null;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_VIEWER]: OutlineViewer;
    }
}
export {};
//# sourceMappingURL=outline-viewer.d.ts.map