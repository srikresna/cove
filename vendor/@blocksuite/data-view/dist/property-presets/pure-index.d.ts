export declare const propertyModelPresets: {
    checkboxPropertyModelConfig: import("../index.js").PropertyModel<"checkbox", {}, boolean, boolean>;
    datePropertyModelConfig: import("../index.js").PropertyModel<"date", {}, number | null, number | null>;
    imagePropertyModelConfig: import("../index.js").PropertyModel<"image", {}, string | null, string | null>;
    multiSelectPropertyModelConfig: import("../index.js").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>;
    numberPropertyModelConfig: import("../index.js").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>;
    progressPropertyModelConfig: import("../index.js").PropertyModel<"progress", {}, number, number>;
    selectPropertyModelConfig: import("../index.js").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>;
    textPropertyModelConfig: import("../index.js").PropertyModel<"text", {}, string, string>;
};
//# sourceMappingURL=pure-index.d.ts.map