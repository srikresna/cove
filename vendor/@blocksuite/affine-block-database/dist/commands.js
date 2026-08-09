import { DatabaseBlockDataSource, databaseViewInitTemplate, } from './data-source';
export const insertDatabaseBlockCommand = (ctx, next) => {
    const { selectedModels, viewType, place, removeEmptyLine, std } = ctx;
    if (!selectedModels?.length)
        return;
    const targetModel = place === 'before'
        ? selectedModels[0]
        : selectedModels[selectedModels.length - 1];
    if (!targetModel)
        return;
    const result = std.store.addSiblingBlocks(targetModel, [{ flavour: 'affine:database' }], place);
    const string = result[0];
    if (string == null)
        return;
    initDatabaseBlock(std.store, targetModel, string, viewType, false);
    if (removeEmptyLine && targetModel.text?.length === 0) {
        std.store.deleteBlock(targetModel);
    }
    next({ insertedDatabaseBlockId: string });
};
export const initDatabaseBlock = (doc, model, databaseId, viewType, isAppendNewRow = true) => {
    const blockModel = doc.getBlock(databaseId)?.model;
    if (!blockModel) {
        return;
    }
    const datasource = new DatabaseBlockDataSource(blockModel);
    databaseViewInitTemplate(datasource, viewType);
    if (isAppendNewRow) {
        const parent = doc.getParent(model);
        if (!parent)
            return;
        doc.addBlock('affine:paragraph', {}, parent.id);
    }
};
