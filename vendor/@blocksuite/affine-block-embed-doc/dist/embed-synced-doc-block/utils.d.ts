import { ColorScheme } from '@blocksuite/affine-model';
import type { BlockComponent } from '@blocksuite/std';
import type { TemplateResult } from 'lit';
type SyncedCardImages = {
    SyncedDocIcon: TemplateResult<1>;
    SyncedDocErrorIcon: TemplateResult<1>;
    SyncedDocDeletedIcon: TemplateResult<1>;
    SyncedDocEmptyBanner: TemplateResult<1>;
    SyncedDocErrorBanner: TemplateResult<1>;
    SyncedDocDeletedBanner: TemplateResult<1>;
};
export declare function getSyncedDocIcons(theme: ColorScheme, editorMode: 'page' | 'edgeless'): SyncedCardImages;
/**
 * This function will return the height of the synced doc block
 */
export declare function calcSyncedDocFullHeight(block: BlockComponent): number;
export {};
//# sourceMappingURL=utils.d.ts.map