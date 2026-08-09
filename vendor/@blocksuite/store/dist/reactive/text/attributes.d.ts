import { z } from 'zod';
export declare const baseTextAttributes: z.ZodObject<{
    bold: z.ZodCatch<z.ZodNullable<z.ZodOptional<z.ZodLiteral<true>>>>;
    italic: z.ZodCatch<z.ZodNullable<z.ZodOptional<z.ZodLiteral<true>>>>;
    underline: z.ZodCatch<z.ZodNullable<z.ZodOptional<z.ZodLiteral<true>>>>;
    strike: z.ZodCatch<z.ZodNullable<z.ZodOptional<z.ZodLiteral<true>>>>;
    code: z.ZodCatch<z.ZodNullable<z.ZodOptional<z.ZodLiteral<true>>>>;
    link: z.ZodCatch<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    bold?: true | null | undefined;
    link?: string | null | undefined;
    strike?: true | null | undefined;
    italic?: true | null | undefined;
    underline?: true | null | undefined;
    code?: true | null | undefined;
}, {
    bold?: unknown;
    link?: unknown;
    strike?: unknown;
    italic?: unknown;
    underline?: unknown;
    code?: unknown;
}>;
export type BaseTextAttributes = z.infer<typeof baseTextAttributes>;
//# sourceMappingURL=attributes.d.ts.map