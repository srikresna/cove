import { z } from 'zod';
import { Boxed, Text } from '../../reactive/index.js';
const FlavourSchema = z.string();
const ParentSchema = z.array(z.string()).optional();
const ContentSchema = z.array(z.string()).optional();
const RoleSchema = z.string();
export const internalPrimitives = Object.freeze({
    Text: (input = '') => new Text(input),
    Boxed: (input) => new Boxed(input),
});
export const BlockSchema = z.object({
    version: z.number(),
    model: z.object({
        role: RoleSchema,
        flavour: FlavourSchema,
        parent: ParentSchema,
        children: ContentSchema,
        isFlatData: z.boolean().optional(),
        props: z
            .function()
            .args(z.custom())
            .returns(z.record(z.any()))
            .optional(),
        toModel: z.function().args().returns(z.custom()).optional(),
    }),
    transformer: z
        .function()
        .args(z.custom())
        .returns(z.custom())
        .optional(),
});
export function defineBlockSchema({ flavour, props, metadata, toModel, transformer, }) {
    const schema = {
        version: metadata.version,
        model: {
            role: metadata.role,
            parent: metadata.parent,
            children: metadata.children,
            flavour,
            props,
            toModel,
            isFlatData: metadata.isFlatData,
        },
        transformer,
    };
    BlockSchema.parse(schema);
    return schema;
}
