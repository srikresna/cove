import { LitElement } from 'lit';
declare const EdgelessLineWidthPanel_base: typeof LitElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EdgelessLineWidthPanel extends EdgelessLineWidthPanel_base {
    private _onSelect;
    render(): import("lit-html").TemplateResult<1>;
    accessor disabled: boolean;
    accessor hasTooltip: boolean;
    accessor lineWidths: number[];
    accessor selectedSize: number;
}
declare global {
    interface HTMLElementTagNameMap {
        'edgeless-line-width-panel': EdgelessLineWidthPanel;
    }
}
export {};
//# sourceMappingURL=line-width-panel.d.ts.map