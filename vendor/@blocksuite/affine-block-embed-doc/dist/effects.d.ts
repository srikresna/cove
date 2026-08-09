import { EmbedLinkedDocBlockComponent } from './embed-linked-doc-block';
import { EmbedEdgelessLinkedDocBlockComponent } from './embed-linked-doc-block/embed-edgeless-linked-doc-block';
import { EmbedSyncedDocBlockComponent } from './embed-synced-doc-block';
import { EmbedSyncedDocCard } from './embed-synced-doc-block/components/embed-synced-doc-card';
import { EmbedEdgelessSyncedDocBlockComponent } from './embed-synced-doc-block/embed-edgeless-synced-doc-block';
export declare function effects(): void;
declare global {
    interface HTMLElementTagNameMap {
        'affine-embed-synced-doc-card': EmbedSyncedDocCard;
        'affine-embed-synced-doc-block': EmbedSyncedDocBlockComponent;
        'affine-embed-edgeless-synced-doc-block': EmbedEdgelessSyncedDocBlockComponent;
        'affine-embed-linked-doc-block': EmbedLinkedDocBlockComponent;
        'affine-embed-edgeless-linked-doc-block': EmbedEdgelessLinkedDocBlockComponent;
    }
}
//# sourceMappingURL=effects.d.ts.map