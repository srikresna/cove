import { BaseCellRenderer } from '../../core/property/index.js';
import type { NumberPropertyDataType } from './types.js';
export declare class NumberCell extends BaseCellRenderer<number, number, NumberPropertyDataType> {
    private accessor _inputEle;
    private _getFormattedString;
    private readonly _keydown;
    private readonly _setValue;
    focusEnd: () => void;
    _blur(): void;
    _focus(): void;
    afterEnterEditingMode(): void;
    beforeExitEditingMode(): void;
    render(): import("lit-html").TemplateResult<1>;
}
export declare const numberPropertyConfig: import("../../index.js").PropertyMetaConfig<"number", {
    format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
    decimal?: number | undefined;
}, number | null, number | null>;
//# sourceMappingURL=cell-renderer.d.ts.map