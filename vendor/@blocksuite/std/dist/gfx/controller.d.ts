import { Bound, type IBound } from '@blocksuite/global/gfx';
import type { BlockModel } from '@blocksuite/store';
import { Signal } from '@preact/signals-core';
import { LifeCycleWatcher } from '../extension/lifecycle-watcher.js';
import type { BlockStdScope } from '../scope/std-scope.js';
import type { BlockComponent } from '../view/index.js';
import type { CursorType } from './cursor.js';
import { GridManager } from './grid.js';
import { KeyboardController } from './keyboard.js';
import { LayerManager } from './layer.js';
import type { PointTestOptions } from './model/base.js';
import { GfxBlockElementModel } from './model/gfx-block-model.js';
import type { GfxModel } from './model/model.js';
import { GfxPrimitiveElementModel } from './model/surface/element-model.js';
import type { SurfaceBlockModel } from './model/surface/surface-model.js';
import { Viewport } from './viewport.js';
export declare class GfxController extends LifeCycleWatcher {
    static key: string;
    private readonly _disposables;
    private readonly _surface$;
    readonly cursor$: Signal<CursorType>;
    readonly keyboard: KeyboardController;
    readonly viewport: Viewport;
    get grid(): GridManager;
    get layer(): LayerManager;
    get doc(): import("@blocksuite/store").Store;
    get elementsBound(): Bound;
    get gfxElements(): GfxModel[];
    get surface$(): Signal<SurfaceBlockModel | null>;
    get surface(): SurfaceBlockModel | null;
    get surfaceComponent(): BlockComponent | null;
    constructor(std: BlockStdScope);
    deleteElement(element: GfxModel | BlockModel<object> | string): void;
    /**
     * Get a block or element by its id.
     * Note that non-gfx block can also be queried in this method.
     * @param id
     * @returns
     */
    getElementById<T extends GfxModel | BlockModel<object> = GfxModel | BlockModel<object>>(id: string): T | null;
    /**
     * Get elements on a specific point.
     * @param x
     * @param y
     * @param options
     */
    getElementByPoint(x: number, y: number, options: {
        all: true;
    } & PointTestOptions): GfxModel[];
    getElementByPoint(x: number, y: number, options?: {
        all?: false;
    } & PointTestOptions): GfxModel | null;
    /**
     * Query all elements in an area.
     * @param bound
     * @param options
     */
    getElementsByBound(bound: IBound | Bound, options?: {
        type: 'all';
    }): GfxModel[];
    getElementsByBound(bound: IBound | Bound, options: {
        type: 'canvas';
    }): GfxPrimitiveElementModel[];
    getElementsByBound(bound: IBound | Bound, options: {
        type: 'block';
    }): GfxBlockElementModel[];
    getElementsByType(type: string): (GfxModel | BlockModel<object>)[];
    mounted(): void;
    unmounted(): void;
    updateElement(element: GfxModel | string, props: Record<string, unknown>): void;
    fitToScreen(options?: {
        bounds?: Bound[];
        smooth?: boolean;
        padding?: [number, number, number, number];
    }): void;
}
//# sourceMappingURL=controller.d.ts.map