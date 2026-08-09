import { CaptionedBlockComponent, SelectedStyle } from '@blocksuite/affine-components/caption';
import type { EmbedIframeBlockModel } from '@blocksuite/affine-model';
import { EmbedIframeService, type IframeOptions } from '@blocksuite/affine-shared/services';
import { type ReadonlySignal } from '@preact/signals-core';
import { type ClassInfo } from 'lit/directives/class-map.js';
import type { EmbedLinkInputPopupOptions } from './components/embed-iframe-link-input-popup.js';
import type { EmbedIframeStatusCardOptions } from './types.js';
export type EmbedIframeStatus = 'idle' | 'loading' | 'success' | 'error';
export declare class EmbedIframeBlockComponent extends CaptionedBlockComponent<EmbedIframeBlockModel> {
    selectedStyle$: ReadonlySignal<ClassInfo> | null;
    blockDraggable: boolean;
    static styles: import("lit").CSSResult;
    readonly status$: import("@preact/signals-core").Signal<EmbedIframeStatus>;
    readonly error$: import("@preact/signals-core").Signal<Error | null>;
    readonly isIdle$: ReadonlySignal<boolean>;
    readonly isLoading$: ReadonlySignal<boolean>;
    readonly hasError$: ReadonlySignal<boolean>;
    readonly isSuccess$: ReadonlySignal<boolean>;
    readonly isDraggingOnHost$: import("@preact/signals-core").Signal<boolean>;
    readonly isResizing$: import("@preact/signals-core").Signal<boolean>;
    readonly showOverlay$: ReadonlySignal<boolean>;
    readonly selectedBorderRadius$: ReadonlySignal<number>;
    protected iframeOptions: IframeOptions | undefined;
    private currentConfigName;
    get embedIframeService(): EmbedIframeService;
    get linkPreviewService(): import("@blocksuite/affine-shared/services").LinkPreviewProvider;
    get notificationService(): import("@blocksuite/affine-shared/services").NotificationService | null;
    get inSurface(): boolean;
    get _horizontalCardHeight(): number;
    get _statusCardOptions(): EmbedIframeStatusCardOptions;
    open: () => void;
    refreshData: () => Promise<boolean>;
    private _linkInputAbortController;
    toggleLinkInputPopup: (options?: EmbedLinkInputPopupOptions) => void;
    /**
     * Get the iframe url from the embed data, first check if iframe_url is set,
     * if not, check if html is set and get the iframe src from html
     * @param embedData - The embed data
     * @returns The iframe url
     */
    private readonly _getIframeUrl;
    private readonly _updateIframeOptions;
    private readonly _validateIframeUrl;
    private readonly _handleDoubleClick;
    private readonly _selectBlock;
    protected _handleClick: () => void;
    private readonly _handleRetry;
    private readonly _renderIframe;
    private readonly _isIframeUrlAllowed;
    private readonly _getSourceHost;
    private readonly _renderContent;
    connectedCallback(): void;
    disconnectedCallback(): void;
    renderBlock(): import("lit-html").TemplateResult<1>;
    accessor blockContainerStyles: {
        margin: string;
        backgroundColor: string;
    };
    get readonly(): boolean;
    get selectionManager(): import("@blocksuite/store").StoreSelectionExtension;
    accessor useCaptionEditor: boolean;
    accessor useZeroWidth: boolean;
    accessor selectedStyle: SelectedStyle;
    accessor _blockContainer: HTMLElement | null;
}
//# sourceMappingURL=embed-iframe-block.d.ts.map