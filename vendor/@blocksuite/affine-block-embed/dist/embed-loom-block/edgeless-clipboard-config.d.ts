import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEmbedLoomConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:embed-loom";
    createBlock(loomEmbed: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map