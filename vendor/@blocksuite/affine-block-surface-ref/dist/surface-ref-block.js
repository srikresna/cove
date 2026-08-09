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
import { FrameBlockComponent } from '@blocksuite/affine-block-frame';
import { EdgelessCRUDIdentifier, getSurfaceBlock, } from '@blocksuite/affine-block-surface';
import { whenHover } from '@blocksuite/affine-components/hover';
import { Peekable } from '@blocksuite/affine-components/peek';
import { ViewExtensionManagerIdentifier } from '@blocksuite/affine-ext-loader';
import { RefNodeSlotsProvider } from '@blocksuite/affine-inline-reference';
import { FrameBlockModel, } from '@blocksuite/affine-model';
import { BlockElementCommentManager, DocModeProvider, EditPropsStore, ThemeProvider, ToolbarRegistryIdentifier, ViewportElementExtension, } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { requestConnectedFrame } from '@blocksuite/affine-shared/utils';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Bound } from '@blocksuite/global/gfx';
import { BlockComponent, BlockSelection, BlockStdScope, LifeCycleWatcher, TextSelection, } from '@blocksuite/std';
import { GfxBlockElementModel, GfxControllerIdentifier, GfxPrimitiveElementModel, } from '@blocksuite/std/gfx';
import { effect, signal } from '@preact/signals-core';
import { css, html, nothing } from 'lit';
import { query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { guard } from 'lit/directives/guard.js';
import { styleMap } from 'lit/directives/style-map.js';
let SurfaceRefBlockComponent = (() => {
    let _classDecorators = [Peekable({
            enableOn: (block) => !!block.referenceModel,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = BlockComponent;
    let _hoverableContainer_decorators;
    let _hoverableContainer_initializers = [];
    let _hoverableContainer_extraInitializers = [];
    let _captionElement_decorators;
    let _captionElement_initializers = [];
    let _captionElement_extraInitializers = [];
    let _previewEditor_decorators;
    let _previewEditor_initializers = [];
    let _previewEditor_extraInitializers = [];
    var SurfaceRefBlockComponent = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _hoverableContainer_decorators = [query('.affine-surface-ref')];
            _captionElement_decorators = [query('affine-surface-ref > block-caption-editor')];
            _previewEditor_decorators = [query('editor-host')];
            __esDecorate(this, null, _hoverableContainer_decorators, { kind: "accessor", name: "hoverableContainer", static: false, private: false, access: { has: obj => "hoverableContainer" in obj, get: obj => obj.hoverableContainer, set: (obj, value) => { obj.hoverableContainer = value; } }, metadata: _metadata }, _hoverableContainer_initializers, _hoverableContainer_extraInitializers);
            __esDecorate(this, null, _captionElement_decorators, { kind: "accessor", name: "captionElement", static: false, private: false, access: { has: obj => "captionElement" in obj, get: obj => obj.captionElement, set: (obj, value) => { obj.captionElement = value; } }, metadata: _metadata }, _captionElement_initializers, _captionElement_extraInitializers);
            __esDecorate(this, null, _previewEditor_decorators, { kind: "accessor", name: "previewEditor", static: false, private: false, access: { has: obj => "previewEditor" in obj, get: obj => obj.previewEditor, set: (obj, value) => { obj.previewEditor = value; } }, metadata: _metadata }, _previewEditor_initializers, _previewEditor_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SurfaceRefBlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    affine-surface-ref {
      position: relative;
    }

    affine-surface-ref:not(:hover)
      affine-surface-ref-toolbar:not([data-open-menu-display='show']) {
      display: none;
    }

    .affine-surface-ref {
      position: relative;
      user-select: none;
      margin: 10px 0;
      break-inside: avoid;
      border-radius: 8px;
      border: 1px solid ${unsafeCSSVarV2('edgeless/frame/border/default')};
      background-color: ${unsafeCSSVarV2('layer/background/primary')};
      overflow: hidden;
    }

    .affine-surface-ref.focused {
      border-color: ${unsafeCSSVarV2('edgeless/frame/border/active')};
    }

    .affine-surface-ref.comment-highlighted {
      outline: 2px solid ${unsafeCSSVarV2('block/comment/highlightUnderline')};
    }

    @media print {
      .affine-surface-ref {
        outline: none !important;
      }
    }

    .ref-content {
      position: relative;
      background-color: var(--affine-background-primary-color);
      background: radial-gradient(
        var(--affine-edgeless-grid-color) 1px,
        var(--affine-background-primary-color) 1px
      );
    }

    .ref-viewport {
      max-width: 100%;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      user-select: none;
    }

    .ref-viewport-event-mask {
      position: absolute;
      inset: 0;
    }
  `; }
        get _viewExtensionManager() {
            return this.std.get(ViewExtensionManagerIdentifier);
        }
        get _previewSpec() {
            return [
                ...this._viewExtensionManager.get('preview-edgeless'),
                ViewportElementExtension('.ref-viewport'),
            ];
        }
        get _shouldRender() {
            return (this.isConnected &&
                // prevent surface-ref from render itself in loop
                !this.parentComponent?.closest('affine-surface-ref'));
        }
        get referenceModel() {
            return this._referencedModel;
        }
        get isCommentHighlighted() {
            return (this.std
                .getOptional(BlockElementCommentManager)
                ?.isBlockCommentHighlighted(this.model) ?? false);
        }
        _initHotkey() {
            const selection = this.host.selection;
            const addParagraph = () => {
                if (!this.store.getParent(this.model))
                    return;
                const [paragraphId] = this.store.addSiblingBlocks(this.model, [
                    {
                        flavour: 'affine:paragraph',
                    },
                ]);
                const model = this.store.getModelById(paragraphId);
                if (!model)
                    return;
                requestConnectedFrame(() => {
                    selection.update(selList => {
                        return selList
                            .filter(sel => !sel.is(BlockSelection))
                            .concat(selection.create(TextSelection, {
                            from: {
                                blockId: model.id,
                                index: 0,
                                length: 0,
                            },
                            to: null,
                        }));
                    });
                }, this);
            };
            this.bindHotKey({
                Enter: () => {
                    if (!this.selected$.value)
                        return;
                    addParagraph();
                    return true;
                },
            });
        }
        _initReferencedModel() {
            const findReferencedModel = () => {
                if (!this.model.props.reference)
                    return [null, this.store.id];
                const referenceId = this.model.props.reference;
                const find = (doc) => {
                    const block = doc.getBlock(referenceId)?.model;
                    if (block instanceof GfxBlockElementModel) {
                        return [block, doc.id];
                    }
                    const surfaceBlock = getSurfaceBlock(doc);
                    if (!surfaceBlock)
                        return [null, doc.id];
                    const element = surfaceBlock.getElementById(referenceId);
                    if (element)
                        return [element, doc.id];
                    return [null, doc.id];
                };
                // find current doc first
                let result = find(this.store);
                if (result[0])
                    return result;
                for (const doc of this.std.workspace.docs.values()) {
                    result = find(doc.getStore());
                    if (result[0])
                        return result;
                }
                return [null, this.store.id];
            };
            const init = () => {
                const [referencedModel, docId] = findReferencedModel();
                this._referencedModel =
                    referencedModel && referencedModel.xywh ? referencedModel : null;
                // TODO(@L-Sun): clear query cache
                const doc = this.store.workspace.getDoc(docId);
                this._previewDoc = doc?.getStore({ readonly: true }) ?? null;
            };
            init();
            this._disposables.add(this.model.propsUpdated.subscribe(payload => {
                if (payload.key === 'reference' &&
                    this.model.props.reference !== this._referencedModel?.id) {
                    init();
                }
            }));
            if (this._referencedModel instanceof GfxPrimitiveElementModel) {
                this._disposables.add(this._referencedModel.surface.elementRemoved.subscribe(({ id }) => {
                    if (this.model.props.reference === id) {
                        init();
                    }
                }));
            }
            if (this._referencedModel instanceof GfxBlockElementModel) {
                this._disposables.add(this.store.slots.blockUpdated.subscribe(({ type, id }) => {
                    if (type === 'delete' && id === this.model.props.reference) {
                        init();
                    }
                }));
            }
        }
        _initViewport() {
            this._referenceXYWH$.value = this.referenceModel?.xywh ?? null;
            const refreshViewport = () => {
                if (!this._referenceXYWH$.value)
                    return;
                const previewEditorHost = this.previewEditor;
                if (!previewEditorHost)
                    return;
                const gfx = previewEditorHost.std.get(GfxControllerIdentifier);
                const viewport = gfx.viewport;
                viewport.setViewportByBound(Bound.deserialize(this._referenceXYWH$.value), this.referenceModel instanceof FrameBlockModel
                    ? undefined
                    : [20, 20, 20, 20]);
            };
            this.disposables.add(effect(refreshViewport));
            const referenceId = this.model.props.reference;
            const referenceXYWH$ = this._referenceXYWH$;
            class SurfaceRefViewportWatcher extends LifeCycleWatcher {
                constructor() {
                    super(...arguments);
                    this._disposable = new DisposableGroup();
                }
                static { this.key = 'surface-ref-viewport-watcher'; }
                mounted() {
                    const crud = this.std.get(EdgelessCRUDIdentifier);
                    const gfx = this.std.get(GfxControllerIdentifier);
                    const { surface, viewport } = gfx;
                    if (!surface)
                        return;
                    const referenceElement = crud.getElementById(referenceId);
                    if (!referenceElement) {
                        throw new BlockSuiteError(ErrorCode.MissingViewModelError, `can not find element(id:${referenceElement})`);
                    }
                    referenceXYWH$.value = referenceElement.xywh;
                    const { _disposable } = this;
                    refreshViewport();
                    _disposable.add(viewport.sizeUpdated.subscribe(refreshViewport));
                    if (referenceElement instanceof GfxBlockElementModel) {
                        _disposable.add(referenceElement.xywh$.subscribe(xywh => {
                            referenceXYWH$.value = xywh;
                        }));
                    }
                    else if (referenceElement instanceof GfxPrimitiveElementModel) {
                        _disposable.add(surface.elementUpdated.subscribe(({ id, oldValues }) => {
                            if (id === referenceId &&
                                oldValues.xywh !== referenceElement.xywh) {
                                referenceXYWH$.value = referenceElement.xywh;
                            }
                        }));
                    }
                    const subscription = this.std.view.viewUpdated.subscribe(({ id, type, method, view }) => {
                        if (id === referenceElement.id &&
                            type === 'block' &&
                            method === 'add' &&
                            view instanceof FrameBlockComponent) {
                            view.showBorder = false;
                            subscription.unsubscribe();
                        }
                    });
                    _disposable.add(subscription);
                }
                unmounted() {
                    this._disposable.dispose();
                }
            }
            this._runtimePreviewExt = [SurfaceRefViewportWatcher];
        }
        _initHover() {
            const { setReference, setFloating, dispose } = whenHover(hovered => {
                const message$ = this.std.get(ToolbarRegistryIdentifier).message$;
                if (hovered) {
                    message$.value = {
                        flavour: this.model.flavour,
                        element: this,
                        setFloating,
                    };
                    return;
                }
                // Clears previous bindings
                message$.value = null;
                setFloating();
            }, { enterDelay: 500 });
            setReference(this.hoverableContainer);
            this._disposables.add(dispose);
        }
        _renderRefContent() {
            if (!this._referenceXYWH$.value)
                return nothing;
            const { w, h } = Bound.deserialize(this._referenceXYWH$.value);
            const aspectRatio = h !== 0 ? w / h : 1;
            const _previewSpec = this._previewSpec.concat(this._runtimePreviewExt);
            const edgelessTheme = this.std.get(ThemeProvider).edgeless$.value;
            return html `<div class="ref-content">
      <div
        class="ref-viewport"
        style=${styleMap({
                aspectRatio: `${aspectRatio}`,
            })}
        data-theme=${edgelessTheme}
      >
        ${guard(this._previewDoc, () => {
                return this._previewDoc
                    ? new BlockStdScope({
                        store: this._previewDoc,
                        extensions: _previewSpec,
                    }).render()
                    : nothing;
            })}
        <div class="ref-viewport-event-mask"></div>
      </div>
    </div>`;
        }
        connectedCallback() {
            super.connectedCallback();
            this.contentEditable = 'false';
            if (!this._shouldRender)
                return;
            this._initReferencedModel();
            this._initHotkey();
            this._initViewport();
        }
        firstUpdated() {
            if (!this._shouldRender)
                return;
            this._initHover();
        }
        render() {
            if (!this._shouldRender)
                return nothing;
            const { _referencedModel, model } = this;
            const isEmpty = !_referencedModel || !_referencedModel.xywh;
            const theme = this.std.get(ThemeProvider).theme$.value;
            const content = isEmpty
                ? html `<surface-ref-placeholder
          .referenceModel=${_referencedModel}
          .refFlavour=${model.props.refFlavour$.value}
          .theme=${theme}
        ></surface-ref-placeholder>`
                : this._renderRefContent();
            return html `
      <div
        class=${classMap({
                'affine-surface-ref': true,
                focused: this.selected$.value,
                'comment-highlighted': this.isCommentHighlighted,
            })}
        @click=${this._handleClick}
      >
        ${content}
      </div>

      <block-caption-editor></block-caption-editor>

      ${Object.values(this.widgets)}
    `;
        }
        viewInEdgeless() {
            if (!this._referenceXYWH$.value)
                return;
            const viewport = {
                xywh: this._referenceXYWH$.value,
                padding: [20, 20, 20, 20],
            };
            this.std.get(EditPropsStore).setStorage('viewport', viewport);
            this.std.get(DocModeProvider).setEditorMode('edgeless');
        }
        #hoverableContainer_accessor_storage;
        get hoverableContainer() { return this.#hoverableContainer_accessor_storage; }
        set hoverableContainer(value) { this.#hoverableContainer_accessor_storage = value; }
        #captionElement_accessor_storage;
        get captionElement() { return this.#captionElement_accessor_storage; }
        set captionElement(value) { this.#captionElement_accessor_storage = value; }
        #previewEditor_accessor_storage;
        get previewEditor() { return this.#previewEditor_accessor_storage; }
        set previewEditor(value) { this.#previewEditor_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._previewDoc = null;
            this._runtimePreviewExt = [];
            this._referencedModel = null;
            // since the xywh of edgeless element is not a signal, we need to use a signal to store the xywh
            this._referenceXYWH$ = signal(null);
            this._handleClick = () => {
                this.selection.update(() => {
                    return [this.selection.create(BlockSelection, { blockId: this.blockId })];
                });
            };
            this.open = ({ openMode, event, } = {}) => {
                const pageId = this.referenceModel?.surface?.store.id;
                if (!pageId)
                    return;
                this.std.getOptional(RefNodeSlotsProvider)?.docLinkClicked.next({
                    pageId: pageId,
                    params: {
                        mode: 'edgeless',
                        elementIds: [this.model.props.reference],
                    },
                    openMode,
                    event,
                    host: this.host,
                });
            };
            this.#hoverableContainer_accessor_storage = __runInitializers(this, _hoverableContainer_initializers, void 0);
            this.#captionElement_accessor_storage = (__runInitializers(this, _hoverableContainer_extraInitializers), __runInitializers(this, _captionElement_initializers, void 0));
            this.#previewEditor_accessor_storage = (__runInitializers(this, _captionElement_extraInitializers), __runInitializers(this, _previewEditor_initializers, void 0));
            __runInitializers(this, _previewEditor_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return SurfaceRefBlockComponent = _classThis;
})();
export { SurfaceRefBlockComponent };
