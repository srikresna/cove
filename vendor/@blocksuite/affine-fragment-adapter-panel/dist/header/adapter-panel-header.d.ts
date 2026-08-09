import { LitElement } from 'lit';
export declare const AFFINE_ADAPTER_PANEL_HEADER = "affine-adapter-panel-header";
declare const AdapterPanelHeader_base: typeof LitElement;
export declare class AdapterPanelHeader extends AdapterPanelHeader_base {
    static styles: import("lit").CSSResult;
    get activeAdapter(): import("../config").AdapterItem;
    private _adapterMenuAbortController;
    private readonly _toggleAdapterMenu;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _adapterPanelHeader;
    private accessor _adapterSelector;
    accessor updateActiveContent: () => void;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_ADAPTER_PANEL_HEADER]: AdapterPanelHeader;
    }
}
export {};
//# sourceMappingURL=adapter-panel-header.d.ts.map