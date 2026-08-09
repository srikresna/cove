import type { Color, ColorScheme } from '@blocksuite/affine-model';
import type { Hsv, Hsva, ModeType, PickColorType, Point, Rgb, Rgba } from './types.js';
export declare const defaultPoint: (x?: number, y?: number) => Point;
export declare const defaultHsva: () => Hsva;
export declare function linearGradientAt(t: number): Rgb;
export declare const bound01: (n: number, max: number) => number;
export declare const rgbToHsv: ({ r, g, b }: Rgb) => Hsv;
export declare const hsvToRgb: ({ h, s, v }: Hsv) => Rgb;
export declare const rgbaToHsva: (rgba: Rgba) => Hsva;
export declare const hsvaToRgba: (hsva: Hsva) => Rgba;
export declare const rgbToHex: ({ r, g, b }: Rgb) => string;
export declare const rgbaToHex8: ({ r, g, b, a }: Rgba) => string;
export declare const hsvaToHex8: (hsva: Hsva) => string;
export declare const parseHexToRgba: (hex: string) => {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare const parseHexToHsva: (hex: string) => Hsva;
export declare const eq: (lhs: Hsv, rhs: Hsv) => boolean;
export declare const renderCanvas: (canvas: HTMLCanvasElement, rgb: Rgb) => void;
export declare const keepColor: (color: string) => string;
export declare const parseStringToRgba: (value: string) => {
    r: number;
    g: number;
    b: number;
    a: number;
};
export declare const preprocessColor: (style: CSSStyleDeclaration) => ({ type, value }: {
    type: ModeType;
    value: string;
}) => {
    type: ModeType;
    rgba: {
        r: number;
        g: number;
        b: number;
        a: number;
    };
};
/**
 * Packs to generate an object with a field name and picked color detail
 *
 * @param key - The model's field name
 * @param detail - The picked color detail
 * @returns An object
 *
 * @example
 *
 * ```json
 * { 'fillColor': '--affine-palette-shape-yellow' }
 * { 'fillColor': '#ffffff' }
 * { 'fillColor': { normal: '#ffffffff' }}
 * { 'fillColor': { light: '#fff000ff', 'dark': '#0000fff00' }}
 * ```
 */
export declare const packColor: (key: string, color: Color) => {
    [x: string]: string | {
        normal: string;
    } | {
        dark: string;
        light: string;
    };
};
/**
 * Packs to generate a color array with the color-scheme
 *
 * @param colorScheme - The current color theme
 * @param value - The color value
 * @param oldColor - The old color
 * @returns A color array
 */
export declare const packColorsWith: (colorScheme: ColorScheme, value: string, oldColor: Color) => {
    type: PickColorType;
    colors: {
        type: ModeType;
        value: string;
    }[];
};
export declare const calcCustomButtonStyle: (color: string, isCustomColor: boolean, ele: Element) => {
    '--b': string;
    '--c': string;
};
export declare const adjustColorAlpha: (color: Color, a: number) => Color;
//# sourceMappingURL=utils.d.ts.map