import { NoteBlockModel } from '@blocksuite/affine-model';
import type { BlockComponent, BlockStdScope } from '@blocksuite/std';
import type { BlockModel, Store } from '@blocksuite/store';
export declare function findAncestorModel(model: BlockModel, match: (m: BlockModel) => boolean): BlockModel<object> | null;
/**
 * Get block component by its model and wait for the doc element to finish updating.
 *
 */
export declare function asyncGetBlockComponent(std: BlockStdScope, id: string): Promise<BlockComponent | null>;
export declare function findNoteBlockModel(model: BlockModel): NoteBlockModel | null;
export declare function getLastNoteBlock(doc: Store): NoteBlockModel | null;
export declare function getFirstNoteBlock(doc: Store): NoteBlockModel | null;
//# sourceMappingURL=getter.d.ts.map