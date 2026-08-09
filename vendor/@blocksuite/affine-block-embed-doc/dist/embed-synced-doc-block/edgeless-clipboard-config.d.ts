import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEmbedSyncedDocConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:embed-synced-doc";
    createBlock(syncedDocEmbed: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map