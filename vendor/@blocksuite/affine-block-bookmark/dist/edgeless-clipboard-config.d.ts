import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardBookmarkConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:bookmark";
    createBlock(bookmark: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map