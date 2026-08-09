import { getImageFilesFromLocal } from '@blocksuite/affine-shared/utils';
import { addSiblingImageBlocks } from '../utils';
export const insertImagesCommand = (ctx, next) => {
    const { selectedModels, placement, removeEmptyLine, std } = ctx;
    if (!selectedModels?.length)
        return;
    const targetModel = placement === 'before'
        ? selectedModels[0]
        : selectedModels[selectedModels.length - 1];
    return next({
        insertedImageIds: getImageFilesFromLocal()
            .then(files => addSiblingImageBlocks(std, files, targetModel, placement))
            .then(result => {
            if (result.length &&
                removeEmptyLine &&
                targetModel.text?.length === 0) {
                std.store.deleteBlock(targetModel);
            }
            return result;
        }),
    });
};
