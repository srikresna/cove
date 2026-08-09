import type { Command } from '@blocksuite/std';
import { type BlockModel, type DraftModel } from '@blocksuite/store';
export declare const copySelectedModelsCommand: Command<{
    draftedModels?: Promise<DraftModel<BlockModel<object>>[]>;
    onCopy?: () => void;
}>;
//# sourceMappingURL=copy-selected-models.d.ts.map