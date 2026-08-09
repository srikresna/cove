import type { GfxCommonBlockProps, GfxElementGeometry } from '@blocksuite/std/gfx';
import { z } from 'zod';
import { FontFamily, FontStyle, FontWeight, TextAlign, type TextStyleProps } from '../../consts/index';
type EdgelessTextProps = {
    hasMaxWidth: boolean;
    comments?: Record<string, boolean>;
} & Omit<TextStyleProps, 'fontSize'> & GfxCommonBlockProps;
export declare const EdgelessTextZodSchema: z.ZodDefault<z.ZodObject<{
    color: z.ZodUnion<[z.ZodString, z.ZodObject<{
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
    fontFamily: z.ZodNativeEnum<typeof FontFamily>;
    fontStyle: z.ZodNativeEnum<typeof FontStyle>;
    fontWeight: z.ZodNativeEnum<typeof FontWeight>;
    textAlign: z.ZodNativeEnum<typeof TextAlign>;
}, "strip", z.ZodTypeAny, {
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontFamily: FontFamily;
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    textAlign: TextAlign;
}, {
    color: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
    fontFamily: FontFamily;
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    textAlign: TextAlign;
}>>;
export declare const EdgelessTextBlockSchema: {
    version: number;
    model: {
        props: import("@blocksuite/store").PropsGetter<EdgelessTextProps>;
        flavour: "affine:edgeless-text";
    } & {
        version: number;
        role: "hub";
        parent: string[];
        children: string[];
    };
    transformer?: ((transformerConfig: Map<string, unknown>) => import("@blocksuite/store").BaseBlockTransformer<EdgelessTextProps>) | undefined;
};
export declare const EdgelessTextBlockSchemaExtension: import("@blocksuite/store").ExtensionType;
declare const EdgelessTextBlockModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<EdgelessTextProps>;
};
export declare class EdgelessTextBlockModel extends EdgelessTextBlockModel_base implements GfxElementGeometry {
    get color(): EdgelessTextProps["color"];
    set color(color: EdgelessTextProps['color']);
}
export {};
//# sourceMappingURL=edgeless-text-model.d.ts.map