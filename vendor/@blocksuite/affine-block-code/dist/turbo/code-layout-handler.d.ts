import type { Rect } from '@blocksuite/affine-gfx-turbo-renderer';
import { BlockLayoutHandlerExtension } from '@blocksuite/affine-gfx-turbo-renderer';
import type { Container } from '@blocksuite/global/di';
import type { EditorHost } from '@blocksuite/std';
import { type ViewportRecord } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import type { CodeLayout } from './code-painter.worker';
export declare class CodeLayoutHandlerExtension extends BlockLayoutHandlerExtension<CodeLayout> {
    readonly blockType = "affine:code";
    static setup(di: Container): void;
    queryLayout(model: BlockModel, host: EditorHost, viewportRecord: ViewportRecord): CodeLayout | null;
    calculateBound(layout: CodeLayout): {
        rect: Rect;
        subRects: Rect[];
    };
}
//# sourceMappingURL=code-layout-handler.d.ts.map