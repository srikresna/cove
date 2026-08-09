import { type BlockComponent, BlockSelection } from '@blocksuite/std';
import type { AffineDragHandleWidget } from '../drag-handle.js';
export declare class SelectionHelper {
    readonly widget: AffineDragHandleWidget;
    /** Check if given block component is selected */
    isBlockSelected: (block?: BlockComponent) => boolean;
    setSelectedBlocks: (blocks: BlockComponent[], noteId?: string) => void;
    get selectedBlockComponents(): BlockComponent<import("@blocksuite/store").BlockModel<object>, import("@blocksuite/std").BlockService, string>[];
    get selectedBlocks(): BlockSelection[];
    get selection(): import("@blocksuite/store").StoreSelectionExtension;
    constructor(widget: AffineDragHandleWidget);
}
//# sourceMappingURL=selection-helper.d.ts.map