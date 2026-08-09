import zod from 'zod';
export declare const selectPropertyType: {
    type: "select";
    modelConfig: <PropertyData extends Record<string, unknown> = Record<string, never>, RawValue = unknown, JsonValue = unknown>(ops: import("../../index.js").PropertyConfig<PropertyData, RawValue, JsonValue>) => import("../../index.js").PropertyModel<"select", PropertyData, RawValue, JsonValue>;
};
export declare const SelectPropertySchema: zod.ZodObject<{
    options: zod.ZodArray<zod.ZodObject<{
        id: zod.ZodString;
        color: zod.ZodString;
        value: zod.ZodString;
    }, "strip", zod.ZodTypeAny, {
        id: string;
        value: string;
        color: string;
    }, {
        id: string;
        value: string;
        color: string;
    }>, "many">;
}, "strip", zod.ZodTypeAny, {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}, {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}>;
export type SelectPropertyData = zod.infer<typeof SelectPropertySchema>;
export declare const selectPropertyModelConfig: import("../../index.js").PropertyModel<"select", {
    options: {
        id: string;
        value: string;
        color: string;
    }[];
}, string | null, string | null>;
//# sourceMappingURL=define.d.ts.map