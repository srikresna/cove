import { type Rect } from '@blocksuite/global/gfx';
import { LitElement } from 'lit';
export declare class DropIndicator extends LitElement {
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1> | null;
    accessor rect: Rect | null;
    accessor zIndex: number;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-drop-indicator': DropIndicator;
    }
}
//# sourceMappingURL=drop-indicator.d.ts.map