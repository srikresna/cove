import { type AliasInfo } from '@blocksuite/affine-model';
import { type BlockComponent } from '@blocksuite/std';
import { EmbedSyncedDocBlockComponent } from './embed-synced-doc-block';
declare const EmbedEdgelessSyncedDocBlockComponent_base: typeof EmbedSyncedDocBlockComponent & (new (...args: any[]) => import("@blocksuite/std").GfxBlockComponent);
export declare class EmbedEdgelessSyncedDocBlockComponent extends EmbedEdgelessSyncedDocBlockComponent_base {
    accessor headerWrapper: HTMLDivElement | null;
    accessor contentElement: BlockComponent | null;
    protected _renderSyncedView: () => import("lit-html").TemplateResult<1>;
    convertToCard: (aliasInfo?: AliasInfo) => void;
    renderGfxBlock(): unknown;
    accessor useCaptionEditor: boolean;
}
export {};
//# sourceMappingURL=embed-edgeless-synced-doc-block.d.ts.map