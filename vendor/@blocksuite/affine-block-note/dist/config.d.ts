import type { NoteBlockModel } from '@blocksuite/affine-model';
import { type BlockStdScope } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
type NoteBlockContext = {
    note: NoteBlockModel;
    std: BlockStdScope;
};
export type NoteConfig = {
    edgelessNoteHeader: (context: NoteBlockContext) => TemplateResult;
    pageBlockTitle: (context: NoteBlockContext) => TemplateResult;
    /**
     * @returns if the viewport fit animation executed
     */
    pageBlockViewportFitAnimation?: (context: NoteBlockContext) => boolean;
};
export declare const NoteConfigExtension: import("@blocksuite/std").ConfigFactory<NoteConfig>;
export {};
//# sourceMappingURL=config.d.ts.map