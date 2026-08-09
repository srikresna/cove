import type { Store, TransformerMiddleware } from '@blocksuite/affine/store';
import { LitElement, type PropertyValues } from 'lit';
export declare const AFFINE_ADAPTER_PANEL = "affine-adapter-panel";
declare const AdapterPanel_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class AdapterPanel extends AdapterPanel_base {
    static styles: import("lit").CSSResult;
    get activeAdapter(): import("./config").AdapterItem;
    private _createJob;
    private _getDocSnapshot;
    private _getHtmlContent;
    private _getMarkdownContent;
    private _getPlainTextContent;
    private readonly _updateActiveContent;
    connectedCallback(): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor store: Store;
    accessor transformerMiddlewares: TransformerMiddleware[];
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_ADAPTER_PANEL]: AdapterPanel;
    }
}
export {};
//# sourceMappingURL=adapter-panel.d.ts.map