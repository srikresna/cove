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
import { DefaultTool, EdgelessLegacySlotIdentifier, } from '@blocksuite/affine-block-surface';
import { toast } from '@blocksuite/affine-components/toast';
import { PanTool } from '@blocksuite/affine-gfx-pointer';
import { EditPropsStore, ViewportElementProvider, } from '@blocksuite/affine-shared/services';
import { EdgelessToolbarToolMixin } from '@blocksuite/affine-widget-edgeless-toolbar';
import { Bound, clamp } from '@blocksuite/global/gfx';
import { SignalWatcher } from '@blocksuite/global/lit';
import { EndPointArrowIcon, ExpandCloseIcon, ExpandFullIcon, StartPointArrowIcon, StopAiIcon, } from '@blocksuite/icons/lit';
import { effect } from '@preact/signals-core';
import { cssVar } from '@toeverything/theme';
import { css, html, LitElement, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { EdgelessFrameManagerIdentifier, isFrameBlock, } from '../frame-manager';
import { PresentTool } from '../present-tool';
let PresentationToolbar = (() => {
    let _classSuper = EdgelessToolbarToolMixin(SignalWatcher(LitElement));
    let __currentFrameIndex_decorators;
    let __currentFrameIndex_initializers = [];
    let __currentFrameIndex_extraInitializers = [];
    let __navigatorMode_decorators;
    let __navigatorMode_initializers = [];
    let __navigatorMode_extraInitializers = [];
    let _containerWidth_decorators;
    let _containerWidth_initializers = [];
    let _containerWidth_extraInitializers = [];
    let _frameMenuShow_decorators;
    let _frameMenuShow_initializers = [];
    let _frameMenuShow_extraInitializers = [];
    let _setFrameMenuShow_decorators;
    let _setFrameMenuShow_initializers = [];
    let _setFrameMenuShow_extraInitializers = [];
    let _setSettingMenuShow_decorators;
    let _setSettingMenuShow_initializers = [];
    let _setSettingMenuShow_extraInitializers = [];
    let _settingMenuShow_decorators;
    let _settingMenuShow_initializers = [];
    let _settingMenuShow_extraInitializers = [];
    return class PresentationToolbar extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __currentFrameIndex_decorators = [state({
                    hasChanged() {
                        return true;
                    },
                })];
            __navigatorMode_decorators = [state()];
            _containerWidth_decorators = [property({ attribute: false })];
            _frameMenuShow_decorators = [property({ type: Boolean })];
            _setFrameMenuShow_decorators = [property()];
            _setSettingMenuShow_decorators = [property()];
            _settingMenuShow_decorators = [property({ type: Boolean })];
            __esDecorate(this, null, __currentFrameIndex_decorators, { kind: "accessor", name: "_currentFrameIndex", static: false, private: false, access: { has: obj => "_currentFrameIndex" in obj, get: obj => obj._currentFrameIndex, set: (obj, value) => { obj._currentFrameIndex = value; } }, metadata: _metadata }, __currentFrameIndex_initializers, __currentFrameIndex_extraInitializers);
            __esDecorate(this, null, __navigatorMode_decorators, { kind: "accessor", name: "_navigatorMode", static: false, private: false, access: { has: obj => "_navigatorMode" in obj, get: obj => obj._navigatorMode, set: (obj, value) => { obj._navigatorMode = value; } }, metadata: _metadata }, __navigatorMode_initializers, __navigatorMode_extraInitializers);
            __esDecorate(this, null, _containerWidth_decorators, { kind: "accessor", name: "containerWidth", static: false, private: false, access: { has: obj => "containerWidth" in obj, get: obj => obj.containerWidth, set: (obj, value) => { obj.containerWidth = value; } }, metadata: _metadata }, _containerWidth_initializers, _containerWidth_extraInitializers);
            __esDecorate(this, null, _frameMenuShow_decorators, { kind: "accessor", name: "frameMenuShow", static: false, private: false, access: { has: obj => "frameMenuShow" in obj, get: obj => obj.frameMenuShow, set: (obj, value) => { obj.frameMenuShow = value; } }, metadata: _metadata }, _frameMenuShow_initializers, _frameMenuShow_extraInitializers);
            __esDecorate(this, null, _setFrameMenuShow_decorators, { kind: "accessor", name: "setFrameMenuShow", static: false, private: false, access: { has: obj => "setFrameMenuShow" in obj, get: obj => obj.setFrameMenuShow, set: (obj, value) => { obj.setFrameMenuShow = value; } }, metadata: _metadata }, _setFrameMenuShow_initializers, _setFrameMenuShow_extraInitializers);
            __esDecorate(this, null, _setSettingMenuShow_decorators, { kind: "accessor", name: "setSettingMenuShow", static: false, private: false, access: { has: obj => "setSettingMenuShow" in obj, get: obj => obj.setSettingMenuShow, set: (obj, value) => { obj.setSettingMenuShow = value; } }, metadata: _metadata }, _setSettingMenuShow_initializers, _setSettingMenuShow_extraInitializers);
            __esDecorate(this, null, _settingMenuShow_decorators, { kind: "accessor", name: "settingMenuShow", static: false, private: false, access: { has: obj => "settingMenuShow" in obj, get: obj => obj.settingMenuShow, set: (obj, value) => { obj.settingMenuShow = value; } }, metadata: _metadata }, _settingMenuShow_initializers, _settingMenuShow_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      align-items: inherit;
      width: 100%;
      height: 100%;
      gap: 8px;
      padding-right: 2px;
    }
    .full-divider {
      width: 8px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .full-divider::after {
      content: '';
      width: 1px;
      height: 100%;
      background: var(--affine-border-color);
      transform: scaleX(0.5);
    }
    .config-buttons {
      display: flex;
      gap: 10px;
    }
    .edgeless-frame-navigator {
      width: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .edgeless-frame-navigator.dense {
      width: auto;
    }

    .edgeless-frame-navigator-title {
      display: inline-block;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      padding-right: 8px;
    }

    .edgeless-frame-navigator-count {
      color: var(--affine-text-secondary-color);
      white-space: nowrap;
    }
    .edgeless-frame-navigator-stop {
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      position: relative;
      overflow: hidden;

      svg {
        display: block;
        width: 24px;
        height: 24px;
        color: white;
      }
    }
    .edgeless-frame-navigator-stop::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      border-radius: inherit;
    }
    .edgeless-frame-navigator-stop:hover::before {
      background: var(--affine-hover-color);
    }
  `; }
        get _cachedPresentHideToolbar() {
            return !!this.edgeless.std
                .get(EditPropsStore)
                .getStorage('presentHideToolbar');
        }
        set _cachedPresentHideToolbar(value) {
            this.edgeless.std
                .get(EditPropsStore)
                .setStorage('presentHideToolbar', !!value);
        }
        get _frames() {
            return this.edgeless.std.get(EdgelessFrameManagerIdentifier).frames;
        }
        get dense() {
            return this.containerWidth < 554;
        }
        get host() {
            return this.edgeless.host;
        }
        get slots() {
            return this.edgeless.std.get(EdgelessLegacySlotIdentifier);
        }
        constructor(edgeless) {
            super();
            this._cachedIndex = -1;
            this.type = PresentTool;
            this.#_currentFrameIndex_accessor_storage = __runInitializers(this, __currentFrameIndex_initializers, 0);
            this.#_fullScreenMode_accessor_storage = (__runInitializers(this, __currentFrameIndex_extraInitializers), true);
            this.#_navigatorMode_accessor_storage = __runInitializers(this, __navigatorMode_initializers, 'fit');
            this.#containerWidth_accessor_storage = (__runInitializers(this, __navigatorMode_extraInitializers), __runInitializers(this, _containerWidth_initializers, 1920));
            this.#frameMenuShow_accessor_storage = (__runInitializers(this, _containerWidth_extraInitializers), __runInitializers(this, _frameMenuShow_initializers, false));
            this.#setFrameMenuShow_accessor_storage = (__runInitializers(this, _frameMenuShow_extraInitializers), __runInitializers(this, _setFrameMenuShow_initializers, () => { }));
            this.#setSettingMenuShow_accessor_storage = (__runInitializers(this, _setFrameMenuShow_extraInitializers), __runInitializers(this, _setSettingMenuShow_initializers, () => { }));
            this.#settingMenuShow_accessor_storage = (__runInitializers(this, _setSettingMenuShow_extraInitializers), __runInitializers(this, _settingMenuShow_initializers, false));
            __runInitializers(this, _settingMenuShow_extraInitializers);
            this.edgeless = edgeless;
        }
        _bindHotKey() {
            const handleKeyIfFrameNavigator = (action) => () => {
                if (this.edgelessTool.toolType === PresentTool) {
                    action();
                }
            };
            this.edgeless.bindHotKey({
                ArrowLeft: handleKeyIfFrameNavigator(() => this._previousFrame()),
                ArrowRight: handleKeyIfFrameNavigator(() => this._nextFrame()),
                Escape: handleKeyIfFrameNavigator(() => this._exitPresentation()),
            }, {
                global: true,
            });
        }
        _exitPresentation() {
            // When exit presentation mode, we need to set the tool to default or pan
            // And exit fullscreen
            if (this.edgeless.store.readonly) {
                this.setEdgelessTool(PanTool, { panning: false });
            }
            else {
                this.setEdgelessTool(DefaultTool);
            }
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
            }
            // Reset the flag when fully exiting presentation mode
            this.edgeless.std
                .get(EditPropsStore)
                .setStorage('presentNoFrameToastShown', false);
        }
        _moveToCurrentFrame(forceMove = false) {
            const currentToolOption = this.gfx.tool.currentToolOption$.value;
            const toolOptions = currentToolOption?.options;
            // If PresentTool is being activated after a temporary pan (indicated by restoredAfterPan)
            // and a forced move isn't explicitly requested, skip moving to the current frame.
            // This preserves the user's panned position instead of resetting to the frame's default view.
            if (currentToolOption?.toolType === PresentTool &&
                toolOptions?.restoredAfterPan &&
                !forceMove) {
                // Clear the flag so future navigations behave normally
                // Here we modify the tool's activated option to avoid triggering setTool update
                const currentTool = this.gfx.tool.currentTool$.peek();
                if (currentTool?.activatedOption) {
                    currentTool.activatedOption.restoredAfterPan = false;
                }
                return;
            }
            const current = this._currentFrameIndex;
            const viewport = this.gfx.viewport;
            const frame = this._frames[current];
            if (frame) {
                let bound = Bound.deserialize(frame.xywh);
                if (this._navigatorMode === 'fill') {
                    const vb = viewport.viewportBounds;
                    const center = bound.center;
                    let w, h;
                    if (vb.w / vb.h > bound.w / bound.h) {
                        w = bound.w;
                        h = (w * vb.h) / vb.w;
                    }
                    else {
                        h = bound.h;
                        w = (h * vb.w) / vb.h;
                    }
                    bound = Bound.fromCenter(center, w, h);
                }
                viewport.setViewportByBound(bound, [0, 0, 0, 0], false);
                this.slots.navigatorFrameChanged.next(this._frames[this._currentFrameIndex]);
            }
        }
        _nextFrame() {
            const frames = this._frames;
            const min = 0;
            const max = frames.length - 1;
            if (this._currentFrameIndex === frames.length - 1) {
                toast(this.host, 'You have reached the last frame');
            }
            else {
                this._currentFrameIndex = clamp(this._currentFrameIndex + 1, min, max);
            }
        }
        _previousFrame() {
            const frames = this._frames;
            const min = 0;
            const max = frames.length - 1;
            if (this._currentFrameIndex === 0) {
                toast(this.host, 'You have reached the first frame');
            }
            else {
                this._currentFrameIndex = clamp(this._currentFrameIndex - 1, min, max);
            }
        }
        /**
         * Toggle fullscreen, but keep edgeless tool to frameNavigator
         * If already fullscreen, exit fullscreen
         * If not fullscreen, enter fullscreen
         */
        _toggleFullScreen() {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
                this._fullScreenMode = false;
            }
            else {
                const { viewportElement } = this.edgeless.std.get(ViewportElementProvider);
                launchIntoFullscreen(viewportElement);
                this._fullScreenMode = true;
            }
        }
        connectedCallback() {
            super.connectedCallback();
            const { _disposables } = this;
            _disposables.add(effect(() => {
                const currentToolOption = this.gfx.tool.currentToolOption$.value;
                if (currentToolOption?.toolType === PresentTool) {
                    const opts = currentToolOption.options;
                    const isAlreadyFullscreen = !!document.fullscreenElement;
                    if (!isAlreadyFullscreen) {
                        this._toggleFullScreen();
                    }
                    else {
                        this._fullScreenMode = true;
                    }
                    this._cachedIndex = this._currentFrameIndex;
                    this._navigatorMode = opts?.mode ?? this._navigatorMode;
                    const selection = this.gfx.selection;
                    if (selection.selectedElements.length > 0 &&
                        isFrameBlock(selection.selectedElements[0])) {
                        const selectedFrameId = selection.selectedElements[0].id;
                        const indexOfSelectedFrame = this._frames.findIndex(frame => frame.id === selectedFrameId);
                        if (indexOfSelectedFrame !== -1) {
                            this._cachedIndex = indexOfSelectedFrame;
                        }
                    }
                    const store = this.edgeless.std.get(EditPropsStore);
                    if (this._frames.length === 0) {
                        if (!store.getStorage('presentNoFrameToastShown')) {
                            toast(this.host, 'The presentation requires at least 1 frame. You can firstly create a frame.', 5000);
                            store.setStorage('presentNoFrameToastShown', true);
                        }
                    }
                    else {
                        // If frames exist, and the flag was set, reset it.
                        // This allows the toast to show again if all frames are subsequently deleted.
                        if (store.getStorage('presentNoFrameToastShown')) {
                            store.setStorage('presentNoFrameToastShown', false);
                        }
                    }
                }
                this.requestUpdate();
            }));
        }
        firstUpdated() {
            const { _disposables } = this;
            this._bindHotKey();
            _disposables.add(this.slots.navigatorSettingUpdated.subscribe(({ fillScreen }) => {
                if (fillScreen !== undefined) {
                    this._navigatorMode = fillScreen ? 'fill' : 'fit';
                }
            }));
            _disposables.addFromEvent(document, 'fullscreenchange', () => {
                if (document.fullscreenElement) {
                    this._timer = setTimeout(() => {
                        this._currentFrameIndex = this._cachedIndex;
                    }, 400);
                }
                else {
                    clearTimeout(this._timer);
                    if (this.edgelessTool.toolType === PresentTool &&
                        this._fullScreenMode) {
                        if (this.edgeless.store.readonly) {
                            this.setEdgelessTool(PanTool, { panning: false });
                        }
                        else {
                            this.setEdgelessTool(DefaultTool);
                        }
                    }
                }
                setTimeout(() => this._moveToCurrentFrame(true), 400);
                this.slots.fullScreenToggled.next();
            });
            this._navigatorMode =
                this.edgeless.std.get(EditPropsStore).getStorage('presentFillScreen') ===
                    true
                    ? 'fill'
                    : 'fit';
        }
        render() {
            const current = this._currentFrameIndex;
            const frames = this._frames;
            const frame = frames[current];
            return html `
      <style>
        :host {
          display: flex;
        }
      </style>
      <edgeless-tool-icon-button
        .iconContainerPadding=${0}
        .tooltip=${'Previous'}
        .iconSize=${'24px'}
        @click=${() => this._previousFrame()}
      >
        ${StartPointArrowIcon()}
      </edgeless-tool-icon-button>

      <div class="edgeless-frame-navigator ${this.dense ? 'dense' : ''}">
        ${this.dense
                ? nothing
                : html `<span
              style="color: ${cssVar('textPrimaryColor')}"
              class="edgeless-frame-navigator-title"
              @click=${() => this._moveToCurrentFrame()}
            >
              ${frame?.props.title ?? 'no frame'}
            </span>`}

        <span class="edgeless-frame-navigator-count">
          ${frames.length === 0 ? 0 : current + 1} / ${frames.length}
        </span>
      </div>

      <edgeless-tool-icon-button
        .tooltip=${'Next'}
        @click=${() => this._nextFrame()}
        .iconContainerPadding=${0}
        .iconSize=${'24px'}
      >
        ${EndPointArrowIcon()}
      </edgeless-tool-icon-button>

      <div class="full-divider"></div>

      <div class="config-buttons">
        <edgeless-tool-icon-button
          .tooltip=${document.fullscreenElement
                ? 'Exit Full Screen'
                : 'Enter Full Screen'}
          @click=${() => this._toggleFullScreen()}
          .iconContainerPadding=${0}
          .iconContainerWidth=${'24px'}
          .iconSize=${'24px'}
        >
          ${document.fullscreenElement ? ExpandCloseIcon() : ExpandFullIcon()}
        </edgeless-tool-icon-button>

        ${this.dense
                ? nothing
                : html `<edgeless-frame-order-button
              .popperShow=${this.frameMenuShow}
              .setPopperShow=${this.setFrameMenuShow}
              .edgeless=${this.edgeless}
            >
            </edgeless-frame-order-button>`}

        <edgeless-navigator-setting-button
          .edgeless=${this.edgeless}
          .hideToolbar=${this._cachedPresentHideToolbar}
          .onHideToolbarChange=${(hideToolbar) => {
                this._cachedPresentHideToolbar = hideToolbar;
            }}
          .popperShow=${this.settingMenuShow}
          .setPopperShow=${this.setSettingMenuShow}
          .includeFrameOrder=${this.dense}
        >
        </edgeless-navigator-setting-button>
      </div>

      <div class="full-divider"></div>

      <button
        class="edgeless-frame-navigator-stop"
        @click=${this._exitPresentation}
        style="background: ${cssVar('warningColor')}"
      >
        ${StopAiIcon()}
      </button>
    `;
        }
        updated(changedProperties) {
            const currentToolOption = this.gfx.tool.currentToolOption$.value;
            const isPresentToolActive = currentToolOption?.toolType === PresentTool;
            const toolOptions = currentToolOption?.options;
            const isRestoredAfterPan = !!(isPresentToolActive && toolOptions?.restoredAfterPan);
            if (changedProperties.has('_currentFrameIndex') && isPresentToolActive) {
                // When the current frame index changes (e.g., user navigates), a viewport update is needed.
                // However, if PresentTool is merely being restored after a pan (isRestoredAfterPan = true)
                // without an explicit index change in this update cycle, we avoid forcing a move to preserve the panned position.
                // Thus, `forceMove` is true unless it's a pan restoration.
                const shouldForceMove = !isRestoredAfterPan;
                this._moveToCurrentFrame(shouldForceMove);
            }
            else if (isPresentToolActive && changedProperties.has('edgelessTool')) {
                // Handles cases where the tool is set/switched to PresentTool (e.g., initial activation or returning from another tool).
                // Similar to frame index changes, avoid forcing a viewport move if restoring after a pan.
                const currentToolIsPresentTool = this.edgelessTool.toolType === PresentTool;
                if (currentToolIsPresentTool) {
                    const shouldForceMoveOnToolChange = !isRestoredAfterPan;
                    this._moveToCurrentFrame(shouldForceMoveOnToolChange);
                }
            }
        }
        #_currentFrameIndex_accessor_storage;
        get _currentFrameIndex() { return this.#_currentFrameIndex_accessor_storage; }
        set _currentFrameIndex(value) { this.#_currentFrameIndex_accessor_storage = value; }
        #_fullScreenMode_accessor_storage;
        get _fullScreenMode() { return this.#_fullScreenMode_accessor_storage; }
        set _fullScreenMode(value) { this.#_fullScreenMode_accessor_storage = value; }
        #_navigatorMode_accessor_storage;
        get _navigatorMode() { return this.#_navigatorMode_accessor_storage; }
        set _navigatorMode(value) { this.#_navigatorMode_accessor_storage = value; }
        #containerWidth_accessor_storage;
        get containerWidth() { return this.#containerWidth_accessor_storage; }
        set containerWidth(value) { this.#containerWidth_accessor_storage = value; }
        #frameMenuShow_accessor_storage;
        get frameMenuShow() { return this.#frameMenuShow_accessor_storage; }
        set frameMenuShow(value) { this.#frameMenuShow_accessor_storage = value; }
        #setFrameMenuShow_accessor_storage;
        get setFrameMenuShow() { return this.#setFrameMenuShow_accessor_storage; }
        set setFrameMenuShow(value) { this.#setFrameMenuShow_accessor_storage = value; }
        #setSettingMenuShow_accessor_storage;
        get setSettingMenuShow() { return this.#setSettingMenuShow_accessor_storage; }
        set setSettingMenuShow(value) { this.#setSettingMenuShow_accessor_storage = value; }
        #settingMenuShow_accessor_storage;
        get settingMenuShow() { return this.#settingMenuShow_accessor_storage; }
        set settingMenuShow(value) { this.#settingMenuShow_accessor_storage = value; }
    };
})();
export { PresentationToolbar };
function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(console.error);
    }
    else if ('mozRequestFullScreen' in element &&
        element.mozRequestFullScreen instanceof Function) {
        // Firefox
        element.mozRequestFullScreen();
    }
    else if ('webkitRequestFullscreen' in element &&
        element.webkitRequestFullscreen instanceof Function) {
        // Chrome, Safari and Opera
        element.webkitRequestFullscreen();
    }
    else if ('msRequestFullscreen' in element &&
        element.msRequestFullscreen instanceof Function) {
        // IE/Edge
        element.msRequestFullscreen();
    }
}
