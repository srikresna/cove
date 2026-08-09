import { Subject } from 'rxjs';
import { SortOrder } from '../utils/layer.js';
import { GfxExtension } from './extension.js';
import type { GfxController } from './index.js';
import { GfxBlockElementModel } from './model/gfx-block-model.js';
import type { GfxModel } from './model/model.js';
import { GfxPrimitiveElementModel } from './model/surface/element-model.js';
import { GfxLocalElementModel } from './model/surface/local-element-model.js';
export type ReorderingDirection = 'front' | 'forward' | 'backward' | 'back';
type BaseLayer<T> = {
    set: Set<T>;
    elements: Array<T>;
    /**
     * fractional indexing range
     */
    indexes: [string, string];
};
export type BlockLayer = BaseLayer<GfxBlockElementModel> & {
    type: 'block';
    /**
     * The z-index of the first block in this layer.
     *
     * A block layer may contains multiple blocks,
     * the block should be rendered with this `zIndex` + "its index in the layer" as the z-index property.
     */
    zIndex: number;
};
export type CanvasLayer = BaseLayer<GfxPrimitiveElementModel> & {
    type: 'canvas';
    /**
     * The z-index of the first element in this canvas layer.
     *
     * A canvas layer renders all the elements in a single canvas,
     *  this property is used to render the canvas with correct z-index.
     */
    zIndex: number;
};
export type Layer = BlockLayer | CanvasLayer;
export declare class LayerManager extends GfxExtension {
    static key: string;
    static INITIAL_INDEX: string;
    private readonly _disposable;
    private get _doc();
    private get _surface();
    blocks: GfxBlockElementModel[];
    canvasElements: GfxPrimitiveElementModel[];
    canvasLayers: {
        set: Set<GfxPrimitiveElementModel>;
        /**
         * fractional index
         */
        indexes: [string, string];
        /**
         * z-index, used for actual rendering
         */
        zIndex: number;
        elements: Array<GfxPrimitiveElementModel>;
    }[];
    layers: Layer[];
    private readonly _groupChildSnapshot;
    slots: {
        layerUpdated: Subject<{
            type: "delete" | "add" | "update";
            initiatingElement: GfxModel | GfxLocalElementModel;
        }>;
    };
    constructor(gfx: GfxController);
    private _buildCanvasLayers;
    private _getModelType;
    private _getModelById;
    private _getRelatedGroupElements;
    private _syncGroupChildSnapshot;
    private _initLayers;
    private _insertIntoLayer;
    private _removeFromLayer;
    private _refreshElementsInLayer;
    private _reset;
    /**
     * @returns a boolean value to indicate whether the layers have been updated
     */
    private _updateLayer;
    add(element: GfxModel | GfxLocalElementModel): void;
    /**
     * Pass to the `Array.sort` to  sort the elements by their index
     */
    compare(a: GfxModel, b: GfxModel): SortOrder;
    /**
     * In some cases, we need to generate a bunch of indexes in advance before acutally adding the elements to the layer manager.
     * Eg. when importing a template. The `generateIndex` is a function only depends on the current state of the manager.
     * So we cannot use it because it will always return the same index if the element is not added to manager.
     *
     * This function return a index generator that can "remember" the index it generated without actually adding the element to the manager.
     *
     * @note The generator cannot work with `group` element.
     *
     * @returns
     */
    createIndexGenerator(): () => string;
    delete(element: GfxModel | GfxLocalElementModel): void;
    unmounted(): void;
    /**
     * @param reverse - if true, generate the index in reverse order
     * @returns
     */
    generateIndex(reverse?: boolean): string;
    getCanvasLayers(): {
        set: Set<GfxPrimitiveElementModel>;
        /**
         * fractional index
         */
        indexes: [string, string];
        /**
         * z-index, used for actual rendering
         */
        zIndex: number;
        elements: Array<GfxPrimitiveElementModel>;
    }[];
    getReorderedIndex(element: GfxModel, direction: ReorderingDirection): string;
    getZIndex(element: GfxModel): number;
    update(element: GfxModel | GfxLocalElementModel, props?: Record<string, unknown>, oldValues?: Record<string, unknown>): void;
    mounted(): void;
}
export {};
//# sourceMappingURL=layer.d.ts.map