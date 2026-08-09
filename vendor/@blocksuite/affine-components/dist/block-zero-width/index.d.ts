import { type BlockComponent } from '@blocksuite/std';
import { LitElement } from 'lit';
export declare class BlockZeroWidth extends LitElement {
    static styles: import("lit").CSSResult;
    _handleClick: (e: MouseEvent) => void;
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor block: BlockComponent;
}
declare global {
    interface HTMLElementTagNameMap {
        'block-zero-width': BlockZeroWidth;
    }
}
//# sourceMappingURL=index.d.ts.map