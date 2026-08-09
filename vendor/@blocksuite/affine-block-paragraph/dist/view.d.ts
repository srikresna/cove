import { type ViewExtensionContext, ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import { ParagraphBlockModel } from '@blocksuite/affine-model';
import { z } from 'zod';
declare const optionsSchema: z.ZodObject<{
    getPlaceholder: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodType<ParagraphBlockModel, z.ZodTypeDef, ParagraphBlockModel>], z.ZodUnknown>, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    getPlaceholder?: ((args_0: ParagraphBlockModel, ...args: unknown[]) => string) | undefined;
}, {
    getPlaceholder?: ((args_0: ParagraphBlockModel, ...args: unknown[]) => string) | undefined;
}>;
export declare class ParagraphViewExtension extends ViewExtensionProvider<z.infer<typeof optionsSchema>> {
    name: string;
    schema: z.ZodObject<{
        getPlaceholder: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodType<ParagraphBlockModel, z.ZodTypeDef, ParagraphBlockModel>], z.ZodUnknown>, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        getPlaceholder?: ((args_0: ParagraphBlockModel, ...args: unknown[]) => string) | undefined;
    }, {
        getPlaceholder?: ((args_0: ParagraphBlockModel, ...args: unknown[]) => string) | undefined;
    }>;
    effect(): void;
    setup(context: ViewExtensionContext, options?: z.infer<typeof optionsSchema>): void;
}
export {};
//# sourceMappingURL=view.d.ts.map