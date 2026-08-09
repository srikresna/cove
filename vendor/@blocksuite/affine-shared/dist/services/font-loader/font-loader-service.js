import { FontFamily, FontStyle, FontWeight } from '@blocksuite/affine-model';
import { createIdentifier } from '@blocksuite/global/di';
import { IS_FIREFOX } from '@blocksuite/global/env';
import { LifeCycleWatcher } from '@blocksuite/std';
const initFontFace = IS_FIREFOX
    ? ({ font, weight, url, style }) => new FontFace(`"${font}"`, `url(${url})`, {
        weight,
        style,
    })
    : ({ font, weight, url, style }) => new FontFace(font, `url(${url})`, {
        weight,
        style,
    });
export class FontLoaderService extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        this._idleLoadTaskId = null;
        this._lazyLoadTimeoutId = null;
        this._deferredFontsQueue = [];
        this._deferredFontsCursor = 0;
        this._loadedFontKeys = new Set();
        this.fontFaces = [];
        this._fontKey = ({ font, weight, style, url }) => {
            return `${font}:${weight}:${style}:${url}`;
        };
        this._isCriticalCanvasFont = ({ font, weight, style, }) => {
            if (style !== FontStyle.Normal)
                return false;
            if (font === FontFamily.Poppins) {
                return (weight === FontWeight.Regular ||
                    weight === FontWeight.Medium ||
                    weight === FontWeight.SemiBold);
            }
            if (font === FontFamily.Inter) {
                return weight === FontWeight.Regular || weight === FontWeight.SemiBold;
            }
            if (font === FontFamily.Kalam) {
                // Mindmap style four uses bold Kalam text.
                // We map to SemiBold because this is the strongest shipped Kalam weight.
                return weight === FontWeight.SemiBold;
            }
            return false;
        };
        this._scheduleDeferredLoad = (fonts) => {
            if (fonts.length === 0 || typeof window === 'undefined') {
                return;
            }
            this._deferredFontsQueue = fonts;
            this._deferredFontsCursor = 0;
            const win = window;
            const scheduleBatch = (delayMs) => {
                this._lazyLoadTimeoutId = window.setTimeout(() => {
                    this._lazyLoadTimeoutId = null;
                    const runBatch = () => {
                        this._idleLoadTaskId = null;
                        const start = this._deferredFontsCursor;
                        const end = Math.min(start + FontLoaderService.DEFERRED_LOAD_BATCH_SIZE, this._deferredFontsQueue.length);
                        const batch = this._deferredFontsQueue.slice(start, end);
                        this._deferredFontsCursor = end;
                        this.load(batch);
                        if (this._deferredFontsCursor < this._deferredFontsQueue.length) {
                            scheduleBatch(FontLoaderService.DEFERRED_LOAD_BATCH_INTERVAL_MS);
                        }
                    };
                    if (typeof win.requestIdleCallback === 'function') {
                        this._idleLoadTaskId = win.requestIdleCallback(runBatch, {
                            timeout: 2000,
                        });
                        return;
                    }
                    runBatch();
                }, delayMs);
            };
            scheduleBatch(FontLoaderService.DEFERRED_LOAD_DELAY_MS);
        };
        this._cancelDeferredLoad = () => {
            if (typeof window === 'undefined') {
                return;
            }
            const win = window;
            if (this._idleLoadTaskId !== null &&
                typeof win.cancelIdleCallback === 'function') {
                win.cancelIdleCallback(this._idleLoadTaskId);
                this._idleLoadTaskId = null;
            }
            if (this._lazyLoadTimeoutId !== null) {
                window.clearTimeout(this._lazyLoadTimeoutId);
                this._lazyLoadTimeoutId = null;
            }
            this._deferredFontsQueue = [];
            this._deferredFontsCursor = 0;
        };
    }
    static { this.key = 'font-loader'; }
    static { this.DEFERRED_LOAD_DELAY_MS = 5000; }
    static { this.DEFERRED_LOAD_BATCH_SIZE = 4; }
    static { this.DEFERRED_LOAD_BATCH_INTERVAL_MS = 1000; }
    get ready() {
        return Promise.all(this.fontFaces.map(fontFace => fontFace.loaded));
    }
    load(fonts) {
        for (const font of fonts) {
            const key = this._fontKey(font);
            if (this._loadedFontKeys.has(key)) {
                continue;
            }
            this._loadedFontKeys.add(key);
            const fontFace = initFontFace(font);
            document.fonts.add(fontFace);
            fontFace.load().catch(console.error);
            this.fontFaces.push(fontFace);
        }
    }
    mounted() {
        const config = this.std.getOptional(FontConfigIdentifier);
        if (!config || config.length === 0) {
            return;
        }
        const criticalFonts = config.filter(this._isCriticalCanvasFont);
        const eagerFonts = criticalFonts.length > 0 ? criticalFonts : config.slice(0, 3);
        const eagerFontKeySet = new Set(eagerFonts.map(this._fontKey));
        const deferredFonts = config.filter(font => !eagerFontKeySet.has(this._fontKey(font)));
        this.load(eagerFonts);
        this._scheduleDeferredLoad(deferredFonts);
    }
    unmounted() {
        this._cancelDeferredLoad();
        for (const fontFace of this.fontFaces) {
            document.fonts.delete(fontFace);
        }
        this.fontFaces.splice(0, this.fontFaces.length);
        this._loadedFontKeys.clear();
    }
}
export const FontConfigIdentifier = createIdentifier('AffineFontConfig');
export const FontConfigExtension = (fontConfig) => ({
    setup: di => {
        di.addImpl(FontConfigIdentifier, () => fontConfig);
    },
});
