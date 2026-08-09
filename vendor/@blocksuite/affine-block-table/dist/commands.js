import { TableModelFlavour, } from '@blocksuite/affine-model';
import {} from '@blocksuite/store';
import { TableDataManager } from './table-data-manager';
export const insertTableBlockCommand = (ctx, next) => {
    const { selectedModels, place, removeEmptyLine, std } = ctx;
    if (!selectedModels?.length)
        return;
    const targetModel = place === 'before'
        ? selectedModels[0]
        : selectedModels[selectedModels.length - 1];
    if (!targetModel)
        return;
    const result = std.store.addSiblingBlocks(targetModel, [{ flavour: TableModelFlavour }], place);
    const blockId = result[0];
    if (blockId == null)
        return;
    const model = std.store.getBlock(blockId)?.model;
    if (model == null)
        return;
    const dataManager = new TableDataManager(model);
    dataManager.addNRow(2);
    dataManager.addNColumn(2);
    if (removeEmptyLine && targetModel.text?.length === 0) {
        std.store.deleteBlock(targetModel);
    }
    next({ insertedTableBlockId: blockId });
};
