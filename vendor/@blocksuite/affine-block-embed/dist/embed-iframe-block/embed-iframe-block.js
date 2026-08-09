var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { SurfaceBlockModel } from '@blocksuite/affine-block-surface';
import { CaptionedBlockComponent, SelectedStyle, } from '@blocksuite/affine-components/caption';
import { createLitPortal } from '@blocksuite/affine-components/portal';
import { EmbedIframeService, LinkPreviewServiceIdentifier, NotificationProvider, VirtualKeyboardProvider, } from '@blocksuite/affine-shared/services';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { BlockSelection } from '@blocksuite/std';
import { flip, offset, shift } from '@floating-ui/dom';
import { computed, effect, signal, } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import { DEFAULT_IFRAME_HEIGHT, DEFAULT_IFRAME_WIDTH, EMBED_IFRAME_DEFAULT_CONTAINER_BORDER_RADIUS, ERROR_CARD_DEFAULT_HEIGHT, IDLE_CARD_DEFAULT_HEIGHT, LINK_CREATE_POPUP_OFFSET, LOADING_CARD_DEFAULT_HEIGHT, } from './consts.js';
import { embedIframeBlockStyles } from './style.js';
import { safeGetIframeSrc } from './utils.js';
const TRUSTED_SANDBOX = 'allow-same-origin allow-scripts allow-forms allow-presentation';
const UNTRUSTED_SANDBOX = 'allow-scripts';
let EmbedIframeBlockComponent = (() => {
    let _classSuper = CaptionedBlockComponent;
    let __blockContainer_decorators;
    let __blockContainer_initializers = [];
    let __blockContainer_extraInitializers = [];
    return class EmbedIframeBlockComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __blockContainer_decorators = [query('.affine-embed-iframe-block-container')];
            __esDecorate(this, null, __blockContainer_decorators, { kind: "accessor", name: "_blockContainer", static: false, private: false, access: { has: obj => "_blockContainer" in obj, get: obj => obj._blockContainer, set: (obj, value) => { obj._blockContainer = value; } }, metadata: _metadata }, __blockContainer_initializers, __blockContainer_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = embedIframeBlockStyles; }
        get embedIframeService() {
            return this.std.get(EmbedIframeService);
        }
        get linkPreviewService() {
            return this.std.get(LinkPreviewServiceIdentifier);
        }
        get notificationService() {
            return this.std.getOptional(NotificationProvider);
        }
        get inSurface() {
            return matchModels(this.model.parent, [SurfaceBlockModel]);
        }
        get _horizontalCardHeight() {
            switch (this.status$.value) {
                case 'idle':
                    return IDLE_CARD_DEFAULT_HEIGHT;
                case 'loading':
                    return LOADING_CARD_DEFAULT_HEIGHT;
                case 'error':
                    return ERROR_CARD_DEFAULT_HEIGHT;
                default:
                    return LOADING_CARD_DEFAULT_HEIGHT;
            }
        }
        get _statusCardOptions() {
            return this.inSurface
                ? { layout: 'vertical' }
                : { layout: 'horizontal', height: this._horizontalCardHeight };
        }
        connectedCallback() {
            super.connectedCallback();
            this.contentEditable = 'false';
            // update the selected style when the block is in the note
            this.disposables.add(effect(() => {
                if (this.inSurface) {
                    return;
                }
                // when the block is in idle status, use the background style
                // otherwise, use the border style
                if (this.status$.value === 'idle') {
                    this.selectedStyle = SelectedStyle.Background;
                }
                else {
                    this.selectedStyle = SelectedStyle.Border;
                }
            }));
            // if the iframe url is not set, refresh the data to get the iframe url
            if (!this.model.props.iframeUrl) {
                this.store.withoutTransact(() => {
                    this.refreshData().catch(console.error);
                });
            }
            else {
                // update iframe options, to ensure the iframe is rendered with the correct options
                this._updateIframeOptions(this.model.props.url);
                this.status$.value = this._validateIframeUrl(this.model.props.url, this.model.props.iframeUrl)
                    ? 'success'
                    : 'error';
            }
            // refresh data when original url changes
            this.disposables.add(this.model.propsUpdated.subscribe(({ key }) => {
                if (key === 'url') {
                    this.refreshData().catch(console.error);
                }
            }));
            // subscribe the editor host global dragging event
            // to show the overlay for the dragging area or other pointer events
            this.handleEvent('dragStart', () => {
                this.isDraggingOnHost$.value = true;
            }, { global: true });
            this.handleEvent('dragEnd', () => {
                this.isDraggingOnHost$.value = false;
            }, { global: true });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._linkInputAbortController?.abort();
            this._linkInputAbortController = null;
        }
        renderBlock() {
            const containerClasses = classMap({
                'affine-embed-iframe-block-container': true,
                ...this.selectedStyle$?.value,
                'in-surface': this.inSurface,
            });
            const containerStyles = styleMap({
                borderRadius: `${this.selectedBorderRadius$.value}px`,
            });
            const overlayClasses = classMap({
                'affine-embed-iframe-block-overlay': true,
                show: this.showOverlay$.value,
            });
            return html `
      <div
        draggable=${this.blockDraggable ? 'true' : 'false'}
        class=${containerClasses}
        style=${containerStyles}
        @click=${this._handleClick}
        @dblclick=${this._handleDoubleClick}
      >
        ${this._renderContent()}

        <!-- overlay to prevent the iframe from capturing pointer events -->
        <div class=${overlayClasses}></div>
      </div>
    `;
        }
        #blockContainerStyles_accessor_storage;
        get blockContainerStyles() { return this.#blockContainerStyles_accessor_storage; }
        set blockContainerStyles(value) { this.#blockContainerStyles_accessor_storage = value; }
        get readonly() {
            return this.store.readonly;
        }
        get selectionManager() {
            return this.host.selection;
        }
        #useCaptionEditor_accessor_storage;
        get useCaptionEditor() { return this.#useCaptionEditor_accessor_storage; }
        set useCaptionEditor(value) { this.#useCaptionEditor_accessor_storage = value; }
        #useZeroWidth_accessor_storage;
        get useZeroWidth() { return this.#useZeroWidth_accessor_storage; }
        set useZeroWidth(value) { this.#useZeroWidth_accessor_storage = value; }
        #selectedStyle_accessor_storage;
        get selectedStyle() { return this.#selectedStyle_accessor_storage; }
        set selectedStyle(value) { this.#selectedStyle_accessor_storage = value; }
        #_blockContainer_accessor_storage;
        get _blockContainer() { return this.#_blockContainer_accessor_storage; }
        set _blockContainer(value) { this.#_blockContainer_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.selectedStyle$ = computed(() => ({
                'selected-style': this.selected$.value,
            }));
            this.blockDraggable = true;
            this.status$ = signal('idle');
            this.error$ = signal(null);
            this.isIdle$ = computed(() => this.status$.value === 'idle');
            this.isLoading$ = computed(() => this.status$.value === 'loading');
            this.hasError$ = computed(() => this.status$.value === 'error');
            this.isSuccess$ = computed(() => this.status$.value === 'success');
            this.isDraggingOnHost$ = signal(false);
            this.isResizing$ = signal(false);
            // show overlay to prevent the iframe from capturing pointer events
            // when the block is dragging, resizing, or not selected
            this.showOverlay$ = computed(() => this.isSuccess$.value &&
                (this.isDraggingOnHost$.value ||
                    this.isResizing$.value ||
                    !this.selected$.value));
            // since different providers have different border radius
            // we need to update the selected border radius when the iframe is loaded
            this.selectedBorderRadius$ = computed(() => {
                if (this.status$.value === 'success' &&
                    typeof this.iframeOptions?.containerBorderRadius === 'number') {
                    return this.iframeOptions.containerBorderRadius;
                }
                return EMBED_IFRAME_DEFAULT_CONTAINER_BORDER_RADIUS;
            });
            this.iframeOptions = undefined;
            this.open = () => {
                const link = this.model.props.url;
                if (!link) {
                    this.notificationService?.notify({
                        title: 'No link found',
                        message: 'Please set a link to the block',
                        accent: 'warning',
                        onClose: function () { },
                    });
                    return;
                }
                window.open(link, '_blank', 'noopener,noreferrer');
            };
            this.refreshData = async () => {
                try {
                    const { url } = this.model.props;
                    if (!url) {
                        this.status$.value = 'idle';
                        return false;
                    }
                    // set loading status
                    this.status$.value = 'loading';
                    this.error$.value = null;
                    // get embed data
                    const embedIframeService = this.embedIframeService;
                    const linkPreviewService = this.linkPreviewService;
                    if (!embedIframeService || !linkPreviewService) {
                        throw new BlockSuiteError(ErrorCode.ValueNotExists, 'EmbedIframeService or LinkPreviewService not found');
                    }
                    // get embed data and preview data in a promise
                    const [embedData, previewData] = await Promise.all([
                        embedIframeService.getEmbedIframeData(url),
                        linkPreviewService.query(url),
                    ]);
                    // if the embed data is not found, and the iframeUrl is not set, throw an error
                    const currentIframeUrl = this.model.props.iframeUrl;
                    if (!embedData && !currentIframeUrl) {
                        throw new BlockSuiteError(ErrorCode.ValueNotExists, 'Failed to get embed data');
                    }
                    // update model
                    const iframeUrl = this._getIframeUrl(embedData) ?? currentIframeUrl;
                    if (!this._validateIframeUrl(url, iframeUrl)) {
                        throw new BlockSuiteError(ErrorCode.ValueNotExists, 'Invalid embed iframe url');
                    }
                    this.store.updateBlock(this.model, {
                        iframeUrl,
                        title: embedData?.title || previewData?.title,
                        description: embedData?.description || previewData?.description,
                    });
                    // update iframe options, to ensure the iframe is rendered with the correct options
                    this._updateIframeOptions(url);
                    // set success status
                    this.status$.value = 'success';
                    return true;
                }
                catch (err) {
                    // set error status
                    this.status$.value = 'error';
                    this.error$.value = err instanceof Error ? err : new Error(String(err));
                    console.error('Failed to refresh iframe data:', err);
                    return false;
                }
            };
            this._linkInputAbortController = null;
            this.toggleLinkInputPopup = (options) => {
                if (this.readonly) {
                    return;
                }
                // toggle create popup when ths block is in idle status and the url is not set
                if (!this._blockContainer || !this.isIdle$.value || this.model.props.url) {
                    return;
                }
                if (this._linkInputAbortController) {
                    this._linkInputAbortController.abort();
                }
                const keyboard = this.host.std.getOptional(VirtualKeyboardProvider);
                const computePosition = keyboard
                    ? {
                        referenceElement: document.body,
                        placement: 'top',
                        middleware: [
                            offset(({ rects }) => ({
                                mainAxis: -rects.floating.height -
                                    (window.innerHeight -
                                        rects.floating.height -
                                        keyboard.height$.value) /
                                        2,
                            })),
                        ],
                        autoUpdate: { animationFrame: true },
                    }
                    : {
                        referenceElement: this._blockContainer,
                        placement: 'bottom',
                        middleware: [flip(), offset(LINK_CREATE_POPUP_OFFSET), shift()],
                        autoUpdate: { animationFrame: true },
                    };
                this._linkInputAbortController = new AbortController();
                const { update } = createLitPortal({
                    template: html `<embed-iframe-link-input-popup
        .model=${this.model}
        .abortController=${this._linkInputAbortController}
        .std=${this.std}
        .inSurface=${this.inSurface}
        .options=${options}
      ></embed-iframe-link-input-popup>`,
                    container: document.body,
                    computePosition,
                    abortController: this._linkInputAbortController,
                    closeOnClickAway: true,
                });
                if (keyboard) {
                    this._linkInputAbortController.signal.addEventListener('abort', keyboard.height$.subscribe(() => {
                        update();
                    }));
                }
            };
            /**
             * Get the iframe url from the embed data, first check if iframe_url is set,
             * if not, check if html is set and get the iframe src from html
             * @param embedData - The embed data
             * @returns The iframe url
             */
            this._getIframeUrl = (embedData) => {
                const { iframe_url, html } = embedData ?? {};
                return iframe_url ?? (html && safeGetIframeSrc(html));
            };
            this._updateIframeOptions = (url) => {
                const config = this.embedIframeService?.getConfig(url);
                if (config) {
                    this.iframeOptions = config.options;
                    this.currentConfigName = config.name;
                }
                else {
                    this.iframeOptions = undefined;
                    this.currentConfigName = undefined;
                }
            };
            this._validateIframeUrl = (url, iframeUrl) => {
                if (!iframeUrl) {
                    return false;
                }
                const config = this.embedIframeService?.getConfig(url);
                if (!config) {
                    return false;
                }
                return config.validateIframeUrl
                    ? config.validateIframeUrl(iframeUrl, url)
                    : config.match(iframeUrl);
            };
            this._handleDoubleClick = () => {
                this.open();
            };
            this._selectBlock = () => {
                const { selectionManager } = this;
                const blockSelection = selectionManager.create(BlockSelection, {
                    blockId: this.blockId,
                });
                selectionManager.setGroup('note', [blockSelection]);
            };
            this._handleClick = () => {
                // when the block is in idle status and the url is not set, clear the selection
                // and show the link input popup
                if (this.isIdle$.value && !this.model.props.url) {
                    // when the block is in the surface, clear the surface selection
                    // otherwise, clear the block selection
                    this.selectionManager.clear([this.inSurface ? 'surface' : 'block']);
                    this.toggleLinkInputPopup();
                    return;
                }
                // We don't need to select the block when the block is in the surface
                if (this.inSurface) {
                    return;
                }
                // otherwise, select the block
                this._selectBlock();
            };
            this._handleRetry = async () => {
                return await this.refreshData();
            };
            this._renderIframe = () => {
                const { iframeUrl } = this.model.props;
                if (!iframeUrl || !this._isIframeUrlAllowed(iframeUrl)) {
                    return html `<embed-iframe-error-card
        .error=${new Error('Invalid iframe URL')}
        .model=${this.model}
        .onRetry=${this._handleRetry}
        .std=${this.std}
        .inSurface=${this.inSurface}
        .options=${this._statusCardOptions}
      ></embed-iframe-error-card>`;
                }
                const { widthPercent, heightInNote, style, allow, referrerpolicy, scrolling, allowFullscreen, sandbox, } = this.iframeOptions ?? {};
                const width = `${widthPercent}%`;
                // if the block is in the surface, use 100% as the height
                // otherwise, use the heightInNote
                const height = this.inSurface ? '100%' : heightInNote;
                const sandboxValue = sandbox ??
                    (this.currentConfigName === 'generic'
                        ? UNTRUSTED_SANDBOX
                        : TRUSTED_SANDBOX);
                const sourceHost = this._getSourceHost();
                return html `<iframe
        width=${width ?? DEFAULT_IFRAME_WIDTH}
        height=${height ?? DEFAULT_IFRAME_HEIGHT}
        ?allowfullscreen=${allowFullscreen}
        loading="lazy"
        frameborder="0"
        credentialless
        sandbox=${sandboxValue}
        src=${ifDefined(iframeUrl)}
        allow=${ifDefined(allow)}
        referrerpolicy=${ifDefined(referrerpolicy)}
        scrolling=${ifDefined(scrolling)}
        style=${ifDefined(style)}
      ></iframe>
      ${sourceHost
                    ? html `<div class="affine-embed-iframe-source">${sourceHost}</div>`
                    : nothing}`;
            };
            this._isIframeUrlAllowed = (iframeUrl) => {
                return this._validateIframeUrl(this.model.props.url, iframeUrl);
            };
            this._getSourceHost = () => {
                const url = this.model.props.url ?? this.model.props.iframeUrl;
                if (!url)
                    return null;
                try {
                    const parsed = new URL(url);
                    return parsed.hostname;
                }
                catch {
                    return null;
                }
            };
            this._renderContent = () => {
                if (this.isIdle$.value) {
                    return html `<embed-iframe-idle-card
        .options=${this._statusCardOptions}
      ></embed-iframe-idle-card>`;
                }
                if (this.isLoading$.value) {
                    return html `<embed-iframe-loading-card
        .std=${this.std}
        .options=${this._statusCardOptions}
      ></embed-iframe-loading-card>`;
                }
                if (this.hasError$.value) {
                    return html `<embed-iframe-error-card
        .error=${this.error$.value}
        .model=${this.model}
        .onRetry=${this._handleRetry}
        .std=${this.std}
        .inSurface=${this.inSurface}
        .options=${this._statusCardOptions}
      ></embed-iframe-error-card>`;
                }
                return this._renderIframe();
            };
            this.#blockContainerStyles_accessor_storage = {
                margin: '18px 0',
                backgroundColor: 'transparent',
            };
            this.#useCaptionEditor_accessor_storage = true;
            this.#useZeroWidth_accessor_storage = true;
            this.#selectedStyle_accessor_storage = SelectedStyle.Border;
            this.#_blockContainer_accessor_storage = __runInitializers(this, __blockContainer_initializers, null);
            __runInitializers(this, __blockContainer_extraInitializers);
        }
    };
})();
export { EmbedIframeBlockComponent };
