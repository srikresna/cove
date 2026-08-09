import { BaseCellRenderer } from '../../core/property/index.js';
export declare class DateCell extends BaseCellRenderer<number, number> {
    private _prevPortalAbortController;
    private readonly openDatePicker;
    private readonly updateValue;
    tempValue$: import("@preact/signals-core").Signal<Date | undefined>;
    format(value?: Date): string;
    formattedTempValue$: import("@preact/signals-core").ReadonlySignal<string>;
    formattedValue$: import("@preact/signals-core").ReadonlySignal<string>;
    afterEnterEditingMode(): void;
    beforeExitEditingMode(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const datePropertyConfig: import("../../index.js").PropertyMetaConfig<"date", {}, number | null, number | null>;
//# sourceMappingURL=cell-renderer.d.ts.map