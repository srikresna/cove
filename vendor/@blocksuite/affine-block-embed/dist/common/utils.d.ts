import { ColorScheme } from '@blocksuite/affine-model';
import type { BlockStdScope } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
type EmbedCardIcons = {
    EmbedCardBannerIcon: TemplateResult<1>;
    EmbedCardHorizontalIcon: TemplateResult<1>;
    EmbedCardListIcon: TemplateResult<1>;
    EmbedCardVerticalIcon: TemplateResult<1>;
    EmbedCardCubeIcon: TemplateResult<1>;
};
export declare function getEmbedCardIcons(theme: ColorScheme): EmbedCardIcons;
export declare function canEmbedAsEmbedBlock(std: BlockStdScope, url: string): boolean;
export {};
//# sourceMappingURL=utils.d.ts.map