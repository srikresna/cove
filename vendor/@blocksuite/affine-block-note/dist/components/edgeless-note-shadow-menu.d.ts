import { ColorScheme, NoteShadow } from '@blocksuite/affine-model';
import { LitElement, type PropertyValues } from 'lit';
export declare class EdgelessNoteShadowMenu extends LitElement {
    static styles: import("lit").CSSResult;
    select(value: NoteShadow): void;
    willUpdate(changedProperties: PropertyValues<this>): void;
    render(): unknown;
    accessor background: string;
    accessor theme: ColorScheme;
    accessor value: NoteShadow;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-shadow-menu': EdgelessNoteShadowMenu;
    }
}
//# sourceMappingURL=edgeless-note-shadow-menu.d.ts.map