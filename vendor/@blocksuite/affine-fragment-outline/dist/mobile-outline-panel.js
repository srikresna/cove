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
import { NoteDisplayMode, ParagraphBlockModel, RootBlockModel, } from '@blocksuite/affine-model';
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties, } from '@blocksuite/std';
import { signal } from '@preact/signals-core';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { getHeadingBlocksFromDoc } from './utils/query.js';
import { observeActiveHeadingDuringScroll, scrollToBlockWithHighlight, } from './utils/scroll.js';
export const AFFINE_MOBILE_OUTLINE_MENU = 'affine-mobile-outline-menu';
let MobileOutlineMenu = (() => {
    let _classDecorators = [requiredProperties({
            editor: PropTypes.object,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _editor_decorators;
    let _editor_initializers = [];
    let _editor_extraInitializers = [];
    var MobileOutlineMenu = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _editor_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _editor_decorators, { kind: "accessor", name: "editor", static: false, private: false, access: { has: obj => "editor" in obj, get: obj => obj.editor, set: (obj, value) => { obj.editor = value; } }, metadata: _metadata }, _editor_initializers, _editor_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            MobileOutlineMenu = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      position: relative;
      display: flex;
      max-height: 100%;
      box-sizing: border-box;
      flex-direction: column;
      align-items: flex-start;
      padding: 0 12px;
    }

    :host::-webkit-scrollbar {
      display: none;
    }

    .outline-menu-item {
      display: inline;
      align-items: center;
      align-self: stretch;
      padding: 11px 8px;
      overflow: hidden;
      color: ${unsafeCSSVarV2('text/primary')};
      text-overflow: ellipsis;
      /* Body/Regular */
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 17px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      letter-spacing: -0.43px;
      white-space: nowrap;
    }

    .outline-menu-item.active {
      color: ${unsafeCSSVarV2('text/emphasis')};
    }

    .outline-menu-item:active {
      background: var(--affine-hover-color);
    }

    .outline-menu-item.title,
    .outline-menu-item.h1 {
      padding-left: 8px;
    }

    .outline-menu-item.h2 {
      padding-left: 28px;
    }

    .outline-menu-item.h3 {
      padding-left: 48px;
    }

    .outline-menu-item.h4 {
      padding-left: 68px;
    }

    .outline-menu-item.h5 {
      padding-left: 88px;
    }

    .outline-menu-item.h6 {
      padding-left: 108px;
    }
  `; }
        async _scrollToBlock(blockId) {
            this._lockActiveHeadingId = true;
            this._activeHeadingId$.value = blockId;
            this._highlightMaskDisposable = await scrollToBlockWithHighlight(this.editor, blockId);
            this._lockActiveHeadingId = false;
        }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.add(observeActiveHeadingDuringScroll(() => this.editor, newHeadingId => {
                if (this._lockActiveHeadingId)
                    return;
                this._activeHeadingId$.value = newHeadingId;
            }));
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._highlightMaskDisposable();
        }
        render() {
            const docModeService = this.editor.std.get(DocModeProvider);
            const mode = docModeService.getEditorMode();
            if (this.editor.store.root === null || mode === 'edgeless')
                return nothing;
            const headingBlocks = getHeadingBlocksFromDoc(this.editor.store, [NoteDisplayMode.DocAndEdgeless, NoteDisplayMode.DocOnly], true);
            if (headingBlocks.length === 0)
                return nothing;
            const items = [
                ...(this.editor.store.meta?.title !== '' ? [this.editor.store.root] : []),
                ...headingBlocks,
            ];
            return repeat(items, block => block.id, this.renderItem);
        }
        #editor_accessor_storage;
        get editor() { return this.#editor_accessor_storage; }
        set editor(value) { this.#editor_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._activeHeadingId$ = signal(null);
            this._highlightMaskDisposable = () => { };
            this._lockActiveHeadingId = false;
            this.renderItem = (item) => {
                let className = '';
                let text = '';
                if (matchModels(item, [RootBlockModel])) {
                    className = 'title';
                    text = item.props.title$.value.toString();
                }
                else if (matchModels(item, [ParagraphBlockModel]) &&
                    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(item.props.type$.value)) {
                    className = item.props.type$.value;
                    text = item.props.text$.value.toString();
                }
                else {
                    return nothing;
                }
                return html `<div
      class=${classMap({
                    'outline-menu-item': true,
                    [className]: true,
                    active: this._activeHeadingId$.value === item.id,
                })}
      @click=${() => {
                    this._scrollToBlock(item.id).catch(console.error);
                }}
    >
      ${text}
    </div>`;
            };
            this.#editor_accessor_storage = __runInitializers(this, _editor_initializers, void 0);
            __runInitializers(this, _editor_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return MobileOutlineMenu = _classThis;
})();
export { MobileOutlineMenu };
