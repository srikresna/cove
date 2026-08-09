import { type Constructor } from '@blocksuite/global/utils';
import type { Boxed } from '@blocksuite/store';
import { BlockModel } from '@blocksuite/store';
import { Subject } from 'rxjs';
import * as Y from 'yjs';
import { type GfxGroupCompatibleInterface } from '../base.js';
import type { GfxGroupModel, GfxModel } from '../model.js';
import { type GfxPrimitiveElementModel } from './element-model.js';
import type { GfxLocalElementModel } from './local-element-model.js';
/**
 * Used for text field
 */
export declare const SURFACE_TEXT_UNIQ_IDENTIFIER = "affine:surface:text";
/**
 * Used for field that use Y.Map. E.g. group children field
 */
export declare const SURFACE_YMAP_UNIQ_IDENTIFIER = "affine:surface:ymap";
export type SurfaceBlockProps = {
    elements: Boxed<Y.Map<Y.Map<unknown>>>;
};
export interface ElementUpdatedData {
    id: string;
    props: Record<string, unknown>;
    oldValues: Record<string, unknown>;
    local: boolean;
}
export type MiddlewareCtx = {
    type: 'beforeAdd';
    payload: {
        type: string;
        props: Record<string, unknown>;
    };
};
export type SurfaceMiddleware = (ctx: MiddlewareCtx) => void;
export declare class SurfaceBlockModel extends BlockModel<SurfaceBlockProps> {
    private static readonly _groupBoundImpactKeys;
    protected _decoratorState: {
        creating: boolean;
        deriving: boolean;
        skipField: boolean;
    };
    protected _elementCtorMap: Record<string, Constructor<GfxPrimitiveElementModel, ConstructorParameters<typeof GfxPrimitiveElementModel>>>;
    protected _elementModels: Map<string, {
        mount: () => void;
        unmount: () => void;
        model: GfxPrimitiveElementModel;
    }>;
    protected _elementTypeMap: Map<string, GfxPrimitiveElementModel<import("./element-model.js").BaseElementProps>[]>;
    protected _groupLikeModels: Map<string, GfxGroupModel>;
    protected _parentGroupMap: Map<string, string>;
    protected _groupChildIdsMap: Map<string, string[]>;
    protected _middlewares: SurfaceMiddleware[];
    protected _surfaceBlockModel: boolean;
    protected localElements: Set<GfxLocalElementModel>;
    elementAdded: Subject<{
        id: string;
        local: boolean;
    }>;
    elementRemoved: Subject<{
        id: string;
        type: string;
        model: GfxPrimitiveElementModel;
        local: boolean;
    }>;
    elementUpdated: Subject<ElementUpdatedData>;
    localElementAdded: Subject<GfxLocalElementModel>;
    localElementDeleted: Subject<GfxLocalElementModel>;
    localElementUpdated: Subject<{
        model: GfxLocalElementModel;
        props: Record<string, unknown>;
        oldValues: Record<string, unknown>;
    }>;
    private readonly _isEmpty$;
    get elementModels(): GfxPrimitiveElementModel<import("./element-model.js").BaseElementProps>[];
    get elements(): Boxed<Y.Map<Y.Map<unknown>>>;
    get localElementModels(): Set<GfxLocalElementModel>;
    get registeredElementTypes(): string[];
    isEmpty(): boolean;
    constructor();
    private _collectElementsToDelete;
    private _createElementFromProps;
    private _createElementFromYMap;
    private _emitElementUpdated;
    private _refreshParentGroupBounds;
    private _refreshParentGroupBoundsForElement;
    private _initElementModels;
    private _propsToY;
    private _watchGroupRelationChange;
    private _watchChildrenChange;
    protected _extendElement(ctorMap: Record<string, Constructor<GfxPrimitiveElementModel, ConstructorParameters<typeof GfxPrimitiveElementModel>>>): void;
    protected _init(): void;
    getConstructor(type: string): Constructor<GfxPrimitiveElementModel<import("./element-model.js").BaseElementProps>, [options: {
        id: string;
        yMap: Y.Map<unknown>;
        model: SurfaceBlockModel;
        stashedStore: Map<unknown, unknown>;
        onChange: (payload: {
            props: Record<string, unknown>;
            oldValues: Record<string, unknown>;
            local: boolean;
        }) => void;
    }]>;
    private _rebuildGroupChildrenIndex;
    private _removeFromParentGroupIfNeeded;
    private _removeGroupFromChildrenIndex;
    private _syncGroupChildrenIndex;
    addElement<T extends object = Record<string, unknown>>(props: Partial<T> & {
        type: string;
    }): string;
    addLocalElement(elem: GfxLocalElementModel): void;
    applyMiddlewares(middlewares: SurfaceMiddleware[]): void;
    deleteElement(id: string): void;
    deleteLocalElement(elem: GfxLocalElementModel): void;
    dispose(): void;
    getElementById(id: string): GfxPrimitiveElementModel | null;
    getElementsByType(type: string): GfxPrimitiveElementModel[];
    getGroup(elem: string | GfxModel): GfxGroupModel | null;
    /**
     * Get all groups in the group chain. The last group is the top level group.
     * @param id
     * @returns
     */
    getGroups(id: string): GfxGroupModel[];
    hasElementById(id: string): boolean;
    isGroup(element: GfxModel): element is GfxModel & GfxGroupCompatibleInterface;
    isGroup(id: string): boolean;
    updateElement<T extends object = Record<string, unknown>>(id: string, props: Partial<T>): void;
}
//# sourceMappingURL=surface-model.d.ts.map