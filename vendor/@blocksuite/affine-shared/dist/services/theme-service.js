import { ColorScheme, DefaultTheme, resolveColor, } from '@blocksuite/affine-model';
import { createIdentifier } from '@blocksuite/global/di';
import { StdIdentifier } from '@blocksuite/std';
import { Extension } from '@blocksuite/store';
import { signal } from '@preact/signals-core';
import { combinedDarkCssVariables, combinedLightCssVariables, } from '@toeverything/theme';
import { isInsideEdgelessEditor } from '../utils/dom';
export const ThemeExtensionIdentifier = createIdentifier('AffineThemeExtension');
export const ThemeProvider = createIdentifier('AffineThemeProvider');
export class ThemeService extends Extension {
    get appTheme() {
        return this.app$.peek();
    }
    get edgelessTheme() {
        return this.edgeless$.peek();
    }
    get theme() {
        return this.theme$.peek();
    }
    get theme$() {
        return isInsideEdgelessEditor(this.std.host) ? this.edgeless$ : this.app$;
    }
    constructor(std) {
        super();
        this.std = std;
        const extension = this.std.getOptional(ThemeExtensionIdentifier);
        this.app$ = extension?.getAppTheme?.() || getThemeObserver().theme$;
        this.edgeless$ =
            extension?.getEdgelessTheme?.(this.std.store.id) ||
                getThemeObserver().theme$;
    }
    static setup(di) {
        di.addImpl(ThemeProvider, ThemeService, [StdIdentifier]);
    }
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
    generateColorProperty(color, fallback = DefaultTheme.transparent, theme = this.theme) {
        const result = resolveColor(color, theme, resolveColor(fallback, theme));
        // Compatible old data
        if (result.startsWith('--')) {
            return result.endsWith('transparent')
                ? DefaultTheme.transparent
                : `var(${result})`;
        }
        return result;
    }
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
    getColorValue(color, fallback = DefaultTheme.transparent, real = false, theme = this.theme) {
        let result = resolveColor(color, theme, resolveColor(fallback, theme));
        // Compatible old data
        if (real && result.startsWith('--')) {
            result = result.endsWith('transparent')
                ? DefaultTheme.transparent
                : this.getCssVariableColor(result, theme);
        }
        return result ?? DefaultTheme.transparent;
    }
    getCssVariableColor(property, theme = this.theme) {
        // Compatible old data
        if (property.startsWith('--')) {
            if (property.endsWith('transparent')) {
                return DefaultTheme.transparent;
            }
            const key = property;
            // V1 theme
            const color = theme === ColorScheme.Dark
                ? combinedDarkCssVariables[key]
                : combinedLightCssVariables[key];
            return color;
        }
        return property;
    }
}
export class ThemeObserver {
    constructor() {
        const COLOR_SCHEMES = Object.values(ColorScheme);
        // Set initial theme according to the data-theme attribute
        const initialMode = document.documentElement.dataset.theme;
        this.theme$ = signal(initialMode && COLOR_SCHEMES.includes(initialMode)
            ? initialMode
            : ColorScheme.Light);
        this.observer = new MutationObserver(() => {
            const mode = document.documentElement.dataset.theme;
            if (!mode)
                return;
            if (!COLOR_SCHEMES.includes(mode))
                return;
            if (mode === this.theme$.value)
                return;
            this.theme$.value = mode;
        });
        this.observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });
    }
    destroy() {
        this.observer.disconnect();
    }
}
export const getThemeObserver = (function () {
    let observer;
    return function () {
        if (observer)
            return observer;
        observer = new ThemeObserver();
        return observer;
    };
})();
