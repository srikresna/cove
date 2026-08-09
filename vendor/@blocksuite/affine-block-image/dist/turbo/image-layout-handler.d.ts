import type { Rect } from '@blocksuite/affine-gfx-turbo-renderer';
import { BlockLayoutHandlerExtension } from '@blocksuite/affine-gfx-turbo-renderer';
import type { Container } from '@blocksuite/global/di';
import type { EditorHost } from '@blocksuite/std';
import { type ViewportRecord } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import type { ImageLayout } from './image-painter.worker';
export declare class ImageLayoutHandlerExtension extends BlockLayoutHandlerExtension<ImageLayout> {
    readonly blockType = "affine:image";
    static setup(di: Container): void;
    queryLayout(model: BlockModel, host: EditorHost, viewportRecord: ViewportRecord): ImageLayout | null;
    calculateBound(layout: ImageLayout): {
        rect: Rect;
        subRects: Rect[];
    };
}
//# sourceMappingURL=image-layout-handler.d.ts.map