import type { Rect } from '@blocksuite/affine-gfx-turbo-renderer';
import { BlockLayoutHandlerExtension } from '@blocksuite/affine-gfx-turbo-renderer';
import type { Container } from '@blocksuite/global/di';
import type { EditorHost } from '@blocksuite/std';
import { type ViewportRecord } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import type { ListLayout } from './list-painter.worker';
export declare class ListLayoutHandlerExtension extends BlockLayoutHandlerExtension<ListLayout> {
    readonly blockType = "affine:list";
    static setup(di: Container): void;
    queryLayout(model: BlockModel, host: EditorHost, viewportRecord: ViewportRecord): ListLayout | null;
    calculateBound(layout: ListLayout): {
        rect: Rect;
        subRects: Rect[];
    };
}
//# sourceMappingURL=list-layout-handler.d.ts.map