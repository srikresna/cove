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
import { EdgelessCRUDIdentifier, getBgGridGap, } from '@blocksuite/affine-block-surface';
import { EditorSettingProvider, FontLoaderService, ThemeProvider, ViewportElementProvider, } from '@blocksuite/affine-shared/services';
import { requestThrottledConnectedFrame } from '@blocksuite/affine-shared/utils';
import { BlockComponent, SurfaceSelection, } from '@blocksuite/std';
import { GfxControllerIdentifier, } from '@blocksuite/std/gfx';
import { css, html } from 'lit';
import { query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { isCanvasElement } from '../edgeless/utils/query';
let EdgelessRootPreviewBlockComponent = (() => {
    let _classSuper = BlockComponent;
    let _overrideBackground_decorators;
    let _overrideBackground_initializers = [];
    let _overrideBackground_extraInitializers = [];
    let _backgroundStyle_decorators;
    let _backgroundStyle_initializers = [];
    let _backgroundStyle_extraInitializers = [];
    let _gfxViewportElm_decorators;
    let _gfxViewportElm_initializers = [];
    let _gfxViewportElm_extraInitializers = [];
    let _surface_decorators;
    let _surface_initializers = [];
    let _surface_extraInitializers = [];
    return class EdgelessRootPreviewBlockComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _overrideBackground_decorators = [state()];
            _backgroundStyle_decorators = [state()];
            _gfxViewportElm_decorators = [query('gfx-viewport')];
            _surface_decorators = [query('affine-surface')];
            __esDecorate(this, null, _overrideBackground_decorators, { kind: "accessor", name: "overrideBackground", static: false, private: false, access: { has: obj => "overrideBackground" in obj, get: obj => obj.overrideBackground, set: (obj, value) => { obj.overrideBackground = value; } }, metadata: _metadata }, _overrideBackground_initializers, _overrideBackground_extraInitializers);
            __esDecorate(this, null, _backgroundStyle_decorators, { kind: "accessor", name: "backgroundStyle", static: false, private: false, access: { has: obj => "backgroundStyle" in obj, get: obj => obj.backgroundStyle, set: (obj, value) => { obj.backgroundStyle = value; } }, metadata: _metadata }, _backgroundStyle_initializers, _backgroundStyle_extraInitializers);
            __esDecorate(this, null, _gfxViewportElm_decorators, { kind: "accessor", name: "gfxViewportElm", static: false, private: false, access: { has: obj => "gfxViewportElm" in obj, get: obj => obj.gfxViewportElm, set: (obj, value) => { obj.gfxViewportElm = value; } }, metadata: _metadata }, _gfxViewportElm_initializers, _gfxViewportElm_extraInitializers);
            __esDecorate(this, null, _surface_decorators, { kind: "accessor", name: "surface", static: false, private: false, access: { has: obj => "surface" in obj, get: obj => obj.surface, set: (obj, value) => { obj.surface = value; } }, metadata: _metadata }, _surface_initializers, _surface_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    affine-edgeless-root-preview {
      pointer-events: none;
      -webkit-user-select: none;
      user-select: none;
      display: block;
      height: 100%;
    }

    affine-edgeless-root-preview .widgets-container {
      position: absolute;
      left: 0;
      top: 0;
      contain: size layout;
      z-index: 1;
      height: 100%;
    }

    affine-edgeless-root-preview .edgeless-background {
      height: 100%;
      background-color: var(--affine-background-primary-color);
      background-image: radial-gradient(
        var(--affine-edgeless-grid-color) 1px,
        var(--affine-background-primary-color) 1px
      );
    }

    @media print {
      .selected {
        background-color: transparent !important;
      }
    }
  `; }
        get _viewport() {
            return this._gfx.viewport;
        }
        get _gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        get surfaceBlockModel() {
            return this.model.children.find(child => child.flavour === 'affine:surface');
        }
        get viewportElement() {
            return this.std.get(ViewportElementProvider).viewportElement;
        }
        _initFontLoader() {
            this.std
                .get(FontLoaderService)
                .ready.then(() => {
                this.surface?.refresh();
            })
                .catch(console.error);
        }
        _initLayerUpdateEffect() {
            const updateLayers = requestThrottledConnectedFrame(() => {
                const blocks = Array.from(this.gfxViewportElm.children);
                blocks.forEach((block) => {
                    block.updateZIndex?.();
                });
            });
            this._disposables.add(this._gfx.layer.slots.layerUpdated.subscribe(() => updateLayers()));
        }
        _initPixelRatioChangeEffect() {
            let media;
            const onPixelRatioChange = () => {
                if (media) {
                    this._gfx.viewport.onResize();
                    media.removeEventListener('change', onPixelRatioChange);
                }
                media = matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
                media.addEventListener('change', onPixelRatioChange);
            };
            onPixelRatioChange();
            this._disposables.add(() => {
                media?.removeEventListener('change', onPixelRatioChange);
            });
        }
        _initResizeEffect() {
            const resizeObserver = new ResizeObserver((_) => {
                this._gfx.selection.set(this._gfx.selection.surfaceSelections);
                this._gfx.viewport.onResize();
            });
            try {
                resizeObserver.observe(this.viewportElement);
                this._resizeObserver?.disconnect();
                this._resizeObserver = resizeObserver;
            }
            catch {
                // viewport is not ready
                console.error('Viewport is not ready');
            }
        }
        _initSlotEffects() {
            this.disposables.add(this.std
                .get(ThemeProvider)
                .theme$.subscribe(() => this.surface?.refresh()));
        }
        get _disableScheduleUpdate() {
            const editorSetting = this.std.getOptional(EditorSettingProvider)?.setting$;
            return editorSetting?.peek().edgelessDisableScheduleUpdate ?? false;
        }
        get _crud() {
            return this.std.get(EdgelessCRUDIdentifier);
        }
        connectedCallback() {
            super.connectedCallback();
            this.handleEvent('selectionChange', () => {
                const surface = this.host.selection.value.find((sel) => sel.is(SurfaceSelection));
                if (!surface)
                    return;
                const el = this._crud.getElementById(surface.elements[0]);
                if (isCanvasElement(el)) {
                    return true;
                }
                return;
            });
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this._resizeObserver) {
                this._resizeObserver.disconnect();
                this._resizeObserver = null;
            }
        }
        firstUpdated() {
            this._initSlotEffects();
            this._initResizeEffect();
            this._initPixelRatioChangeEffect();
            this._initFontLoader();
            this._initLayerUpdateEffect();
            this._disposables.add(this._gfx.viewport.viewportUpdated.subscribe(() => {
                this._refreshLayerViewport();
            }));
            this._refreshLayerViewport();
        }
        renderBlock() {
            const background = styleMap({
                ...this.backgroundStyle,
                background: this.overrideBackground,
            });
            return html `
      <div class="edgeless-background edgeless-container" style=${background}>
        <gfx-viewport
          .enableChildrenSchedule=${!this._disableScheduleUpdate}
          .viewport=${this._gfx.viewport}
          .getModelsInViewport=${() => {
                const blocks = this._gfx.grid.search(this._gfx.viewport.overscanBlockBounds, {
                    useSet: true,
                    filter: ['block'],
                });
                return blocks;
            }}
          .host=${this.host}
        >
          ${this.renderChildren(this.model)}${this.renderChildren(this.surfaceBlockModel)}
        </gfx-viewport>
      </div>
    `;
        }
        #overrideBackground_accessor_storage;
        get overrideBackground() { return this.#overrideBackground_accessor_storage; }
        set overrideBackground(value) { this.#overrideBackground_accessor_storage = value; }
        #backgroundStyle_accessor_storage;
        get backgroundStyle() { return this.#backgroundStyle_accessor_storage; }
        set backgroundStyle(value) { this.#backgroundStyle_accessor_storage = value; }
        #gfxViewportElm_accessor_storage;
        get gfxViewportElm() { return this.#gfxViewportElm_accessor_storage; }
        set gfxViewportElm(value) { this.#gfxViewportElm_accessor_storage = value; }
        #surface_accessor_storage;
        get surface() { return this.#surface_accessor_storage; }
        set surface(value) { this.#surface_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._refreshLayerViewport = requestThrottledConnectedFrame(() => {
                const { zoom, translateX, translateY } = this._viewport;
                const gap = getBgGridGap(zoom);
                this.backgroundStyle = {
                    backgroundPosition: `${translateX}px ${translateY}px`,
                    backgroundSize: `${gap}px ${gap}px`,
                };
            }, this);
            this._resizeObserver = null;
            this.#overrideBackground_accessor_storage = __runInitializers(this, _overrideBackground_initializers, undefined);
            this.#backgroundStyle_accessor_storage = (__runInitializers(this, _overrideBackground_extraInitializers), __runInitializers(this, _backgroundStyle_initializers, null));
            this.#gfxViewportElm_accessor_storage = (__runInitializers(this, _backgroundStyle_extraInitializers), __runInitializers(this, _gfxViewportElm_initializers, void 0));
            this.#surface_accessor_storage = (__runInitializers(this, _gfxViewportElm_extraInitializers), __runInitializers(this, _surface_initializers, void 0));
            __runInitializers(this, _surface_extraInitializers);
        }
    };
})();
export { EdgelessRootPreviewBlockComponent };
