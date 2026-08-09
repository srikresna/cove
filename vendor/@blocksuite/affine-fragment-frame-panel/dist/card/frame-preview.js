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
import { ViewExtensionManagerIdentifier } from '@blocksuite/affine-ext-loader';
import { DocModeExtension, DocModeProvider, ViewportElementExtension, } from '@blocksuite/affine-shared/services';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { Bound, deserializeXYWH } from '@blocksuite/global/gfx';
import { WithDisposable } from '@blocksuite/global/lit';
import { BlockStdScope, LifeCycleWatcher, ShadowlessElement, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import {} from '@blocksuite/store';
import { css, html, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';
import { styleMap } from 'lit/directives/style-map.js';
import debounce from 'lodash-es/debounce';
const DEFAULT_PREVIEW_CONTAINER_WIDTH = 280;
const DEFAULT_PREVIEW_CONTAINER_HEIGHT = 166;
const styles = css `
  .frame-preview-container {
    display: block;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: relative;
  }

  .frame-preview-surface-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
  }

  .frame-preview-viewport {
    max-width: 100%;
    box-sizing: border-box;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
  }

  .frame-preview-viewport
    > editor-host
    > affine-edgeless-root-preview
    > .edgeless-background {
    background-color: transparent;
    background-image: none;
  }
`;
export const AFFINE_FRAME_PREVIEW = 'frame-preview';
let FramePreview = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _fillScreen_decorators;
    let _fillScreen_initializers = [];
    let _fillScreen_extraInitializers = [];
    let _frame_decorators;
    let _frame_initializers = [];
    let _frame_extraInitializers = [];
    let _frameViewportWH_decorators;
    let _frameViewportWH_initializers = [];
    let _frameViewportWH_extraInitializers = [];
    let _previewEditor_decorators;
    let _previewEditor_initializers = [];
    let _previewEditor_extraInitializers = [];
    let _surfaceHeight_decorators;
    let _surfaceHeight_initializers = [];
    let _surfaceHeight_extraInitializers = [];
    let _surfaceWidth_decorators;
    let _surfaceWidth_initializers = [];
    let _surfaceWidth_extraInitializers = [];
    return class FramePreview extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _std_decorators = [property({ attribute: false })];
            _fillScreen_decorators = [state()];
            _frame_decorators = [property({ attribute: false })];
            _frameViewportWH_decorators = [state()];
            _previewEditor_decorators = [query('editor-host')];
            _surfaceHeight_decorators = [property({ attribute: false })];
            _surfaceWidth_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _fillScreen_decorators, { kind: "accessor", name: "fillScreen", static: false, private: false, access: { has: obj => "fillScreen" in obj, get: obj => obj.fillScreen, set: (obj, value) => { obj.fillScreen = value; } }, metadata: _metadata }, _fillScreen_initializers, _fillScreen_extraInitializers);
            __esDecorate(this, null, _frame_decorators, { kind: "accessor", name: "frame", static: false, private: false, access: { has: obj => "frame" in obj, get: obj => obj.frame, set: (obj, value) => { obj.frame = value; } }, metadata: _metadata }, _frame_initializers, _frame_extraInitializers);
            __esDecorate(this, null, _frameViewportWH_decorators, { kind: "accessor", name: "frameViewportWH", static: false, private: false, access: { has: obj => "frameViewportWH" in obj, get: obj => obj.frameViewportWH, set: (obj, value) => { obj.frameViewportWH = value; } }, metadata: _metadata }, _frameViewportWH_initializers, _frameViewportWH_extraInitializers);
            __esDecorate(this, null, _previewEditor_decorators, { kind: "accessor", name: "previewEditor", static: false, private: false, access: { has: obj => "previewEditor" in obj, get: obj => obj.previewEditor, set: (obj, value) => { obj.previewEditor = value; } }, metadata: _metadata }, _previewEditor_initializers, _previewEditor_extraInitializers);
            __esDecorate(this, null, _surfaceHeight_decorators, { kind: "accessor", name: "surfaceHeight", static: false, private: false, access: { has: obj => "surfaceHeight" in obj, get: obj => obj.surfaceHeight, set: (obj, value) => { obj.surfaceHeight = value; } }, metadata: _metadata }, _surfaceHeight_initializers, _surfaceHeight_extraInitializers);
            __esDecorate(this, null, _surfaceWidth_decorators, { kind: "accessor", name: "surfaceWidth", static: false, private: false, access: { has: obj => "surfaceWidth" in obj, get: obj => obj.surfaceWidth, set: (obj, value) => { obj.surfaceWidth = value; } }, metadata: _metadata }, _surfaceWidth_initializers, _surfaceWidth_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        get _viewExtensionManager() {
            return this.std.get(ViewExtensionManagerIdentifier);
        }
        get _previewSpec() {
            return this._viewExtensionManager.get('preview-edgeless');
        }
        get _originalDoc() {
            return this.frame.store;
        }
        _initPreviewDoc() {
            const doc = this._originalDoc.workspace.getDoc(this._originalDoc.id);
            this._previewDoc =
                doc?.getStore({ readonly: true, query: this._docFilter }) ?? null;
            this.disposables.add(() => {
                this._originalDoc.doc.removeStore({ query: this._docFilter });
            });
        }
        _initSpec() {
            const refreshViewport = this._refreshViewport.bind(this);
            class FramePreviewWatcher extends LifeCycleWatcher {
                static { this.key = 'frame-preview-watcher'; }
                mounted() {
                    const std = this.std;
                    const { view } = std;
                    view.viewUpdated.subscribe(payload => {
                        if (payload.type !== 'block' ||
                            payload.method !== 'add' ||
                            payload.view.model.flavour !== 'affine:page') {
                            return;
                        }
                        const viewport = std.get(GfxControllerIdentifier).viewport;
                        const subscription = viewport.sizeUpdated.subscribe(() => {
                            subscription.unsubscribe();
                            refreshViewport();
                        });
                    });
                }
            }
            const docModeService = this.std.get(DocModeProvider);
            this._runtimePreviewExt = [
                ViewportElementExtension('.frame-preview-viewport'),
                FramePreviewWatcher,
                DocModeExtension(docModeService),
            ];
        }
        _refreshViewport() {
            const previewEditorHost = this.previewEditor;
            if (!previewEditorHost)
                return;
            const { viewport } = previewEditorHost.std.get(GfxControllerIdentifier);
            const frameBound = Bound.deserialize(this.frame.xywh);
            viewport.setViewportByBound(frameBound);
        }
        _renderSurfaceContent() {
            const { width, height } = this.frameViewportWH;
            const _previewSpec = this._previewSpec.concat(this._runtimePreviewExt);
            return html `<div
      class="frame-preview-surface-container"
      style=${styleMap({
                width: `${this.surfaceWidth}px`,
                height: `${this.surfaceHeight}px`,
            })}
    >
      <div
        class="frame-preview-viewport"
        style=${styleMap({
                width: `${width}px`,
                height: `${height}px`,
            })}
      >
        ${guard([this._previewDoc, this.frame], () => {
                if (!this._previewDoc || !this.frame)
                    return nothing;
                return new BlockStdScope({
                    store: this._previewDoc,
                    extensions: _previewSpec,
                }).render();
            })}
      </div>
    </div>`;
        }
        _setFrameDisposables(frame) {
            this._clearFrameDisposables();
            this._frameDisposables = new DisposableGroup();
            this._frameDisposables.add(frame.propsUpdated.subscribe(debounce(this._updateFrameViewportWH, 10, { leading: true })));
        }
        connectedCallback() {
            super.connectedCallback();
            this._initSpec();
            this._initPreviewDoc();
            this._updateFrameViewportWH();
            this._setFrameDisposables(this.frame);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._clearFrameDisposables();
        }
        render() {
            const { frame } = this;
            const noContent = !frame || !frame.xywh;
            return html `<div class="frame-preview-container">
      ${noContent ? nothing : this._renderSurfaceContent()}
    </div>`;
        }
        updated(_changedProperties) {
            if (_changedProperties.has('frame')) {
                this._setFrameDisposables(this.frame);
            }
            if (_changedProperties.has('frameViewportWH')) {
                this._refreshViewport();
            }
        }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #fillScreen_accessor_storage;
        get fillScreen() { return this.#fillScreen_accessor_storage; }
        set fillScreen(value) { this.#fillScreen_accessor_storage = value; }
        #frame_accessor_storage;
        get frame() { return this.#frame_accessor_storage; }
        set frame(value) { this.#frame_accessor_storage = value; }
        #frameViewportWH_accessor_storage;
        get frameViewportWH() { return this.#frameViewportWH_accessor_storage; }
        set frameViewportWH(value) { this.#frameViewportWH_accessor_storage = value; }
        #previewEditor_accessor_storage;
        get previewEditor() { return this.#previewEditor_accessor_storage; }
        set previewEditor(value) { this.#previewEditor_accessor_storage = value; }
        #surfaceHeight_accessor_storage;
        get surfaceHeight() { return this.#surfaceHeight_accessor_storage; }
        set surfaceHeight(value) { this.#surfaceHeight_accessor_storage = value; }
        #surfaceWidth_accessor_storage;
        get surfaceWidth() { return this.#surfaceWidth_accessor_storage; }
        set surfaceWidth(value) { this.#surfaceWidth_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._clearFrameDisposables = () => {
                this._frameDisposables?.dispose();
                this._frameDisposables = null;
            };
            this._docFilter = {
                mode: 'loose',
                match: [
                    {
                        flavour: 'affine:frame',
                        viewType: 'hidden',
                    },
                ],
            };
            this._frameDisposables = null;
            this._previewDoc = null;
            this._runtimePreviewExt = [];
            this._updateFrameViewportWH = () => {
                const [, , w, h] = deserializeXYWH(this.frame.xywh);
                let scale = 1;
                if (this.fillScreen) {
                    scale = Math.max(this.surfaceWidth / w, this.surfaceHeight / h);
                }
                else {
                    scale = Math.min(this.surfaceWidth / w, this.surfaceHeight / h);
                }
                this.frameViewportWH = {
                    width: w * scale,
                    height: h * scale,
                };
            };
            this.#std_accessor_storage = __runInitializers(this, _std_initializers, void 0);
            this.#fillScreen_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _fillScreen_initializers, false));
            this.#frame_accessor_storage = (__runInitializers(this, _fillScreen_extraInitializers), __runInitializers(this, _frame_initializers, void 0));
            this.#frameViewportWH_accessor_storage = (__runInitializers(this, _frame_extraInitializers), __runInitializers(this, _frameViewportWH_initializers, {
                width: 0,
                height: 0,
            }));
            this.#previewEditor_accessor_storage = (__runInitializers(this, _frameViewportWH_extraInitializers), __runInitializers(this, _previewEditor_initializers, null));
            this.#surfaceHeight_accessor_storage = (__runInitializers(this, _previewEditor_extraInitializers), __runInitializers(this, _surfaceHeight_initializers, DEFAULT_PREVIEW_CONTAINER_HEIGHT));
            this.#surfaceWidth_accessor_storage = (__runInitializers(this, _surfaceHeight_extraInitializers), __runInitializers(this, _surfaceWidth_initializers, DEFAULT_PREVIEW_CONTAINER_WIDTH));
            __runInitializers(this, _surfaceWidth_extraInitializers);
        }
    };
})();
export { FramePreview };
