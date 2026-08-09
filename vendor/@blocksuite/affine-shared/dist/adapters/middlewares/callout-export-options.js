import { z } from 'zod';
export const CALLOUT_MARKDOWN_EXPORT_OPTIONS_KEY = 'calloutMarkdownExportOptions';
export var CalloutExportStyle;
(function (CalloutExportStyle) {
    CalloutExportStyle["GFM"] = "GFM";
    CalloutExportStyle["Admonitions"] = "Admonitions";
})(CalloutExportStyle || (CalloutExportStyle = {}));
export var CalloutAdmonitionType;
(function (CalloutAdmonitionType) {
    CalloutAdmonitionType["Info"] = "info";
    CalloutAdmonitionType["Tip"] = "tip";
    CalloutAdmonitionType["Warning"] = "warning";
    CalloutAdmonitionType["Danger"] = "danger";
    CalloutAdmonitionType["Details"] = "details";
})(CalloutAdmonitionType || (CalloutAdmonitionType = {}));
export const DEFAULT_ADMONITION_TYPE = CalloutAdmonitionType.Info;
export const CalloutAdmonitionTypeSet = new Set(Object.values(CalloutAdmonitionType));
export const calloutMarkdownExportOptionsSchema = z.object({
    style: z.nativeEnum(CalloutExportStyle),
    admonitionType: z.nativeEnum(CalloutAdmonitionType).optional(),
});
/**
 * Middleware to set the export style of the callout block
 * @param style - The markdown export style of the callout block
 * @returns A TransformerMiddleware that sets the markdown export style of the callout block
 */
export const calloutMarkdownExportMiddleware = (options) => {
    return ({ adapterConfigs }) => {
        adapterConfigs.set(CALLOUT_MARKDOWN_EXPORT_OPTIONS_KEY, options);
    };
};
