import { LineWidth, type StrokeStyle } from '@blocksuite/affine-model';
import { ShadowlessElement } from '@blocksuite/std';
export declare class EdgelessNoteBorderDropdownMenu extends ShadowlessElement {
    render(): import("lit-html").TemplateResult<1>;
    accessor lineStyle: StrokeStyle;
    accessor lineSize: LineWidth;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-note-border-dropdown-menu': EdgelessNoteBorderDropdownMenu;
    }
}
//# sourceMappingURL=edgeless-note-border-dropdown-menu.d.ts.map