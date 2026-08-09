import type { Rect } from '@blocksuite/affine-gfx-turbo-renderer';
import { BlockLayoutHandlerExtension } from '@blocksuite/affine-gfx-turbo-renderer';
import type { Container } from '@blocksuite/global/di';
import type { EditorHost } from '@blocksuite/std';
import { type ViewportRecord } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import type { ParagraphLayout } from './paragraph-painter.worker';
export declare class ParagraphLayoutHandlerExtension extends BlockLayoutHandlerExtension<ParagraphLayout> {
    readonly blockType = "affine:paragraph";
    static setup(di: Container): void;
    queryLayout(model: BlockModel, host: EditorHost, viewportRecord: ViewportRecord): ParagraphLayout | null;
    calculateBound(layout: ParagraphLayout): {
        rect: Rect;
        subRects: Rect[];
    };
}
//# sourceMappingURL=paragraph-layout-handler.d.ts.map