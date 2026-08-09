import type { TransformerMiddleware } from '@blocksuite/store';
import { z } from 'zod';
export declare const CALLOUT_MARKDOWN_EXPORT_OPTIONS_KEY = "calloutMarkdownExportOptions";
export declare enum CalloutExportStyle {
    GFM = "GFM",
    Admonitions = "Admonitions"
}
export declare enum CalloutAdmonitionType {
    Info = "info",
    Tip = "tip",
    Warning = "warning",
    Danger = "danger",
    Details = "details"
}
export declare const DEFAULT_ADMONITION_TYPE = CalloutAdmonitionType.Info;
export declare const CalloutAdmonitionTypeSet: Set<string>;
export declare const calloutMarkdownExportOptionsSchema: z.ZodObject<{
    style: z.ZodNativeEnum<typeof CalloutExportStyle>;
    admonitionType: z.ZodOptional<z.ZodNativeEnum<typeof CalloutAdmonitionType>>;
}, "strip", z.ZodTypeAny, {
    style: CalloutExportStyle;
    admonitionType?: CalloutAdmonitionType | undefined;
}, {
    style: CalloutExportStyle;
    admonitionType?: CalloutAdmonitionType | undefined;
}>;
export type CalloutMarkdownExportOptions = z.infer<typeof calloutMarkdownExportOptionsSchema>;
/**
 * Middleware to set the export style of the callout block
 * @param style - The markdown export style of the callout block
 * @returns A TransformerMiddleware that sets the markdown export style of the callout block
 */
export declare const calloutMarkdownExportMiddleware: (options: CalloutMarkdownExportOptions) => TransformerMiddleware;
//# sourceMappingURL=callout-export-options.d.ts.map