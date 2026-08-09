import { type StoreExtensionContext, StoreExtensionProvider } from '@blocksuite/affine-ext-loader';
import { z } from 'zod';
declare const optionsSchema: z.ZodObject<{
    mode: z.ZodOptional<z.ZodEnum<["doc", "edgeless"]>>;
}, "strip", z.ZodTypeAny, {
    mode?: "edgeless" | "doc" | undefined;
}, {
    mode?: "edgeless" | "doc" | undefined;
}>;
export declare class NoteStoreExtension extends StoreExtensionProvider<z.infer<typeof optionsSchema>> {
    name: string;
    schema: z.ZodObject<{
        mode: z.ZodOptional<z.ZodEnum<["doc", "edgeless"]>>;
    }, "strip", z.ZodTypeAny, {
        mode?: "edgeless" | "doc" | undefined;
    }, {
        mode?: "edgeless" | "doc" | undefined;
    }>;
    setup(context: StoreExtensionContext, options?: z.infer<typeof optionsSchema>): void;
}
export {};
//# sourceMappingURL=store.d.ts.map