import type { Command } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
import type { EmbedLinkInputPopupOptions } from '../components/embed-iframe-link-input-popup';
export declare const insertEmptyEmbedIframeCommand: Command<{
    place?: 'after' | 'before';
    removeEmptyLine?: boolean;
    selectedModels?: BlockModel[];
    linkInputPopupOptions?: EmbedLinkInputPopupOptions;
}, {
    insertedEmbedIframeBlockId: Promise<string>;
}>;
//# sourceMappingURL=insert-empty-embed-iframe.d.ts.map