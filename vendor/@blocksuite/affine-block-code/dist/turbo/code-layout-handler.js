import { BlockLayoutHandlerExtension, BlockLayoutHandlersIdentifier, } from '@blocksuite/affine-gfx-turbo-renderer';
import { clientToModelCoord } from '@blocksuite/std/gfx';
export class CodeLayoutHandlerExtension extends BlockLayoutHandlerExtension {
    constructor() {
        super(...arguments);
        this.blockType = 'affine:code';
    }
    static setup(di) {
        di.addImpl(BlockLayoutHandlersIdentifier('code'), CodeLayoutHandlerExtension);
    }
    queryLayout(model, host, viewportRecord) {
        const component = host.std.view.getBlock(model.id);
        if (!component)
            return null;
        const codeBlockElement = component.querySelector('.affine-code-block-container');
        if (!codeBlockElement)
            return null;
        const { zoom, viewScale } = viewportRecord;
        const codeLayout = {
            type: 'affine:code',
            blockId: model.id,
            rect: { x: 0, y: 0, w: 0, h: 0 },
        };
        // Get the bounding rect of the code block
        const clientRect = codeBlockElement.getBoundingClientRect();
        if (!clientRect)
            return null;
        // Convert client coordinates to model coordinates
        const [modelX, modelY] = clientToModelCoord(viewportRecord, [
            clientRect.x,
            clientRect.y,
        ]);
        codeLayout.rect = {
            x: modelX,
            y: modelY,
            w: clientRect.width / zoom / viewScale,
            h: clientRect.height / zoom / viewScale,
        };
        return codeLayout;
    }
    calculateBound(layout) {
        const rect = layout.rect;
        return {
            rect,
            subRects: [rect],
        };
    }
}
