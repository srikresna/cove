import { BaseCellRenderer } from '../../core/property/index.js';
export declare class CheckboxCell extends BaseCellRenderer<boolean> {
    static styles: import("lit").CSSResult;
    beforeEnterEditMode(): boolean;
    onCopy(_e: ClipboardEvent): void;
    onCut(_e: ClipboardEvent): void;
    onPaste(_e: ClipboardEvent): void;
    render(): import("lit-html").TemplateResult<1>;
    private accessor _checkbox;
}
export declare const checkboxPropertyConfig: import("../../index.js").PropertyMetaConfig<"checkbox", {}, boolean, boolean>;
//# sourceMappingURL=cell-renderer.d.ts.map