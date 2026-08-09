import { type DropTarget } from '@blocksuite/affine-shared/utils';
import { Bound, Point } from '@blocksuite/global/gfx';
import type { BlockComponent, EditorHost } from '@blocksuite/std';
import type { BaseSelection, BlockModel, SliceSnapshot } from '@blocksuite/store';
export declare const getDragHandleContainerHeight: (model: BlockModel) => number;
export declare const containChildBlock: (blocks: BlockComponent[], childModel: BlockModel) => boolean;
export declare const containBlock: (blockIDs: string[], targetID: string) => boolean;
export declare const extractIdsFromSnapshot: (snapshot: SliceSnapshot) => string[];
export declare const insideDatabaseTable: (element: Element) => boolean;
export declare const includeTextSelection: (selections: BaseSelection[]) => boolean;
/**
 * Check if the path of two blocks are equal
 */
export declare const isBlockIdEqual: (id1: string | null | undefined, id2: string | null | undefined) => boolean;
export declare const isOutOfNoteBlock: (editorHost: EditorHost, noteBlock: Element, point: Point, scale: number) => boolean;
export declare const getParentNoteBlock: (blockComponent: BlockComponent) => Element | null;
export declare const getClosestNoteBlock: (editorHost: EditorHost, rootComponent: BlockComponent, point: Point) => BlockComponent<BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
export declare const getClosestBlockByPoint: (editorHost: EditorHost, rootComponent: BlockComponent, point: Point) => BlockComponent<BlockModel<object>, import("@blocksuite/std").BlockService, string> | null;
export declare const getDropResult: (event: MouseEvent, scale?: number) => DropTarget | null;
export declare function getDragHandleLeftPadding(blocks: BlockComponent[]): 2 | 18;
export declare function updateDragHandleClassName(blocks?: BlockComponent[]): void;
export declare function getDuplicateBlocks(blocks: BlockModel[]): {
    flavour: string;
    blockProps: Record<string, unknown>;
}[];
export declare function getSnapshotRect(snapshot: SliceSnapshot): Bound | null;
//# sourceMappingURL=utils.d.ts.map