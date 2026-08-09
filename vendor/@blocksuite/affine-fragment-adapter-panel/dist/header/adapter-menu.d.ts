import { LitElement } from 'lit';
import { type AdapterItem } from '../config';
export declare const AFFINE_ADAPTER_MENU = "affine-adapter-menu";
declare const AdapterMenu_base: typeof LitElement;
export declare class AdapterMenu extends AdapterMenu_base {
    static styles: import("lit").CSSResult;
    get activeAdapter(): AdapterItem;
    private readonly _handleAdapterChange;
    render(): import("lit-html").TemplateResult<1>;
    accessor abortController: AbortController | null;
    private accessor _context;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_ADAPTER_MENU]: AdapterMenu;
    }
}
export {};
//# sourceMappingURL=adapter-menu.d.ts.map