import { type DocMode } from '@blocksuite/affine-model';
import type { BlockStdScope } from '@blocksuite/std';
import { type BlockModel, type BlockSnapshot, type DraftModel, type Store } from '@blocksuite/store';
export declare const RENDER_CARD_THROTTLE_MS = 60;
export declare function getNotesFromDoc(doc: Store): BlockModel<object>[] | null;
export declare function isEmptyDoc(doc: Store | null, mode: DocMode): boolean;
export declare function isEmptyNote(note: BlockModel): boolean;
/**
 * Gets the document content with a max length.
 */
export declare function getDocContentWithMaxLength(doc: Store, maxlength?: number): string | undefined;
export declare function getTitleFromSelectedModels(selectedModels: DraftModel[]): string | undefined;
export declare function promptDocTitle(std: BlockStdScope, autofill?: string): Promise<string | null> | Promise<undefined>;
export declare function notifyDocCreated(std: BlockStdScope): void;
export declare function convertSelectedBlocksToLinkedDoc(std: BlockStdScope, doc: Store, selectedModels: DraftModel[] | Promise<DraftModel[]>, docTitle?: string): Promise<Store | undefined>;
export declare function createLinkedDocFromSlice(std: BlockStdScope, doc: Store, snapshots: BlockSnapshot[], docTitle?: string): Store;
//# sourceMappingURL=render-linked-doc.d.ts.map