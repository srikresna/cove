import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEmbedLinkedDocConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:embed-linked-doc";
    createBlock(linkedDocEmbed: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map