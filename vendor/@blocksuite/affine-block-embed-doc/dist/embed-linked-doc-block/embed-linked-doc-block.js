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
import { EmbedBlockComponent, RENDER_CARD_THROTTLE_MS, } from '@blocksuite/affine-block-embed';
import { SurfaceBlockModel } from '@blocksuite/affine-block-surface';
import { LoadingIcon } from '@blocksuite/affine-components/icons';
import { isPeekable, Peekable } from '@blocksuite/affine-components/peek';
import { RefNodeSlotsProvider } from '@blocksuite/affine-inline-reference';
import { EMBED_CARD_HEIGHT, EMBED_CARD_WIDTH, REFERENCE_NODE, } from '@blocksuite/affine-shared/consts';
import { CitationProvider, DocDisplayMetaProvider, DocModeProvider, OpenDocExtensionIdentifier, ThemeProvider, } from '@blocksuite/affine-shared/services';
import { cloneReferenceInfo, cloneReferenceInfoWithoutAliases, isNewTabTrigger, isNewViewTrigger, matchModels, referenceToNode, } from '@blocksuite/affine-shared/utils';
import { Bound } from '@blocksuite/global/gfx';
import { ResetIcon } from '@blocksuite/icons/lit';
import { BlockSelection } from '@blocksuite/std';
import { Text } from '@blocksuite/store';
import { computed } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { property, queryAsync, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import throttle from 'lodash-es/throttle';
import { filter } from 'rxjs/operators';
import * as Y from 'yjs';
import { renderLinkedDocInCard } from '../common/render-linked-doc';
import { SyncedDocErrorIcon } from '../embed-synced-doc-block/styles.js';
import { styles } from './styles.js';
import { getEmbedLinkedDocIcons } from './utils.js';
let EmbedLinkedDocBlockComponent = (() => {
    let _classDecorators = [Peekable({
            enableOn: ({ store }) => !store.readonly,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = EmbedBlockComponent;
    let __docUpdatedAt_decorators;
    let __docUpdatedAt_initializers = [];
    let __docUpdatedAt_extraInitializers = [];
    let __linkedDocMode_decorators;
    let __linkedDocMode_initializers = [];
    let __linkedDocMode_extraInitializers = [];
    let __loading_decorators;
    let __loading_initializers = [];
    let __loading_extraInitializers = [];
    let __referenceToNode_decorators;
    let __referenceToNode_initializers = [];
    let __referenceToNode_extraInitializers = [];
    let _isBannerEmpty_decorators;
    let _isBannerEmpty_initializers = [];
    let _isBannerEmpty_extraInitializers = [];
    let _isError_decorators;
    let _isError_initializers = [];
    let _isError_extraInitializers = [];
    let _isNoteContentEmpty_decorators;
    let _isNoteContentEmpty_initializers = [];
    let _isNoteContentEmpty_extraInitializers = [];
    let _noteContainer_decorators;
    let _noteContainer_initializers = [];
    let _noteContainer_extraInitializers = [];
    var EmbedLinkedDocBlockComponent = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __docUpdatedAt_decorators = [state()];
            __linkedDocMode_decorators = [state()];
            __loading_decorators = [state()];
            __referenceToNode_decorators = [state()];
            _isBannerEmpty_decorators = [property({ attribute: false })];
            _isError_decorators = [property({ attribute: false })];
            _isNoteContentEmpty_decorators = [property({ attribute: false })];
            _noteContainer_decorators = [queryAsync('.affine-embed-linked-doc-content-note.render')];
            __esDecorate(this, null, __docUpdatedAt_decorators, { kind: "accessor", name: "_docUpdatedAt", static: false, private: false, access: { has: obj => "_docUpdatedAt" in obj, get: obj => obj._docUpdatedAt, set: (obj, value) => { obj._docUpdatedAt = value; } }, metadata: _metadata }, __docUpdatedAt_initializers, __docUpdatedAt_extraInitializers);
            __esDecorate(this, null, __linkedDocMode_decorators, { kind: "accessor", name: "_linkedDocMode", static: false, private: false, access: { has: obj => "_linkedDocMode" in obj, get: obj => obj._linkedDocMode, set: (obj, value) => { obj._linkedDocMode = value; } }, metadata: _metadata }, __linkedDocMode_initializers, __linkedDocMode_extraInitializers);
            __esDecorate(this, null, __loading_decorators, { kind: "accessor", name: "_loading", static: false, private: false, access: { has: obj => "_loading" in obj, get: obj => obj._loading, set: (obj, value) => { obj._loading = value; } }, metadata: _metadata }, __loading_initializers, __loading_extraInitializers);
            __esDecorate(this, null, __referenceToNode_decorators, { kind: "accessor", name: "_referenceToNode", static: false, private: false, access: { has: obj => "_referenceToNode" in obj, get: obj => obj._referenceToNode, set: (obj, value) => { obj._referenceToNode = value; } }, metadata: _metadata }, __referenceToNode_initializers, __referenceToNode_extraInitializers);
            __esDecorate(this, null, _isBannerEmpty_decorators, { kind: "accessor", name: "isBannerEmpty", static: false, private: false, access: { has: obj => "isBannerEmpty" in obj, get: obj => obj.isBannerEmpty, set: (obj, value) => { obj.isBannerEmpty = value; } }, metadata: _metadata }, _isBannerEmpty_initializers, _isBannerEmpty_extraInitializers);
            __esDecorate(this, null, _isError_decorators, { kind: "accessor", name: "isError", static: false, private: false, access: { has: obj => "isError" in obj, get: obj => obj.isError, set: (obj, value) => { obj.isError = value; } }, metadata: _metadata }, _isError_initializers, _isError_extraInitializers);
            __esDecorate(this, null, _isNoteContentEmpty_decorators, { kind: "accessor", name: "isNoteContentEmpty", static: false, private: false, access: { has: obj => "isNoteContentEmpty" in obj, get: obj => obj.isNoteContentEmpty, set: (obj, value) => { obj.isNoteContentEmpty = value; } }, metadata: _metadata }, _isNoteContentEmpty_initializers, _isNoteContentEmpty_extraInitializers);
            __esDecorate(this, null, _noteContainer_decorators, { kind: "accessor", name: "noteContainer", static: false, private: false, access: { has: obj => "noteContainer" in obj, get: obj => obj.noteContainer, set: (obj, value) => { obj.noteContainer = value; } }, metadata: _metadata }, _noteContainer_initializers, _noteContainer_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EmbedLinkedDocBlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        get docTitle() {
            return this.model.props.title || this.linkedDoc?.meta?.title || 'Untitled';
        }
        get editorMode() {
            return this._linkedDocMode;
        }
        get linkedDoc() {
            const doc = this.std.workspace.getDoc(this.model.props.pageId);
            return doc?.getStore({ id: this.model.props.pageId });
        }
        get readonly() {
            return this.store.readonly;
        }
        get citationService() {
            return this.std.get(CitationProvider);
        }
        get isCitation() {
            return this.citationService.isCitationModel(this.model);
        }
        _isDocEmpty() {
            const linkedDoc = this.linkedDoc;
            if (!linkedDoc) {
                return false;
            }
            return !!linkedDoc && this.isNoteContentEmpty && this.isBannerEmpty;
        }
        connectedCallback() {
            super.connectedCallback();
            this._cardStyle = this.model.props.style;
            this._referenceToNode = referenceToNode(this.model.props);
            this._load().catch(e => {
                console.error(e);
                this.isError = true;
            });
            const linkedDoc = this.linkedDoc;
            if (linkedDoc) {
                // Should throttle the blockUpdated event to avoid too many re-renders
                // Because the blockUpdated event is triggered too frequently at some cases
                this.disposables.add(linkedDoc.slots.blockUpdated.subscribe(throttle(payload => {
                    if (payload.type === 'update' &&
                        ['', 'caption', 'xywh'].includes(payload.props.key)) {
                        return;
                    }
                    if (payload.type === 'add' && payload.init) {
                        return;
                    }
                    this._load().catch(e => {
                        console.error(e);
                        this.isError = true;
                    });
                }, RENDER_CARD_THROTTLE_MS)));
                this._setDocUpdatedAt();
                if (this._referenceToNode) {
                    this._linkedDocMode = this.model.props.params?.mode ?? 'page';
                }
                else {
                    const docMode = this.std.get(DocModeProvider);
                    this._linkedDocMode = docMode.getPrimaryMode(this.model.props.pageId);
                    this.disposables.add(docMode.onPrimaryModeChange(mode => {
                        this._linkedDocMode = mode;
                    }, this.model.props.pageId));
                }
            }
            this.disposables.add(this.model.propsUpdated.subscribe(({ key }) => {
                if (key === 'style') {
                    this._cardStyle = this.model.props.style;
                }
                if (key === 'pageId' || key === 'style') {
                    this._load().catch(e => {
                        console.error(e);
                        this.isError = true;
                    });
                }
            }));
            this.disposables.add(this.store.workspace.slots.docListUpdated.subscribe(() => {
                this._setDocUpdatedAt();
                this.refreshData();
            }));
            this._trackCitationDeleteEvent();
        }
        getInitialState() {
            return {};
        }
        renderBlock() {
            return this.isCitation
                ? this._renderCitationView()
                : this._renderEmbedView();
        }
        updated() {
            if (this.readonly) {
                return;
            }
            // update card style when linked doc deleted
            const linkedDoc = this.linkedDoc;
            const { xywh, style } = this.model.props;
            const bound = Bound.deserialize(xywh);
            if (linkedDoc && style === 'horizontalThin') {
                bound.w = EMBED_CARD_WIDTH.horizontal;
                bound.h = EMBED_CARD_HEIGHT.horizontal;
                this.store.withoutTransact(() => {
                    this.store.updateBlock(this.model, {
                        xywh: bound.serialize(),
                        style: 'horizontal',
                    });
                });
            }
            else if (!linkedDoc && style === 'horizontal') {
                bound.w = EMBED_CARD_WIDTH.horizontalThin;
                bound.h = EMBED_CARD_HEIGHT.horizontalThin;
                this.store.withoutTransact(() => {
                    this.store.updateBlock(this.model, {
                        xywh: bound.serialize(),
                        style: 'horizontalThin',
                    });
                });
            }
        }
        #_docUpdatedAt_accessor_storage;
        get _docUpdatedAt() { return this.#_docUpdatedAt_accessor_storage; }
        set _docUpdatedAt(value) { this.#_docUpdatedAt_accessor_storage = value; }
        #_linkedDocMode_accessor_storage;
        get _linkedDocMode() { return this.#_linkedDocMode_accessor_storage; }
        set _linkedDocMode(value) { this.#_linkedDocMode_accessor_storage = value; }
        #_loading_accessor_storage;
        get _loading() { return this.#_loading_accessor_storage; }
        set _loading(value) { this.#_loading_accessor_storage = value; }
        #_referenceToNode_accessor_storage;
        // reference to block/element
        get _referenceToNode() { return this.#_referenceToNode_accessor_storage; }
        set _referenceToNode(value) { this.#_referenceToNode_accessor_storage = value; }
        #isBannerEmpty_accessor_storage;
        get isBannerEmpty() { return this.#isBannerEmpty_accessor_storage; }
        set isBannerEmpty(value) { this.#isBannerEmpty_accessor_storage = value; }
        #isError_accessor_storage;
        get isError() { return this.#isError_accessor_storage; }
        set isError(value) { this.#isError_accessor_storage = value; }
        #isNoteContentEmpty_accessor_storage;
        get isNoteContentEmpty() { return this.#isNoteContentEmpty_accessor_storage; }
        set isNoteContentEmpty(value) { this.#isNoteContentEmpty_accessor_storage = value; }
        #noteContainer_accessor_storage;
        get noteContainer() { return this.#noteContainer_accessor_storage; }
        set noteContainer(value) { this.#noteContainer_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._load = async () => {
                // If this is a citation linked doc block, we don't need to load the linked doc and render linked doc content in card
                if (this.isCitation) {
                    return;
                }
                const { loading = true, isError = false, isBannerEmpty = true, isNoteContentEmpty = true, } = this.getInitialState();
                this._loading = loading;
                this.isError = isError;
                this.isBannerEmpty = isBannerEmpty;
                this.isNoteContentEmpty = isNoteContentEmpty;
                if (!this._loading) {
                    return;
                }
                const linkedDoc = this.linkedDoc;
                if (!linkedDoc) {
                    this._loading = false;
                    return;
                }
                if (!linkedDoc.loaded) {
                    try {
                        linkedDoc.load();
                    }
                    catch (e) {
                        console.error(e);
                        this.isError = true;
                    }
                }
                if (!this.isError && !linkedDoc.root) {
                    await new Promise(resolve => {
                        const subscription = linkedDoc.slots.rootAdded.subscribe(() => {
                            subscription.unsubscribe();
                            resolve();
                        });
                    });
                }
                this._loading = false;
                // If it is a link to a block or element, the content will not be rendered.
                if (this._referenceToNode) {
                    return;
                }
                if (!this.isError) {
                    const cardStyle = this.model.props.style;
                    if (cardStyle === 'horizontal' || cardStyle === 'vertical') {
                        renderLinkedDocInCard(this);
                    }
                }
            };
            this._selectBlock = () => {
                const selectionManager = this.std.selection;
                const blockSelection = selectionManager.create(BlockSelection, {
                    blockId: this.blockId,
                });
                selectionManager.setGroup('note', [blockSelection]);
            };
            this._setDocUpdatedAt = () => {
                const meta = this.store.workspace.meta.getDocMeta(this.model.props.pageId);
                if (meta) {
                    const date = meta.updatedDate || meta.createDate;
                    this._docUpdatedAt = new Date(date);
                }
            };
            this._cardStyle = 'horizontal';
            this.convertToEmbed = () => {
                if (this._referenceToNode)
                    return;
                const { caption } = this.model.props;
                const { parent, store } = this.model;
                const index = parent?.children.indexOf(this.model);
                const blockId = store.addBlock('affine:embed-synced-doc', {
                    caption,
                    ...cloneReferenceInfoWithoutAliases(this.referenceInfo$.peek()),
                }, parent, index);
                store.deleteBlock(this.model);
                this.std.selection.setGroup('note', [
                    this.std.selection.create(BlockSelection, { blockId }),
                ]);
            };
            this.convertToInline = () => {
                const { store } = this.model;
                const parent = store.getParent(this.model);
                if (!parent) {
                    return;
                }
                const index = parent.children.indexOf(this.model);
                const yText = new Y.Text();
                yText.insert(0, REFERENCE_NODE);
                yText.format(0, REFERENCE_NODE.length, {
                    reference: {
                        type: 'LinkedPage',
                        ...this.referenceInfo$.peek(),
                    },
                });
                const text = new Text(yText);
                store.addBlock('affine:paragraph', {
                    text,
                }, parent, index);
                store.deleteBlock(this.model);
            };
            this.referenceInfo$ = computed(() => {
                const { pageId, params, title$, description$ } = this.model.props;
                return cloneReferenceInfo({
                    pageId,
                    params,
                    title: title$.value,
                    description: description$.value,
                });
            });
            this.icon$ = computed(() => {
                const { pageId, params, title } = this.referenceInfo$.value;
                return this.std
                    .get(DocDisplayMetaProvider)
                    .icon(pageId, { params, title, referenced: true }).value;
            });
            this.open = ({ openMode, event, } = {}) => {
                this.std.getOptional(RefNodeSlotsProvider)?.docLinkClicked.next({
                    ...this.referenceInfo$.peek(),
                    openMode,
                    event,
                    host: this.host,
                });
            };
            this.refreshData = () => {
                this._load().catch(e => {
                    console.error(e);
                    this.isError = true;
                });
            };
            this.title$ = computed(() => {
                const { pageId, params, title } = this.referenceInfo$.value;
                return (this.std
                    .get(DocDisplayMetaProvider)
                    .title(pageId, { params, title, referenced: true }) || title);
            });
            this._handleDoubleClick = (event) => {
                event.stopPropagation();
                const openDocService = this.std.get(OpenDocExtensionIdentifier);
                const shouldOpenInPeek = openDocService.isAllowed('open-in-center-peek') && isPeekable(this);
                this.open({
                    openMode: shouldOpenInPeek
                        ? 'open-in-center-peek'
                        : 'open-in-active-view',
                    event,
                });
            };
            this._handleClick = (event) => {
                if (isNewTabTrigger(event)) {
                    this.open({ openMode: 'open-in-new-tab', event });
                }
                else if (isNewViewTrigger(event)) {
                    this.open({ openMode: 'open-in-new-view', event });
                }
                if (this.readonly) {
                    return;
                }
                this._selectBlock();
            };
            this._renderCitationView = () => {
                const { footnoteIdentifier } = this.model.props;
                return html `<div
      draggable="${this.blockDraggable ? 'true' : 'false'}"
      class=${classMap({
                    'embed-block-container': true,
                    ...this.selectedStyle$?.value,
                })}
      style=${styleMap({
                    ...this.embedContainerStyle,
                })}
    >
      <affine-citation-card
        .icon=${this.icon$.value}
        .citationTitle=${this.title$.value}
        .citationIdentifier=${footnoteIdentifier}
        .active=${this.selected$.value}
        .onClickCallback=${this._handleClick}
        .onDoubleClickCallback=${this._handleDoubleClick}
      ></affine-citation-card>
    </div> `;
            };
            this._renderEmbedView = () => {
                const linkedDoc = this.linkedDoc;
                const trash = linkedDoc?.meta?.trash;
                const isDeleted = trash || !linkedDoc;
                const isLoading = this._loading;
                const isError = this.isError;
                const isEmpty = this._isDocEmpty() && this.isBannerEmpty;
                const inCanvas = matchModels(this.model.parent, [SurfaceBlockModel]);
                const cardClassMap = classMap({
                    loading: isLoading,
                    error: isError,
                    deleted: isDeleted,
                    empty: isEmpty,
                    'banner-empty': this.isBannerEmpty,
                    'note-empty': this.isNoteContentEmpty,
                    'in-canvas': inCanvas,
                    [this._cardStyle]: true,
                    'comment-highlighted': this.isCommentHighlighted,
                });
                const theme = this.std.get(ThemeProvider).theme;
                const { LinkedDocDeletedBanner, LinkedDocEmptyBanner, SyncedDocErrorBanner, } = getEmbedLinkedDocIcons(theme, this._linkedDocMode, this._cardStyle);
                const icon = isError
                    ? SyncedDocErrorIcon
                    : isLoading
                        ? LoadingIcon()
                        : this.icon$.value;
                const title = isLoading ? 'Loading...' : this.title$;
                const description = this.model.props.description$;
                const showDefaultNoteContent = isError || isLoading || isDeleted || isEmpty;
                const defaultNoteContent = isError
                    ? 'This linked doc failed to load.'
                    : isLoading
                        ? ''
                        : isDeleted
                            ? 'This linked doc is deleted.'
                            : isEmpty
                                ? 'Preview of the doc will be displayed here.'
                                : '';
                const dateText = this._cardStyle === 'cube'
                    ? this._docUpdatedAt.toLocaleTimeString()
                    : this._docUpdatedAt.toLocaleString();
                const showDefaultBanner = isError || isLoading || isDeleted || isEmpty;
                const defaultBanner = isError
                    ? SyncedDocErrorBanner
                    : isLoading
                        ? LinkedDocEmptyBanner
                        : isDeleted
                            ? LinkedDocDeletedBanner
                            : LinkedDocEmptyBanner;
                const hasDescriptionAlias = Boolean(description.value);
                return this.renderEmbed(() => html `
        <div
          class="affine-embed-linked-doc-block ${cardClassMap}"
          @click=${this._handleClick}
          @dblclick=${this._handleDoubleClick}
        >
          <div class="affine-embed-linked-doc-content">
            <div class="affine-embed-linked-doc-content-title">
              <div class="affine-embed-linked-doc-content-title-icon">
                ${icon}
              </div>

              <div class="affine-embed-linked-doc-content-title-text">
                ${title}
              </div>
            </div>

            ${when(hasDescriptionAlias, () => html `<div class="affine-embed-linked-doc-content-note alias">
                  ${repeat((description.value ?? '').split('\n'), text => html `<p>${text}</p>`)}
                </div>`, () => when(showDefaultNoteContent, () => html `
                    <div class="affine-embed-linked-doc-content-note default">
                      ${defaultNoteContent}
                    </div>
                  `, () => html `
                    <div
                      class="affine-embed-linked-doc-content-note render"
                    ></div>
                  `))}
            ${isError
                    ? html `
                  <div class="affine-embed-linked-doc-card-content-reload">
                    <div
                      class="affine-embed-linked-doc-card-content-reload-button"
                      @click=${this.refreshData}
                    >
                      ${ResetIcon()} <span>Reload</span>
                    </div>
                  </div>
                `
                    : html `
                  <div class="affine-embed-linked-doc-content-date">
                    <span>Updated</span>

                    <span>${dateText}</span>
                  </div>
                `}
          </div>

          ${showDefaultBanner
                    ? html `
                <div class="affine-embed-linked-doc-banner default">
                  ${defaultBanner}
                </div>
              `
                    : nothing}
        </div>
      `);
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
            this.#_docUpdatedAt_accessor_storage = __runInitializers(this, __docUpdatedAt_initializers, new Date());
            this.#_linkedDocMode_accessor_storage = (__runInitializers(this, __docUpdatedAt_extraInitializers), __runInitializers(this, __linkedDocMode_initializers, 'page'));
            this.#_loading_accessor_storage = (__runInitializers(this, __linkedDocMode_extraInitializers), __runInitializers(this, __loading_initializers, false));
            this.#_referenceToNode_accessor_storage = (__runInitializers(this, __loading_extraInitializers), __runInitializers(this, __referenceToNode_initializers, false));
            this.#isBannerEmpty_accessor_storage = (__runInitializers(this, __referenceToNode_extraInitializers), __runInitializers(this, _isBannerEmpty_initializers, false));
            this.#isError_accessor_storage = (__runInitializers(this, _isBannerEmpty_extraInitializers), __runInitializers(this, _isError_initializers, false));
            this.#isNoteContentEmpty_accessor_storage = (__runInitializers(this, _isError_extraInitializers), __runInitializers(this, _isNoteContentEmpty_initializers, false));
            this.#noteContainer_accessor_storage = (__runInitializers(this, _isNoteContentEmpty_extraInitializers), __runInitializers(this, _noteContainer_initializers, void 0));
            __runInitializers(this, _noteContainer_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return EmbedLinkedDocBlockComponent = _classThis;
})();
export { EmbedLinkedDocBlockComponent };
