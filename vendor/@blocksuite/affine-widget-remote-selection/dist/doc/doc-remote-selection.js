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
import { AttachmentBlockModel, BookmarkBlockModel, CodeBlockModel, DatabaseBlockModel, ImageBlockModel, SurfaceRefBlockModel, } from '@blocksuite/affine-model';
import { getSelectionRectsCommand } from '@blocksuite/affine-shared/commands';
import { EMBED_BLOCK_MODEL_LIST } from '@blocksuite/affine-shared/consts';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { BlockSelection, TextSelection, WidgetComponent, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { computed, effect } from '@preact/signals-core';
import { css, html, nothing } from 'lit';
import { state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import throttle from 'lodash-es/throttle';
import { RemoteColorManager } from '../manager/remote-color-manager';
import { cursorStyle, selectionStyle } from './utils';
export const AFFINE_DOC_REMOTE_SELECTION_WIDGET = 'affine-doc-remote-selection-widget';
let AffineDocRemoteSelectionWidget = (() => {
    let _classSuper = WidgetComponent;
    let __selections_decorators;
    let __selections_initializers = [];
    let __selections_extraInitializers = [];
    return class AffineDocRemoteSelectionWidget extends _classSuper {
        constructor() {
            super(...arguments);
            this.#_selections_accessor_storage = __runInitializers(this, __selections_initializers, []);
            this._abortController = (__runInitializers(this, __selections_extraInitializers), new AbortController());
            this._remoteColorManager = null;
            this._remoteSelections = computed(() => {
                const status = this.store.awarenessStore.getStates();
                return [...this.std.selection.remoteSelections.entries()].map(([id, selections]) => {
                    return {
                        id,
                        selections,
                        user: status.get(id)?.user,
                    };
                });
            });
            this._resizeObserver = new ResizeObserver(() => {
                this.requestUpdate();
            });
            this._getSelectionRect = (selections) => {
                if (!this.block) {
                    return [];
                }
                if (this.block.model.flavour !== 'affine:page') {
                    console.error('remote selection widget must be used in page component');
                    return [];
                }
                const textSelection = selections.find(selection => selection instanceof TextSelection);
                const blockSelections = selections.filter(selection => selection instanceof BlockSelection);
                if (!textSelection && !blockSelections.length)
                    return [];
                const [_, { selectionRects }] = this.std.command.exec(getSelectionRectsCommand, {
                    textSelection,
                    blockSelections,
                });
                if (!selectionRects)
                    return [];
                return selectionRects.map(({ blockId, ...rect }) => {
                    if (!blockId)
                        return rect;
                    const block = this.host.view.getBlock(blockId);
                    if (!block)
                        return rect;
                    const isTransparent = this._config.blockSelectionBackgroundTransparent(block.model);
                    return {
                        ...rect,
                        transparent: isTransparent,
                    };
                });
            };
            this._updateSelections = (selections) => {
                const remoteUsers = new Set();
                this._selections = selections.flatMap(({ selections, id, user }) => {
                    if (remoteUsers.has(id)) {
                        return [];
                    }
                    else {
                        remoteUsers.add(id);
                    }
                    return {
                        id,
                        selections,
                        rects: this._getSelectionRect(selections),
                        user,
                    };
                });
            };
            this._updateSelectionsThrottled = throttle(this._updateSelections, 60);
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __selections_decorators = [state()];
            __esDecorate(this, null, __selections_decorators, { kind: "accessor", name: "_selections", static: false, private: false, access: { has: obj => "_selections" in obj, get: obj => obj._selections, set: (obj, value) => { obj._selections = value; } }, metadata: _metadata }, __selections_initializers, __selections_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        // avoid being unable to select text by mouse click or drag
        static { this.styles = css `
    :host {
      pointer-events: none;
    }
  `; }
        #_selections_accessor_storage;
        get _selections() { return this.#_selections_accessor_storage; }
        set _selections(value) { this.#_selections_accessor_storage = value; }
        get _config() {
            return {
                blockSelectionBackgroundTransparent: block => {
                    return matchModels(block, [
                        CodeBlockModel,
                        DatabaseBlockModel,
                        ImageBlockModel,
                        AttachmentBlockModel,
                        BookmarkBlockModel,
                        SurfaceRefBlockModel,
                        ...EMBED_BLOCK_MODEL_LIST,
                    ]);
                },
            };
        }
        get _container() {
            return this.offsetParent;
        }
        get _containerRect() {
            return this.offsetParent?.getBoundingClientRect();
        }
        get _selectionManager() {
            return this.host.selection;
        }
        _getTextRange(textSelection) {
            const toBlockId = textSelection.to
                ? textSelection.to.blockId
                : textSelection.from.blockId;
            let range = this.std.range.textSelectionToRange(this._selectionManager.create(TextSelection, {
                from: {
                    blockId: toBlockId,
                    index: textSelection.to
                        ? textSelection.to.index + textSelection.to.length
                        : textSelection.from.index + textSelection.from.length,
                    length: 0,
                },
                to: null,
            }));
            if (!range) {
                // If no range, maybe the block is not updated yet
                // We just set the range to the end of the block
                const block = this.std.view.getBlock(toBlockId);
                if (!block)
                    return null;
                range = this.std.range.textSelectionToRange(this._selectionManager.create(TextSelection, {
                    from: {
                        blockId: toBlockId,
                        index: block.model.text?.length ?? 0,
                        length: 0,
                    },
                    to: null,
                }));
                if (!range)
                    return null;
            }
            return range;
        }
        _getCursorRect(selections) {
            if (!this.block) {
                return null;
            }
            if (this.block.model.flavour !== 'affine:page') {
                console.error('remote selection widget must be used in page component');
                return null;
            }
            const textSelection = selections.find(selection => selection instanceof TextSelection);
            const blockSelections = selections.filter(selection => selection instanceof BlockSelection);
            const container = this._container;
            const containerRect = this._containerRect;
            if (textSelection) {
                const range = this._getTextRange(textSelection);
                if (!range)
                    return null;
                const container = this._container;
                const containerRect = this._containerRect;
                const rangeRects = Array.from(range.getClientRects());
                if (rangeRects.length > 0) {
                    const rect = rangeRects.length === 1
                        ? rangeRects[0]
                        : rangeRects[rangeRects.length - 1];
                    return {
                        width: 2,
                        height: rect.height,
                        top: rect.top - (containerRect?.top ?? 0) + (container?.scrollTop ?? 0),
                        left: rect.left -
                            (containerRect?.left ?? 0) +
                            (container?.scrollLeft ?? 0),
                    };
                }
            }
            else if (blockSelections.length > 0) {
                const lastBlockSelection = blockSelections[blockSelections.length - 1];
                const block = this.host.view.getBlock(lastBlockSelection.blockId);
                if (block) {
                    const rect = block.getBoundingClientRect();
                    return {
                        width: 2,
                        height: rect.height,
                        top: rect.top - (containerRect?.top ?? 0) + (container?.scrollTop ?? 0),
                        left: rect.left +
                            rect.width -
                            (containerRect?.left ?? 0) +
                            (container?.scrollLeft ?? 0),
                    };
                }
            }
            return null;
        }
        connectedCallback() {
            super.connectedCallback();
            this.handleEvent('wheel', () => {
                this.requestUpdate();
            });
            this.disposables.addFromEvent(window, 'resize', () => {
                this.requestUpdate();
            });
            this._remoteColorManager = new RemoteColorManager(this.std);
            this.disposables.add(effect(() => {
                const selections = this._remoteSelections.value;
                this._updateSelectionsThrottled(selections);
            }));
            this.disposables.add(this.std.store.slots.blockUpdated.subscribe(() => {
                this._updateSelectionsThrottled(this._remoteSelections.peek());
            }));
            const gfx = this.std.get(GfxControllerIdentifier);
            this.disposables.add(gfx.viewport.viewportUpdated.subscribe(() => {
                const selections = this._remoteSelections.peek();
                this._updateSelections(selections);
            }));
            this.disposables.add(this.std.event.active$.subscribe(value => {
                if (!value) {
                    this.std.selection.clearRemote();
                }
            }));
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._resizeObserver.disconnect();
            this._abortController.abort();
        }
        render() {
            if (this._selections.length === 0) {
                return nothing;
            }
            const remoteColorManager = this._remoteColorManager;
            if (!remoteColorManager)
                return nothing;
            return html `<div>
      ${this._selections.map(selection => {
                const color = remoteColorManager.get(selection.id);
                if (!color)
                    return [];
                const cursorRect = this._getCursorRect(selection.selections);
                return selection.rects
                    .map(r => html `<div style="${selectionStyle(r, color)}"></div>`)
                    .concat([
                    html `
              <div
                style="${cursorRect
                        ? cursorStyle(cursorRect, color)
                        : styleMap({
                            display: 'none',
                        })}"
              >
                <div
                  style="${styleMap({
                        position: 'relative',
                        height: '100%',
                    })}"
                >
                  <div
                    style="${styleMap({
                        position: 'absolute',
                        left: '-4px',
                        bottom: `${cursorRect?.height ? cursorRect.height - 4 : 0}px`,
                        backgroundColor: color,
                        color: 'white',
                        maxWidth: '160px',
                        padding: '0 3px',
                        border: '1px solid var(--affine-pure-black-20)',
                        boxShadow: '0px 1px 6px 0px rgba(0, 0, 0, 0.16)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        lineHeight: '18px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: selection.user ? 'block' : 'none',
                    })}"
                  >
                    ${selection.user?.name}
                  </div>
                </div>
              </div>
            `,
                ]);
            })}
    </div>`;
        }
    };
})();
export { AffineDocRemoteSelectionWidget };
