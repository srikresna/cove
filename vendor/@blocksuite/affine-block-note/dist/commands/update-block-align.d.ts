import type { TextAlign } from '@blocksuite/affine-model';
import { type BlockComponent, type Command } from '@blocksuite/std';
type UpdateBlockAlignConfig = {
    textAlign: TextAlign;
    selectedBlocks?: BlockComponent[];
};
export declare const updateBlockAlign: Command<UpdateBlockAlignConfig>;
export {};
//# sourceMappingURL=update-block-align.d.ts.map