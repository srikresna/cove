import { ShadowlessElement } from '@blocksuite/std';
import type { EmbedSyncedDocBlockComponent } from '../embed-synced-doc-block.js';
declare const EmbedSyncedDocCard_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class EmbedSyncedDocCard extends EmbedSyncedDocCard_base {
    static styles: import("lit").CSSResult;
    private _dragging;
    get blockState(): {
        isLoading: boolean;
        isError: boolean;
        isDeleted: boolean;
        isCycle: boolean;
    };
    get editorMode(): import("@blocksuite/affine-model").DocMode;
    get host(): import("@blocksuite/std").EditorHost;
    get linkedDoc(): import("@blocksuite/store").Store | null;
    get model(): import("@blocksuite/affine-model").EmbedSyncedDocModel;
    get std(): import("@blocksuite/std").BlockStdScope;
    private _handleClick;
    private _isDocEmpty;
    private _selectBlock;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
    accessor bannerContainer: Promise<HTMLDivElement>;
    accessor block: EmbedSyncedDocBlockComponent;
    accessor isBannerEmpty: boolean;
    accessor isError: boolean;
    accessor isNoteContentEmpty: boolean;
    accessor noteContainer: Promise<HTMLDivElement>;
}
export {};
//# sourceMappingURL=embed-synced-doc-card.d.ts.map