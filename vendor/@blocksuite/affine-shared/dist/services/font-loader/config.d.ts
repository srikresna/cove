import { z } from 'zod';
export declare const fontConfigSchema: z.ZodObject<{
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
}>;
export type FontConfig = z.infer<typeof fontConfigSchema>;
export declare const AffineCanvasTextFonts: FontConfig[];
export declare const CommunityCanvasTextFonts: FontConfig[];
//# sourceMappingURL=config.d.ts.map