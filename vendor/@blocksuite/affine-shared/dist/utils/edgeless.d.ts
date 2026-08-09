import type { GfxBlockElementModel, GfxModel } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
export declare function getSelectedRect(selected: GfxModel[]): DOMRect;
export declare function getElementsWithoutGroup(elements: GfxModel[]): GfxModel[];
export declare function isTopLevelBlock(selectable: BlockModel | GfxModel | null): selectable is GfxBlockElementModel;
//# sourceMappingURL=edgeless.d.ts.map