import { type ViewExtensionContext, ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import type { AffineInlineEditor } from '@blocksuite/affine-shared/types';
import type { EditorHost } from '@blocksuite/std';
import { z } from 'zod';
import { type LinkedMenuGroup } from './config';
declare const optionsSchema: z.ZodObject<{
    triggerKeys: z.ZodOptional<z.ZodTuple<[z.ZodString], z.ZodString>>;
    convertTriggerKey: z.ZodOptional<z.ZodBoolean>;
    ignoreBlockTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    ignoreSelector: z.ZodOptional<z.ZodString>;
    getMenus: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString, z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodVoid>, z.ZodType<EditorHost, z.ZodTypeDef, EditorHost>, z.ZodType<AffineInlineEditor, z.ZodTypeDef, AffineInlineEditor>, z.ZodType<AbortSignal, z.ZodTypeDef, AbortSignal>], z.ZodUnknown>, z.ZodUnion<[z.ZodPromise<z.ZodArray<z.ZodType<LinkedMenuGroup, z.ZodTypeDef, LinkedMenuGroup>, "many">>, z.ZodArray<z.ZodType<LinkedMenuGroup, z.ZodTypeDef, LinkedMenuGroup>, "many">]>>>;
    autoFocusedItemKey: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodType<LinkedMenuGroup, z.ZodTypeDef, LinkedMenuGroup>, "many">, z.ZodString, z.ZodNullable<z.ZodString>, z.ZodType<EditorHost, z.ZodTypeDef, EditorHost>, z.ZodType<AffineInlineEditor, z.ZodTypeDef, AffineInlineEditor>], z.ZodUnknown>, z.ZodNullable<z.ZodString>>>;
    mobile: z.ZodOptional<z.ZodObject<{
        scrollContainer: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodType<HTMLElement, z.ZodTypeDef, HTMLElement>, z.ZodType<Window, z.ZodTypeDef, Window>]>>;
        scrollTopOffset: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodNumber>]>>;
    }, "strip", z.ZodTypeAny, {
        scrollContainer?: string | HTMLElement | Window | undefined;
        scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
    }, {
        scrollContainer?: string | HTMLElement | Window | undefined;
        scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    mobile?: {
        scrollContainer?: string | HTMLElement | Window | undefined;
        scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
    } | undefined;
    triggerKeys?: [string, ...string[]] | undefined;
    convertTriggerKey?: boolean | undefined;
    ignoreBlockTypes?: string[] | undefined;
    ignoreSelector?: string | undefined;
    getMenus?: ((args_0: string, args_1: (...args: unknown[]) => void, args_2: EditorHost, args_3: AffineInlineEditor, args_4: AbortSignal, ...args: unknown[]) => LinkedMenuGroup[] | Promise<LinkedMenuGroup[]>) | undefined;
    autoFocusedItemKey?: ((args_0: LinkedMenuGroup[], args_1: string, args_2: string | null, args_3: EditorHost, args_4: AffineInlineEditor, ...args: unknown[]) => string | null) | undefined;
}, {
    mobile?: {
        scrollContainer?: string | HTMLElement | Window | undefined;
        scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
    } | undefined;
    triggerKeys?: [string, ...string[]] | undefined;
    convertTriggerKey?: boolean | undefined;
    ignoreBlockTypes?: string[] | undefined;
    ignoreSelector?: string | undefined;
    getMenus?: ((args_0: string, args_1: (...args: unknown[]) => void, args_2: EditorHost, args_3: AffineInlineEditor, args_4: AbortSignal, ...args: unknown[]) => LinkedMenuGroup[] | Promise<LinkedMenuGroup[]>) | undefined;
    autoFocusedItemKey?: ((args_0: LinkedMenuGroup[], args_1: string, args_2: string | null, args_3: EditorHost, args_4: AffineInlineEditor, ...args: unknown[]) => string | null) | undefined;
}>;
export type LinkedDocViewExtensionOptions = z.infer<typeof optionsSchema>;
export declare class LinkedDocViewExtension extends ViewExtensionProvider<LinkedDocViewExtensionOptions> {
    name: string;
    schema: z.ZodObject<{
        triggerKeys: z.ZodOptional<z.ZodTuple<[z.ZodString], z.ZodString>>;
        convertTriggerKey: z.ZodOptional<z.ZodBoolean>;
        ignoreBlockTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        ignoreSelector: z.ZodOptional<z.ZodString>;
        getMenus: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodString, z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodVoid>, z.ZodType<EditorHost, z.ZodTypeDef, EditorHost>, z.ZodType<AffineInlineEditor, z.ZodTypeDef, AffineInlineEditor>, z.ZodType<AbortSignal, z.ZodTypeDef, AbortSignal>], z.ZodUnknown>, z.ZodUnion<[z.ZodPromise<z.ZodArray<z.ZodType<LinkedMenuGroup, z.ZodTypeDef, LinkedMenuGroup>, "many">>, z.ZodArray<z.ZodType<LinkedMenuGroup, z.ZodTypeDef, LinkedMenuGroup>, "many">]>>>;
        autoFocusedItemKey: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodArray<z.ZodType<LinkedMenuGroup, z.ZodTypeDef, LinkedMenuGroup>, "many">, z.ZodString, z.ZodNullable<z.ZodString>, z.ZodType<EditorHost, z.ZodTypeDef, EditorHost>, z.ZodType<AffineInlineEditor, z.ZodTypeDef, AffineInlineEditor>], z.ZodUnknown>, z.ZodNullable<z.ZodString>>>;
        mobile: z.ZodOptional<z.ZodObject<{
            scrollContainer: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodType<HTMLElement, z.ZodTypeDef, HTMLElement>, z.ZodType<Window, z.ZodTypeDef, Window>]>>;
            scrollTopOffset: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodNumber>]>>;
        }, "strip", z.ZodTypeAny, {
            scrollContainer?: string | HTMLElement | Window | undefined;
            scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
        }, {
            scrollContainer?: string | HTMLElement | Window | undefined;
            scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        mobile?: {
            scrollContainer?: string | HTMLElement | Window | undefined;
            scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
        } | undefined;
        triggerKeys?: [string, ...string[]] | undefined;
        convertTriggerKey?: boolean | undefined;
        ignoreBlockTypes?: string[] | undefined;
        ignoreSelector?: string | undefined;
        getMenus?: ((args_0: string, args_1: (...args: unknown[]) => void, args_2: EditorHost, args_3: AffineInlineEditor, args_4: AbortSignal, ...args: unknown[]) => LinkedMenuGroup[] | Promise<LinkedMenuGroup[]>) | undefined;
        autoFocusedItemKey?: ((args_0: LinkedMenuGroup[], args_1: string, args_2: string | null, args_3: EditorHost, args_4: AffineInlineEditor, ...args: unknown[]) => string | null) | undefined;
    }, {
        mobile?: {
            scrollContainer?: string | HTMLElement | Window | undefined;
            scrollTopOffset?: number | ((...args: unknown[]) => number) | undefined;
        } | undefined;
        triggerKeys?: [string, ...string[]] | undefined;
        convertTriggerKey?: boolean | undefined;
        ignoreBlockTypes?: string[] | undefined;
        ignoreSelector?: string | undefined;
        getMenus?: ((args_0: string, args_1: (...args: unknown[]) => void, args_2: EditorHost, args_3: AffineInlineEditor, args_4: AbortSignal, ...args: unknown[]) => LinkedMenuGroup[] | Promise<LinkedMenuGroup[]>) | undefined;
        autoFocusedItemKey?: ((args_0: LinkedMenuGroup[], args_1: string, args_2: string | null, args_3: EditorHost, args_4: AffineInlineEditor, ...args: unknown[]) => string | null) | undefined;
    }>;
    effect(): void;
    setup(context: ViewExtensionContext, options?: LinkedDocViewExtensionOptions): void;
}
export {};
//# sourceMappingURL=view.d.ts.map