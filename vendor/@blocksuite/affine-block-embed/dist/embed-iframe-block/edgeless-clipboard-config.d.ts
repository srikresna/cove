import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEmbedIframeConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:embed-iframe";
    createBlock(embedIframe: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map