import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardEmbedHtmlConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:embed-html";
    createBlock(htmlEmbed: BlockSnapshot): string | null;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map