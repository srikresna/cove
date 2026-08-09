import type { EditorHost } from '@blocksuite/std';
import type { ViewportRecord } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import { Extension } from '@blocksuite/store';
import type { BlockLayout, Rect } from '../types';
export declare abstract class BlockLayoutHandlerExtension<T extends BlockLayout = BlockLayout> extends Extension {
    abstract readonly blockType: string;
    abstract queryLayout(model: BlockModel, host: EditorHost, viewportRecord: ViewportRecord): T | null;
    abstract calculateBound(layout: T): {
        rect: Rect;
        subRects: Rect[];
    };
}
export declare const BlockLayoutHandlersIdentifier: import("@blocksuite/global/di").ServiceIdentifier<BlockLayoutHandlerExtension<BlockLayout>> & (<U extends BlockLayoutHandlerExtension<BlockLayout> = BlockLayoutHandlerExtension<BlockLayout>>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
//# sourceMappingURL=block-layout-provider.d.ts.map