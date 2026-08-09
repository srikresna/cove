import { BlockLayoutPainterExtension } from '@blocksuite/affine-gfx-turbo-renderer/painter';
function isNoteLayout(layout) {
    return layout.type === 'affine:note';
}
class NoteLayoutPainter {
    paint(ctx, layout, layoutBaseX, layoutBaseY) {
        if (!isNoteLayout(layout)) {
            const message = {
                type: 'paintError',
                error: 'Invalid layout format',
                blockType: 'affine:note',
            };
            self.postMessage(message);
            return;
        }
        // Get the layout rectangle
        const x = layout.rect.x - layoutBaseX;
        const y = layout.rect.y - layoutBaseY;
        const width = layout.rect.w;
        const height = layout.rect.h;
        ctx.fillStyle = layout.background || 'rgb(255, 255, 255)';
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
    }
}
export const NoteLayoutPainterExtension = BlockLayoutPainterExtension('affine:note', NoteLayoutPainter);
