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
import { ViewportElementProvider } from '@blocksuite/affine-shared/services';
import { autoScroll, getScrollContainer, } from '@blocksuite/affine-shared/utils';
import { BlockComponent, BlockSelection, WidgetComponent, WidgetViewExtension, } from '@blocksuite/std';
import { html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { literal, unsafeStatic } from 'lit/static-html.js';
import { getSelectingBlockPaths, isDragArea, } from './utils';
export const AFFINE_PAGE_DRAGGING_AREA_WIDGET = 'affine-page-dragging-area-widget';
let AffinePageDraggingAreaWidget = (() => {
    let _classSuper = WidgetComponent;
    let _rect_decorators;
    let _rect_initializers = [];
    let _rect_extraInitializers = [];
    return class AffinePageDraggingAreaWidget extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _rect_decorators = [state()];
            __esDecorate(this, null, _rect_decorators, { kind: "accessor", name: "rect", static: false, private: false, access: { has: obj => "rect" in obj, get: obj => obj.rect, set: (obj, value) => { obj.rect = value; } }, metadata: _metadata }, _rect_initializers, _rect_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.excludeFlavours = ['affine:note', 'affine:surface']; }
        get _allBlocksWithRect() {
            if (!this._viewport) {
                return [];
            }
            const { scrollLeft, scrollTop } = this._viewport;
            const getAllNodeFromTree = () => {
                const blocks = [];
                this.host.view.walkThrough(node => {
                    const view = node;
                    if (!(view instanceof BlockComponent)) {
                        return true;
                    }
                    if (view.model.role !== 'root' &&
                        !AffinePageDraggingAreaWidget.excludeFlavours.includes(view.model.flavour)) {
                        blocks.push(view);
                    }
                    return;
                });
                return blocks;
            };
            const elements = getAllNodeFromTree();
            return elements.map(element => {
                const bounding = element.getBoundingClientRect();
                return {
                    element,
                    rect: {
                        left: bounding.left + scrollLeft,
                        top: bounding.top + scrollTop,
                        width: bounding.width,
                        height: bounding.height,
                    },
                };
            });
        }
        get _viewport() {
            return this.std.get(ViewportElementProvider).viewport;
        }
        get scrollContainer() {
            if (!this.block) {
                return null;
            }
            return getScrollContainer(this.block);
        }
        _clearRaf() {
            if (this._rafID) {
                cancelAnimationFrame(this._rafID);
                this._rafID = 0;
            }
        }
        _selectBlocksByRect(userRect) {
            const selections = getSelectingBlockPaths(this._allBlocksWithRect, userRect).map(blockPath => {
                return this.host.selection.create(BlockSelection, {
                    blockId: blockPath,
                });
            });
            this.host.selection.setGroup('note', selections);
        }
        connectedCallback() {
            super.connectedCallback();
            this.handleEvent('dragStart', ctx => {
                const state = ctx.get('pointerState');
                const { button } = state.raw;
                if (button !== 0)
                    return;
                if (!isDragArea(state))
                    return;
                if (!this._viewport)
                    return;
                this._dragging = true;
                const { scrollLeft, scrollTop } = this._viewport;
                this._initialScrollOffset = {
                    left: scrollLeft,
                    top: scrollTop,
                };
                this._initialContainerOffset = {
                    x: state.containerOffset.x,
                    y: state.containerOffset.y,
                };
                return true;
            }, { global: true });
            this.handleEvent('dragMove', ctx => {
                this._clearRaf();
                if (!this._dragging) {
                    return;
                }
                const state = ctx.get('pointerState');
                // TODO(@L-Sun) support drag area for touch device
                if (state.raw.pointerType === 'touch')
                    return;
                ctx.get('defaultState').event.preventDefault();
                this._rafID = requestAnimationFrame(() => {
                    this._updateDraggingArea(state, true);
                });
                return true;
            }, { global: true });
            this.handleEvent('dragEnd', () => {
                this._clearRaf();
                this._dragging = false;
                this.rect = null;
                this._initialScrollOffset = {
                    top: 0,
                    left: 0,
                };
                this._initialContainerOffset = {
                    x: 0,
                    y: 0,
                };
                this._lastPointerState = null;
            }, {
                global: true,
            });
            this.handleEvent('pointerMove', ctx => {
                if (this._dragging) {
                    const state = ctx.get('pointerState');
                    state.raw.preventDefault();
                }
            }, {
                global: true,
            });
        }
        disconnectedCallback() {
            this._clearRaf();
            this._disposables.dispose();
            super.disconnectedCallback();
        }
        firstUpdated() {
            this._disposables.addFromEvent(this.scrollContainer, 'scroll', () => {
                if (!this._dragging || !this._lastPointerState)
                    return;
                const state = this._lastPointerState;
                this._rafID = requestAnimationFrame(() => {
                    this._updateDraggingArea(state, false);
                });
            });
        }
        render() {
            const rect = this.rect;
            if (!rect)
                return nothing;
            const style = {
                left: rect.left + 'px',
                top: rect.top + 'px',
                width: rect.width + 'px',
                height: rect.height + 'px',
            };
            return html `
      <style>
        .affine-page-dragging-area {
          position: absolute;
          background: var(--affine-hover-color);
          z-index: 1;
          pointer-events: none;
        }
      </style>
      <div class="affine-page-dragging-area" style=${styleMap(style)}></div>
    `;
        }
        #rect_accessor_storage;
        get rect() { return this.#rect_accessor_storage; }
        set rect(value) { this.#rect_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._dragging = false;
            this._initialContainerOffset = {
                x: 0,
                y: 0,
            };
            this._initialScrollOffset = {
                top: 0,
                left: 0,
            };
            this._lastPointerState = null;
            this._rafID = 0;
            this._updateDraggingArea = (state, shouldAutoScroll) => {
                const { x, y } = state;
                const { x: startX, y: startY } = state.start;
                const { left: initScrollX, top: initScrollY } = this._initialScrollOffset;
                if (!this._viewport) {
                    return;
                }
                const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = this._viewport;
                const { x: initConX, y: initConY } = this._initialContainerOffset;
                const { x: conX, y: conY } = state.containerOffset;
                const { left: viewportLeft, top: viewportTop } = this._viewport;
                let left = Math.min(startX + initScrollX + initConX - viewportLeft, x + scrollLeft + conX - viewportLeft);
                let right = Math.max(startX + initScrollX + initConX - viewportLeft, x + scrollLeft + conX - viewportLeft);
                let top = Math.min(startY + initScrollY + initConY - viewportTop, y + scrollTop + conY - viewportTop);
                let bottom = Math.max(startY + initScrollY + initConY - viewportTop, y + scrollTop + conY - viewportTop);
                left = Math.max(left, conX - viewportLeft);
                right = Math.min(right, scrollWidth);
                top = Math.max(top, conY - viewportTop);
                bottom = Math.min(bottom, scrollHeight);
                const userRect = {
                    left,
                    top,
                    width: right - left,
                    height: bottom - top,
                };
                this.rect = userRect;
                this._selectBlocksByRect({
                    left: userRect.left + viewportLeft,
                    top: userRect.top + viewportTop,
                    width: userRect.width,
                    height: userRect.height,
                });
                this._lastPointerState = state;
                if (shouldAutoScroll && this.scrollContainer) {
                    const rect = this.scrollContainer.getBoundingClientRect();
                    const result = autoScroll(this.scrollContainer, state.raw.y - rect.top);
                    if (!result) {
                        this._clearRaf();
                        return;
                    }
                }
            };
            this.#rect_accessor_storage = __runInitializers(this, _rect_initializers, null);
            __runInitializers(this, _rect_extraInitializers);
        }
    };
})();
export { AffinePageDraggingAreaWidget };
export const pageDraggingAreaWidget = WidgetViewExtension('affine:page', AFFINE_PAGE_DRAGGING_AREA_WIDGET, literal `${unsafeStatic(AFFINE_PAGE_DRAGGING_AREA_WIDGET)}`);
