import { BaseCellRenderer } from '../../core/property/index.js';
export declare class ProgressCell extends BaseCellRenderer<number, number> {
    startDrag: (event: MouseEvent) => void;
    get _value(): number;
    _onChange(value?: number): void;
    firstUpdated(): void;
    preventDefault(e: ClipboardEvent): void;
    onCopy(_e: ClipboardEvent): void;
    onCut(_e: ClipboardEvent): void;
    beforeExitEditingMode(): void;
    onPaste(_e: ClipboardEvent): void;
    protected render(): import("lit-html").TemplateResult<1>;
    private accessor _progressBg;
    private accessor tempValue;
}
export declare const progressPropertyConfig: import("../../index.js").PropertyMetaConfig<"progress", {}, number, number>;
//# sourceMappingURL=cell-renderer.d.ts.map