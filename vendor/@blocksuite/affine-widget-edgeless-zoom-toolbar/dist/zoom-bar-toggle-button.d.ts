import type { BlockStdScope } from '@blocksuite/std';
import { LitElement, nothing } from 'lit';
declare const ZoomBarToggleButton_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class ZoomBarToggleButton extends ZoomBarToggleButton_base {
    static styles: import("lit").CSSResult;
    private _abortController;
    private _closeZoomMenu;
    private get _slots();
    private _toggleZoomMenu;
    disconnectedCallback(): void;
    firstUpdated(): void;
    render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private accessor _showPopper;
    private accessor _toggleButton;
    accessor std: BlockStdScope;
}
export {};
//# sourceMappingURL=zoom-bar-toggle-button.d.ts.map