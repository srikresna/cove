import { type PeekViewService } from '@blocksuite/affine-components/peek';
import { type ViewExtensionContext, ViewExtensionProvider } from '@blocksuite/affine-ext-loader';
import { type TelemetryService } from '@blocksuite/affine-shared/services';
import { z } from 'zod';
declare const optionsSchema: z.ZodObject<{
    linkPreviewCacheConfig: z.ZodOptional<z.ZodObject<{
        cacheSize: z.ZodNumber;
        memoryTTL: z.ZodNumber;
        localStorageTTL: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        cacheSize: number;
        memoryTTL: number;
        localStorageTTL: number;
    }, {
        cacheSize: number;
        memoryTTL: number;
        localStorageTTL: number;
    }>>;
    fontConfig: z.ZodOptional<z.ZodArray<z.ZodObject<{
        font: z.ZodString;
        weight: z.ZodString;
        url: z.ZodString;
        style: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        style: string;
        font: string;
        url: string;
        weight: string;
    }, {
        style: string;
        font: string;
        url: string;
        weight: string;
    }>, "many">>;
    telemetry: z.ZodOptional<z.ZodType<TelemetryService, z.ZodTypeDef, TelemetryService>>;
    peekView: z.ZodOptional<z.ZodType<PeekViewService, z.ZodTypeDef, PeekViewService>>;
}, "strip", z.ZodTypeAny, {
    linkPreviewCacheConfig?: {
        cacheSize: number;
        memoryTTL: number;
        localStorageTTL: number;
    } | undefined;
    fontConfig?: {
        style: string;
        font: string;
        url: string;
        weight: string;
    }[] | undefined;
    telemetry?: TelemetryService | undefined;
    peekView?: PeekViewService | undefined;
}, {
    linkPreviewCacheConfig?: {
        cacheSize: number;
        memoryTTL: number;
        localStorageTTL: number;
    } | undefined;
    fontConfig?: {
        style: string;
        font: string;
        url: string;
        weight: string;
    }[] | undefined;
    telemetry?: TelemetryService | undefined;
    peekView?: PeekViewService | undefined;
}>;
export type FoundationViewExtensionOptions = z.infer<typeof optionsSchema>;
export declare class FoundationViewExtension extends ViewExtensionProvider<FoundationViewExtensionOptions> {
    name: string;
    schema: z.ZodObject<{
        linkPreviewCacheConfig: z.ZodOptional<z.ZodObject<{
            cacheSize: z.ZodNumber;
            memoryTTL: z.ZodNumber;
            localStorageTTL: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            cacheSize: number;
            memoryTTL: number;
            localStorageTTL: number;
        }, {
            cacheSize: number;
            memoryTTL: number;
            localStorageTTL: number;
        }>>;
        fontConfig: z.ZodOptional<z.ZodArray<z.ZodObject<{
            font: z.ZodString;
            weight: z.ZodString;
            url: z.ZodString;
            style: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            style: string;
            font: string;
            url: string;
            weight: string;
        }, {
            style: string;
            font: string;
            url: string;
            weight: string;
        }>, "many">>;
        telemetry: z.ZodOptional<z.ZodType<TelemetryService, z.ZodTypeDef, TelemetryService>>;
        peekView: z.ZodOptional<z.ZodType<PeekViewService, z.ZodTypeDef, PeekViewService>>;
    }, "strip", z.ZodTypeAny, {
        linkPreviewCacheConfig?: {
            cacheSize: number;
            memoryTTL: number;
            localStorageTTL: number;
        } | undefined;
        fontConfig?: {
            style: string;
            font: string;
            url: string;
            weight: string;
        }[] | undefined;
        telemetry?: TelemetryService | undefined;
        peekView?: PeekViewService | undefined;
    }, {
        linkPreviewCacheConfig?: {
            cacheSize: number;
            memoryTTL: number;
            localStorageTTL: number;
        } | undefined;
        fontConfig?: {
            style: string;
            font: string;
            url: string;
            weight: string;
        }[] | undefined;
        telemetry?: TelemetryService | undefined;
        peekView?: PeekViewService | undefined;
    }>;
    effect(): void;
    setup(context: ViewExtensionContext, options?: FoundationViewExtensionOptions): void;
}
export {};
//# sourceMappingURL=view.d.ts.map