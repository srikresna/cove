import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEmbedFigmaConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:embed-figma";
    createBlock(figmaEmbed: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map