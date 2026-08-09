export * from './converts.js';
export * from './number/types.js';
export * from './select/define.js';
export declare const propertyPresets: {
    checkboxPropertyConfig: import("../index.js").PropertyMetaConfig<"checkbox", {}, boolean, boolean>;
    datePropertyConfig: import("../index.js").PropertyMetaConfig<"date", {}, number | null, number | null>;
    imagePropertyConfig: import("../index.js").PropertyMetaConfig<"image", {}, string | null, string | null>;
    multiSelectPropertyConfig: import("../index.js").PropertyMetaConfig<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>;
    numberPropertyConfig: import("../index.js").PropertyMetaConfig<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>;
    progressPropertyConfig: import("../index.js").PropertyMetaConfig<"progress", {}, number, number>;
    selectPropertyConfig: import("../index.js").PropertyMetaConfig<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>;
    textPropertyConfig: import("../index.js").PropertyMetaConfig<"text", {}, string, string>;
};
//# sourceMappingURL=index.d.ts.map