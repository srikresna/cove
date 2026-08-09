export declare const databasePropertyConverts: ({
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>, import("@blocksuite/data-view").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>, import("@blocksuite/data-view").PropertyModel<"progress", {}, number, number>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"progress", {}, number, number>, import("@blocksuite/data-view").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>, import("@blocksuite/data-view").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>, import("@blocksuite/data-view").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>, import("@blocksuite/data-view").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>, import("@blocksuite/data-view").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>, import("@blocksuite/data-view").PropertyModel<"progress", {}, number, number>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>, import("@blocksuite/data-view").PropertyModel<"checkbox", {}, boolean, boolean>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"checkbox", {}, boolean, boolean>, import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>, import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>, import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"progress", {}, number, number>, import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>>;
} | {
    from: any;
    to: any;
    convert: import("@blocksuite/data-view").ConvertFunction<import("@blocksuite/data-view").PropertyModel<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>, import("@blocksuite/data-view").PropertyModel<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>>;
})[];
//# sourceMappingURL=converts.d.ts.map