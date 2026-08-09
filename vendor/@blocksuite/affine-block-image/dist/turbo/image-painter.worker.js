import { BlockLayoutPainterExtension } from '@blocksuite/affine-gfx-turbo-renderer/painter';
function isImageLayout(layout) {
    return layout.type === 'affine:image';
}
class ImageLayoutPainter {
    paint(ctx, layout, layoutBaseX, layoutBaseY) {
        if (!isImageLayout(layout)) {
            console.warn('Expected image layout but received different format:', layout);
            return;
        }
        // For now, just paint a white rectangle
        const x = layout.rect.x - layoutBaseX;
        const y = layout.rect.y - layoutBaseY;
        const width = layout.rect.w;
        const height = layout.rect.h;
        // Draw a white rectangle with border
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, width, height);
        // Add a border
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
}
export const ImageLayoutPainterExtension = BlockLayoutPainterExtension('affine:image', ImageLayoutPainter);
