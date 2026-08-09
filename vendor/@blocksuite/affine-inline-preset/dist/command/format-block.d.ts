import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import type { BlockSelection, Command } from '@blocksuite/std';
export declare const formatBlockCommand: Command<{
    currentBlockSelections?: BlockSelection[];
    blockSelections?: BlockSelection[];
    styles: AffineTextAttributes;
    mode?: 'replace' | 'merge';
}>;
//# sourceMappingURL=format-block.d.ts.map