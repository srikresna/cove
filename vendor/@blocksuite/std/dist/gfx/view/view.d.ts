import { type Container } from '@blocksuite/global/di';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { type Bound, type IVec } from '@blocksuite/global/gfx';
import type { Extension } from '@blocksuite/store';
import type { PointerEventState } from '../../event/index.js';
import type { EditorHost } from '../../view/index.js';
import type { GfxController } from '../index.js';
import type { BoxSelectionContext, DragEndContext, DragMoveContext, DragStartContext, GfxViewTransformInterface } from '../interactivity/index.js';
import type { GfxElementGeometry, PointTestOptions } from '../model/base.js';
import { GfxPrimitiveElementModel } from '../model/surface/element-model.js';
import type { GfxLocalElementModel } from '../model/surface/local-element-model.js';
export type EventsHandlerMap = {
    click: PointerEventState;
    dblclick: PointerEventState;
    pointerdown: PointerEventState;
    pointerenter: PointerEventState;
    pointerleave: PointerEventState;
    pointermove: PointerEventState;
    pointerup: PointerEventState;
    dragstart: PointerEventState;
    dragmove: PointerEventState;
    dragend: PointerEventState;
};
export type SupportedEvent = keyof EventsHandlerMap;
export declare const GfxElementModelViewExtIdentifier: import("@blocksuite/global/di").ServiceIdentifier<typeof GfxElementModelView> & (<U extends typeof GfxElementModelView = typeof GfxElementModelView>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare class GfxElementModelView<T extends GfxLocalElementModel | GfxPrimitiveElementModel = GfxPrimitiveElementModel | GfxLocalElementModel, RendererContext = object> implements GfxElementGeometry, Extension, GfxViewTransformInterface {
    readonly gfx: GfxController;
    static type: string;
    private readonly _handlers;
    private _isConnected;
    protected disposable: DisposableGroup;
    readonly model: T;
    get isConnected(): boolean;
    get rotate(): number;
    get surface(): import("../index.js").SurfaceBlockModel;
    get type(): string;
    get std(): import("../../index.js").BlockStdScope;
    constructor(model: T, gfx: GfxController);
    static setup(di: Container): void;
    containsBound(bounds: Bound): boolean;
    /**
     * Dispatches an event to the view.
     * @param event
     * @param evt
     * @returns Whether the event view has any handlers for the event.
     */
    dispatch<K extends keyof EventsHandlerMap>(event: K, evt: EventsHandlerMap[K]): boolean;
    getLineIntersections(start: IVec, end: IVec): import("@blocksuite/global/gfx").PointLocation[] | null;
    getNearestPoint(point: IVec): IVec;
    getRelativePointLocation(relativePoint: IVec): import("@blocksuite/global/gfx").PointLocation;
    includesPoint(x: number, y: number, _: PointTestOptions, __: EditorHost): boolean;
    intersectsBound(bound: Bound): boolean;
    off<K extends keyof EventsHandlerMap>(event: K, callback: (evt: EventsHandlerMap[K]) => void): void;
    on<K extends keyof EventsHandlerMap>(event: K, callback: (evt: EventsHandlerMap[K]) => void): () => void;
    once<K extends keyof EventsHandlerMap>(event: K, callback: (evt: EventsHandlerMap[K]) => void): () => void;
    onCreated(): void;
    onDragStart(_: DragStartContext): void;
    onDragEnd(_: DragEndContext): void;
    onDragMove({ dx, dy, currentBound }: DragMoveContext): void;
    onBoxSelected(_: BoxSelectionContext): boolean | void;
    /**
     * Called when the view is destroyed.
     * Override this method requires calling `super.onDestroyed()`.
     */
    onDestroyed(): void;
    render(_: RendererContext): void;
}
//# sourceMappingURL=view.d.ts.map