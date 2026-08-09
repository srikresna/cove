import { BlockLayoutPainterExtension } from '@blocksuite/affine-gfx-turbo-renderer/painter';
function isCodeLayout(layout) {
    return layout.type === 'affine:code';
}
class CodeLayoutPainter {
    paint(ctx, layout, layoutBaseX, layoutBaseY) {
        if (!isCodeLayout(layout)) {
            const message = {
                type: 'paintError',
                error: 'Invalid layout format',
                blockType: 'affine:code',
            };
            self.postMessage(message);
            return;
        }
        // Get the layout dimensions
        const x = layout.rect.x - layoutBaseX;
        const y = layout.rect.y - layoutBaseY;
        const width = layout.rect.w;
        const height = layout.rect.h;
        // Simple white rectangle for now
        ctx.fillStyle = 'white';
        ctx.fillRect(x, y, width, height);
        // Add a border to visualize the code block
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
}
export const CodeLayoutPainterExtension = BlockLayoutPainterExtension('affine:code', CodeLayoutPainter);
