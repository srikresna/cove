import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardImageConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:image";
    createBlock(image: BlockSnapshot): Promise<string | null>;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map