import type { BlockSelection, Command, SurfaceSelection, TextSelection } from '@blocksuite/std';
import { BlockComponent } from '@blocksuite/std';
import type { RoleType } from '@blocksuite/store';
import type { ImageSelection } from '../../selection/index.js';
export declare const getSelectedBlocksCommand: Command<{
    currentTextSelection?: TextSelection;
    currentBlockSelections?: BlockSelection[];
    currentImageSelections?: ImageSelection[];
    currentSurfaceSelection?: SurfaceSelection;
    textSelection?: TextSelection;
    blockSelections?: BlockSelection[];
    imageSelections?: ImageSelection[];
    surfaceSelection?: SurfaceSelection;
    filter?: (el: BlockComponent) => boolean;
    types?: Array<'image' | 'text' | 'block' | 'surface'>;
    roles?: RoleType[];
    mode?: 'all' | 'flat' | 'highest';
}, {
    selectedBlocks: BlockComponent[];
}>;
//# sourceMappingURL=get-selected-blocks.d.ts.map