import type { Command } from '@blocksuite/std';
import { type BlockModel } from '@blocksuite/store';
/**
 * @description Duplicate the selected models
 * @param selectedModels - The selected models for duplicate
 * @param parentModel - The parent model of duplicated models, default is the last selected model's parent model
 * @param index - The index of the duplicated models in the parent model, default is the last selected model's index + 1
 */
export declare const duplicateSelectedModelsCommand: Command<{
    selectedModels?: BlockModel[];
    parentModel?: BlockModel;
    index?: number;
}>;
//# sourceMappingURL=duplicate-selected-model.d.ts.map