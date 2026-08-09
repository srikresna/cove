import { EdgelessCRUDExtension } from '@blocksuite/affine-block-surface';
import {} from '@blocksuite/affine-model';
import { GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
export const insertSurfaceRefBlockCommand = (ctx, next) => {
    const { selectedModels, reference, place, removeEmptyLine, std } = ctx;
    if (!selectedModels?.length)
        return;
    const targetModel = place === 'before'
        ? selectedModels[0]
        : selectedModels[selectedModels.length - 1];
    const surfaceRefProps = {
        flavour: 'affine:surface-ref',
        reference,
    };
    const crud = std.get(EdgelessCRUDExtension);
    const element = crud.getElementById(reference);
    if (!element) {
        console.error(`reference not found ${reference}`);
        return;
    }
    surfaceRefProps.refFlavour =
        element instanceof GfxPrimitiveElementModel
            ? element.type
            : element.flavour;
    const result = std.store.addSiblingBlocks(targetModel, [surfaceRefProps], place);
    if (result.length === 0)
        return;
    if (removeEmptyLine && targetModel.text?.length === 0) {
        std.store.deleteBlock(targetModel);
    }
    next({
        insertedSurfaceRefBlockId: result[0],
    });
};
