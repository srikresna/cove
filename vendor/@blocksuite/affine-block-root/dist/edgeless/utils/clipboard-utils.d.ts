import type { EdgelessTextBlockModel, EmbedSyncedDocModel, FrameBlockModel, ImageBlockModel, NoteBlockModel, ShapeElementModel } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import { type GfxModel } from '@blocksuite/std/gfx';
export declare function duplicate(edgeless: BlockComponent, elements: GfxModel[], select?: boolean): Promise<void>;
export declare const splitElements: (elements: GfxModel[]) => {
    notes: NoteBlockModel[];
    shapes: ShapeElementModel[];
    frames: FrameBlockModel[];
    images: ImageBlockModel[];
    edgelessTexts: EdgelessTextBlockModel[];
    embedSyncedDocs: EmbedSyncedDocModel[];
};
//# sourceMappingURL=clipboard-utils.d.ts.map