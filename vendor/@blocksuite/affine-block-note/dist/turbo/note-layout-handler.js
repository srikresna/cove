import { BlockLayoutHandlerExtension, BlockLayoutHandlersIdentifier, } from '@blocksuite/affine-gfx-turbo-renderer';
import { ColorScheme, resolveColor, } from '@blocksuite/affine-model';
import { clientToModelCoord } from '@blocksuite/std/gfx';
export class NoteLayoutHandlerExtension extends BlockLayoutHandlerExtension {
    constructor() {
        super(...arguments);
        this.blockType = 'affine:note';
    }
    static setup(di) {
        di.addImpl(BlockLayoutHandlersIdentifier('note'), NoteLayoutHandlerExtension);
    }
    queryLayout(model, host, viewportRecord) {
        const component = host.std.view.getBlock(model.id);
        if (!component)
            return null;
        // Get the note container element
        const noteContainer = component.querySelector('.affine-note-mask');
        if (!noteContainer)
            return null;
        // Get the bounding client rect of the note container
        const clientRect = noteContainer.getBoundingClientRect();
        // Convert client coordinates to model coordinates
        const [modelX, modelY] = clientToModelCoord(viewportRecord, [
            clientRect.x,
            clientRect.y,
        ]);
        const { zoom, viewScale } = viewportRecord;
        // Cast model to NoteBlockModel to access background property from props
        const noteModel = model;
        const background = noteModel.props.background;
        // Resolve the color to a string
        const backgroundString = resolveColor(background, ColorScheme.Light);
        // Create the note layout object
        const noteLayout = {
            type: 'affine:note',
            blockId: model.id,
            rect: {
                x: modelX,
                y: modelY,
                w: clientRect.width / zoom / viewScale,
                h: clientRect.height / zoom / viewScale,
            },
            background: backgroundString,
        };
        return noteLayout;
    }
    calculateBound(layout) {
        const rect = layout.rect;
        return {
            rect,
            subRects: [rect], // The note is represented by a single rectangle
        };
    }
}
