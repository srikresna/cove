import { LitElement } from 'lit';
import { type AdapterItem } from '../config';
export declare const AFFINE_ADAPTER_PANEL_BODY = "affine-adapter-panel-body";
declare const AdapterPanelBody_base: typeof LitElement;
export declare class AdapterPanelBody extends AdapterPanelBody_base {
    static styles: import("lit").CSSResult;
    get activeAdapter(): AdapterItem;
    get isHtmlPreview(): boolean;
    get htmlContent(): string;
    get markdownContent(): string;
    get plainTextContent(): string;
    get docSnapshot(): import("@blocksuite/store").DocSnapshot | null;
    private _renderHtmlPanel;
    private readonly _renderAdapterContent;
    private readonly _renderAdapterContainer;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_ADAPTER_PANEL_BODY]: AdapterPanelBody;
    }
}
export {};
//# sourceMappingURL=adapter-panel-body.d.ts.map