import type { GfxCompatibleProps } from '@blocksuite/std/gfx';
import type { ReferenceInfo } from '../../../consts/doc.js';
import type { EmbedCardStyle } from '../../../utils/index.js';
export declare const EmbedSyncedDocStyles: ["syncedDoc"];
export type EmbedSyncedDocBlockProps = {
    style: EmbedCardStyle;
    caption?: string | null;
    scale?: number;
    /**
     * Record the scaled height of the synced doc block when it is folded,
     * a.k.a the fourth number of the `xywh`
     */
    preFoldHeight?: number;
} & ReferenceInfo & GfxCompatibleProps;
declare const EmbedSyncedDocModel_base: {
    new (): import("@blocksuite/std/gfx").GfxBlockElementModel<import("../../../index.js").EmbedProps<EmbedSyncedDocBlockProps>>;
};
export declare class EmbedSyncedDocModel extends EmbedSyncedDocModel_base {
    get isFolded(): boolean;
}
export {};
//# sourceMappingURL=synced-doc-model.d.ts.map