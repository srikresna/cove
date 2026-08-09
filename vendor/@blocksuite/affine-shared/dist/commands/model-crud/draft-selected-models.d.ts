import type { Command } from '@blocksuite/std';
import { type BlockModel, type DraftModel } from '@blocksuite/store';
export declare const draftSelectedModelsCommand: Command<{
    selectedModels?: BlockModel[];
}, {
    draftedModels: Promise<DraftModel<BlockModel<object>>[]>;
}>;
//# sourceMappingURL=draft-selected-models.d.ts.map