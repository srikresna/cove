import type { Rect } from '@blocksuite/global/gfx';
import type { BlockComponent } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
export interface EditingState {
    element: BlockComponent;
    model: BlockModel;
    rect: DOMRect;
}
/**
 * Returns a flag for the drop target.
 */
export declare enum DropFlags {
    Normal = 0,
    Database = 1,
    EmptyDatabase = 2
}
/**
 * A drop placement.
 */
export type DropPlacement = 'none' | 'before' | 'after' | 'database' | 'in';
export type DropTarget = {
    placement: DropPlacement;
    rect: Rect;
    modelState: EditingState;
};
//# sourceMappingURL=types.d.ts.map