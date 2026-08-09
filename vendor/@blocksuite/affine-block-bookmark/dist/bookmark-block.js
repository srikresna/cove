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
import { CaptionedBlockComponent, SelectedStyle, } from '@blocksuite/affine-components/caption';
import { ImageProxyService } from '@blocksuite/affine-shared/adapters';
import { BlockElementCommentManager, CitationProvider, DocModeProvider, LinkPreviewServiceIdentifier, } from '@blocksuite/affine-shared/services';
import { normalizeUrl } from '@blocksuite/affine-shared/utils';
import { BlockSelection } from '@blocksuite/std';
import { computed, signal } from '@preact/signals-core';
import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { filter } from 'rxjs/operators';
import { refreshBookmarkUrlData } from './utils.js';
export const BOOKMARK_MIN_WIDTH = 450;
let BookmarkBlockComponent = (() => {
    let _classSuper = CaptionedBlockComponent;
    let _bookmarkCard_decorators;
    let _bookmarkCard_initializers = [];
    let _bookmarkCard_extraInitializers = [];
    let _error_decorators;
    let _error_initializers = [];
    let _error_extraInitializers = [];
    let _loading_decorators;
    let _loading_initializers = [];
    let _loading_extraInitializers = [];
    return class BookmarkBlockComponent extends _classSuper {
        constructor() {
            super(...arguments);
            this.selectedStyle$ = computed(() => ({
                'selected-style': this.selected$.value,
            }));
            this.blockDraggable = true;
            /**
             * @description Local link preview data
             * When the doc is in readonly mode, and the link preview data are not provided (stored in the block model),
             * We will use the local link preview data fetched from the link previewer service to render the block.
             */
            this._localLinkPreview$ = signal({
                icon: null,
                title: null,
                description: null,
                image: null,
            });
            /**
             * @description Link preview data for actual rendering
             * When the doc is not in readonly mode, and the link preview data are provided (stored in the block model),
             * We will use the model props to render the block.
             * Otherwise, we will use the local link preview data to render the block.
             */
            this.linkPreview$ = computed(() => {
                const modelProps = this.model.props;
                const local = this._localLinkPreview$.value;
                return {
                    icon: modelProps.icon$.value ?? local.icon ?? null,
                    title: modelProps.title$.value ?? local.title ?? null,
                    description: modelProps.description$.value ?? local.description ?? null,
                    image: modelProps.image$.value ?? local.image ?? null,
                };
            });
            this._updateLocalLinkPreview = () => {
                // cancel any inflight request
                this._fetchAbortController?.abort();
                this._fetchAbortController = new AbortController();
                this.loading = true;
                this.error = false;
                this.std
                    .get(LinkPreviewServiceIdentifier)
                    .query(this.model.props.url, this._fetchAbortController.signal)
                    .then(data => {
                    this._localLinkPreview$.value = {
                        icon: data.icon ?? null,
                        title: data.title ?? null,
                        description: data.description ?? null,
                        image: data.image ?? null,
                    };
                })
                    .catch(() => {
                    this.error = true;
                })
                    .finally(() => {
                    this.loading = false;
                });
            };
            this.selectBlock = () => {
                const selectionManager = this.std.selection;
                const blockSelection = selectionManager.create(BlockSelection, {
                    blockId: this.blockId,
                });
                selectionManager.setGroup('note', [blockSelection]);
            };
            this.open = () => {
                const link = this.link;
                if (!link)
                    return;
                window.open(link, '_blank', 'noopener,noreferrer');
            };
            this.refreshData = () => {
                refreshBookmarkUrlData(this, this._fetchAbortController?.signal).catch(console.error);
            };
            this.handleClick = (event) => {
                event.stopPropagation();
                if (this.model.parent?.flavour !== 'affine:surface' &&
                    !this.store.readonly) {
                    this.selectBlock();
                }
            };
            this.handleDoubleClick = (event) => {
                event.stopPropagation();
                this.open();
            };
            this._renderCitationView = () => {
                const { url, footnoteIdentifier } = this.model.props;
                const { icon, title, description } = this.linkPreview$.value;
                const iconSrc = icon ? this.imageProxyService.buildUrl(icon) : undefined;
                return html `
      <affine-citation-card
        .icon=${iconSrc}
        .citationTitle=${title || url}
        .citationContent=${description}
        .citationIdentifier=${footnoteIdentifier}
        .onClickCallback=${this.handleClick}
        .onDoubleClickCallback=${this.handleDoubleClick}
        .active=${this.selected$.value}
      ></affine-citation-card>
    `;
            };
            this._renderCardView = () => {
                return html `<bookmark-card
      .bookmark=${this}
      .loading=${this.loading}
      .error=${this.error}
    ></bookmark-card>`;
            };
            this._trackCitationDeleteEvent = () => {
                // Check citation delete event
                this._disposables.add(this.std.store.slots.blockUpdated
                    .pipe(filter(payload => {
                    if (!payload.isLocal)
                        return false;
                    const { flavour, id, type } = payload;
                    if (type !== 'delete' ||
                        flavour !== this.model.flavour ||
                        id !== this.model.id)
                        return false;
                    const { model } = payload;
                    if (!this.citationService.isCitationModel(model))
                        return false;
                    return true;
                }))
                    .subscribe(() => {
                    this.citationService.trackEvent('Delete');
                }));
            };
            this.#blockContainerStyles_accessor_storage = {
                margin: '18px 0',
            };
            this.#bookmarkCard_accessor_storage = __runInitializers(this, _bookmarkCard_initializers, void 0);
            this.#error_accessor_storage = (__runInitializers(this, _bookmarkCard_extraInitializers), __runInitializers(this, _error_initializers, false));
            this.#loading_accessor_storage = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _loading_initializers, false));
            this.#selectedStyle_accessor_storage = (__runInitializers(this, _loading_extraInitializers), SelectedStyle.Border);
            this.#useCaptionEditor_accessor_storage = true;
            this.#useZeroWidth_accessor_storage = true;
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _bookmarkCard_decorators = [query('bookmark-card')];
            _error_decorators = [property({ attribute: false })];
            _loading_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _bookmarkCard_decorators, { kind: "accessor", name: "bookmarkCard", static: false, private: false, access: { has: obj => "bookmarkCard" in obj, get: obj => obj.bookmarkCard, set: (obj, value) => { obj.bookmarkCard = value; } }, metadata: _metadata }, _bookmarkCard_initializers, _bookmarkCard_extraInitializers);
            __esDecorate(this, null, _error_decorators, { kind: "accessor", name: "error", static: false, private: false, access: { has: obj => "error" in obj, get: obj => obj.error, set: (obj, value) => { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            __esDecorate(this, null, _loading_decorators, { kind: "accessor", name: "loading", static: false, private: false, access: { has: obj => "loading" in obj, get: obj => obj.loading, set: (obj, value) => { obj.loading = value; } }, metadata: _metadata }, _loading_initializers, _loading_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get link() {
            return normalizeUrl(this.model.props.url);
        }
        get citationService() {
            return this.std.get(CitationProvider);
        }
        get isCitation() {
            return this.citationService.isCitationModel(this.model);
        }
        get imageProxyService() {
            return this.std.get(ImageProxyService);
        }
        get isCommentHighlighted() {
            return (this.std
                .getOptional(BlockElementCommentManager)
                ?.isBlockCommentHighlighted(this.model) ?? false);
        }
        connectedCallback() {
            super.connectedCallback();
            const mode = this.std.get(DocModeProvider).getEditorMode();
            const miniWidth = `${BOOKMARK_MIN_WIDTH}px`;
            this.containerStyleMap = styleMap({
                position: 'relative',
                width: '100%',
                ...(mode === 'edgeless' ? { miniWidth } : {}),
            });
            this._fetchAbortController = new AbortController();
            this.contentEditable = 'false';
            if ((!this.model.props.description && !this.model.props.title) ||
                (!this.model.props.image && this.model.props.style === 'vertical')) {
                // When the doc is readonly, and the preview data not provided
                // We should fetch the preview data and update the local link preview data
                if (this.store.readonly) {
                    this._updateLocalLinkPreview();
                    return;
                }
                // Otherwise, we should refresh the data to the model props
                this.refreshData();
            }
            this.disposables.add(this.model.propsUpdated.subscribe(({ key }) => {
                if (key === 'url') {
                    this.refreshData();
                }
            }));
            this._trackCitationDeleteEvent();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._fetchAbortController?.abort();
        }
        renderBlock() {
            return html `
      <div
        draggable="${this.blockDraggable ? 'true' : 'false'}"
        class=${classMap({
                'affine-bookmark-container': true,
                ...this.selectedStyle$?.value,
            })}
        style=${this.containerStyleMap}
      >
        ${this.isCitation ? this._renderCitationView() : this._renderCardView()}
      </div>
    `;
        }
        #blockContainerStyles_accessor_storage;
        get blockContainerStyles() { return this.#blockContainerStyles_accessor_storage; }
        set blockContainerStyles(value) { this.#blockContainerStyles_accessor_storage = value; }
        #bookmarkCard_accessor_storage;
        get bookmarkCard() { return this.#bookmarkCard_accessor_storage; }
        set bookmarkCard(value) { this.#bookmarkCard_accessor_storage = value; }
        #error_accessor_storage;
        get error() { return this.#error_accessor_storage; }
        set error(value) { this.#error_accessor_storage = value; }
        #loading_accessor_storage;
        get loading() { return this.#loading_accessor_storage; }
        set loading(value) { this.#loading_accessor_storage = value; }
        #selectedStyle_accessor_storage;
        get selectedStyle() { return this.#selectedStyle_accessor_storage; }
        set selectedStyle(value) { this.#selectedStyle_accessor_storage = value; }
        #useCaptionEditor_accessor_storage;
        get useCaptionEditor() { return this.#useCaptionEditor_accessor_storage; }
        set useCaptionEditor(value) { this.#useCaptionEditor_accessor_storage = value; }
        #useZeroWidth_accessor_storage;
        get useZeroWidth() { return this.#useZeroWidth_accessor_storage; }
        set useZeroWidth(value) { this.#useZeroWidth_accessor_storage = value; }
    };
})();
export { BookmarkBlockComponent };
