import { type BlockComponent, type PointerEventState } from '@blocksuite/std';
export type Rect = {
    left: number;
    top: number;
    width: number;
    height: number;
};
export type BlockInfo = {
    element: BlockComponent;
    rect: Rect;
};
export declare function getSelectingBlockPaths(blockInfos: BlockInfo[], userRect: Rect): string[];
export declare function isDragArea(e: PointerEventState): boolean;
//# sourceMappingURL=utils.d.ts.map