import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEdgelessTextConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:edgeless-text";
    createBlock(edgelessText: BlockSnapshot): Promise<string | null>;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map