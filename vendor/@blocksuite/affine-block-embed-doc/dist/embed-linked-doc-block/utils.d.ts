import { ColorScheme, type EmbedLinkedDocStyles } from '@blocksuite/affine-model';
import type { TemplateResult } from 'lit';
type EmbedCardImages = {
    LinkedDocIcon: TemplateResult<1>;
    LinkedDocDeletedIcon: TemplateResult<1>;
    LinkedDocEmptyBanner: TemplateResult<1>;
    LinkedDocDeletedBanner: TemplateResult<1>;
    SyncedDocErrorBanner: TemplateResult<1>;
};
export declare function getEmbedLinkedDocIcons(theme: ColorScheme, editorMode: 'page' | 'edgeless', style: (typeof EmbedLinkedDocStyles)[number]): EmbedCardImages;
export {};
//# sourceMappingURL=utils.d.ts.map