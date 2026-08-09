import { type Point } from '@blocksuite/global/gfx';
import type { BlockComponent } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import { type DropTarget } from './types.js';
/**
 * Calculates the drop target.
 */
export declare function calcDropTarget(point: Point, model: BlockModel, element: Element, draggingElements?: BlockComponent[], scale?: number, 
/**
 * Allow the dragging block to be dropped as sublist
 */
allowSublist?: boolean): DropTarget | null;
//# sourceMappingURL=calc-drop-target.d.ts.map