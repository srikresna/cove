import { z } from 'zod';
import type { Color } from '../themes/color.js';
export declare enum TextAlign {
    Center = "center",
    Left = "left",
    Right = "right"
}
export declare const TextAlignMap: Record<TextAlign, "Center" | "Left" | "Right">;
export declare enum TextVerticalAlign {
    Bottom = "bottom",
    Center = "center",
    Top = "top"
}
export type TextStyleProps = {
    color: Color;
    fontFamily: FontFamily;
    fontSize: number;
    fontStyle: FontStyle;
    fontWeight: FontWeight;
    textAlign: TextAlign;
};
export declare enum FontWeight {
    Bold = "700",
    Light = "300",
    Medium = "500",
    Regular = "400",
    SemiBold = "600"
}
export declare const FontWeightMap: Record<FontWeight, "Medium" | "Bold" | "Light" | "Regular" | "SemiBold">;
export declare enum FontStyle {
    Italic = "italic",
    Normal = "normal"
}
export declare enum FontFamily {
    BebasNeue = "blocksuite:surface:BebasNeue",
    Inter = "blocksuite:surface:Inter",
    Kalam = "blocksuite:surface:Kalam",
    Lora = "blocksuite:surface:Lora",
    OrelegaOne = "blocksuite:surface:OrelegaOne",
    Poppins = "blocksuite:surface:Poppins",
    Satoshi = "blocksuite:surface:Satoshi"
}
export declare const FontFamilyMap: Record<FontFamily, "BebasNeue" | "Inter" | "Kalam" | "Lora" | "OrelegaOne" | "Poppins" | "Satoshi">;
export declare const FontFamilyList: { [K in FontFamily]: [K, (typeof FontFamilyMap)[K]]; }[FontFamily][];
export declare enum TextResizing {
    AUTO_WIDTH_AND_HEIGHT = 0,
    AUTO_HEIGHT = 1
}
export declare const FontFamilySchema: z.ZodNativeEnum<typeof FontFamily>;
export declare const FontWeightSchema: z.ZodNativeEnum<typeof FontWeight>;
export declare const FontStyleSchema: z.ZodNativeEnum<typeof FontStyle>;
export declare const TextAlignSchema: z.ZodNativeEnum<typeof TextAlign>;
//# sourceMappingURL=text.d.ts.map