import type { ColorScheme, Palette } from '@blocksuite/affine-model';
export type Rgb = {
    r: number;
    g: number;
    b: number;
};
export type Rgba = Rgb & {
    a: number;
};
export type Hsv = {
    h: number;
    s: number;
    v: number;
};
export type Hsva = Hsv & {
    a: number;
};
export type Point = {
    x: number;
    y: number;
};
export type NavType = 'colors' | 'custom';
export type NavTab<Type> = {
    type: Type;
    name: string;
};
export type ModeType = 'normal' | `${ColorScheme}`;
export type ModeTab<Type> = NavTab<Type> & {
    hsva: Hsva;
};
export type ModeRgba = {
    type: ModeType;
    rgba: Rgba;
};
export type PickColorType = 'palette' | ModeType;
export type PickColorEvent = {
    type: 'start' | 'end';
} | {
    type: 'pick';
    detail: Palette;
};
//# sourceMappingURL=types.d.ts.map