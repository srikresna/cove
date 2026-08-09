import { BaseCellRenderer } from '../../core/property/index.js';
export declare class TextCell extends BaseCellRenderer<string, string> {
    private accessor _inputEle;
    private readonly _keydown;
    private readonly _setValue;
    focusEnd: () => void;
    afterEnterEditingMode(): void;
    beforeExitEditingMode(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const textPropertyConfig: import("../../index.js").PropertyMetaConfig<"text", {}, string, string>;
//# sourceMappingURL=cell-renderer.d.ts.map