import { EmbedBlockComponent } from '@blocksuite/affine-block-embed';
import type { DocMode, EmbedLinkedDocModel, EmbedLinkedDocStyles } from '@blocksuite/affine-model';
import { type OpenDocMode } from '@blocksuite/affine-shared/services';
export declare class EmbedLinkedDocBlockComponent extends EmbedBlockComponent<EmbedLinkedDocModel> {
    static styles: import("lit").CSSResult;
    private readonly _load;
    private readonly _selectBlock;
    private readonly _setDocUpdatedAt;
    _cardStyle: (typeof EmbedLinkedDocStyles)[number];
    convertToEmbed: () => void;
    convertToInline: () => void;
    referenceInfo$: import("@preact/signals-core").ReadonlySignal<{
        pageId: string;
        title?: string | undefined;
        description?: string | undefined;
        params?: {
            mode?: "edgeless" | "page" | undefined;
            blockIds?: string[] | undefined;
            elementIds?: string[] | undefined;
            databaseId?: string | undefined;
            databaseRowId?: string | undefined;
            xywh?: `[${number},${number},${number},${number}]` | undefined;
            commentId?: string | undefined;
        } | undefined;
    }>;
    icon$: import("@preact/signals-core").ReadonlySignal<import("lit-html").TemplateResult>;
    open: ({ openMode, event, }?: {
        openMode?: OpenDocMode;
        event?: MouseEvent;
    }) => void;
    refreshData: () => void;
    title$: import("@preact/signals-core").ReadonlySignal<import("@preact/signals-core").ReadonlySignal<string>>;
    get docTitle(): string;
    get editorMode(): DocMode;
    get linkedDoc(): import("@blocksuite/store").Store | undefined;
    get readonly(): boolean;
    get citationService(): import("@blocksuite/affine-shared/services").CitationViewService;
    get isCitation(): boolean;
    private readonly _handleDoubleClick;
    private _isDocEmpty;
    protected _handleClick: (event: MouseEvent) => void;
    private readonly _renderCitationView;
    private readonly _renderEmbedView;
    private readonly _trackCitationDeleteEvent;
    connectedCallback(): void;
    getInitialState(): {
        loading?: boolean;
        isError?: boolean;
        isNoteContentEmpty?: boolean;
        isBannerEmpty?: boolean;
    };
    renderBlock(): import("lit-html").TemplateResult<1>;
    updated(): void;
    private accessor _docUpdatedAt;
    private accessor _linkedDocMode;
    private accessor _loading;
    private accessor _referenceToNode;
    accessor isBannerEmpty: boolean;
    accessor isError: boolean;
    accessor isNoteContentEmpty: boolean;
    accessor noteContainer: Promise<HTMLDivElement | null>;
}
//# sourceMappingURL=embed-linked-doc-block.d.ts.map