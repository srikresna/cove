export declare const presetPropertyConverts: ({
    from: any;
    to: any;
    convert: import("../index.js").ConvertFunction<import("../index.js").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>, import("../index.js").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>>;
} | {
    from: any;
    to: any;
    convert: import("../index.js").ConvertFunction<import("../index.js").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>, import("../index.js").PropertyModel<"progress", {}, number, number>>;
} | {
    from: any;
    to: any;
    convert: import("../index.js").ConvertFunction<import("../index.js").PropertyModel<"progress", {}, number, number>, import("../index.js").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>>;
} | {
    from: any;
    to: any;
    convert: import("../index.js").ConvertFunction<import("../index.js").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>, import("../index.js").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>>;
})[];
//# sourceMappingURL=converts.d.ts.map