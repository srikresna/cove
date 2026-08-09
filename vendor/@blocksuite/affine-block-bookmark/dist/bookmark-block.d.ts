import { CaptionedBlockComponent, SelectedStyle } from '@blocksuite/affine-components/caption';
import type { BookmarkBlockModel } from '@blocksuite/affine-model';
import { ImageProxyService } from '@blocksuite/affine-shared/adapters';
import { type ReadonlySignal } from '@preact/signals-core';
import { type ClassInfo } from 'lit/directives/class-map.js';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
export declare const BOOKMARK_MIN_WIDTH = 450;
export declare class BookmarkBlockComponent extends CaptionedBlockComponent<BookmarkBlockModel> {
    selectedStyle$: ReadonlySignal<ClassInfo> | null;
    private _fetchAbortController?;
    blockDraggable: boolean;
    protected containerStyleMap: ReturnType<typeof styleMap>;
    /**
     * @description Local link preview data
     * When the doc is in readonly mode, and the link preview data are not provided (stored in the block model),
     * We will use the local link preview data fetched from the link previewer service to render the block.
     */
    private readonly _localLinkPreview$;
    /**
     * @description Link preview data for actual rendering
     * When the doc is not in readonly mode, and the link preview data are provided (stored in the block model),
     * We will use the model props to render the block.
     * Otherwise, we will use the local link preview data to render the block.
     */
    linkPreview$: ReadonlySignal<{
        icon: string | null;
        title: string | null;
        description: string | null;
        image: string | null;
    }>;
    private readonly _updateLocalLinkPreview;
    selectBlock: () => void;
    get link(): string;
    open: () => void;
    refreshData: () => void;
    get citationService(): import("@blocksuite/affine-shared/services").CitationViewService;
    get isCitation(): boolean;
    get imageProxyService(): ImageProxyService;
    get isCommentHighlighted(): boolean;
    handleClick: (event: MouseEvent) => void;
    handleDoubleClick: (event: MouseEvent) => void;
    private readonly _renderCitationView;
    private readonly _renderCardView;
    private readonly _trackCitationDeleteEvent;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    protected accessor blockContainerStyles: StyleInfo;
    accessor bookmarkCard: HTMLElement;
    accessor error: boolean;
    accessor loading: boolean;
    accessor selectedStyle: SelectedStyle;
    accessor useCaptionEditor: boolean;
    accessor useZeroWidth: boolean;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-bookmark': BookmarkBlockComponent;
    }
}
//# sourceMappingURL=bookmark-block.d.ts.map