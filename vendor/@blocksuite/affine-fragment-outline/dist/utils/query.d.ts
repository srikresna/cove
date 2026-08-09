import { NoteBlockModel, NoteDisplayMode, ParagraphBlockModel, RootBlockModel } from '@blocksuite/affine-model';
import type { BlockModel, Store } from '@blocksuite/store';
export declare function getNotesFromStore(store: Store, modes?: NoteDisplayMode[]): NoteBlockModel[];
export declare function isRootBlock(block: BlockModel): block is RootBlockModel;
export declare function isHeadingBlock(block: BlockModel): block is ParagraphBlockModel;
export declare function getHeadingBlocksFromNote(note: NoteBlockModel, ignoreEmpty?: boolean): BlockModel<object>[];
export declare function getHeadingBlocksFromDoc(store: Store, modes?: NoteDisplayMode[], ignoreEmpty?: boolean): BlockModel<object>[];
//# sourceMappingURL=query.d.ts.map