import type { AffineTextStyleAttributes } from '@blocksuite/affine-shared/types';
import { LitElement } from 'lit';
export type HighlightType = Pick<AffineTextStyleAttributes, 'color' | 'background'>;
export declare class HighlightDropdownMenu extends LitElement {
    accessor updateHighlight: (styles: HighlightType) => void;
    private readonly _update;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-highlight-dropdown-menu': HighlightDropdownMenu;
    }
}
//# sourceMappingURL=dropdown-menu.d.ts.map