export * from './converts.js';
export declare const databaseBlockProperties: {
    checkboxColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"checkbox", {}, boolean, boolean>;
    dateColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"date", {}, number | null, number | null>;
    multiSelectColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"multi-select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string[], string[]>;
    numberColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"number", {
        format: "number" | "numberWithCommas" | "percent" | "currencyYen" | "currencyINR" | "currencyCNY" | "currencyUSD" | "currencyEUR" | "currencyGBP";
        decimal?: number | undefined;
    }, number | null, number | null>;
    progressColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"progress", {}, number, number>;
    selectColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"select", {
        options: {
            id: string;
            value: string;
            color: string;
        }[];
    }, string | null, string | null>;
    imageColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"image", {}, string | null, string | null>;
    linkColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"link", {}, string, string>;
    richTextColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"rich-text", {}, import("./rich-text/define.js").RichTextCellType | undefined, string>;
    titleColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"title", {}, import("@blocksuite/store").Text<{
        bold?: true | null | undefined;
        link?: string | null | undefined;
        strike?: true | null | undefined;
        italic?: true | null | undefined;
        underline?: true | null | undefined;
        code?: true | null | undefined;
    }> | undefined, string>;
    createdTimeColumnConfig: import("@blocksuite/data-view").PropertyMetaConfig<"created-time", {}, number | null, number | null>;
};
//# sourceMappingURL=index.d.ts.map