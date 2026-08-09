import type { EmbedProps } from '@blocksuite/affine-model';
import { type BlockService, type GfxBlockComponent } from '@blocksuite/std';
import type { GfxBlockElementModel } from '@blocksuite/std/gfx';
import type { EmbedBlockComponent } from './embed-block-element.js';
export declare function toEdgelessEmbedBlock<Model extends GfxBlockElementModel<EmbedProps>, Service extends BlockService, WidgetName extends string, B extends typeof EmbedBlockComponent<Model, Service, WidgetName>>(block: B): B & {
    new (...args: any[]): GfxBlockComponent;
};
//# sourceMappingURL=to-edgeless-embed-block.d.ts.map