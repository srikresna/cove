import type { RootBlockModel } from '@blocksuite/affine-model';
import { type BlockComponent } from '@blocksuite/std';
import type { BlockModel } from '@blocksuite/store';
export declare function getModelByElement<Model extends BlockModel>(element: Element): Model | null;
export declare function getRootByElement(element: Element): BlockComponent<RootBlockModel> | null;
export declare function getPageRootByElement(element: Element): BlockComponent<RootBlockModel> | null;
export declare function getEdgelessRootByElement(element: Element): BlockComponent<RootBlockModel> | null;
//# sourceMappingURL=query.d.ts.map