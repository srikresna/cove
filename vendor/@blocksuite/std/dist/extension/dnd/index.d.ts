import { type ElementGetFeedbackArgs } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { DropTargetRecord } from '@atlaskit/pragmatic-drag-and-drop/types';
import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { ServiceIdentifier } from '@blocksuite/global/di';
import { LifeCycleWatcher } from '../lifecycle-watcher.js';
import type { ElementDragEventBaseArgs, ElementDragEventMap, ElementDropEventMap, ElementDropTargetFeedbackArgs, ElementMonitorFeedbackArgs, OriginalAutoScrollOption, OriginalDraggableOption } from './types.js';
export type DragEntity = {
    type: string;
};
export type DragFrom = {
    at: string;
};
export type DragFromBlockSuite = {
    at: 'blocksuite-editor';
    docId: string;
};
export type DragPayload<E extends DragEntity = DragEntity, F extends DragFrom = DragFromBlockSuite> = {
    bsEntity?: E;
    from?: F;
};
export type DropPayload<T extends {} = {}> = {
    edge?: Edge;
} & T;
export type DropEdge = Edge;
export interface DNDEntity {
    basic: DragEntity;
}
export type DraggableOption<PayloadEntity extends DragEntity, PayloadFrom extends DragFrom, DropPayload extends {}> = Pick<OriginalDraggableOption, 'element' | 'dragHandle' | 'canDrag'> & {
    /**
     * Set drag data for the draggable element.
     * @see {@link ElementGetFeedbackArgs} for callback arguments
     * @param callback - callback to set drag
     */
    setDragData?: (args: ElementGetFeedbackArgs) => PayloadEntity;
    /**
     * Set external drag data for the draggable element.
     * @param callback - callback to set external drag data
     * @see {@link ElementGetFeedbackArgs} for callback arguments
     */
    setExternalDragData?: (args: ElementGetFeedbackArgs) => ReturnType<Required<OriginalDraggableOption>['getInitialDataForExternal']>;
    /**
     * Set custom drag preview for the draggable element.
     *
     * `setDragPreview` is a function that will be called with a `container` element and other drag data as parameter when the drag preview is generating.
     * Append the custom element to the `container` which will be used to generate the preview. Once the drag preview is generated, the
     * `container` element and its children will be removed automatically.
     *
     * If you want to completely disable the drag preview, just set `setDragPreview` to `false`.
     *
     * @example
     * dnd.draggable({
     *  // ...
     *  setDragPreview: ({ container }) => {
     *    const preview = document.createElement('div');
     *    preview.style.width = '100px';
     *    preview.style.height = '100px';
     *    preview.style.backgroundColor = 'red';
     *    preview.innerText = 'Custom Drag Preview';
     *    container.appendChild(preview);
     *
     *    return () => {
     *      // do some cleanup
     *    }
     *  }
     * })
     *
     * @param callback - callback to set custom drag preview
     * @returns
     */
    setDragPreview?: false | ((options: ElementDragEventBaseArgs<DragPayload<PayloadEntity, PayloadFrom>> & {
        /**
         * Allows you to use the native `setDragImage` function if you want
         * Although, we recommend using alternative techniques (see element adapter docs)
         */
        nativeSetDragImage: DataTransfer['setDragImage'] | null;
        container: HTMLElement;
        setOffset: (offset: 'preserve' | 'center' | {
            x: number;
            y: number;
        }) => void;
    }) => void | (() => void));
} & ElementDragEventMap<DragPayload<PayloadEntity, PayloadFrom>, DropPayload>;
export type DropTargetOption<PayloadEntity extends DragEntity, PayloadFrom extends DragFrom, DropPayload extends {}> = {
    /**
     * {@link OriginalDropTargetOption.element}
     */
    element: HTMLElement;
    /**
     * Allow drop position for the drop target.
     */
    allowDropPosition?: Edge[];
    /**
     * {@link OriginalDropTargetOption.getDropEffect}
     */
    getDropEffect?: (args: ElementDropTargetFeedbackArgs<DragPayload<PayloadEntity, PayloadFrom>>) => DropTargetRecord['dropEffect'];
    /**
     * {@link OriginalDropTargetOption.canDrop}
     */
    canDrop?: (args: ElementDropTargetFeedbackArgs<DragPayload<PayloadEntity, PayloadFrom>>) => boolean;
    /**
     * {@link OriginalDropTargetOption.getData}
     */
    setDropData?: (args: ElementDropTargetFeedbackArgs<DragPayload<PayloadEntity, PayloadFrom>>) => DropPayload;
    /**
     * {@link OriginalDropTargetOption.getIsSticky}
     */
    getIsSticky?: (args: ElementDropTargetFeedbackArgs<DragPayload<PayloadEntity, PayloadFrom>>) => boolean;
} & ElementDropEventMap<DragPayload<PayloadEntity, PayloadFrom>, DropPayload>;
export type MonitorOption<PayloadEntity extends DragEntity, PayloadFrom extends DragFrom, DropPayload extends {}> = {
    /**
     * {@link OriginalMonitorOption.canMonitor}
     */
    canMonitor?: (args: ElementMonitorFeedbackArgs<DragPayload<PayloadEntity, PayloadFrom>>) => boolean;
} & ElementDragEventMap<DragPayload<PayloadEntity, PayloadFrom>, DropPayload>;
export type AutoScroll<PayloadEntity extends DragEntity, PayloadFrom extends DragFrom> = {
    element: HTMLElement;
    canScroll?: (args: ElementDragEventBaseArgs<DragPayload<PayloadEntity, PayloadFrom>>) => void;
    getAllowedAxis?: (args: ElementDragEventBaseArgs<DragPayload<PayloadEntity, PayloadFrom>>) => ReturnType<Required<OriginalAutoScrollOption>['getAllowedAxis']>;
    getConfiguration?: (args: ElementDragEventBaseArgs<DragPayload<PayloadEntity, PayloadFrom>>) => ReturnType<Required<OriginalAutoScrollOption>['getConfiguration']>;
};
export declare const DndExtensionIdentifier: ServiceIdentifier<DndController>;
export declare class DndController extends LifeCycleWatcher {
    static key: string;
    /**
     * Make an element draggable.
     */
    draggable<PayloadEntity extends DragEntity = DragEntity, DropData extends {} = {}>(args: DraggableOption<PayloadEntity, DragFromBlockSuite, DropPayload<DropData>>): import("@atlaskit/pragmatic-drag-and-drop/types").CleanupFn;
    /**
     * Make an element a drop target.
     */
    dropTarget<PayloadEntity extends DragEntity = DragEntity, DropData extends {} = {}, PayloadFrom extends DragFrom = DragFromBlockSuite>(args: DropTargetOption<PayloadEntity, PayloadFrom, DropPayload<DropData>>): import("@atlaskit/pragmatic-drag-and-drop/types").CleanupFn;
    monitor<PayloadEntity extends DragEntity = DragEntity, DropData extends {} = {}, PayloadFrom extends DragFrom = DragFromBlockSuite>(args: MonitorOption<PayloadEntity, PayloadFrom, DropPayload<DropData>>): import("@atlaskit/pragmatic-drag-and-drop/types").CleanupFn;
    autoScroll<PayloadEntity extends DragEntity = DragEntity, PayloadFrom extends DragFrom = DragFromBlockSuite>(options: AutoScroll<PayloadEntity, PayloadFrom>): import("@atlaskit/pragmatic-drag-and-drop/types").CleanupFn;
}
//# sourceMappingURL=index.d.ts.map