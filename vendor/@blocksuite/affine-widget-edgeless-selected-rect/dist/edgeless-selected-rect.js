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
import {} from '@blocksuite/affine-block-frame';
import { EdgelessLegacySlotIdentifier, OverlayIdentifier, } from '@blocksuite/affine-block-surface';
import { ConnectorElementModel, } from '@blocksuite/affine-model';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { getSelectedRect, requestThrottledConnectedFrame, stopPropagation, } from '@blocksuite/affine-shared/utils';
import { deserializeXYWH } from '@blocksuite/global/gfx';
import { WidgetComponent } from '@blocksuite/std';
import { GfxControllerIdentifier, InteractivityIdentifier, } from '@blocksuite/std/gfx';
import { css, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { RenderResizeHandles } from './resize-handles.js';
import { generateCursorUrl, getRotatedResizeCursor } from './utils.js';
export const EDGELESS_SELECTED_RECT_WIDGET = 'edgeless-selected-rect';
let EdgelessSelectedRectWidget = (() => {
    let _classSuper = WidgetComponent;
    let __selectedRect_decorators;
    let __selectedRect_initializers = [];
    let __selectedRect_extraInitializers = [];
    let __allowedHandles_decorators;
    let __allowedHandles_initializers = [];
    let __allowedHandles_extraInitializers = [];
    let __isHeightLimit_decorators;
    let __isHeightLimit_initializers = [];
    let __isHeightLimit_extraInitializers = [];
    let __isResizing_decorators;
    let __isResizing_initializers = [];
    let __isResizing_extraInitializers = [];
    let __isWidthLimit_decorators;
    let __isWidthLimit_initializers = [];
    let __isWidthLimit_extraInitializers = [];
    let __mode_decorators;
    let __mode_initializers = [];
    let __mode_extraInitializers = [];
    let __scaleDirection_decorators;
    let __scaleDirection_initializers = [];
    let __scaleDirection_extraInitializers = [];
    let __scalePercent_decorators;
    let __scalePercent_initializers = [];
    let __scalePercent_extraInitializers = [];
    let _autoCompleteOff_decorators;
    let _autoCompleteOff_initializers = [];
    let _autoCompleteOff_extraInitializers = [];
    return class EdgelessSelectedRectWidget extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __selectedRect_decorators = [state()];
            __allowedHandles_decorators = [state()];
            __isHeightLimit_decorators = [state()];
            __isResizing_decorators = [state()];
            __isWidthLimit_decorators = [state()];
            __mode_decorators = [state()];
            __scaleDirection_decorators = [state()];
            __scalePercent_decorators = [state()];
            _autoCompleteOff_decorators = [state()];
            __esDecorate(this, null, __selectedRect_decorators, { kind: "accessor", name: "_selectedRect", static: false, private: false, access: { has: obj => "_selectedRect" in obj, get: obj => obj._selectedRect, set: (obj, value) => { obj._selectedRect = value; } }, metadata: _metadata }, __selectedRect_initializers, __selectedRect_extraInitializers);
            __esDecorate(this, null, __allowedHandles_decorators, { kind: "accessor", name: "_allowedHandles", static: false, private: false, access: { has: obj => "_allowedHandles" in obj, get: obj => obj._allowedHandles, set: (obj, value) => { obj._allowedHandles = value; } }, metadata: _metadata }, __allowedHandles_initializers, __allowedHandles_extraInitializers);
            __esDecorate(this, null, __isHeightLimit_decorators, { kind: "accessor", name: "_isHeightLimit", static: false, private: false, access: { has: obj => "_isHeightLimit" in obj, get: obj => obj._isHeightLimit, set: (obj, value) => { obj._isHeightLimit = value; } }, metadata: _metadata }, __isHeightLimit_initializers, __isHeightLimit_extraInitializers);
            __esDecorate(this, null, __isResizing_decorators, { kind: "accessor", name: "_isResizing", static: false, private: false, access: { has: obj => "_isResizing" in obj, get: obj => obj._isResizing, set: (obj, value) => { obj._isResizing = value; } }, metadata: _metadata }, __isResizing_initializers, __isResizing_extraInitializers);
            __esDecorate(this, null, __isWidthLimit_decorators, { kind: "accessor", name: "_isWidthLimit", static: false, private: false, access: { has: obj => "_isWidthLimit" in obj, get: obj => obj._isWidthLimit, set: (obj, value) => { obj._isWidthLimit = value; } }, metadata: _metadata }, __isWidthLimit_initializers, __isWidthLimit_extraInitializers);
            __esDecorate(this, null, __mode_decorators, { kind: "accessor", name: "_mode", static: false, private: false, access: { has: obj => "_mode" in obj, get: obj => obj._mode, set: (obj, value) => { obj._mode = value; } }, metadata: _metadata }, __mode_initializers, __mode_extraInitializers);
            __esDecorate(this, null, __scaleDirection_decorators, { kind: "accessor", name: "_scaleDirection", static: false, private: false, access: { has: obj => "_scaleDirection" in obj, get: obj => obj._scaleDirection, set: (obj, value) => { obj._scaleDirection = value; } }, metadata: _metadata }, __scaleDirection_initializers, __scaleDirection_extraInitializers);
            __esDecorate(this, null, __scalePercent_decorators, { kind: "accessor", name: "_scalePercent", static: false, private: false, access: { has: obj => "_scalePercent" in obj, get: obj => obj._scalePercent, set: (obj, value) => { obj._scalePercent = value; } }, metadata: _metadata }, __scalePercent_initializers, __scalePercent_extraInitializers);
            __esDecorate(this, null, _autoCompleteOff_decorators, { kind: "accessor", name: "autoCompleteOff", static: false, private: false, access: { has: obj => "autoCompleteOff" in obj, get: obj => obj.autoCompleteOff, set: (obj, value) => { obj.autoCompleteOff = value; } }, metadata: _metadata }, _autoCompleteOff_initializers, _autoCompleteOff_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // disable change-in-update warning
        static { this.enabledWarnings = []; }
        static { this.styles = css `
    :host {
      display: block;
      user-select: none;
      contain: size layout;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
    }

    .affine-edgeless-selected-rect {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: center center;
      border-radius: 0;
      pointer-events: none;
      box-sizing: border-box;
      z-index: 1;
      border-color: var(--affine-blue);
      border-width: 2px;
      border-style: solid;
      transform: translate(0, 0) rotate(0);
    }

    .affine-edgeless-selected-rect[data-locked='true'] {
      border-color: ${unsafeCSSVarV2('edgeless/lock/locked', '#00000085')};
    }

    .affine-edgeless-selected-rect .handle {
      position: absolute;
      user-select: none;
      outline: none;
      pointer-events: auto;

      /**
       * Fix: pointerEvent stops firing after a short time.
       * When a gesture is started, the browser intersects the touch-action values of the touched element and its ancestors,
       * up to the one that implements the gesture (in other words, the first containing scrolling element)
       * https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
       */
      touch-action: none;
    }

    .affine-edgeless-selected-rect .handle[aria-label^='top-'],
    .affine-edgeless-selected-rect .handle[aria-label^='bottom-'] {
      width: 18px;
      height: 18px;
      box-sizing: border-box;
      z-index: 10;
    }

    .affine-edgeless-selected-rect .handle[aria-label^='top-'] .resize,
    .affine-edgeless-selected-rect .handle[aria-label^='bottom-'] .resize {
      position: absolute;
      width: 12px;
      height: 12px;
      box-sizing: border-box;
      border-radius: 50%;
      border: 2px var(--affine-blue) solid;
      background: white;
    }

    .affine-edgeless-selected-rect .handle[aria-label^='top-'] .rotate,
    .affine-edgeless-selected-rect .handle[aria-label^='bottom-'] .rotate {
      position: absolute;
      width: 12px;
      height: 12px;
      box-sizing: border-box;
      background: transparent;
    }

    /* -18 + 6.5 */
    .affine-edgeless-selected-rect .handle[aria-label='top-left'] {
      left: -12px;
      top: -12px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='top-left'] .resize {
      right: 0;
      bottom: 0;
    }
    .affine-edgeless-selected-rect .handle[aria-label='top-left'] .rotate {
      right: 6px;
      bottom: 6px;
    }

    .affine-edgeless-selected-rect .handle[aria-label='top-right'] {
      top: -12px;
      right: -12px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='top-right'] .resize {
      left: 0;
      bottom: 0;
    }
    .affine-edgeless-selected-rect .handle[aria-label='top-right'] .rotate {
      left: 6px;
      bottom: 6px;
    }

    .affine-edgeless-selected-rect .handle[aria-label='bottom-right'] {
      right: -12px;
      bottom: -12px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='bottom-right'] .resize {
      left: 0;
      top: 0;
    }
    .affine-edgeless-selected-rect .handle[aria-label='bottom-right'] .rotate {
      left: 6px;
      top: 6px;
    }

    .affine-edgeless-selected-rect .handle[aria-label='bottom-left'] {
      bottom: -12px;
      left: -12px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='bottom-left'] .resize {
      right: 0;
      top: 0;
    }
    .affine-edgeless-selected-rect .handle[aria-label='bottom-left'] .rotate {
      right: 6px;
      top: 6px;
    }

    .affine-edgeless-selected-rect .handle[aria-label='top'],
    .affine-edgeless-selected-rect .handle[aria-label='bottom'],
    .affine-edgeless-selected-rect .handle[aria-label='left'],
    .affine-edgeless-selected-rect .handle[aria-label='right'] {
      border: 0;
      background: transparent;
      border-color: var('--affine-blue');
    }

    .affine-edgeless-selected-rect .handle[aria-label='left'],
    .affine-edgeless-selected-rect .handle[aria-label='right'] {
      top: 0;
      bottom: 0;
      height: 100%;
      width: 6px;
    }

    .affine-edgeless-selected-rect .handle[aria-label='top'],
    .affine-edgeless-selected-rect .handle[aria-label='bottom'] {
      left: 0;
      right: 0;
      width: 100%;
      height: 6px;
    }

    /* calc(-1px - (6px - 1px) / 2) = -3.5px */
    .affine-edgeless-selected-rect .handle[aria-label='left'] {
      left: -3.5px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='right'] {
      right: -3.5px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='top'] {
      top: -3.5px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='bottom'] {
      bottom: -3.5px;
    }

    .affine-edgeless-selected-rect .handle[aria-label='top'] .resize,
    .affine-edgeless-selected-rect .handle[aria-label='bottom'] .resize,
    .affine-edgeless-selected-rect .handle[aria-label='left'] .resize,
    .affine-edgeless-selected-rect .handle[aria-label='right'] .resize {
      width: 100%;
      height: 100%;
    }

    .affine-edgeless-selected-rect .handle[aria-label='top'] .resize:after,
    .affine-edgeless-selected-rect .handle[aria-label='bottom'] .resize:after,
    .affine-edgeless-selected-rect .handle[aria-label='left'] .resize:after,
    .affine-edgeless-selected-rect .handle[aria-label='right'] .resize:after {
      position: absolute;
      width: 7px;
      height: 7px;
      box-sizing: border-box;
      border-radius: 6px;
      z-index: 10;
      content: '';
      background: white;
    }

    .affine-edgeless-selected-rect
      .handle[aria-label='top']
      .transparent-handle:after,
    .affine-edgeless-selected-rect
      .handle[aria-label='bottom']
      .transparent-handle:after,
    .affine-edgeless-selected-rect
      .handle[aria-label='left']
      .transparent-handle:after,
    .affine-edgeless-selected-rect
      .handle[aria-label='right']
      .transparent-handle:after {
      opacity: 0;
    }

    .affine-edgeless-selected-rect .handle[aria-label='left'] .resize:after,
    .affine-edgeless-selected-rect .handle[aria-label='right'] .resize:after {
      top: calc(50% - 6px);
    }

    .affine-edgeless-selected-rect .handle[aria-label='top'] .resize:after,
    .affine-edgeless-selected-rect .handle[aria-label='bottom'] .resize:after {
      left: calc(50% - 6px);
    }

    .affine-edgeless-selected-rect .handle[aria-label='left'] .resize:after {
      left: -0.5px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='right'] .resize:after {
      right: -0.5px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='top'] .resize:after {
      top: -0.5px;
    }
    .affine-edgeless-selected-rect .handle[aria-label='bottom'] .resize:after {
      bottom: -0.5px;
    }

    .affine-edgeless-selected-rect .handle .resize::before {
      content: '';
      display: none;
      position: absolute;
      width: 20px;
      height: 20px;
      background-image: url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M23 3H19C10.1634 3 3 10.1634 3 19V23' stroke='black' stroke-opacity='0.3' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-size: contain;
      background-repeat: no-repeat;
    }
    .affine-edgeless-selected-rect[data-mode='scale']
      .handle[aria-label='top-left']
      .resize:hover::before,
    .affine-edgeless-selected-rect[data-scale-direction='top-left'][data-scale-percent]
      .handle[aria-label='top-left']
      .resize::before {
      display: block;
      top: 0px;
      left: 0px;
      transform: translate(-100%, -100%);
    }
    .affine-edgeless-selected-rect[data-mode='scale']
      .handle[aria-label='top-right']
      .resize:hover::before,
    .affine-edgeless-selected-rect[data-scale-direction='top-right'][data-scale-percent]
      .handle[aria-label='top-right']
      .resize::before {
      display: block;
      top: 0px;
      right: 0px;
      transform: translate(100%, -100%) rotate(90deg);
    }
    .affine-edgeless-selected-rect[data-mode='scale']
      .handle[aria-label='bottom-right']
      .resize:hover::before,
    .affine-edgeless-selected-rect[data-scale-direction='bottom-right'][data-scale-percent]
      .handle[aria-label='bottom-right']
      .resize::before {
      display: block;
      bottom: 0px;
      right: 0px;
      transform: translate(100%, 100%) rotate(180deg);
    }
    .affine-edgeless-selected-rect[data-mode='scale']
      .handle[aria-label='bottom-left']
      .resize:hover::before,
    .affine-edgeless-selected-rect[data-scale-direction='bottom-left'][data-scale-percent]
      .handle[aria-label='bottom-left']
      .resize::before {
      display: block;
      bottom: 0px;
      left: 0px;
      transform: translate(-100%, 100%) rotate(-90deg);
    }

    .affine-edgeless-selected-rect::after {
      content: attr(data-scale-percent);
      display: none;
      position: absolute;
      color: var(--affine-icon-color);
      font-feature-settings:
        'clig' off,
        'liga' off;
      font-family: var(--affine-font-family);
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 24px;
    }
    .affine-edgeless-selected-rect[data-scale-direction='top-left']::after {
      display: block;
      top: -20px;
      left: -20px;
      transform: translate(-100%, -100%);
    }
    .affine-edgeless-selected-rect[data-scale-direction='top-right']::after {
      display: block;
      top: -20px;
      right: -20px;
      transform: translate(100%, -100%);
    }
    .affine-edgeless-selected-rect[data-scale-direction='bottom-right']::after {
      display: block;
      bottom: -20px;
      right: -20px;
      transform: translate(100%, 100%);
    }
    .affine-edgeless-selected-rect[data-scale-direction='bottom-left']::after {
      display: block;
      bottom: -20px;
      left: -20px;
      transform: translate(-100%, 100%);
    }
  `; }
        #_selectedRect_accessor_storage;
        get _selectedRect() { return this.#_selectedRect_accessor_storage; }
        set _selectedRect(value) { this.#_selectedRect_accessor_storage = value; }
        get frameOverlay() {
            return this.std.get(OverlayIdentifier('frame'));
        }
        get gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        get selection() {
            return this.gfx.selection;
        }
        get surface() {
            return this.gfx.surface;
        }
        get zoom() {
            return this.gfx.viewport.zoom;
        }
        constructor() {
            super();
            this._dragEndCleanup = () => {
                this._isWidthLimit = false;
                this._isHeightLimit = false;
                this._scalePercent = undefined;
                this._scaleDirection = undefined;
                this._updateCursor();
                this.frameOverlay.clear();
            };
            this._updateCursor = (options) => {
                if (!options) {
                    !this._isResizing && (this.gfx.cursor$.value = 'default');
                    return 'default';
                }
                const { type, angle, flipX, flipY } = options;
                let cursor = 'default';
                let handle = options.handle;
                if (flipX) {
                    handle = (handle.includes('left')
                        ? handle.replace('left', 'right')
                        : handle.replace('right', 'left'));
                }
                if (flipY) {
                    handle = (handle.includes('top')
                        ? handle.replace('top', 'bottom')
                        : handle.replace('bottom', 'top'));
                }
                if (type === 'rotate') {
                    cursor = generateCursorUrl(angle, handle);
                }
                else {
                    cursor = getRotatedResizeCursor({
                        handle,
                        angle,
                    });
                }
                if (options.pure !== true) {
                    this.gfx.cursor$.value = cursor;
                }
                return cursor;
            };
            this._updateOnElementChange = (element) => {
                const id = typeof element === 'string' ? element : element.id;
                if (this.selection.has(id)) {
                    this._updateSelectedRect();
                }
            };
            this._updateHandles = () => {
                const interaction = this._interaction;
                const { store, selection } = this;
                const elements = selection.selectedElements;
                if (interaction && !selection.editing && !store.readonly) {
                    const resizeHandles = interaction.getResizeHandlers({
                        elements,
                    });
                    const { rotatable } = interaction.getRotateConfig({
                        elements,
                    });
                    this._allowedHandles = {
                        rotatable,
                        resizeHandles,
                    };
                }
                else {
                    this._allowedHandles = null;
                }
            };
            this._updateOnSelectionChange = () => {
                this._updateHandles();
                this._updateSelectedRect();
                // Reset the cursor
                this._updateCursor();
            };
            this.#_selectedRect_accessor_storage = __runInitializers(this, __selectedRect_initializers, {
                width: 0,
                height: 0,
                left: 0,
                top: 0,
                rotate: 0,
                borderWidth: 0,
                borderStyle: 'solid',
            });
            this._updateSelectedRect = (__runInitializers(this, __selectedRect_extraInitializers), requestThrottledConnectedFrame(() => {
                const { zoom, selection, gfx } = this;
                const elements = selection.selectedElements;
                const rect = getSelectedRect(elements);
                // Compensate for outer CSS scale (e.g. embed-edgeless-synced-doc),
                // matching GfxBlockComponent.getCSSTransform.
                const { viewportX, viewportY, viewScale } = gfx.viewport;
                const left = ((rect.left - viewportX) * zoom) / viewScale;
                const top = ((rect.top - viewportY) * zoom) / viewScale;
                const width = (rect.width * zoom) / viewScale;
                const height = (rect.height * zoom) / viewScale;
                let rotate = 0;
                if (elements.length === 1 && elements[0].rotate) {
                    rotate = elements[0].rotate;
                }
                this._selectedRect = {
                    width,
                    height,
                    left,
                    top,
                    rotate,
                    borderStyle: 'solid',
                    borderWidth: 2,
                };
            }, this));
            this.#_allowedHandles_accessor_storage = __runInitializers(this, __allowedHandles_initializers, null);
            this.#_isHeightLimit_accessor_storage = (__runInitializers(this, __allowedHandles_extraInitializers), __runInitializers(this, __isHeightLimit_initializers, false));
            this.#_isResizing_accessor_storage = (__runInitializers(this, __isHeightLimit_extraInitializers), __runInitializers(this, __isResizing_initializers, false));
            this.#_isWidthLimit_accessor_storage = (__runInitializers(this, __isResizing_extraInitializers), __runInitializers(this, __isWidthLimit_initializers, false));
            this.#_mode_accessor_storage = (__runInitializers(this, __isWidthLimit_extraInitializers), __runInitializers(this, __mode_initializers, 'resize'));
            this.#_scaleDirection_accessor_storage = (__runInitializers(this, __mode_extraInitializers), __runInitializers(this, __scaleDirection_initializers, undefined));
            this.#_scalePercent_accessor_storage = (__runInitializers(this, __scaleDirection_extraInitializers), __runInitializers(this, __scalePercent_initializers, undefined));
            this.#autoCompleteOff_accessor_storage = (__runInitializers(this, __scalePercent_extraInitializers), __runInitializers(this, _autoCompleteOff_initializers, false));
            __runInitializers(this, _autoCompleteOff_extraInitializers);
            this.addEventListener('pointerdown', stopPropagation);
        }
        _shouldRenderSelection(elements) {
            elements = elements ?? this.selection.selectedElements;
            return elements.length > 0 && !this.selection.editing;
        }
        firstUpdated() {
            const { _disposables, selection, gfx } = this;
            _disposables.add(
            // viewport zooming / scrolling
            gfx.viewport.viewportUpdated.subscribe(this._updateSelectedRect));
            if (gfx.surface) {
                _disposables.add(gfx.surface.elementAdded.subscribe(this._updateOnElementChange));
                _disposables.add(gfx.surface.elementRemoved.subscribe(this._updateOnElementChange));
                _disposables.add(gfx.surface.elementUpdated.subscribe(this._updateOnElementChange));
            }
            _disposables.add(this.store.slots.blockUpdated.subscribe(this._updateOnElementChange));
            _disposables.add(selection.slots.updated.subscribe(this._updateOnSelectionChange));
            _disposables.add(this._slots.readonlyUpdated.subscribe(() => this.requestUpdate()));
            _disposables.add(this._slots.elementResizeEnd.subscribe(() => (this._isResizing = false)));
            if (this._interaction) {
                _disposables.add(this._interaction.activeInteraction$.subscribe(val => {
                    const pre = this._isResizing;
                    const newVal = val?.type === 'resize' || val?.type === 'rotate';
                    if (pre === newVal) {
                        return;
                    }
                    this._isResizing = newVal;
                    if (newVal) {
                        this._slots.elementResizeStart.next();
                    }
                    else {
                        this._slots.elementResizeEnd.next();
                    }
                }));
            }
        }
        get _interaction() {
            return this.std.getOptional(InteractivityIdentifier);
        }
        get _slots() {
            return this.std.get(EdgelessLegacySlotIdentifier);
        }
        _renderHandles() {
            const { selection, gfx, block } = this;
            const elements = selection.selectedElements;
            if (selection.inoperable) {
                return [];
            }
            const handles = [];
            if (this._allowedHandles &&
                this._interaction &&
                !elements.some(element => element.isLocked())) {
                const interaction = this._interaction;
                handles.push(RenderResizeHandles(this._allowedHandles.resizeHandles, this._allowedHandles.rotatable, (e, handle) => {
                    const isRotate = e.target.classList.contains('rotate');
                    if (isRotate) {
                        interaction.handleElementRotate({
                            elements,
                            event: e,
                            onRotateStart: () => {
                                this._mode = 'rotate';
                            },
                            onRotateUpdate: payload => {
                                this._updateCursor({
                                    type: 'rotate',
                                    angle: payload.currentAngle,
                                    handle,
                                });
                            },
                            onRotateEnd: () => {
                                this._mode = 'resize';
                                this._dragEndCleanup();
                            },
                        });
                    }
                    else {
                        interaction.handleElementResize({
                            elements,
                            handle,
                            event: e,
                            onResizeStart: () => {
                                this._mode = 'resize';
                            },
                            onResizeUpdate: ({ lockRatio, scaleX, scaleY, exceed }) => {
                                if (lockRatio) {
                                    this._scaleDirection = handle;
                                    this._scalePercent = `${Math.round(scaleX * 100)}%`;
                                    this._mode = 'scale';
                                }
                                if (exceed) {
                                    this._isWidthLimit = exceed.w;
                                    this._isHeightLimit = exceed.h;
                                }
                                this._updateCursor({
                                    type: 'resize',
                                    angle: elements.length > 1 ? 0 : (elements[0]?.rotate ?? 0),
                                    handle,
                                    flipX: scaleX < 0,
                                    flipY: scaleY < 0,
                                });
                            },
                            onResizeEnd: () => {
                                this._mode = 'resize';
                                this._dragEndCleanup();
                            },
                        });
                    }
                }, option => {
                    if (['resize', 'rotate'].includes(interaction.activeInteraction$.value?.type ?? '')) {
                        return '';
                    }
                    return this._updateCursor({
                        ...option,
                        angle: elements.length > 1 ? 0 : (elements[0]?.rotate ?? 0),
                        pure: true,
                    });
                }));
            }
            if (elements.length === 1 &&
                elements[0] instanceof ConnectorElementModel &&
                !elements[0].isLocked()) {
                handles.push(html `
        <edgeless-connector-handle
          .connector=${elements[0]}
          .edgeless=${block}
        ></edgeless-connector-handle>
      `);
            }
            if (elements.length > 1 &&
                !elements.some(e => e instanceof ConnectorElementModel)) {
                handles.push(repeat(elements, element => element.id, element => {
                    const [modelX, modelY, w, h] = deserializeXYWH(element.xywh);
                    const { viewportX, viewportY, zoom, viewScale } = gfx.viewport;
                    const x = ((modelX - viewportX) * zoom) / viewScale;
                    const y = ((modelY - viewportY) * zoom) / viewScale;
                    const { left, top, borderWidth } = this._selectedRect;
                    const style = {
                        position: 'absolute',
                        boxSizing: 'border-box',
                        left: `${x - left - borderWidth}px`,
                        top: `${y - top - borderWidth}px`,
                        width: `${(w * zoom) / viewScale}px`,
                        height: `${(h * zoom) / viewScale}px`,
                        transform: `rotate(${element.rotate}deg)`,
                        border: `1px solid var(--affine-primary-color)`,
                    };
                    return html `<div
              class="element-handle"
              style=${styleMap(style)}
            ></div>`;
                }));
            }
            return handles;
        }
        _renderAutoComplete() {
            const { store, selection, block, _selectedRect } = this;
            return !store.readonly &&
                !selection.inoperable &&
                !this.autoCompleteOff &&
                !this._isResizing
                ? html `<edgeless-auto-complete
          .current=${selection.selectedElements[0]}
          .edgeless=${block}
          .selectedRect=${_selectedRect}
        >
        </edgeless-auto-complete>`
                : nothing;
        }
        render() {
            const elements = this.selection.selectedElements;
            if (!this._shouldRenderSelection(elements))
                return nothing;
            const { _selectedRect } = this;
            const hasElementLocked = elements.some(element => element.isLocked());
            const handlers = this._renderHandles();
            const isConnector = elements.length === 1 && elements[0] instanceof ConnectorElementModel;
            return html `
      <style>
        .affine-edgeless-selected-rect .handle[aria-label='right']::after {
          content: '';
          display: ${this._isWidthLimit ? 'initial' : 'none'};
          position: absolute;
          top: 0;
          left: 1.5px;
          width: 2px;
          height: 100%;
          background: var(--affine-error-color);
          filter: drop-shadow(-6px 0px 12px rgba(235, 67, 53, 0.35));
        }

        .affine-edgeless-selected-rect .handle[aria-label='bottom']::after {
          content: '';
          display: ${this._isHeightLimit ? 'initial' : 'none'};
          position: absolute;
          top: 1.5px;
          left: 0px;
          width: 100%;
          height: 2px;
          background: var(--affine-error-color);
          filter: drop-shadow(-6px 0px 12px rgba(235, 67, 53, 0.35));
        }
      </style>

      ${this._renderAutoComplete()}

      <div
        class="affine-edgeless-selected-rect"
        style=${styleMap({
                width: `${_selectedRect.width}px`,
                height: `${_selectedRect.height}px`,
                borderWidth: `${_selectedRect.borderWidth}px`,
                borderStyle: isConnector ? 'none' : _selectedRect.borderStyle,
                transform: `translate(${_selectedRect.left}px, ${_selectedRect.top}px) rotate(${_selectedRect.rotate}deg)`,
            })}
        disabled="true"
        data-mode=${this._mode}
        data-scale-percent=${ifDefined(this._scalePercent)}
        data-scale-direction=${ifDefined(this._scaleDirection)}
        data-locked=${hasElementLocked}
      >
        ${handlers}
      </div>
    `;
        }
        #_allowedHandles_accessor_storage;
        get _allowedHandles() { return this.#_allowedHandles_accessor_storage; }
        set _allowedHandles(value) { this.#_allowedHandles_accessor_storage = value; }
        #_isHeightLimit_accessor_storage;
        get _isHeightLimit() { return this.#_isHeightLimit_accessor_storage; }
        set _isHeightLimit(value) { this.#_isHeightLimit_accessor_storage = value; }
        #_isResizing_accessor_storage;
        get _isResizing() { return this.#_isResizing_accessor_storage; }
        set _isResizing(value) { this.#_isResizing_accessor_storage = value; }
        #_isWidthLimit_accessor_storage;
        get _isWidthLimit() { return this.#_isWidthLimit_accessor_storage; }
        set _isWidthLimit(value) { this.#_isWidthLimit_accessor_storage = value; }
        #_mode_accessor_storage;
        get _mode() { return this.#_mode_accessor_storage; }
        set _mode(value) { this.#_mode_accessor_storage = value; }
        #_scaleDirection_accessor_storage;
        get _scaleDirection() { return this.#_scaleDirection_accessor_storage; }
        set _scaleDirection(value) { this.#_scaleDirection_accessor_storage = value; }
        #_scalePercent_accessor_storage;
        get _scalePercent() { return this.#_scalePercent_accessor_storage; }
        set _scalePercent(value) { this.#_scalePercent_accessor_storage = value; }
        #autoCompleteOff_accessor_storage;
        get autoCompleteOff() { return this.#autoCompleteOff_accessor_storage; }
        set autoCompleteOff(value) { this.#autoCompleteOff_accessor_storage = value; }
    };
})();
export { EdgelessSelectedRectWidget };
