import { Text } from '@blocksuite/store';
export declare const titleColumnType: {
    type: "title";
    modelConfig: <PropertyData extends Record<string, unknown> = Record<string, never>, RawValue = unknown, JsonValue = unknown>(ops: import("@blocksuite/data-view").PropertyConfig<PropertyData, RawValue, JsonValue>) => import("@blocksuite/data-view").PropertyModel<"title", PropertyData, RawValue, JsonValue>;
};
export declare const titlePropertyModelConfig: import("@blocksuite/data-view").PropertyModel<"title", {}, Text<{
    bold?: true | null | undefined;
    link?: string | null | undefined;
    strike?: true | null | undefined;
    italic?: true | null | undefined;
    underline?: true | null | undefined;
    code?: true | null | undefined;
}> | undefined, string>;
//# sourceMappingURL=define.d.ts.map