import { LifeCycleWatcher } from '@blocksuite/std';
import { type Signal } from '@preact/signals-core';
import { type HighlighterCore, type MaybeGetter } from 'shiki';
export declare class CodeBlockHighlighter extends LifeCycleWatcher {
    static key: string;
    private static _sharedHighlighter;
    private static _highlighterPromise;
    private static _refCount;
    private _darkThemeKey;
    private _lightThemeKey;
    highlighter$: Signal<HighlighterCore | null>;
    get themeKey(): string | undefined;
    private readonly _loadTheme;
    private static _getOrCreateHighlighter;
    mounted(): void;
    unmounted(): void;
    private static _isHighlighterInUse;
}
/**
 * https://github.com/shikijs/shiki/blob/933415cdc154fe74ccfb6bbb3eb6a7b7bf183e60/packages/core/src/internal.ts#L31
 */
export declare function normalizeGetter<T>(p: MaybeGetter<T>): Promise<T>;
//# sourceMappingURL=code-block-service.d.ts.map