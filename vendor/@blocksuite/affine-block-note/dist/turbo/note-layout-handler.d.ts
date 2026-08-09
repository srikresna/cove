import type { Rect } from '@blocksuite/affine-gfx-turbo-renderer';
import { BlockLayoutHandlerExtension } from '@blocksuite/affine-gfx-turbo-renderer';
import type { Container } from '@blocksuite/global/di';
import type { EditorHost } from '@blocksuite/std';
import { type ViewportRecord } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import type { NoteLayout } from './note-painter.worker';
export declare class NoteLayoutHandlerExtension extends BlockLayoutHandlerExtension<NoteLayout> {
    readonly blockType = "affine:note";
    static setup(di: Container): void;
    queryLayout(model: BlockModel, host: EditorHost, viewportRecord: ViewportRecord): NoteLayout | null;
    calculateBound(layout: NoteLayout): {
        rect: Rect;
        subRects: Rect[];
    };
}
//# sourceMappingURL=note-layout-handler.d.ts.map