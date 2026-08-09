import type * as Y from 'yjs';
import { z } from 'zod';
import { Boxed, Text } from '../../reactive/index.js';
import type { BaseBlockTransformer } from '../../transformer/base.js';
import type { BlockModel } from './block-model.js';
export type RoleType = 'root' | 'content' | string;
export interface InternalPrimitives {
    Text: (input?: Y.Text | string) => Text;
    Boxed: <T>(input: T) => Boxed<T>;
}
export declare const internalPrimitives: InternalPrimitives;
export declare const BlockSchema: z.ZodObject<{
    version: z.ZodNumber;
    model: z.ZodObject<{
        role: z.ZodString;
        flavour: z.ZodString;
        parent: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        children: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        isFlatData: z.ZodOptional<z.ZodBoolean>;
        props: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodType<InternalPrimitives, z.ZodTypeDef, InternalPrimitives>], z.ZodUnknown>, z.ZodRecord<z.ZodString, z.ZodAny>>>;
        toModel: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodType<BlockModel<object>, z.ZodTypeDef, BlockModel<object>>>>;
    }, "strip", z.ZodTypeAny, {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?: ((args_0: InternalPrimitives, ...args: unknown[]) => Record<string, any>) | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => BlockModel<object>) | undefined;
    }, {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?: ((args_0: InternalPrimitives, ...args: unknown[]) => Record<string, any>) | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => BlockModel<object>) | undefined;
    }>;
    transformer: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodType<Map<string, unknown>, z.ZodTypeDef, Map<string, unknown>>], z.ZodUnknown>, z.ZodType<BaseBlockTransformer<object>, z.ZodTypeDef, BaseBlockTransformer<object>>>>;
}, "strip", z.ZodTypeAny, {
    version: number;
    model: {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?: ((args_0: InternalPrimitives, ...args: unknown[]) => Record<string, any>) | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => BlockModel<object>) | undefined;
    };
    transformer?: ((args_0: Map<string, unknown>, ...args: unknown[]) => BaseBlockTransformer<object>) | undefined;
}, {
    version: number;
    model: {
        flavour: string;
        role: string;
        children?: string[] | undefined;
        props?: ((args_0: InternalPrimitives, ...args: unknown[]) => Record<string, any>) | undefined;
        parent?: string[] | undefined;
        isFlatData?: boolean | undefined;
        toModel?: ((...args: unknown[]) => BlockModel<object>) | undefined;
    };
    transformer?: ((args_0: Map<string, unknown>, ...args: unknown[]) => BaseBlockTransformer<object>) | undefined;
}>;
export type BlockSchemaType = z.infer<typeof BlockSchema>;
export type PropsGetter<Props> = (internalPrimitives: InternalPrimitives) => Props;
export declare function defineBlockSchema<Flavour extends string, Role extends RoleType, Props extends object, Metadata extends Readonly<{
    version: number;
    role: Role;
    parent?: string[];
    children?: string[];
    isFlatData?: boolean;
}>, Model extends BlockModel<Props>, Transformer extends BaseBlockTransformer<Props>>(options: {
    flavour: Flavour;
    metadata: Metadata;
    props?: (internalPrimitives: InternalPrimitives) => Props;
    toModel?: () => Model;
    transformer?: (transformerConfig: Map<string, unknown>) => Transformer;
}): {
    version: number;
    model: {
        props: PropsGetter<Props>;
        flavour: Flavour;
    } & Metadata;
    transformer?: (transformerConfig: Map<string, unknown>) => Transformer;
};
//# sourceMappingURL=zod.d.ts.map