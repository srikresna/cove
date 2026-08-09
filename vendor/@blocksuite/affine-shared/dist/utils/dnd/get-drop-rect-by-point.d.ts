import type { Point } from '@blocksuite/global/gfx';
import type { BlockModel } from '@blocksuite/store';
import { DropFlags } from './types.js';
/**
 * Gets the drop rect by block and point.
 */
export declare function getDropRectByPoint(point: Point, model: BlockModel, element: Element): null | {
    rect: DOMRect;
    flag: DropFlags;
};
//# sourceMappingURL=get-drop-rect-by-point.d.ts.map