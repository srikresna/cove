import type { PropertyMetaConfig } from '@blocksuite/data-view';
export declare const queryBlockColumns: (PropertyMetaConfig<"date", {}, number | null, number | null> | PropertyMetaConfig<"number", {
    format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
    decimal?: number | undefined;
}, number | null, number | null> | PropertyMetaConfig<"progress", {}, number, number> | PropertyMetaConfig<"select", {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}, string | null, string | null> | PropertyMetaConfig<"multi-select", {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}, string[], string[]> | PropertyMetaConfig<"checkbox", {}, boolean, boolean>)[];
export declare const queryBlockHiddenColumns: PropertyMetaConfig<string, any, any, any>[];
export declare const queryBlockAllColumnMap: {
    [k: string]: PropertyMetaConfig;
};
//# sourceMappingURL=index.d.ts.map