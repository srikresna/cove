import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardAttachmentConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:attachment";
    createBlock(attachment: BlockSnapshot): Promise<string | null>;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map