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
import './components/add-block-widget.js';
import { EdgelessCRUDIdentifier } from '@blocksuite/affine-block-surface';
import { focusTextModel } from '@blocksuite/affine-rich-text';
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { isInsideEdgelessEditor, isInsidePageEditor, } from '@blocksuite/affine-shared/utils';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { WidgetComponent } from '@blocksuite/std';
import { computed, signal } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { RectHelper } from './helpers/rect-helper.js';
import { SelectionHelper } from './helpers/selection-helper.js';
import { styles } from './styles.js';
import { updateDragHandleClassName } from './utils.js';
import { DragEventWatcher } from './watchers/drag-event-watcher.js';
import { EdgelessWatcher } from './watchers/edgeless-watcher.js';
import { HandleEventWatcher } from './watchers/handle-event-watcher.js';
import { KeyboardEventWatcher } from './watchers/keyboard-event-watcher.js';
import { PageWatcher } from './watchers/page-watcher.js';
import { PointerEventWatcher } from './watchers/pointer-event-watcher.js';
let AffineDragHandleWidget = (() => {
    let _classSuper = WidgetComponent;
    let _activeDragHandle_decorators;
    let _activeDragHandle_initializers = [];
    let _activeDragHandle_extraInitializers = [];
    let _showAddBlockWidget_decorators;
    let _showAddBlockWidget_initializers = [];
    let _showAddBlockWidget_extraInitializers = [];
    let _dragHandleContainer_decorators;
    let _dragHandleContainer_initializers = [];
    let _dragHandleContainer_extraInitializers = [];
    let _dragHandleGrabber_decorators;
    let _dragHandleGrabber_initializers = [];
    let _dragHandleGrabber_extraInitializers = [];
    let _addBlockWidgetContainer_decorators;
    let _addBlockWidgetContainer_initializers = [];
    let _addBlockWidgetContainer_extraInitializers = [];
    let _dragHoverRect_decorators;
    let _dragHoverRect_initializers = [];
    let _dragHoverRect_extraInitializers = [];
    return class AffineDragHandleWidget extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _activeDragHandle_decorators = [state()];
            _showAddBlockWidget_decorators = [state()];
            _dragHandleContainer_decorators = [query('.affine-drag-handle-container')];
            _dragHandleGrabber_decorators = [query('.affine-drag-handle-grabber')];
            _addBlockWidgetContainer_decorators = [query('.affine-add-block-widget-container')];
            _dragHoverRect_decorators = [state()];
            __esDecorate(this, null, _activeDragHandle_decorators, { kind: "accessor", name: "activeDragHandle", static: false, private: false, access: { has: obj => "activeDragHandle" in obj, get: obj => obj.activeDragHandle, set: (obj, value) => { obj.activeDragHandle = value; } }, metadata: _metadata }, _activeDragHandle_initializers, _activeDragHandle_extraInitializers);
            __esDecorate(this, null, _showAddBlockWidget_decorators, { kind: "accessor", name: "showAddBlockWidget", static: false, private: false, access: { has: obj => "showAddBlockWidget" in obj, get: obj => obj.showAddBlockWidget, set: (obj, value) => { obj.showAddBlockWidget = value; } }, metadata: _metadata }, _showAddBlockWidget_initializers, _showAddBlockWidget_extraInitializers);
            __esDecorate(this, null, _dragHandleContainer_decorators, { kind: "accessor", name: "dragHandleContainer", static: false, private: false, access: { has: obj => "dragHandleContainer" in obj, get: obj => obj.dragHandleContainer, set: (obj, value) => { obj.dragHandleContainer = value; } }, metadata: _metadata }, _dragHandleContainer_initializers, _dragHandleContainer_extraInitializers);
            __esDecorate(this, null, _dragHandleGrabber_decorators, { kind: "accessor", name: "dragHandleGrabber", static: false, private: false, access: { has: obj => "dragHandleGrabber" in obj, get: obj => obj.dragHandleGrabber, set: (obj, value) => { obj.dragHandleGrabber = value; } }, metadata: _metadata }, _dragHandleGrabber_initializers, _dragHandleGrabber_extraInitializers);
            __esDecorate(this, null, _addBlockWidgetContainer_decorators, { kind: "accessor", name: "addBlockWidgetContainer", static: false, private: false, access: { has: obj => "addBlockWidgetContainer" in obj, get: obj => obj.addBlockWidgetContainer, set: (obj, value) => { obj.addBlockWidgetContainer = value; } }, metadata: _metadata }, _addBlockWidgetContainer_initializers, _addBlockWidgetContainer_extraInitializers);
            __esDecorate(this, null, _dragHoverRect_decorators, { kind: "accessor", name: "dragHoverRect", static: false, private: false, access: { has: obj => "dragHoverRect" in obj, get: obj => obj.dragHoverRect, set: (obj, value) => { obj.dragHoverRect = value; } }, metadata: _metadata }, _dragHoverRect_initializers, _dragHoverRect_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        #activeDragHandle_accessor_storage;
        get activeDragHandle() { return this.#activeDragHandle_accessor_storage; }
        set activeDragHandle(value) { this.#activeDragHandle_accessor_storage = value; }
        #showAddBlockWidget_accessor_storage;
        get showAddBlockWidget() { return this.#showAddBlockWidget_accessor_storage; }
        set showAddBlockWidget(value) { this.#showAddBlockWidget_accessor_storage = value; }
        get isBlockDragHandleVisible() {
            return this.activeDragHandle === 'block';
        }
        get isGfxDragHandleVisible() {
            return this.activeDragHandle === 'gfx';
        }
        get dragHandleContainerOffsetParent() {
            return this.dragHandleContainer.parentElement;
        }
        get mode() {
            return this.std.get(DocModeProvider).getEditorMode();
        }
        get rootComponent() {
            return this.block;
        }
        connectedCallback() {
            super.connectedCallback();
            this.pointerEventWatcher.watch();
            this._keyboardEventWatcher.watch();
            this._dragEventWatcher.watch();
        }
        disconnectedCallback() {
            this.hide(true);
            this._disposables.dispose();
            this._anchorModelDisposables?.dispose();
            super.disconnectedCallback();
        }
        firstUpdated() {
            this.hide(true);
            this._disposables.addFromEvent(this.host, 'pointerleave', () => {
                this.hide();
            });
            this._handleEventWatcher.watch();
            if (isInsidePageEditor(this.host)) {
                this._pageWatcher.watch();
            }
            else if (isInsideEdgelessEditor(this.host)) {
                this.edgelessWatcher.watch();
            }
        }
        render() {
            const hoverRectStyle = styleMap(this.dragHoverRect && this.activeDragHandle
                ? {
                    width: `${this.dragHoverRect.width}px`,
                    height: `${this.dragHoverRect.height}px`,
                    top: `${this.dragHoverRect.top}px`,
                    left: `${this.dragHoverRect.left}px`,
                }
                : {
                    display: 'none',
                });
            const isGfx = this.activeDragHandle === 'gfx';
            const classes = {
                'affine-drag-handle-grabber': true,
                dots: isGfx ? true : false,
            };
            return html `
      <div class="affine-drag-handle-widget">
        <div class="affine-add-block-widget-container">
          <affine-add-block-widget
            .visible=${this.showAddBlockWidget && this.mode === 'page'}
            @add-block=${this._handleAddBlock}
          ></affine-add-block-widget>
        </div>
        <div class="affine-drag-handle-container">
          <div class=${classMap(classes)}>
            ${isGfx
                ? html `
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                  <div class="dot"></div>
                `
                : nothing}
          </div>
        </div>
        <div class="affine-drag-hover-rect" style=${hoverRectStyle}></div>
      </div>
    `;
        }
        #dragHandleContainer_accessor_storage;
        get dragHandleContainer() { return this.#dragHandleContainer_accessor_storage; }
        set dragHandleContainer(value) { this.#dragHandleContainer_accessor_storage = value; }
        #dragHandleGrabber_accessor_storage;
        get dragHandleGrabber() { return this.#dragHandleGrabber_accessor_storage; }
        set dragHandleGrabber(value) { this.#dragHandleGrabber_accessor_storage = value; }
        #addBlockWidgetContainer_accessor_storage;
        get addBlockWidgetContainer() { return this.#addBlockWidgetContainer_accessor_storage; }
        set addBlockWidgetContainer(value) { this.#addBlockWidgetContainer_accessor_storage = value; }
        #dragHoverRect_accessor_storage;
        get dragHoverRect() { return this.#dragHoverRect_accessor_storage; }
        set dragHoverRect(value) { this.#dragHoverRect_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._anchorModelDisposables = null;
            /**
             * Used to handle drag behavior
             */
            this._dragEventWatcher = new DragEventWatcher(this);
            this._handleEventWatcher = new HandleEventWatcher(this);
            this._keyboardEventWatcher = new KeyboardEventWatcher(this);
            this._pageWatcher = new PageWatcher(this);
            this._reset = () => {
                this.dragging = false;
                this.isDragHandleHovered = false;
                this.pointerEventWatcher.reset();
            };
            /**
             * Insert a new empty paragraph block below the currently hovered block
             * and move the cursor into it.
             */
            this._handleAddBlock = () => {
                const anchorBlockId = this.anchorBlockId.peek();
                if (!anchorBlockId)
                    return;
                const block = this.anchorBlockComponent.peek();
                if (!block)
                    return;
                const { store } = this;
                const parent = store.getParent(block.model);
                if (!parent)
                    return;
                const index = parent.children.indexOf(block.model);
                if (index < 0)
                    return;
                store.captureSync();
                const newBlockId = store.addBlock('affine:paragraph', {}, parent, index + 1);
                if (!newBlockId)
                    return;
                this.host.updateComplete
                    .then(() => {
                    focusTextModel(this.std, newBlockId);
                })
                    .catch(console.error);
                this.hide();
            };
            this.#activeDragHandle_accessor_storage = __runInitializers(this, _activeDragHandle_initializers, null);
            this.#showAddBlockWidget_accessor_storage = (__runInitializers(this, _activeDragHandle_extraInitializers), __runInitializers(this, _showAddBlockWidget_initializers, false));
            this.anchorBlockId = (__runInitializers(this, _showAddBlockWidget_extraInitializers), signal(null));
            this.anchorBlockComponent = computed(() => {
                if (!this.anchorBlockId.value)
                    return null;
                return this.std.view.getBlock(this.anchorBlockId.value);
            });
            this.anchorEdgelessElement = computed(() => {
                if (!this.anchorBlockId.value)
                    return null;
                if (this.mode === 'page')
                    return null;
                const crud = this.std.get(EdgelessCRUDIdentifier);
                const edgelessElement = crud.getElementById(this.anchorBlockId.value);
                return edgelessElement;
            });
            // Single block: drag handle should show on the vertical middle of the first line of element
            this.center = [0, 0];
            this.dragging = false;
            this.rectHelper = new RectHelper(this);
            this.draggingAreaRect = computed(this.rectHelper.getDraggingAreaRect);
            this.lastDragPoint = null;
            this.edgelessWatcher = new EdgelessWatcher(this);
            this.handleAnchorModelDisposables = () => {
                const block = this.anchorBlockComponent.peek();
                if (!block)
                    return;
                const blockModel = block.model;
                if (this._anchorModelDisposables) {
                    this._anchorModelDisposables.dispose();
                    this._anchorModelDisposables = null;
                }
                this._anchorModelDisposables = new DisposableGroup();
                this._anchorModelDisposables.add(blockModel.deleted.subscribe(() => this.hide()));
            };
            /**
             * @param force Reset the dragging state
             */
            this.hide = (force = false) => {
                if (this.dragging && !force)
                    return;
                updateDragHandleClassName();
                this.isDragHandleHovered = false;
                this.anchorBlockId.value = null;
                this.dragHoverRect = null;
                this.activeDragHandle = null;
                this.showAddBlockWidget = false;
                if (this.dragHandleContainer) {
                    this.dragHandleContainer.removeAttribute('style');
                    this.dragHandleContainer.style.display = 'none';
                }
                if (this.dragHandleGrabber) {
                    this.dragHandleGrabber.removeAttribute('style');
                }
                if (this.addBlockWidgetContainer) {
                    this.addBlockWidgetContainer.removeAttribute('style');
                    this.addBlockWidgetContainer.style.display = 'none';
                }
                if (force) {
                    this._reset();
                }
            };
            this.isDragHandleHovered = false;
            this.noteScale = signal(1);
            this.pointerEventWatcher = new PointerEventWatcher(this);
            this.scale = signal(1);
            this.scaleInNote = computed(() => this.scale.value * this.noteScale.value);
            this.selectionHelper = new SelectionHelper(this);
            this.#dragHandleContainer_accessor_storage = __runInitializers(this, _dragHandleContainer_initializers, void 0);
            this.#dragHandleGrabber_accessor_storage = (__runInitializers(this, _dragHandleContainer_extraInitializers), __runInitializers(this, _dragHandleGrabber_initializers, void 0));
            this.#addBlockWidgetContainer_accessor_storage = (__runInitializers(this, _dragHandleGrabber_extraInitializers), __runInitializers(this, _addBlockWidgetContainer_initializers, void 0));
            this.#dragHoverRect_accessor_storage = (__runInitializers(this, _addBlockWidgetContainer_extraInitializers), __runInitializers(this, _dragHoverRect_initializers, null));
            __runInitializers(this, _dragHoverRect_extraInitializers);
        }
    };
})();
export { AffineDragHandleWidget };
