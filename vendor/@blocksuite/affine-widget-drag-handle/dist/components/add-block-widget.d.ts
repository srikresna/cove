import { LitElement } from 'lit';
import type { AFFINE_ADD_BLOCK_WIDGET } from '../consts.js';
export declare class AffineAddBlockWidget extends LitElement {
    static styles: import("lit").CSSResult;
    accessor visible: boolean;
    private readonly _handleClick;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        [AFFINE_ADD_BLOCK_WIDGET]: AffineAddBlockWidget;
    }
}
//# sourceMappingURL=add-block-widget.d.ts.map