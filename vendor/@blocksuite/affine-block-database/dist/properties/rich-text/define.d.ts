import { Text } from '@blocksuite/store';
export declare const richTextColumnType: {
    type: "rich-text";
    modelConfig: <PropertyData extends Record<string, unknown> = Record<string, never>, RawValue = unknown, JsonValue = unknown>(ops: import("@blocksuite/data-view").PropertyConfig<PropertyData, RawValue, JsonValue>) => import("@blocksuite/data-view").PropertyModel<"rich-text", PropertyData, RawValue, JsonValue>;
};
export type RichTextCellType = Text | Text['yText'];
export declare const toYText: (text?: RichTextCellType) => undefined | Text["yText"];
export declare const richTextPropertyModelConfig: import("@blocksuite/data-view").PropertyModel<"rich-text", {}, RichTextCellType | undefined, string>;
//# sourceMappingURL=define.d.ts.map