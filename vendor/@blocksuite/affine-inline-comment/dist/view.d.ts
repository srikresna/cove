import { type ViewExtensionContext, ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import z from 'zod';
declare const optionsSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
}, {
    enabled?: boolean | undefined;
}>;
export declare class InlineCommentViewExtension extends ViewExtensionProvider<z.infer<typeof optionsSchema>> {
    name: string;
    schema: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
    }, {
        enabled?: boolean | undefined;
    }>;
    effect(): void;
    setup(context: ViewExtensionContext, options?: z.infer<typeof optionsSchema>): void;
}
export {};
//# sourceMappingURL=view.d.ts.map