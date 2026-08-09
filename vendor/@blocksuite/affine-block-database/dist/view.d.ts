import type { MenuOptions } from '@blocksuite/affine-components/context-menu';
import { type ViewExtensionContext, ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import { DatabaseBlockModel } from '@blocksuite/affine-model';
import { z } from 'zod';
declare const optionsSchema: z.ZodObject<{
    configure: z.ZodFunction<z.ZodTuple<[z.ZodType<DatabaseBlockModel, z.ZodTypeDef, DatabaseBlockModel>, z.ZodType<MenuOptions, z.ZodTypeDef, MenuOptions>], z.ZodUnknown>, z.ZodType<MenuOptions, z.ZodTypeDef, MenuOptions>>;
}, "strip", z.ZodTypeAny, {
    configure: (args_0: DatabaseBlockModel, args_1: MenuOptions, ...args: unknown[]) => MenuOptions;
}, {
    configure: (args_0: DatabaseBlockModel, args_1: MenuOptions, ...args: unknown[]) => MenuOptions;
}>;
export type DatabaseViewExtensionOptions = z.infer<typeof optionsSchema>;
export declare class DatabaseViewExtension extends ViewExtensionProvider<DatabaseViewExtensionOptions> {
    name: string;
    schema: z.ZodObject<{
        configure: z.ZodFunction<z.ZodTuple<[z.ZodType<DatabaseBlockModel, z.ZodTypeDef, DatabaseBlockModel>, z.ZodType<MenuOptions, z.ZodTypeDef, MenuOptions>], z.ZodUnknown>, z.ZodType<MenuOptions, z.ZodTypeDef, MenuOptions>>;
    }, "strip", z.ZodTypeAny, {
        configure: (args_0: DatabaseBlockModel, args_1: MenuOptions, ...args: unknown[]) => MenuOptions;
    }, {
        configure: (args_0: DatabaseBlockModel, args_1: MenuOptions, ...args: unknown[]) => MenuOptions;
    }>;
    effect(): void;
    setup(context: ViewExtensionContext, options?: DatabaseViewExtensionOptions): void;
}
export {};
//# sourceMappingURL=view.d.ts.map