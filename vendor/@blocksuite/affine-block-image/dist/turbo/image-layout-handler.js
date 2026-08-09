import { BlockLayoutHandlerExtension, BlockLayoutHandlersIdentifier, } from '@blocksuite/affine-gfx-turbo-renderer';
import { clientToModelCoord } from '@blocksuite/std/gfx';
export class ImageLayoutHandlerExtension extends BlockLayoutHandlerExtension {
    constructor() {
        super(...arguments);
        this.blockType = 'affine:image';
    }
    static setup(di) {
        di.addImpl(BlockLayoutHandlersIdentifier('image'), ImageLayoutHandlerExtension);
    }
    queryLayout(model, host, viewportRecord) {
        const component = host.std.view.getBlock(model.id);
        if (!component)
            return null;
        const imageContainer = component.querySelector('.affine-image-container');
        if (!imageContainer)
            return null;
        const resizableImg = component.querySelector('.resizable-img');
        if (!resizableImg)
            return null;
        const { zoom, viewScale } = viewportRecord;
        const rect = resizableImg.getBoundingClientRect();
        const [modelX, modelY] = clientToModelCoord(viewportRecord, [
            rect.x,
            rect.y,
        ]);
        const imageLayout = {
            type: 'affine:image',
            blockId: model.id,
            rect: {
                x: modelX,
                y: modelY,
                w: rect.width / zoom / viewScale,
                h: rect.height / zoom / viewScale,
            },
        };
        return imageLayout;
    }
    calculateBound(layout) {
        const rect = layout.rect;
        return {
            rect,
            subRects: [rect],
        };
    }
}
