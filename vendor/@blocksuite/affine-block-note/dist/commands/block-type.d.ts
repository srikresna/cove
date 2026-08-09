import { type BlockComponent, type Command } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
type UpdateBlockConfig = {
    flavour: string;
    props?: Record<string, unknown>;
};
export declare const updateBlockType: Command<UpdateBlockConfig & {
    selectedBlocks?: BlockComponent[];
}, {
    updatedBlocks: BlockModel[];
}>;
export {};
//# sourceMappingURL=block-type.d.ts.map