import { type NoteBlockModel } from '@blocksuite/affine-model';
import type { EditorHost } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
import { type Store } from '@blocksuite/store';
export declare function createLinkedDocFromNote(doc: Store, note: NoteBlockModel, docTitle?: string): Store | undefined;
export declare function createLinkedDocFromEdgelessElements(host: EditorHost, elements: GfxModel[], docTitle?: string): Store;
//# sourceMappingURL=render-linked-doc.d.ts.map