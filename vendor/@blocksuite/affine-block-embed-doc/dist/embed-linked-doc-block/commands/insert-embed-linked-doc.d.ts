import type { ReferenceParams } from '@blocksuite/affine-model';
import type { Command } from '@blocksuite/std';
export type LinkableFlavour = 'affine:bookmark' | 'affine:embed-linked-doc' | 'affine:embed-synced-doc' | 'affine:embed-iframe' | 'affine:embed-figma' | 'affine:embed-github' | 'affine:embed-loom' | 'affine:embed-youtube';
export type InsertedLinkType = {
    flavour: LinkableFlavour;
} | null;
export declare const insertEmbedLinkedDocCommand: Command<{
    docId: string;
    params?: ReferenceParams;
}, {
    blockId: string;
}>;
//# sourceMappingURL=insert-embed-linked-doc.d.ts.map