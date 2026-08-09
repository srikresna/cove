import { ColorScheme } from '@blocksuite/affine-model';
export function inferColorSchemeFromThemeMode(themeMode) {
    return themeMode === 'dark' ? ColorScheme.Dark : ColorScheme.Light;
}
export function getAffinePlaceholderFillColor(colorScheme) {
    return colorScheme === ColorScheme.Dark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.04)';
}
export function getAffinePlaceholderStrokeColor(colorScheme) {
    return colorScheme === ColorScheme.Dark
        ? 'rgba(255, 255, 255, 0.04)'
        : 'rgba(0, 0, 0, 0.02)';
}
