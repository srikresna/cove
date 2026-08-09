import { z, type ZodTypeAny } from 'zod';
export declare function dynamicSchema<Key extends string, Value extends ZodTypeAny>(keyValidator: (key: string) => key is Key, valueType: Value): z.ZodEffects<z.ZodRecord<z.ZodType<Key, z.ZodTypeDef, Key>, Value>, z.RecordType<Key, Value["_output"]>, unknown>;
//# sourceMappingURL=dynamic-schema.d.ts.map