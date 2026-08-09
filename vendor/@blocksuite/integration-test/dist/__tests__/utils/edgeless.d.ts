import type { EdgelessRootBlockComponent, PageRootBlockComponent } from '@blocksuite/affine/blocks/root';
import type { SurfaceBlockComponent } from '@blocksuite/affine/blocks/surface';
import type { Store } from '@blocksuite/store';
import type { TestAffineEditorContainer } from '../../index.js';
export declare function getSurface(doc: Store, editor: TestAffineEditorContainer): SurfaceBlockComponent;
export declare function getDocRootBlock(doc: Store, editor: TestAffineEditorContainer, mode: 'page'): PageRootBlockComponent;
export declare function getDocRootBlock(doc: Store, editor: TestAffineEditorContainer, mode: 'edgeless'): EdgelessRootBlockComponent;
export declare function addNote(doc: Store, props?: Record<string, any>): string;
//# sourceMappingURL=edgeless.d.ts.map