import { type Color, ColorScheme } from '@blocksuite/affine-model';
import { type Container } from '@blocksuite/global/di';
import { type BlockStdScope } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
import { type Signal } from '@preact/signals-core';
export declare const ThemeExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<ThemeExtension> & (<U extends ThemeExtension = ThemeExtension>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export interface ThemeExtension {
    getAppTheme?: () => Signal<ColorScheme>;
    getEdgelessTheme?: (docId?: string) => Signal<ColorScheme>;
}
export declare const ThemeProvider: import("@blocksuite/global/di").ServiceIdentifier<ThemeService> & (<U extends ThemeService = ThemeService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class ThemeService extends Extension {
    private readonly std;
    app$: Signal<ColorScheme>;
    edgeless$: Signal<ColorScheme>;
    get appTheme(): ColorScheme;
    get edgelessTheme(): ColorScheme;
    get theme(): ColorScheme;
    get theme$(): Signal<ColorScheme>;
    constructor(std: BlockStdScope);
    static setup(di: Container): void;
    /**
     * Generates a CSS's color property with `var` or `light-dark` functions.
     *
     * Sometimes used to set the frame/note background.
     *
     * @param color - A color value.
     * @param fallback  - If color value processing fails, it will be used as a fallback.
     * @param theme - Target theme, default is the current theme.
     * @returns - A color property string.
     *
     * @example
     *
     * ```
     * `rgba(255,0,0)`
     * `#fff`
     * `light-dark(#fff, #000)`
     * `var(--affine-palette-shape-blue)`
     * ```
     */
    generateColorProperty(color: Color, fallback?: Color, theme?: ColorScheme): string;
    /**
     * Gets a color with the current theme.
     *
     * @param color - A color value.
     * @param fallback - If color value processing fails, it will be used as a fallback.
     * @param real - If true, it returns the computed style.
     * @param theme - Target theme, default is the current theme.
     * @returns - A color property string.
     *
     * @example
     *
     * ```
     * `rgba(255,0,0)`
     * `#fff`
     * `--affine-palette-shape-blue`
     * ```
     */
    getColorValue(color: Color, fallback?: Color, real?: boolean, theme?: ColorScheme): string;
    getCssVariableColor(property: string, theme?: ColorScheme): string;
}
export declare class ThemeObserver {
    private readonly observer;
    theme$: Signal<ColorScheme>;
    constructor();
    destroy(): void;
}
export declare const getThemeObserver: () => ThemeObserver;
//# sourceMappingURL=theme-service.d.ts.map