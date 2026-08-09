import { LineWidth, StrokeStyle } from '@blocksuite/affine-model';
import { LitElement } from 'lit';
export type LineDetailType = {
    type: 'size';
    value: LineWidth;
} | {
    type: 'style';
    value: StrokeStyle;
};
declare const EdgelessLineStylesPanel_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessLineStylesPanel extends EdgelessLineStylesPanel_base {
    static styles: import("lit").CSSResult;
    select(detail: LineDetailType): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor lineStyle: StrokeStyle;
    accessor lineSize: LineWidth;
    accessor lineStyles: StrokeStyle[];
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-line-styles-panel': EdgelessLineStylesPanel;
    }
}
export {};
//# sourceMappingURL=line-styles-panel.d.ts.map