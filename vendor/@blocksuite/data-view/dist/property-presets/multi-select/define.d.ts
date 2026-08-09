export declare const multiSelectPropertyType: {
    type: "multi-select";
    modelConfig: <PropertyData extends Record<string, unknown> = Record<string, never>, RawValue = unknown, JsonValue = unknown>(ops: import("../../index.js").PropertyConfig<PropertyData, RawValue, JsonValue>) => import("../../index.js").PropertyModel<"multi-select", PropertyData, RawValue, JsonValue>;
};
export declare const multiSelectPropertyModelConfig: import("../../index.js").PropertyModel<"multi-select", {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}, string[], string[]>;
//# sourceMappingURL=define.d.ts.map