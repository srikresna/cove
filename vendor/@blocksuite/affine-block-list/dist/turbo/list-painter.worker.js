import { BlockLayoutPainterExtension, getBaseline, } from '@blocksuite/affine-gfx-turbo-renderer/painter';
const debugListBorder = false;
function isListLayout(layout) {
    return layout.type === 'affine:list';
}
class ListLayoutPainter {
    static { this.supportFontFace = typeof FontFace !== 'undefined' &&
        typeof self !== 'undefined' &&
        'fonts' in self; }
    static { this.font = ListLayoutPainter.supportFontFace
        ? new FontFace('Inter', `url(https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTcviYwYZ8UA3.woff2)`)
        : null; }
    static { this.fontLoaded = !ListLayoutPainter.supportFontFace; }
    static {
        if (ListLayoutPainter.supportFontFace && ListLayoutPainter.font) {
            // @ts-expect-error worker fonts API
            self.fonts.add(ListLayoutPainter.font);
            ListLayoutPainter.font
                .load()
                .then(() => {
                ListLayoutPainter.fontLoaded = true;
            })
                .catch(error => {
                console.error('Failed to load Inter font:', error);
            });
        }
    }
    paint(ctx, layout, layoutBaseX, layoutBaseY) {
        if (!ListLayoutPainter.fontLoaded) {
            const message = {
                type: 'paintError',
                error: 'Font not loaded',
                blockType: 'affine:list',
            };
            self.postMessage(message);
            return;
        }
        if (!isListLayout(layout)) {
            console.warn('Expected list layout but received different format:', layout);
            return;
        }
        const renderedPositions = new Set();
        layout.items.forEach(item => {
            const fontSize = item.fontSize;
            const baselineY = getBaseline(fontSize);
            ctx.font = `${fontSize}px Inter`;
            ctx.strokeStyle = 'yellow';
            // Render the text content
            item.rects.forEach(textRect => {
                const x = textRect.rect.x - layoutBaseX;
                const y = textRect.rect.y - layoutBaseY;
                const posKey = `${x},${y}`;
                // Only render if we haven't rendered at this position before
                if (renderedPositions.has(posKey))
                    return;
                if (debugListBorder) {
                    ctx.strokeRect(x, y, textRect.rect.w, textRect.rect.h);
                }
                ctx.fillStyle = 'black';
                ctx.fillText(textRect.text, x, y + baselineY);
                renderedPositions.add(posKey);
            });
        });
    }
}
export const ListLayoutPainterExtension = BlockLayoutPainterExtension('affine:list', ListLayoutPainter);
