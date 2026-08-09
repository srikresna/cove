import type { Container } from '@blocksuite/global/di';
import { type GfxController, GfxExtension } from '@blocksuite/std/gfx';
import { BehaviorSubject } from 'rxjs';
import type { RendererOptions, RenderingState, TurboRendererConfig, ViewportLayoutTree } from './types';
export declare function shouldPreferBitmapCacheDuringLowZoomGesture(params: {
    isIOS: boolean;
    zoom: number;
    hasBitmap: boolean;
}): boolean;
export declare function shouldIdleTurboBlocksDuringZooming(params: {
    isIOS: boolean;
    zoom: number;
}): boolean;
export declare const TurboRendererConfigFactory: import("@blocksuite/std").ConfigFactory<TurboRendererConfig>;
/**
 * Manages the Turbo Rendering process for the viewport, coordinating between the main thread and a painter worker.
 * Turbo Rendering optimizes performance by rendering block content onto a canvas bitmap,
 * falling back to standard DOM rendering during interactions.
 *
 * To add Turbo Rendering support for a new block type (e.g., 'affine:my-block'):
 *
 * 1.  **In the block's package (e.g., `blocksuite/affine/blocks/my-block`):**
 *   a.  Add `@blocksuite/affine/gfx/turbo-renderer` as a dependency in `package.json` and create a `src/turbo` directory.
 *   b.  Implement the Layout Handler (e.g., `MyBlockLayoutHandlerExtension`) and Painter Worker (e.g., `MyBlockLayoutPainterExtension`). Refer to `ParagraphLayoutHandlerExtension` and `ParagraphLayoutPainterExtension` in `blocksuite/affine/blocks/block-paragraph` for implementation examples.
 *   c.  Export the Layout Handler and Painter Worker extensions from the block package's main `src/index.ts` by adding these two explicit export statements:
 *       ```typescript
 *       export * from './turbo/my-block-layout-handler';
 *       export * from './turbo/my-block-painter.worker';
 *       ```
 *   d.  Add an export mapping for the painter worker in `package.json` under the `exports` field (e.g., `"./turbo-painter": "./src/turbo/my-block-painter.worker.ts"`).
 *   e.  Add a TypeScript project reference to `blocksuite/affine/gfx/turbo-renderer` in `tsconfig.json`.
 *
 * 2.  **In the application integration point (e.g., `packages/frontend/core/src/blocksuite/extensions` and `blocksuite/integration-test/src/__tests__/utils/renderer-entry.ts`):**
 *   a.  In `turbo-renderer.ts` (or the file setting up `TurboRendererConfigFactory`):
 *     - Import and add the new Layout Handler extension to the `patchTurboRendererExtension` array (or equivalent DI setup). See how `ParagraphLayoutHandlerExtension` is added as a reference.
 *   b.  In `turbo-painter.worker.ts` (the painter worker entry point):
 *     - Import and add the new Painter Worker extension to the `ViewportLayoutPainter` constructor's extension array. See how `ParagraphLayoutPainterExtension` is added as a reference.
 *
 * 3.  **Run `yarn affine init`** from the workspace root to update generated configuration files (`workspace.gen.ts`) and the lockfile (`yarn.lock`).
 *
 * **Note:** Always ensure the directory structure and export patterns match the `paragraph` block (`blocksuite/affine/blocks/block-paragraph`) for consistency.
 */
export declare class ViewportTurboRendererExtension extends GfxExtension {
    static key: string;
    readonly state$: BehaviorSubject<RenderingState>;
    readonly canvas: HTMLCanvasElement;
    layoutCacheData: ViewportLayoutTree | null;
    optimizedBlockIds: string[];
    private readonly worker;
    private readonly disposables;
    private layoutVersion;
    private bitmap;
    private viewportElement;
    private readonly refresh$;
    private readonly isRecentlyZoomed$;
    get currentState(): RenderingState;
    constructor(gfx: GfxController);
    static extendGfx(gfx: GfxController): void;
    static setup(di: Container): void;
    get options(): RendererOptions;
    mounted(): void;
    unmounted(): void;
    get viewport(): import("@blocksuite/std/gfx").Viewport;
    get selection(): import("@blocksuite/std/gfx").GfxSelectionManager;
    get layoutCache(): ViewportLayoutTree;
    refresh(): Promise<void>;
    invalidate(): void;
    private debugLog;
    private clearBitmap;
    private paintLayout;
    canUseBitmapCache(): boolean;
    private isZooming;
    private clearCanvas;
    private drawCachedBitmap;
    private canOptimize;
    private updateOptimizedBlocks;
    private clearOptimizedBlocks;
    private handleResize;
    private paintPlaceholder;
}
export declare const ViewportTurboRendererIdentifier: import("@blocksuite/global/di").ServiceIdentifier<GfxExtension>;
//# sourceMappingURL=turbo-renderer.d.ts.map