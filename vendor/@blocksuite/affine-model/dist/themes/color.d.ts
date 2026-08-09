import { z } from 'zod';
export declare enum ColorScheme {
    Dark = "dark",
    Light = "light"
}
export declare const ColorSchema: z.ZodUnion<[z.ZodString, z.ZodObject<{
    normal: z.ZodString;
}, "strip", z.ZodTypeAny, {
    normal: string;
}, {
    normal: string;
}>, z.ZodObject<{
    dark: z.ZodString;
    light: z.ZodString;
}, "strip", z.ZodTypeAny, {
    dark: string;
    light: string;
}, {
    dark: string;
    light: string;
}>]>;
export type Color = z.infer<typeof ColorSchema>;
export declare function resolveColor(color: Color, colorScheme: ColorScheme, fallback?: string): string;
export declare function isTransparent(color: Color): boolean;
//# sourceMappingURL=color.d.ts.map