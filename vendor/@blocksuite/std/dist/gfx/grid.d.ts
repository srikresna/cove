import type { IBound } from '@blocksuite/global/gfx';
import { GfxExtension } from './extension.js';
import { GfxBlockElementModel } from './model/gfx-block-model.js';
import type { GfxModel } from './model/model.js';
import { GfxPrimitiveElementModel } from './model/surface/element-model.js';
import { GfxLocalElementModel } from './model/surface/local-element-model.js';
export declare const DEFAULT_GRID_SIZE = 3000;
declare const typeFilters: {
    block: (model: GfxModel | GfxLocalElementModel) => model is GfxBlockElementModel<import("./index.js").GfxCompatibleProps>;
    canvas: (model: GfxModel | GfxLocalElementModel) => model is GfxPrimitiveElementModel<import("./index.js").BaseElementProps>;
    local: (model: GfxModel | GfxLocalElementModel) => model is GfxLocalElementModel;
};
export type BuiltInFilterModelMap = {
    block: GfxBlockElementModel;
    canvas: GfxPrimitiveElementModel;
    local: GfxLocalElementModel;
};
export type BuiltInFilterType = keyof typeof typeFilters;
type FilterFunc = (model: GfxModel | GfxLocalElementModel) => boolean;
export declare class GridManager extends GfxExtension {
    static key: string;
    private readonly _elementToGrids;
    private readonly _externalElementToGrids;
    private readonly _externalGrids;
    private readonly _grids;
    get isEmpty(): boolean;
    private _addToExternalGrids;
    private _createExternalGrid;
    private _createGrid;
    private _getExternalGrid;
    private _getGrid;
    private _removeFromExternalGrids;
    private _searchExternal;
    private _toFilterFunc;
    add(element: GfxModel | GfxLocalElementModel): void;
    boundHasChanged(a: IBound, b: IBound): boolean;
    /**
     *
     * @param bound
     * @param strict
     * @param reverseChecking If true, check if the bound is inside the elements instead of checking if the elements are inside the bound
     * @returns
     */
    has(bound: IBound, strict?: boolean, reverseChecking?: boolean, filter?: (model: GfxModel | GfxLocalElementModel) => boolean): boolean;
    remove(element: GfxModel | GfxLocalElementModel): void;
    /**
     * Search for elements in a bound.
     * @param bound
     * @param options
     */
    search<T extends BuiltInFilterType = 'canvas' | 'block'>(bound: IBound, options?: {
        /**
         * If true, only return elements that are completely inside the bound.
         * Default is false.
         */
        strict?: boolean;
        /**
         * If true, return a set of elements instead of an array
         */
        useSet?: false;
        /**
         * Use this to filter the elements, if not provided, it will return blocks and canvas elements by default
         */
        filter?: (T | FilterFunc)[] | FilterFunc;
    }): BuiltInFilterModelMap[T][];
    search<T extends BuiltInFilterType = 'canvas' | 'block'>(bound: IBound, options: {
        strict?: boolean | undefined;
        useSet: true;
        filter?: (T | FilterFunc)[] | FilterFunc;
    }): Set<BuiltInFilterModelMap[T]>;
    update(element: GfxModel | GfxLocalElementModel): void;
    private readonly _disposables;
    unmounted(): void;
    mounted(): void;
}
export {};
//# sourceMappingURL=grid.d.ts.map