export declare const numberPropertyType: {
    type: "number";
    modelConfig: <PropertyData extends Record<string, unknown> = Record<string, never>, RawValue = unknown, JsonValue = unknown>(ops: import("../../index.js").PropertyConfig<PropertyData, RawValue, JsonValue>) => import("../../index.js").PropertyModel<"number", PropertyData, RawValue, JsonValue>;
};
export declare const numberPropertyModelConfig: import("../../index.js").PropertyModel<"number", {
    format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
    decimal?: number | undefined;
}, number | null, number | null>;
//# sourceMappingURL=define.d.ts.map