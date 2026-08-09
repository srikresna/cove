import zod from 'zod';
export declare const NumberPropertySchema: zod.ZodObject<{
    decimal: zod.ZodOptional<zod.ZodNumber>;
    format: zod.ZodEnum<["number", "numberWithCommas", "percent", "currencyYen", "currencyINR", "currencyCNY", "currencyUSD", "currencyEUR", "currencyGBP"]>;
}, "strip", zod.ZodTypeAny, {
    format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
    decimal?: number | undefined;
}, {
    format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
    decimal?: number | undefined;
}>;
export type NumberPropertyDataType = zod.infer<typeof NumberPropertySchema>;
//# sourceMappingURL=types.d.ts.map