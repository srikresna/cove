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
import { EmbedBlockComponent, isEmptyDoc, } from '@blocksuite/affine-block-embed';
import { Peekable } from '@blocksuite/affine-components/peek';
import { ViewExtensionManagerIdentifier } from '@blocksuite/affine-ext-loader';
import { RefNodeSlotsProvider, } from '@blocksuite/affine-inline-reference';
import { NoteDisplayMode, } from '@blocksuite/affine-model';
import { REFERENCE_NODE } from '@blocksuite/affine-shared/consts';
import { DocDisplayMetaProvider, DocModeProvider, EditorSettingExtension, EditorSettingProvider, GeneralSettingSchema, ThemeExtensionIdentifier, ThemeProvider, } from '@blocksuite/affine-shared/services';
import { cloneReferenceInfo } from '@blocksuite/affine-shared/utils';
import { Bound, getCommonBound } from '@blocksuite/global/gfx';
import { BlockSelection, BlockStdScope, LifeCycleWatcher, } from '@blocksuite/std';
import { GfxControllerIdentifier, GfxExtension } from '@blocksuite/std/gfx';
import { Text } from '@blocksuite/store';
import { computed, signal } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { classMap } from 'lit/directives/class-map.js';
import { guard } from 'lit/directives/guard.js';
import { styleMap } from 'lit/directives/style-map.js';
import * as Y from 'yjs';
import { blockStyles } from './styles.js';
let EmbedSyncedDocBlockComponent = (() => {
    let _classDecorators = [Peekable({
            enableOn: ({ store }) => !store.readonly,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = EmbedBlockComponent;
    let __cycle_decorators;
    let __cycle_initializers = [];
    let __cycle_extraInitializers = [];
    let __deleted_decorators;
    let __deleted_initializers = [];
    let __deleted_extraInitializers = [];
    let __docUpdatedAt_decorators;
    let __docUpdatedAt_initializers = [];
    let __docUpdatedAt_extraInitializers = [];
    let __error_decorators;
    let __error_initializers = [];
    let __error_extraInitializers = [];
    let __isEmptySyncedDoc_decorators;
    let __isEmptySyncedDoc_initializers = [];
    let __isEmptySyncedDoc_extraInitializers = [];
    let __loading_decorators;
    let __loading_initializers = [];
    let __loading_extraInitializers = [];
    let _depth_decorators;
    let _depth_initializers = [];
    let _depth_extraInitializers = [];
    let _syncedDocCard_decorators;
    let _syncedDocCard_initializers = [];
    let _syncedDocCard_extraInitializers = [];
    let _syncedDocEditorHost_decorators;
    let _syncedDocEditorHost_initializers = [];
    let _syncedDocEditorHost_extraInitializers = [];
    let _syncedDocMode_decorators;
    let _syncedDocMode_initializers = [];
    let _syncedDocMode_extraInitializers = [];
    var EmbedSyncedDocBlockComponent = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            // Caches total bounds, includes all blocks and elements.
            this._cachedBounds = null;
            this._hasRenderedSyncedView = false;
            this._hasInitedFitEffect = false;
            this._initEdgelessFitEffect = () => {
                const fitToContent = () => {
                    if (this.isPageMode)
                        return;
                    const controller = this.syncedDocEditorHost?.std.getOptional(GfxControllerIdentifier);
                    if (!controller)
                        return;
                    const viewport = controller.viewport;
                    if (!viewport)
                        return;
                    if (!this._cachedBounds) {
                        this._cachedBounds = getCommonBound([
                            ...controller.layer.blocks.map(block => Bound.deserialize(block.xywh)),
                            ...controller.layer.canvasElements,
                        ]);
                    }
                    viewport.onResize();
                    const { centerX, centerY, zoom } = viewport.getFitToScreenData(this._cachedBounds);
                    viewport.setCenter(centerX, centerY);
                    viewport.setZoom(zoom);
                };
                const observer = new ResizeObserver(fitToContent);
                const block = this.embedBlock;
                observer.observe(block);
                this._disposables.add(() => {
                    observer.disconnect();
                });
                this.syncedDocEditorHost?.updateComplete
                    .then(() => fitToContent())
                    .catch(() => { });
            };
            this._pageFilter = {
                mode: 'loose',
                match: [
                    {
                        flavour: 'affine:note',
                        props: {
                            displayMode: NoteDisplayMode.EdgelessOnly,
                        },
                        viewType: 'hidden',
                    },
                ],
            };
            this._buildPreviewSpec = (name) => {
                const nextDepth = this.depth + 1;
                const viewExtensionManager = this.std.get(ViewExtensionManagerIdentifier);
                const previewSpec = viewExtensionManager.get(name);
                const currentDisposables = this.disposables;
                const editorSetting = this.std.getOptional(EditorSettingProvider) ?? {
                    setting$: signal(GeneralSettingSchema.parse({})),
                };
                class EmbedSyncedDocWatcher extends LifeCycleWatcher {
                    static { this.key = 'embed-synced-doc-watcher'; }
                    mounted() {
                        const { view } = this.std;
                        view.viewUpdated.subscribe(payload => {
                            if (payload.type !== 'block' ||
                                payload.view.model.flavour !== 'affine:embed-synced-doc') {
                                return;
                            }
                            const nextComponent = payload.view;
                            if (payload.method === 'add') {
                                nextComponent.depth = nextDepth;
                                currentDisposables.add(() => {
                                    nextComponent.depth = 0;
                                });
                                return;
                            }
                            if (payload.method === 'delete') {
                                nextComponent.depth = 0;
                                return;
                            }
                        });
                    }
                }
                class GfxViewportInitializer extends GfxExtension {
                    static { this.key = 'gfx-viewport-initializer'; }
                    mounted() {
                        this.gfx.fitToScreen();
                    }
                }
                return previewSpec.concat([
                    EmbedSyncedDocWatcher,
                    GfxViewportInitializer,
                    EditorSettingExtension(editorSetting),
                ]);
            };
            this._renderSyncedView = () => {
                const syncedDoc = this.syncedDoc;
                const editorMode = this.editorMode;
                const isPageMode = this.isPageMode;
                if (!syncedDoc) {
                    console.error('Synced doc is not found');
                    return html `${nothing}`;
                }
                if (isPageMode) {
                    this.dataset.pageMode = '';
                }
                const containerStyleMap = styleMap({
                    position: 'relative',
                    width: '100%',
                });
                const themeService = this.std.get(ThemeProvider);
                const themeExtension = this.std.getOptional(ThemeExtensionIdentifier);
                const appTheme = themeService.app$.value;
                let edgelessTheme = themeService.edgeless$.value;
                if (themeExtension?.getEdgelessTheme && this.syncedDoc?.id) {
                    edgelessTheme = themeExtension.getEdgelessTheme(this.syncedDoc.id).value;
                }
                const theme = isPageMode ? appTheme : edgelessTheme;
                this.dataset.nestedEditor = '';
                const renderEditor = () => {
                    return choose(editorMode, [
                        [
                            'page',
                            () => html `
            <div class="affine-page-viewport" data-theme=${appTheme}>
              ${new BlockStdScope({
                                store: syncedDoc,
                                extensions: this._buildPreviewSpec('preview-page'),
                            }).render()}
            </div>
          `,
                        ],
                        [
                            'edgeless',
                            () => html `
            <div class="affine-edgeless-viewport" data-theme=${edgelessTheme}>
              ${new BlockStdScope({
                                store: syncedDoc,
                                extensions: this._buildPreviewSpec('preview-edgeless'),
                            }).render()}
            </div>
          `,
                        ],
                    ]);
                };
                return this.renderEmbed(() => html `
        <div
          class=${classMap({
                    'affine-embed-synced-doc-container': true,
                    [editorMode]: true,
                    [theme]: true,
                    surface: false,
                    selected: this.selected$.value,
                    'show-hover-border': true,
                    'comment-highlighted': this.isCommentHighlighted,
                })}
          @click=${this._handleClick}
          style=${containerStyleMap}
          ?data-scale=${undefined}
        >
          <div class="affine-embed-synced-doc-editor">
            ${isPageMode && this._isEmptySyncedDoc
                    ? html `
                  <div class="affine-embed-synced-doc-editor-empty">
                    <span>
                      This is a linked doc, you can add content here.
                    </span>
                  </div>
                `
                    : guard([editorMode, syncedDoc, appTheme, edgelessTheme], renderEditor)}
          </div>
          <div
            class=${classMap({
                    'affine-embed-synced-doc-header-wrapper': true,
                    selected: this.selected$.value,
                })}
          >
            <div class="affine-embed-synced-doc-header">
              <span class="affine-embed-synced-doc-icon"
                >${this.icon$.value}</span
              >
              <span class="affine-embed-synced-doc-title">${this.title$}</span>
            </div>
          </div>
        </div>
      `);
            };
            this.cardStyleMap = styleMap({
                position: 'relative',
                display: 'block',
                width: '100%',
            });
            this.convertToCard = (aliasInfo) => {
                const { store } = this.model;
                const { caption } = this.model.props;
                const parent = store.getParent(this.model);
                if (!parent) {
                    console.error(`Trying to convert synced doc to card, but the parent is not found.`);
                    return;
                }
                const index = parent.children.indexOf(this.model);
                const blockId = store.addBlock('affine:embed-linked-doc', { caption, ...this.referenceInfo, ...aliasInfo }, parent, index);
                store.deleteBlock(this.model);
                this.std.selection.setGroup('note', [
                    this.std.selection.create(BlockSelection, { blockId }),
                ]);
            };
            this.convertToInline = () => {
                const { store } = this.model;
                const parent = store.getParent(this.model);
                if (!parent) {
                    console.error(`Trying to convert synced doc to inline, but the parent is not found.`);
                    return;
                }
                const index = parent.children.indexOf(this.model);
                const yText = new Y.Text();
                yText.insert(0, REFERENCE_NODE);
                yText.format(0, REFERENCE_NODE.length, {
                    reference: {
                        type: 'LinkedPage',
                        ...this.referenceInfo,
                    },
                });
                const text = new Text(yText);
                store.addBlock('affine:paragraph', {
                    text,
                }, parent, index);
                store.deleteBlock(this.model);
            };
            this.embedContainerStyle = {
                height: 'unset',
            };
            this.icon$ = computed(() => {
                const { pageId, params } = this.model.props;
                return this.std
                    .get(DocDisplayMetaProvider)
                    .icon(pageId, { params, referenced: true }).value;
            });
            this.open = (event) => {
                const pageId = this.model.props.pageId;
                if (pageId === this.store.id)
                    return;
                this.std
                    .getOptional(RefNodeSlotsProvider)
                    ?.docLinkClicked.next({ ...event, pageId, host: this.host });
            };
            this.refreshData = () => {
                this._load()
                    .then(() => {
                    this._isEmptySyncedDoc = isEmptyDoc(this.syncedDoc, this.editorMode);
                })
                    .catch(e => {
                    console.error(e);
                    this._error = true;
                });
            };
            this.title$ = computed(() => {
                const { pageId, params } = this.model.props;
                return this.std
                    .get(DocDisplayMetaProvider)
                    .title(pageId, { params, referenced: true });
            });
            this.#_cycle_accessor_storage = __runInitializers(this, __cycle_initializers, false);
            this.#_deleted_accessor_storage = (__runInitializers(this, __cycle_extraInitializers), __runInitializers(this, __deleted_initializers, false));
            this.#_docUpdatedAt_accessor_storage = (__runInitializers(this, __deleted_extraInitializers), __runInitializers(this, __docUpdatedAt_initializers, new Date()));
            this.#_error_accessor_storage = (__runInitializers(this, __docUpdatedAt_extraInitializers), __runInitializers(this, __error_initializers, false));
            this.#_isEmptySyncedDoc_accessor_storage = (__runInitializers(this, __error_extraInitializers), __runInitializers(this, __isEmptySyncedDoc_initializers, true));
            this.#_loading_accessor_storage = (__runInitializers(this, __isEmptySyncedDoc_extraInitializers), __runInitializers(this, __loading_initializers, false));
            this.#depth_accessor_storage = (__runInitializers(this, __loading_extraInitializers), __runInitializers(this, _depth_initializers, 0));
            this.#syncedDocCard_accessor_storage = (__runInitializers(this, _depth_extraInitializers), __runInitializers(this, _syncedDocCard_initializers, null));
            this.#syncedDocEditorHost_accessor_storage = (__runInitializers(this, _syncedDocCard_extraInitializers), __runInitializers(this, _syncedDocEditorHost_initializers, null));
            this.#syncedDocMode_accessor_storage = (__runInitializers(this, _syncedDocEditorHost_extraInitializers), __runInitializers(this, _syncedDocMode_initializers, 'page'));
            this.#useCaptionEditor_accessor_storage = (__runInitializers(this, _syncedDocMode_extraInitializers), true);
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __cycle_decorators = [state()];
            __deleted_decorators = [state()];
            __docUpdatedAt_decorators = [state()];
            __error_decorators = [state()];
            __isEmptySyncedDoc_decorators = [state()];
            __loading_decorators = [state()];
            _depth_decorators = [state()];
            _syncedDocCard_decorators = [query(':scope > .affine-block-component > .embed-block-container > affine-embed-synced-doc-card')];
            _syncedDocEditorHost_decorators = [query(':scope > .affine-block-component > .embed-block-container > .affine-embed-synced-doc-container > .affine-embed-synced-doc-editor > div > editor-host')];
            _syncedDocMode_decorators = [state()];
            __esDecorate(this, null, __cycle_decorators, { kind: "accessor", name: "_cycle", static: false, private: false, access: { has: obj => "_cycle" in obj, get: obj => obj._cycle, set: (obj, value) => { obj._cycle = value; } }, metadata: _metadata }, __cycle_initializers, __cycle_extraInitializers);
            __esDecorate(this, null, __deleted_decorators, { kind: "accessor", name: "_deleted", static: false, private: false, access: { has: obj => "_deleted" in obj, get: obj => obj._deleted, set: (obj, value) => { obj._deleted = value; } }, metadata: _metadata }, __deleted_initializers, __deleted_extraInitializers);
            __esDecorate(this, null, __docUpdatedAt_decorators, { kind: "accessor", name: "_docUpdatedAt", static: false, private: false, access: { has: obj => "_docUpdatedAt" in obj, get: obj => obj._docUpdatedAt, set: (obj, value) => { obj._docUpdatedAt = value; } }, metadata: _metadata }, __docUpdatedAt_initializers, __docUpdatedAt_extraInitializers);
            __esDecorate(this, null, __error_decorators, { kind: "accessor", name: "_error", static: false, private: false, access: { has: obj => "_error" in obj, get: obj => obj._error, set: (obj, value) => { obj._error = value; } }, metadata: _metadata }, __error_initializers, __error_extraInitializers);
            __esDecorate(this, null, __isEmptySyncedDoc_decorators, { kind: "accessor", name: "_isEmptySyncedDoc", static: false, private: false, access: { has: obj => "_isEmptySyncedDoc" in obj, get: obj => obj._isEmptySyncedDoc, set: (obj, value) => { obj._isEmptySyncedDoc = value; } }, metadata: _metadata }, __isEmptySyncedDoc_initializers, __isEmptySyncedDoc_extraInitializers);
            __esDecorate(this, null, __loading_decorators, { kind: "accessor", name: "_loading", static: false, private: false, access: { has: obj => "_loading" in obj, get: obj => obj._loading, set: (obj, value) => { obj._loading = value; } }, metadata: _metadata }, __loading_initializers, __loading_extraInitializers);
            __esDecorate(this, null, _depth_decorators, { kind: "accessor", name: "depth", static: false, private: false, access: { has: obj => "depth" in obj, get: obj => obj.depth, set: (obj, value) => { obj.depth = value; } }, metadata: _metadata }, _depth_initializers, _depth_extraInitializers);
            __esDecorate(this, null, _syncedDocCard_decorators, { kind: "accessor", name: "syncedDocCard", static: false, private: false, access: { has: obj => "syncedDocCard" in obj, get: obj => obj.syncedDocCard, set: (obj, value) => { obj.syncedDocCard = value; } }, metadata: _metadata }, _syncedDocCard_initializers, _syncedDocCard_extraInitializers);
            __esDecorate(this, null, _syncedDocEditorHost_decorators, { kind: "accessor", name: "syncedDocEditorHost", static: false, private: false, access: { has: obj => "syncedDocEditorHost" in obj, get: obj => obj.syncedDocEditorHost, set: (obj, value) => { obj.syncedDocEditorHost = value; } }, metadata: _metadata }, _syncedDocEditorHost_initializers, _syncedDocEditorHost_extraInitializers);
            __esDecorate(this, null, _syncedDocMode_decorators, { kind: "accessor", name: "syncedDocMode", static: false, private: false, access: { has: obj => "syncedDocMode" in obj, get: obj => obj.syncedDocMode, set: (obj, value) => { obj.syncedDocMode = value; } }, metadata: _metadata }, _syncedDocMode_initializers, _syncedDocMode_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EmbedSyncedDocBlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = blockStyles; }
        get blockState() {
            return {
                isLoading: this._loading,
                isError: this._error,
                isDeleted: this._deleted,
                isCycle: this._cycle,
            };
        }
        get docTitle() {
            return this.syncedDoc?.meta?.title || 'Untitled';
        }
        get docUpdatedAt() {
            return this._docUpdatedAt;
        }
        get editorMode() {
            return this.linkedMode ?? this.syncedDocMode;
        }
        get isPageMode() {
            return this.editorMode === 'page';
        }
        get linkedMode() {
            return this.referenceInfo.params?.mode;
        }
        get referenceInfo() {
            return cloneReferenceInfo(this.model.props);
        }
        get syncedDoc() {
            const options = { readonly: true };
            if (this.isPageMode)
                options.query = this._pageFilter;
            const doc = this.std.workspace.getDoc(this.model.props.pageId);
            return doc?.getStore(options) ?? null;
        }
        _checkCycle() {
            let editorHost = this.host;
            while (editorHost && !this._cycle) {
                this._cycle =
                    !!editorHost && editorHost.store.id === this.model.props.pageId;
                editorHost = editorHost.parentElement?.closest('editor-host') ?? null;
            }
        }
        _isClickAtBorder(event, element, tolerance = 8) {
            const { x, y } = event;
            const rect = element.getBoundingClientRect();
            if (!rect) {
                return false;
            }
            return (Math.abs(x - rect.left) < tolerance ||
                Math.abs(x - rect.right) < tolerance ||
                Math.abs(y - rect.top) < tolerance ||
                Math.abs(y - rect.bottom) < tolerance);
        }
        async _load() {
            this._loading = true;
            this._error = false;
            this._deleted = false;
            this._cycle = false;
            const syncedDoc = this.syncedDoc;
            const trash = syncedDoc?.meta?.trash;
            if (trash || !syncedDoc) {
                this._deleted = true;
                this._loading = false;
                return;
            }
            this._checkCycle();
            if (!syncedDoc.loaded) {
                try {
                    syncedDoc.load();
                }
                catch (e) {
                    console.error(e);
                    this._error = true;
                }
            }
            if (!this._error && !syncedDoc.root) {
                await new Promise(resolve => {
                    const subscription = syncedDoc.slots.rootAdded.subscribe(() => {
                        subscription.unsubscribe();
                        resolve();
                    });
                });
            }
            this._loading = false;
        }
        _selectBlock() {
            const selectionManager = this.std.selection;
            const blockSelection = selectionManager.create(BlockSelection, {
                blockId: this.blockId,
            });
            selectionManager.setGroup('note', [blockSelection]);
        }
        _setDocUpdatedAt() {
            const meta = this.store.workspace.meta.getDocMeta(this.model.props.pageId);
            if (meta) {
                const date = meta.updatedDate || meta.createDate;
                this._docUpdatedAt = new Date(date);
            }
        }
        _handleClick(_event) {
            this._selectBlock();
        }
        connectedCallback() {
            super.connectedCallback();
            this._cardStyle = this.model.props.style;
            this.style.display = 'block';
            this._load().catch(e => {
                console.error(e);
                this._error = true;
            });
            this.contentEditable = 'false';
            this.disposables.add(this.model.propsUpdated.subscribe(({ key }) => {
                if (key === 'pageId' || key === 'style') {
                    this._load().catch(e => {
                        console.error(e);
                        this._error = true;
                    });
                }
            }));
            this._setDocUpdatedAt();
            this.disposables.add(this.store.workspace.slots.docListUpdated.subscribe(() => {
                this._setDocUpdatedAt();
                this.refreshData();
            }));
            if (!this.linkedMode) {
                const docMode = this.std.get(DocModeProvider);
                this.syncedDocMode = docMode.getPrimaryMode(this.model.props.pageId);
                this._isEmptySyncedDoc = isEmptyDoc(this.syncedDoc, this.editorMode);
                this.disposables.add(docMode.onPrimaryModeChange(mode => {
                    this.syncedDocMode = mode;
                    this._isEmptySyncedDoc = isEmptyDoc(this.syncedDoc, this.editorMode);
                }, this.model.props.pageId));
            }
            this.syncedDoc &&
                this.disposables.add(this.syncedDoc.slots.blockUpdated.subscribe(() => {
                    this._isEmptySyncedDoc = isEmptyDoc(this.syncedDoc, this.editorMode);
                }));
        }
        firstUpdated() {
            this.disposables.addFromEvent(this, 'click', e => {
                e.stopPropagation();
                if (this._isClickAtBorder(e, this)) {
                    e.preventDefault();
                    this._selectBlock();
                }
            });
        }
        renderBlock() {
            delete this.dataset.nestedEditor;
            const syncedDoc = this.syncedDoc;
            const { isLoading, isError, isDeleted, isCycle } = this.blockState;
            const isCardOnly = this.depth >= 1;
            if (isLoading ||
                isError ||
                isDeleted ||
                isCardOnly ||
                isCycle ||
                !syncedDoc) {
                return this.renderEmbed(() => html `
          <affine-embed-synced-doc-card
            style=${this.cardStyleMap}
            .block=${this}
          ></affine-embed-synced-doc-card>
        `);
            }
            !this._hasRenderedSyncedView && (this._hasRenderedSyncedView = true);
            return this._renderSyncedView();
        }
        updated(changedProperties) {
            super.updated(changedProperties);
            this.syncedDocCard?.requestUpdate();
            if (!this._hasInitedFitEffect && this._hasRenderedSyncedView) {
                /* Register the resizeObserver AFTER syncdView viewport's own resizeObserver
                 * so that viewport.onResize() use up-to-date boundingClientRect values */
                this._hasInitedFitEffect = true;
                this._initEdgelessFitEffect();
            }
        }
        #_cycle_accessor_storage;
        get _cycle() { return this.#_cycle_accessor_storage; }
        set _cycle(value) { this.#_cycle_accessor_storage = value; }
        #_deleted_accessor_storage;
        get _deleted() { return this.#_deleted_accessor_storage; }
        set _deleted(value) { this.#_deleted_accessor_storage = value; }
        #_docUpdatedAt_accessor_storage;
        get _docUpdatedAt() { return this.#_docUpdatedAt_accessor_storage; }
        set _docUpdatedAt(value) { this.#_docUpdatedAt_accessor_storage = value; }
        #_error_accessor_storage;
        get _error() { return this.#_error_accessor_storage; }
        set _error(value) { this.#_error_accessor_storage = value; }
        #_isEmptySyncedDoc_accessor_storage;
        get _isEmptySyncedDoc() { return this.#_isEmptySyncedDoc_accessor_storage; }
        set _isEmptySyncedDoc(value) { this.#_isEmptySyncedDoc_accessor_storage = value; }
        #_loading_accessor_storage;
        get _loading() { return this.#_loading_accessor_storage; }
        set _loading(value) { this.#_loading_accessor_storage = value; }
        #depth_accessor_storage;
        get depth() { return this.#depth_accessor_storage; }
        set depth(value) { this.#depth_accessor_storage = value; }
        #syncedDocCard_accessor_storage;
        get syncedDocCard() { return this.#syncedDocCard_accessor_storage; }
        set syncedDocCard(value) { this.#syncedDocCard_accessor_storage = value; }
        #syncedDocEditorHost_accessor_storage;
        get syncedDocEditorHost() { return this.#syncedDocEditorHost_accessor_storage; }
        set syncedDocEditorHost(value) { this.#syncedDocEditorHost_accessor_storage = value; }
        #syncedDocMode_accessor_storage;
        get syncedDocMode() { return this.#syncedDocMode_accessor_storage; }
        set syncedDocMode(value) { this.#syncedDocMode_accessor_storage = value; }
        #useCaptionEditor_accessor_storage;
        get useCaptionEditor() { return this.#useCaptionEditor_accessor_storage; }
        set useCaptionEditor(value) { this.#useCaptionEditor_accessor_storage = value; }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return EmbedSyncedDocBlockComponent = _classThis;
})();
export { EmbedSyncedDocBlockComponent };
