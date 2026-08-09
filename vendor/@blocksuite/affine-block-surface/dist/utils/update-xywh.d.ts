import { Bound } from '@blocksuite/global/gfx';
import { type GfxModel } from '@blocksuite/std/gfx';
import type { BlockModel, BlockProps } from '@blocksuite/store';
export declare function updateXYWH(ele: GfxModel, bound: Bound, updateElement: (id: string, props: Record<string, unknown>) => void, updateBlock: (model: BlockModel, callBackOrProps: (() => void) | Partial<BlockProps>) => void): void;
//# sourceMappingURL=update-xywh.d.ts.map