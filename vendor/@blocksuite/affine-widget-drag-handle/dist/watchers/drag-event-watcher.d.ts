import { DropIndicator } from '@blocksuite/affine-components/drop-indicator';
import { type BlockStdScope, type DragFromBlockSuite, type DragPayload } from '@blocksuite/std';
import { type SliceSnapshot } from '@blocksuite/store';
import type { AffineDragHandleWidget } from '../drag-handle.js';
import { PreviewHelper } from '../helpers/preview-helper.js';
export type DragBlockEntity = {
    type: 'blocks';
    /**
     * The mode that the blocks are dragged from
     */
    fromMode?: 'block' | 'gfx';
    snapshot?: SliceSnapshot;
    modelIds: string[];
};
export type DragBlockPayload = DragPayload<DragBlockEntity, DragFromBlockSuite>;
declare module '@blocksuite/std' {
    interface DNDEntity {
        blocks: DragBlockPayload;
    }
}
export declare class DragEventWatcher {
    readonly widget: AffineDragHandleWidget;
    dropIndicator: null | DropIndicator;
    previewHelper: PreviewHelper;
    dropTargetCleanUps: Map<string, (() => void)[]>;
    resetOpacityCallbacks: (() => void)[];
    get host(): import("@blocksuite/std").EditorHost;
    get mode(): import("@blocksuite/affine-model").DocMode | null;
    get std(): BlockStdScope;
    get gfx(): import("@blocksuite/std/gfx").GfxController;
    private readonly _createDropIndicator;
    private readonly _clearDropIndicator;
    private readonly _cleanup;
    private readonly _onDragMove;
    private readonly _getFallbackInsertPlace;
    /**
     * When dragging, should update indicator position and target drop block id
     */
    private readonly _getDropResult;
    private readonly _updateDropIndicator;
    private readonly _resetDropResult;
    private readonly _updateDropResult;
    private readonly _getSnapshotFromSelectedGfxElms;
    private readonly _getDraggedSnapshot;
    private readonly _getSnapshotFromHoveredBlocks;
    private readonly _onEdgelessDrop;
    private readonly _onPageDrop;
    private readonly _onDrop;
    private readonly _onDropNoteOnNote;
    /**
     * Merge the snapshot into the current existing surface model and page model.
     * This method does the following:
     * 1. Analyze the snapshot to build the container dependency tree
     * 2. Merge the snapshot in the correct order to make sure all containers are created after their children
     * @param snapshot
     * @param point
     */
    private readonly _mergeSnapshotToCurDoc;
    /**
     * Rewrite the xywh of the snapshot to make the top left corner of the snapshot align with the point
     * @param snapshot
     * @param point the point in model coordinate
     * @returns
     */
    private readonly _rewriteSnapshotXYWH;
    get dndExtension(): import("@blocksuite/affine-shared/services").DNDAPIExtension | null;
    /**
     * This method will try to drop the snapshot as gfx block directly if all blocks can be dropped as gfx block.
     * Otherwise, it will create a linked doc to reference the original doc.
     * @param snapshot
     * @param point
     */
    private readonly _dropAsGfxBlock;
    private readonly _toSnapshot;
    private readonly _trackLinkedDocCreated;
    private readonly _setOpacityOfDraggedBlocks;
    constructor(widget: AffineDragHandleWidget);
    private _dropToModel;
    private _getJob;
    private _isDropOnCurrentEditor;
    private _isUnderNoteBlock;
    private _makeDraggable;
    private _makeDropTarget;
    private _monitorBlockDrag;
    watch(): void;
}
//# sourceMappingURL=drag-event-watcher.d.ts.map