import { type ClipboardConfigCreationContext, EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardFrameConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:frame";
    createBlock(frame: BlockSnapshot, context: ClipboardConfigCreationContext): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map