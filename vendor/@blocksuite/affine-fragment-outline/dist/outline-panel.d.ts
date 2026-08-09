import { type EditorHost, ShadowlessElement } from '@blocksuite/std';
import { type PropertyValues } from 'lit';
export declare const AFFINE_OUTLINE_PANEL = "affine-outline-panel";
declare const OutlinePanel_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class OutlinePanel extends OutlinePanel_base {
    private _getEditorMode;
    private _setContext;
    private _watchSettingsChange;
    connectedCallback(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1> | undefined;
    private accessor _context;
    accessor editor: EditorHost;
    accessor fitPadding: number[];
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_OUTLINE_PANEL]: OutlinePanel;
    }
}
export {};
//# sourceMappingURL=outline-panel.d.ts.map