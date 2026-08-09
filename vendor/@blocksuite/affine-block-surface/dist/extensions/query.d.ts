import type { Connectable, NoteBlockModel } from '@blocksuite/affine-model';
import type { GfxModel } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
export declare function isConnectable(element: GfxModel | null): element is Connectable;
export declare function isNoteBlock(element: BlockModel | GfxModel | null): element is NoteBlockModel;
//# sourceMappingURL=query.d.ts.map