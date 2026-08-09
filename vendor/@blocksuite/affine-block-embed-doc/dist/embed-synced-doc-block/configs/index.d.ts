import { type EmbedSyncedDocModel } from '@blocksuite/affine-model';
import { type BlockStdScope } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
export type EmbedSyncedDocConfig = {
    edgelessHeader: (context: {
        model: EmbedSyncedDocModel;
        std: BlockStdScope;
    }) => TemplateResult;
};
export declare const EmbedSyncedDocConfigExtension: import("@blocksuite/std").ConfigFactory<EmbedSyncedDocConfig>;
//# sourceMappingURL=index.d.ts.map