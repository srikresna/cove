import { findNoteBlockModel } from '@blocksuite/affine-shared/utils';
import { BlockSelection, SurfaceSelection, TextSelection, } from '@blocksuite/std';
export class SelectionHelper {
    get selectedBlockComponents() {
        return this.selectedBlocks
            .map(block => this.widget.std.view.getBlock(block.blockId))
            .filter((block) => !!block);
    }
    get selectedBlocks() {
        const selection = this.selection;
        return selection.find(TextSelection)
            ? selection.filter(TextSelection)
            : selection.filter(BlockSelection);
    }
    get selection() {
        return this.widget.std.selection;
    }
    constructor(widget) {
        this.widget = widget;
        /** Check if given block component is selected */
        this.isBlockSelected = (block) => {
            if (!block)
                return false;
            return this.selectedBlocks.some(selection => selection.blockId === block.model.id);
        };
        this.setSelectedBlocks = (blocks, noteId) => {
            const { selection } = this;
            const selections = blocks.map(block => selection.create(BlockSelection, {
                blockId: block.blockId,
            }));
            // When current page is edgeless page
            // We need to remain surface selection and set editing as true
            if (this.widget.mode === 'edgeless') {
                const surfaceElementId = noteId
                    ? noteId
                    : findNoteBlockModel(blocks[0].model)?.id;
                if (!surfaceElementId)
                    return;
                const surfaceSelection = selection.create(SurfaceSelection, blocks[0].blockId, [surfaceElementId], true);
                selections.push(surfaceSelection);
            }
            selection.set(selections);
        };
    }
}
