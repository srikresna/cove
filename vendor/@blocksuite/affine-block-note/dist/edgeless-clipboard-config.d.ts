import { EdgelessClipboardConfig } from '@blocksuite/affine-block-surface';
import { type BlockSnapshot } from '@blocksuite/store';
export declare class EdgelessClipboardNoteConfig extends EdgelessClipboardConfig {
    static readonly key = "affine:note";
    createBlock(note: BlockSnapshot): Promise<null | string>;
}
//# sourceMappingURL=edgeless-clipboard-config.d.ts.map