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
import { EdgelessLegacySlotIdentifier } from '@blocksuite/affine-block-surface';
import { NoteBlockSchema, NoteDisplayMode } from '@blocksuite/affine-model';
import { focusTextModel } from '@blocksuite/affine-rich-text';
import { EDGELESS_BLOCK_CHILD_PADDING } from '@blocksuite/affine-shared/consts';
import { TelemetryProvider } from '@blocksuite/affine-shared/services';
import { handleNativeRangeAtPoint, stopPropagation, } from '@blocksuite/affine-shared/utils';
import { Bound } from '@blocksuite/global/gfx';
import { toGfxBlockComponent } from '@blocksuite/std';
import { GfxViewInteractionExtension, } from '@blocksuite/std/gfx';
import { html, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { styleMap } from 'lit/directives/style-map.js';
import clamp from 'lodash-es/clamp';
import { MoreIndicator } from './components/more-indicator';
import { NoteConfigExtension } from './config';
import { NoteBlockComponent } from './note-block';
import { ACTIVE_NOTE_EXTRA_PADDING } from './note-edgeless-block.css';
import * as styles from './note-edgeless-block.css';
export const AFFINE_EDGELESS_NOTE = 'affine-edgeless-note';
let EdgelessNoteBlockComponent = (() => {
    let _classSuper = toGfxBlockComponent(NoteBlockComponent);
    let __editing_decorators;
    let __editing_initializers = [];
    let __editing_extraInitializers = [];
    let __isHover_decorators;
    let __isHover_initializers = [];
    let __isHover_extraInitializers = [];
    let __isResizing_decorators;
    let __isResizing_initializers = [];
    let __isResizing_extraInitializers = [];
    let __noteFullHeight_decorators;
    let __noteFullHeight_initializers = [];
    let __noteFullHeight_extraInitializers = [];
    let _hideMask_decorators;
    let _hideMask_initializers = [];
    let _hideMask_extraInitializers = [];
    let __noteContent_decorators;
    let __noteContent_initializers = [];
    let __noteContent_extraInitializers = [];
    let __docTitle_decorators;
    let __docTitle_initializers = [];
    let __docTitle_extraInitializers = [];
    return class EdgelessNoteBlockComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __editing_decorators = [state()];
            __isHover_decorators = [state()];
            __isResizing_decorators = [state()];
            __noteFullHeight_decorators = [state()];
            _hideMask_decorators = [state()];
            __noteContent_decorators = [query(`.${styles.clipContainer} > div`)];
            __docTitle_decorators = [query('doc-title')];
            __esDecorate(this, null, __editing_decorators, { kind: "accessor", name: "_editing", static: false, private: false, access: { has: obj => "_editing" in obj, get: obj => obj._editing, set: (obj, value) => { obj._editing = value; } }, metadata: _metadata }, __editing_initializers, __editing_extraInitializers);
            __esDecorate(this, null, __isHover_decorators, { kind: "accessor", name: "_isHover", static: false, private: false, access: { has: obj => "_isHover" in obj, get: obj => obj._isHover, set: (obj, value) => { obj._isHover = value; } }, metadata: _metadata }, __isHover_initializers, __isHover_extraInitializers);
            __esDecorate(this, null, __isResizing_decorators, { kind: "accessor", name: "_isResizing", static: false, private: false, access: { has: obj => "_isResizing" in obj, get: obj => obj._isResizing, set: (obj, value) => { obj._isResizing = value; } }, metadata: _metadata }, __isResizing_initializers, __isResizing_extraInitializers);
            __esDecorate(this, null, __noteFullHeight_decorators, { kind: "accessor", name: "_noteFullHeight", static: false, private: false, access: { has: obj => "_noteFullHeight" in obj, get: obj => obj._noteFullHeight, set: (obj, value) => { obj._noteFullHeight = value; } }, metadata: _metadata }, __noteFullHeight_initializers, __noteFullHeight_extraInitializers);
            __esDecorate(this, null, _hideMask_decorators, { kind: "accessor", name: "hideMask", static: false, private: false, access: { has: obj => "hideMask" in obj, get: obj => obj.hideMask, set: (obj, value) => { obj.hideMask = value; } }, metadata: _metadata }, _hideMask_initializers, _hideMask_extraInitializers);
            __esDecorate(this, null, __noteContent_decorators, { kind: "accessor", name: "_noteContent", static: false, private: false, access: { has: obj => "_noteContent" in obj, get: obj => obj._noteContent, set: (obj, value) => { obj._noteContent = value; } }, metadata: _metadata }, __noteContent_initializers, __noteContent_extraInitializers);
            __esDecorate(this, null, __docTitle_decorators, { kind: "accessor", name: "_docTitle", static: false, private: false, access: { has: obj => "_docTitle" in obj, get: obj => obj._docTitle, set: (obj, value) => { obj._docTitle = value; } }, metadata: _metadata }, __docTitle_initializers, __docTitle_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get _isShowCollapsedContent() {
            return (!!this.model.props.edgeless.collapse &&
                this.selected$.value &&
                !this._dragging &&
                (this._isResizing || this._isHover || this._editing));
        }
        get _dragging() {
            return this._isHover && this.gfx.tool.dragging$.value;
        }
        _collapsedContent() {
            if (!this._isShowCollapsedContent) {
                return nothing;
            }
            const { xywh, edgeless } = this.model.props;
            const { borderSize } = edgeless.style;
            const extraPadding = this._editing ? ACTIVE_NOTE_EXTRA_PADDING : 0;
            const extraBorder = this._editing ? borderSize : 0;
            const bound = Bound.deserialize(xywh);
            const scale = edgeless.scale ?? 1;
            const width = bound.w / scale + extraPadding * 2 + extraBorder;
            const height = bound.h / scale;
            const rect = this._noteContent?.getBoundingClientRect();
            if (!rect)
                return nothing;
            const zoom = this.gfx.viewport.zoom;
            this._noteFullHeight =
                rect.height / scale / zoom + 2 * EDGELESS_BLOCK_CHILD_PADDING;
            if (height >= this._noteFullHeight) {
                return nothing;
            }
            return html `
      <div
        class=${styles.collapsedContent}
        style=${styleMap({
                width: `${width}px`,
                height: `${this._noteFullHeight - height}px`,
                left: `${-(extraPadding + extraBorder / 2)}px`,
                top: `${height + extraPadding + extraBorder / 2}px`,
            })}
      ></div>
    `;
        }
        _handleKeyDown(e) {
            if (e.key === 'ArrowUp') {
                this._docTitle?.inlineEditor?.focusEnd();
            }
        }
        _hovered() {
            if (this.selection.value.some(sel => sel.type === 'surface' && sel.blockId === this.model.id)) {
                if (this._hoverTimeout) {
                    clearTimeout(this._hoverTimeout);
                    this._hoverTimeout = null;
                }
                this._isHover = true;
            }
        }
        _leaved(e) {
            if (this._hoverTimeout) {
                clearTimeout(this._hoverTimeout);
                this._hoverTimeout = null;
            }
            const rect = this.getBoundingClientRect();
            const threshold = -10;
            const leavedFromBottom = e.clientY - rect.bottom > threshold &&
                rect.left < e.clientX &&
                e.clientX < rect.right;
            if (leavedFromBottom) {
                this._hoverTimeout = setTimeout(() => {
                    this._isHover = false;
                }, 300);
            }
            else {
                this._isHover = false;
            }
        }
        _setCollapse(event) {
            event.stopImmediatePropagation();
            const { collapse, collapsedHeight } = this.model.props.edgeless;
            if (collapse) {
                this.model.store.updateBlock(this.model, () => {
                    this.model.props.edgeless.collapse = false;
                });
            }
            else if (collapsedHeight) {
                const { xywh, edgeless } = this.model.props;
                const bound = Bound.deserialize(xywh);
                bound.h = collapsedHeight * (edgeless.scale ?? 1);
                this.model.store.updateBlock(this.model, () => {
                    this.model.props.edgeless.collapse = true;
                    this.model.props.xywh = bound.serialize();
                });
            }
            this.selection.clear();
        }
        connectedCallback() {
            super.connectedCallback();
            const selection = this.gfx.selection;
            this._editing = selection.has(this.model.id) && selection.editing;
            this._disposables.add(selection.slots.updated.subscribe(() => {
                if (selection.has(this.model.id) && selection.editing) {
                    this._editing = true;
                }
                else {
                    this._editing = false;
                }
            }));
            this.disposables.addFromEvent(this, 'keydown', this._handleKeyDown);
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this._hoverTimeout) {
                clearTimeout(this._hoverTimeout);
                this._hoverTimeout = null;
            }
        }
        get edgelessSlots() {
            return this.std.get(EdgelessLegacySlotIdentifier);
        }
        firstUpdated() {
            const { _disposables } = this;
            const selection = this.gfx.selection;
            _disposables.add(this.edgelessSlots.elementResizeStart.subscribe(() => {
                if (selection.selectedElements.includes(this.model)) {
                    this._isResizing = true;
                }
            }));
            _disposables.add(this.edgelessSlots.elementResizeEnd.subscribe(() => {
                this._isResizing = false;
            }));
            const observer = new MutationObserver(() => {
                const rect = this._noteContent?.getBoundingClientRect();
                if (!rect)
                    return;
                const zoom = this.gfx.viewport.zoom;
                const scale = this.model.props.edgeless.scale ?? 1;
                this._noteFullHeight =
                    rect.height / scale / zoom + 2 * EDGELESS_BLOCK_CHILD_PADDING;
            });
            if (this._noteContent) {
                observer.observe(this, { childList: true, subtree: true });
                _disposables.add(() => observer.disconnect());
            }
        }
        updated(changedProperties) {
            if (changedProperties.has('_editing') && this._editing) {
                this.std.getOptional(TelemetryProvider)?.track('EdgelessNoteEditing', {
                    page: 'edgeless',
                    segment: this.model.isPageBlock() ? 'page' : 'note',
                });
            }
        }
        getCSSScaleVal() {
            const baseScale = super.getCSSScaleVal();
            const extraScale = this.model.props.edgeless?.scale ?? 1;
            return baseScale * extraScale;
        }
        getRenderingRect() {
            const { xywh, edgeless } = this.model.props;
            const { collapse, scale = 1 } = edgeless;
            const bound = Bound.deserialize(xywh);
            const width = bound.w / scale;
            const height = bound.h / scale;
            return {
                x: bound.x,
                y: bound.y,
                w: width,
                h: collapse ? height : 'unset',
                zIndex: this.toZIndex(),
            };
        }
        renderGfxBlock() {
            const { model } = this;
            const { displayMode } = model.props;
            if (!!displayMode && displayMode === NoteDisplayMode.DocOnly)
                return nothing;
            const { xywh, edgeless } = model.props;
            const { borderRadius } = edgeless.style;
            const { collapse = false, collapsedHeight, scale = 1 } = edgeless;
            const { tool } = this.gfx;
            const bound = Bound.deserialize(xywh);
            const height = bound.h / scale;
            const style = {
                borderRadius: borderRadius + 'px',
            };
            const extra = this._editing ? ACTIVE_NOTE_EXTRA_PADDING : 0;
            const isCollapsable = collapse != null &&
                collapsedHeight != null &&
                collapsedHeight !== this._noteFullHeight;
            const isCollapseArrowUp = collapse
                ? this._noteFullHeight < height
                : !!collapsedHeight && collapsedHeight < height;
            const hasHeader = !!this.std.getOptional(NoteConfigExtension.identifier)
                ?.edgelessNoteHeader;
            return html `
      <div
        class=${styles.edgelessNoteContainer}
        style=${styleMap(style)}
        data-model-height="${bound.h}"
        data-editing=${this._editing}
        data-collapse=${ifDefined(collapse)}
        data-testid="edgeless-note-container"
        @mouseleave=${this._leaved}
        @mousemove=${this._hovered}
        data-scale="${scale}"
      >
        <edgeless-note-background
          .editing=${this._editing}
          .note=${this.model}
        ></edgeless-note-background>

        <div
          data-testid="edgeless-note-clip-container"
          class=${styles.clipContainer}
          style=${styleMap({
                'overflow-y': this._isShowCollapsedContent ? 'initial' : 'clip',
            })}
        >
          <div>
            <edgeless-page-block-title
              .note=${this.model}
            ></edgeless-page-block-title>
            <div
              contenteditable=${String(!this.store.readonly$.value)}
              class="edgeless-note-page-content"
            >
              ${this.renderPageContent()}
            </div>
          </div>
        </div>

        <edgeless-note-mask
          .model=${this.model}
          .host=${this.host}
          .zoom=${this.gfx.viewport.zoom ?? 1}
          .disableMask=${this.hideMask}
          .editing=${this._editing}
        ></edgeless-note-mask>

        ${isCollapsable &&
                tool.currentToolName$.value !== 'frameNavigator' &&
                (!this.model.isPageBlock() || !hasHeader)
                ? html `<div
              class="${classMap({
                    [styles.collapseButton]: true,
                    flip: isCollapseArrowUp,
                })}"
              style=${styleMap({
                    bottom: this._editing ? `${-extra}px` : '0',
                })}
              data-testid="edgeless-note-collapse-button"
              @mousedown=${stopPropagation}
              @mouseup=${stopPropagation}
              @click=${this._setCollapse}
            >
              ${MoreIndicator}
            </div>`
                : nothing}
        ${this._collapsedContent()}
      </div>
    `;
        }
        onBoxSelected(_) {
            return this.model.props.displayMode !== NoteDisplayMode.DocOnly;
        }
        #_editing_accessor_storage;
        get _editing() { return this.#_editing_accessor_storage; }
        set _editing(value) { this.#_editing_accessor_storage = value; }
        #_isHover_accessor_storage;
        get _isHover() { return this.#_isHover_accessor_storage; }
        set _isHover(value) { this.#_isHover_accessor_storage = value; }
        #_isResizing_accessor_storage;
        get _isResizing() { return this.#_isResizing_accessor_storage; }
        set _isResizing(value) { this.#_isResizing_accessor_storage = value; }
        #_noteFullHeight_accessor_storage;
        get _noteFullHeight() { return this.#_noteFullHeight_accessor_storage; }
        set _noteFullHeight(value) { this.#_noteFullHeight_accessor_storage = value; }
        #hideMask_accessor_storage;
        get hideMask() { return this.#hideMask_accessor_storage; }
        set hideMask(value) { this.#hideMask_accessor_storage = value; }
        #_noteContent_accessor_storage;
        get _noteContent() { return this.#_noteContent_accessor_storage; }
        set _noteContent(value) { this.#_noteContent_accessor_storage = value; }
        #_docTitle_accessor_storage;
        get _docTitle() { return this.#_docTitle_accessor_storage; }
        set _docTitle(value) { this.#_docTitle_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._hoverTimeout = null;
            this.#_editing_accessor_storage = __runInitializers(this, __editing_initializers, false);
            this.#_isHover_accessor_storage = (__runInitializers(this, __editing_extraInitializers), __runInitializers(this, __isHover_initializers, false));
            this.#_isResizing_accessor_storage = (__runInitializers(this, __isHover_extraInitializers), __runInitializers(this, __isResizing_initializers, false));
            this.#_noteFullHeight_accessor_storage = (__runInitializers(this, __isResizing_extraInitializers), __runInitializers(this, __noteFullHeight_initializers, 0));
            this.#hideMask_accessor_storage = (__runInitializers(this, __noteFullHeight_extraInitializers), __runInitializers(this, _hideMask_initializers, false));
            this.#_noteContent_accessor_storage = (__runInitializers(this, _hideMask_extraInitializers), __runInitializers(this, __noteContent_initializers, null));
            this.#_docTitle_accessor_storage = (__runInitializers(this, __noteContent_extraInitializers), __runInitializers(this, __docTitle_initializers, null));
            __runInitializers(this, __docTitle_extraInitializers);
        }
    };
})();
export { EdgelessNoteBlockComponent };
export const EdgelessNoteInteraction = GfxViewInteractionExtension(NoteBlockSchema.model.flavour, {
    resizeConstraint: {
        minWidth: 170 + 24 * 2,
        minHeight: 92,
    },
    handleRotate: () => {
        return {
            beforeRotate(context) {
                context.set({
                    rotatable: false,
                });
            },
        };
    },
    handleResize: ({ model }) => {
        const initialScale = model.props.edgeless.scale ?? 1;
        return {
            onResizeStart(context) {
                context.default(context);
                model.stash('edgeless');
            },
            onResizeMove(context) {
                const { originalBound, newBound, lockRatio, constraint } = context;
                const { minWidth, minHeight, maxHeight, maxWidth } = constraint;
                let scale = initialScale;
                let edgelessProp = { ...model.props.edgeless };
                const originalRealWidth = originalBound.w / scale;
                if (lockRatio) {
                    scale = newBound.w / originalRealWidth;
                    edgelessProp.scale = scale;
                }
                newBound.w = clamp(newBound.w, minWidth * scale, maxWidth);
                newBound.h = clamp(newBound.h, minHeight * scale, maxHeight);
                if (newBound.h > minHeight * scale) {
                    edgelessProp.collapse = true;
                    edgelessProp.collapsedHeight = newBound.h / scale;
                }
                model.props.edgeless = edgelessProp;
                model.props.xywh = newBound.serialize();
            },
            onResizeEnd(context) {
                context.default(context);
                model.pop('edgeless');
            },
        };
    },
    handleSelection: ({ std, gfx, view, model }) => {
        return {
            onSelect(context) {
                const { selected, multiSelect, event: e } = context;
                const { editing } = gfx.selection;
                const alreadySelected = gfx.selection.has(model.id);
                if (!multiSelect && selected && (alreadySelected || editing)) {
                    if (model.isLocked())
                        return;
                    if (alreadySelected && editing) {
                        return;
                    }
                    gfx.selection.set({
                        elements: [model.id],
                        editing: true,
                    });
                    view.updateComplete
                        .then(() => {
                        if (!view.isConnected) {
                            return;
                        }
                        let isClickOnTitle = false;
                        const titleRect = view
                            .querySelector('edgeless-page-block-title')
                            ?.getBoundingClientRect();
                        if (titleRect) {
                            const titleBound = new Bound(titleRect.x, titleRect.y, titleRect.width, titleRect.height);
                            if (titleBound.isPointInBound([e.clientX, e.clientY])) {
                                isClickOnTitle = true;
                            }
                        }
                        if (isClickOnTitle) {
                            handleNativeRangeAtPoint(e.clientX, e.clientY);
                            return;
                        }
                        if (model.children.length === 0) {
                            const blockId = std.store.addBlock('affine:paragraph', { type: 'text' }, model.id);
                            if (blockId) {
                                focusTextModel(std, blockId);
                            }
                        }
                        else {
                            const rect = view
                                .querySelector('.affine-block-children-container')
                                ?.getBoundingClientRect();
                            if (rect) {
                                const offsetY = 8 * gfx.viewport.zoom;
                                const offsetX = 2 * gfx.viewport.zoom;
                                const x = clamp(e.clientX, rect.left + offsetX, rect.right - offsetX);
                                const y = clamp(e.clientY, rect.top + offsetY, rect.bottom - offsetY);
                                handleNativeRangeAtPoint(x, y);
                            }
                            else {
                                handleNativeRangeAtPoint(e.clientX, e.clientY);
                            }
                        }
                    })
                        .catch(console.error);
                }
                else if (multiSelect && alreadySelected && editing) {
                    // range selection using Shift-click when editing
                    return;
                }
                else {
                    context.default(context);
                }
            },
        };
    },
});
