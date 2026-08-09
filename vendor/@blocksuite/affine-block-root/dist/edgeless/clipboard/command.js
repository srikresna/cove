import { EdgelessClipboardConfigIdentifier, EdgelessCRUDIdentifier, SurfaceGroupLikeModel, } from '@blocksuite/affine-block-surface';
import { Bound } from '@blocksuite/global/gfx';
import { assertType } from '@blocksuite/global/utils';
import { GfxControllerIdentifier, SortOrder, } from '@blocksuite/std/gfx';
import { BlockSnapshotSchema } from '@blocksuite/store';
import { createCanvasElement } from './canvas';
import { createNewPresentationIndexes, edgelessElementsBoundFromRawData, } from './utils';
export const createElementsFromClipboardDataCommand = (ctx, next) => {
    const { std, elementsRawData } = ctx;
    let { pasteCenter } = ctx;
    const gfx = std.get(GfxControllerIdentifier);
    const toolManager = gfx.tool;
    const runner = async () => {
        let oldCommonBound, pasteX, pasteY;
        {
            const lastMousePos = toolManager.lastMousePos$.peek();
            pasteCenter = pasteCenter ?? [lastMousePos.x, lastMousePos.y];
            const [modelX, modelY] = pasteCenter;
            oldCommonBound = edgelessElementsBoundFromRawData(elementsRawData);
            pasteX = modelX - oldCommonBound.w / 2;
            pasteY = modelY - oldCommonBound.h / 2;
        }
        const getNewXYWH = (oldXYWH) => {
            const oldBound = Bound.deserialize(oldXYWH);
            return new Bound(oldBound.x + pasteX - oldCommonBound.x, oldBound.y + pasteY - oldCommonBound.y, oldBound.w, oldBound.h).serialize();
        };
        // create blocks and canvas elements
        const context = {
            oldToNewIdMap: new Map(),
            originalIndexes: new Map(),
            newPresentationIndexes: createNewPresentationIndexes(elementsRawData, std),
        };
        const blockModels = [];
        const canvasElements = [];
        const allElements = [];
        for (const data of elementsRawData) {
            const { data: blockSnapshot } = BlockSnapshotSchema.safeParse(data);
            if (blockSnapshot) {
                const oldId = blockSnapshot.id;
                const config = std.getOptional(EdgelessClipboardConfigIdentifier(blockSnapshot.flavour));
                if (!config)
                    continue;
                if (typeof blockSnapshot.props.index !== 'string') {
                    console.error(`Block(id: ${oldId}) does not have index property`);
                    continue;
                }
                const originalIndex = blockSnapshot.props.index;
                if (typeof blockSnapshot.props.xywh !== 'string') {
                    console.error(`Block(id: ${oldId}) does not have xywh property`);
                    continue;
                }
                assertType(blockSnapshot.props);
                blockSnapshot.props.xywh = getNewXYWH(blockSnapshot.props.xywh);
                blockSnapshot.props.lockedBySelf = false;
                const newId = await config.createBlock(blockSnapshot, context);
                if (!newId)
                    continue;
                const block = std.store.getBlock(newId);
                if (!block)
                    continue;
                assertType(block.model);
                blockModels.push(block.model);
                allElements.push(block.model);
                context.oldToNewIdMap.set(oldId, newId);
                context.originalIndexes.set(oldId, originalIndex);
            }
            else {
                assertType(data);
                const oldId = data.id;
                const element = createCanvasElement(std, data, context, getNewXYWH(data.xywh));
                if (!element)
                    continue;
                canvasElements.push(element);
                allElements.push(element);
                context.oldToNewIdMap.set(oldId, element.id);
                context.originalIndexes.set(oldId, element.index);
            }
        }
        // remap old id to new id for the original index
        const oldIds = [...context.originalIndexes.keys()];
        oldIds.forEach(oldId => {
            const newId = context.oldToNewIdMap.get(oldId);
            const originalIndex = context.originalIndexes.get(oldId);
            if (newId && originalIndex) {
                context.originalIndexes.set(newId, originalIndex);
                context.originalIndexes.delete(oldId);
            }
        });
        updatePastedElementsIndex(std, allElements, context.originalIndexes);
        return {
            canvasElements: canvasElements,
            blockModels: blockModels,
        };
    };
    return next({
        createdElementsPromise: runner(),
    });
};
function updatePastedElementsIndex(std, elements, originalIndexes) {
    const gfx = std.get(GfxControllerIdentifier);
    const crud = std.get(EdgelessCRUDIdentifier);
    function compare(a, b) {
        if (a instanceof SurfaceGroupLikeModel && a.hasDescendant(b)) {
            return SortOrder.BEFORE;
        }
        else if (b instanceof SurfaceGroupLikeModel && b.hasDescendant(a)) {
            return SortOrder.AFTER;
        }
        else {
            const aGroups = a.groups;
            const bGroups = b.groups;
            let i = 1;
            let aGroup = aGroups.at(-i);
            let bGroup = bGroups.at(-i);
            while (aGroup === bGroup && aGroup) {
                ++i;
                aGroup = aGroups.at(-i);
                bGroup = bGroups.at(-i);
            }
            aGroup = aGroup ?? a;
            bGroup = bGroup ?? b;
            return originalIndexes.get(aGroup.id) === originalIndexes.get(bGroup.id)
                ? SortOrder.SAME
                : originalIndexes.get(aGroup.id) < originalIndexes.get(bGroup.id)
                    ? SortOrder.BEFORE
                    : SortOrder.AFTER;
        }
    }
    const idxGenerator = gfx.layer.createIndexGenerator();
    const sortedElements = elements.sort(compare);
    sortedElements.forEach(ele => {
        const newIndex = idxGenerator();
        crud.updateElement(ele.id, {
            index: newIndex,
        });
    });
}
