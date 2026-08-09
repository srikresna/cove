import { z } from 'zod';
export var ColorScheme;
(function (ColorScheme) {
    ColorScheme["Dark"] = "dark";
    ColorScheme["Light"] = "light";
})(ColorScheme || (ColorScheme = {}));
const ColorNormalSchema = z.object({
    normal: z.string(),
});
const ColorDarkLightSchema = z.object({
    [ColorScheme.Dark]: z.string(),
    [ColorScheme.Light]: z.string(),
});
export const ColorSchema = z.union([
    z.string(),
    ColorNormalSchema,
    ColorDarkLightSchema,
]);
// Converts `Color` type to string.
export function resolveColor(color, colorScheme, fallback = 'transparent') {
    let value = fallback;
    if (typeof color === 'object') {
        if (ColorScheme.Dark in color && ColorScheme.Light in color) {
            value = color[colorScheme];
        }
        else if ('normal' in color) {
            value = color.normal;
        }
    }
    else {
        value = color;
    }
    if (!value) {
        value = fallback;
    }
    return value;
}
export function isTransparent(color) {
    return (typeof color === 'string' && color.toLowerCase().endsWith('transparent'));
}
