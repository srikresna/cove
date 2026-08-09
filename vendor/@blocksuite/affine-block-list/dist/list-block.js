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
import '@blocksuite/affine-shared/commands';
import { CaptionedBlockComponent } from '@blocksuite/affine-components/caption';
import { playCheckAnimation } from '@blocksuite/affine-components/icons';
import { TOGGLE_BUTTON_PARENT_CLASS } from '@blocksuite/affine-components/toggle-button';
import { DefaultInlineManagerExtension } from '@blocksuite/affine-inline-preset';
import { BLOCK_CHILDREN_CONTAINER_PADDING_LEFT, EDGELESS_TOP_CONTENTEDITABLE_SELECTOR, } from '@blocksuite/affine-shared/consts';
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { getViewportElement } from '@blocksuite/affine-shared/utils';
import { BlockSelection, TextSelection } from '@blocksuite/std';
import { getInlineRangeProvider, } from '@blocksuite/std/inline';
import { effect } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { correctNumberedListsOrderToPrev } from './commands/utils.js';
import { listBlockStyles } from './styles.js';
import { getListIcon } from './utils/get-list-icon.js';
let ListBlockComponent = (() => {
    let _classSuper = CaptionedBlockComponent;
    let __readonlyCollapsed_decorators;
    let __readonlyCollapsed_initializers = [];
    let __readonlyCollapsed_extraInitializers = [];
    let __richTextElement_decorators;
    let __richTextElement_initializers = [];
    let __richTextElement_extraInitializers = [];
    return class ListBlockComponent extends _classSuper {
        constructor() {
            super(...arguments);
            this._inlineRangeProvider = null;
            this._onClickIcon = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (this.model.props.type === 'toggle') {
                    if (this.store.readonly) {
                        this._readonlyCollapsed = !this._readonlyCollapsed;
                    }
                    else {
                        this.store.captureSync();
                        this.store.updateBlock(this.model, {
                            collapsed: !this.model.props.collapsed,
                        });
                    }
                    return;
                }
                else if (this.model.props.type === 'todo') {
                    if (this.store.readonly)
                        return;
                    this.store.captureSync();
                    const checkedPropObj = { checked: !this.model.props.checked };
                    this.store.updateBlock(this.model, checkedPropObj);
                    if (this.model.props.checked) {
                        const checkEl = this.querySelector('.affine-list-block__todo-prefix');
                        if (checkEl) {
                            playCheckAnimation(checkEl).catch(console.error);
                        }
                    }
                    return;
                }
                this._select();
            };
            this.#_readonlyCollapsed_accessor_storage = __runInitializers(this, __readonlyCollapsed_initializers, false);
            this.#_richTextElement_accessor_storage = (__runInitializers(this, __readonlyCollapsed_extraInitializers), __runInitializers(this, __richTextElement_initializers, null));
            this.#blockContainerStyles_accessor_storage = (__runInitializers(this, __richTextElement_extraInitializers), {
                margin: 'var(--affine-list-margin, 10px 0)',
            });
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __readonlyCollapsed_decorators = [state()];
            __richTextElement_decorators = [query('rich-text')];
            __esDecorate(this, null, __readonlyCollapsed_decorators, { kind: "accessor", name: "_readonlyCollapsed", static: false, private: false, access: { has: obj => "_readonlyCollapsed" in obj, get: obj => obj._readonlyCollapsed, set: (obj, value) => { obj._readonlyCollapsed = value; } }, metadata: _metadata }, __readonlyCollapsed_initializers, __readonlyCollapsed_extraInitializers);
            __esDecorate(this, null, __richTextElement_decorators, { kind: "accessor", name: "_richTextElement", static: false, private: false, access: { has: obj => "_richTextElement" in obj, get: obj => obj._richTextElement, set: (obj, value) => { obj._richTextElement = value; } }, metadata: _metadata }, __richTextElement_initializers, __richTextElement_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = listBlockStyles; }
        get attributeRenderer() {
            return this.inlineManager.getRenderer();
        }
        get attributesSchema() {
            return this.inlineManager.getSchema();
        }
        get embedChecker() {
            return this.inlineManager.embedChecker;
        }
        get inlineManager() {
            return this.std.get(DefaultInlineManagerExtension.identifier);
        }
        get topContenteditableElement() {
            if (this.std.get(DocModeProvider).getEditorMode() === 'edgeless') {
                return this.closest(EDGELESS_TOP_CONTENTEDITABLE_SELECTOR);
            }
            return this.rootComponent;
        }
        _select() {
            const selection = this.host.selection;
            selection.update(selList => {
                return selList
                    .filter(sel => !sel.is(TextSelection) && !sel.is(BlockSelection))
                    .concat(selection.create(BlockSelection, { blockId: this.blockId }));
            });
        }
        connectedCallback() {
            super.connectedCallback();
            this._inlineRangeProvider = getInlineRangeProvider(this);
            this.disposables.add(effect(() => {
                const collapsed = this.model.props.collapsed$.value;
                this._readonlyCollapsed = collapsed;
            }));
            this.disposables.add(effect(() => {
                const type = this.model.props.type$.value;
                const order = this.model.props.order$.value;
                // old numbered list has no order
                if (type === 'numbered' && !Number.isInteger(order)) {
                    correctNumberedListsOrderToPrev(this.store, this.model, false);
                }
                // if list is not numbered, order should be null
                if (type !== 'numbered' && order !== null) {
                    this.model.props.order = null;
                }
            }));
        }
        async getUpdateComplete() {
            const result = await super.getUpdateComplete();
            await this._richTextElement?.updateComplete;
            return result;
        }
        renderBlock() {
            const { model, _onClickIcon } = this;
            const widgets = html `${repeat(Object.entries(this.widgets), ([id]) => id, ([_, widget]) => widget)}`;
            const collapsed = this.store.readonly
                ? this._readonlyCollapsed
                : model.props.collapsed;
            const listIcon = getListIcon(model, !collapsed, _onClickIcon);
            const textAlignStyle = styleMap({
                textAlign: this.model.props.textAlign$?.value,
            });
            const children = html `<div
      class="affine-block-children-container"
      style=${styleMap({
                paddingLeft: `${BLOCK_CHILDREN_CONTAINER_PADDING_LEFT}px`,
                display: collapsed ? 'none' : undefined,
            })}
    >
      ${this.renderChildren(this.model)}
    </div>`;
            return html `
      <div class=${'affine-list-block-container'} style="${textAlignStyle}">
        <div
          class=${classMap({
                'affine-list-rich-text-wrapper': true,
                'affine-list--checked': this.model.props.type === 'todo' && this.model.props.checked,
                [TOGGLE_BUTTON_PARENT_CLASS]: true,
            })}
        >
          ${this.model.children.length > 0
                ? html `
                <blocksuite-toggle-button
                  .collapsed=${collapsed}
                  .updateCollapsed=${(value) => {
                    if (this.store.readonly) {
                        this._readonlyCollapsed = value;
                    }
                    else {
                        this.store.captureSync();
                        this.store.updateBlock(this.model, {
                            collapsed: value,
                        });
                    }
                }}
                ></blocksuite-toggle-button>
              `
                : nothing}
          ${listIcon}
          <rich-text
            .yText=${this.model.props.text.yText}
            .inlineEventSource=${this.topContenteditableElement ?? nothing}
            .undoManager=${this.store.history.undoManager}
            .attributeRenderer=${this.attributeRenderer}
            .attributesSchema=${this.attributesSchema}
            .markdownMatches=${this.inlineManager?.markdownMatches}
            .embedChecker=${this.embedChecker}
            .readonly=${this.store.readonly}
            .inlineRangeProvider=${this._inlineRangeProvider}
            .enableClipboard=${false}
            .enableUndoRedo=${false}
            .verticalScrollContainerGetter=${() => getViewportElement(this.host)}
          ></rich-text>
        </div>

        ${children} ${widgets}
      </div>
    `;
        }
        #_readonlyCollapsed_accessor_storage;
        get _readonlyCollapsed() { return this.#_readonlyCollapsed_accessor_storage; }
        set _readonlyCollapsed(value) { this.#_readonlyCollapsed_accessor_storage = value; }
        #_richTextElement_accessor_storage;
        get _richTextElement() { return this.#_richTextElement_accessor_storage; }
        set _richTextElement(value) { this.#_richTextElement_accessor_storage = value; }
        #blockContainerStyles_accessor_storage;
        get blockContainerStyles() { return this.#blockContainerStyles_accessor_storage; }
        set blockContainerStyles(value) { this.#blockContainerStyles_accessor_storage = value; }
    };
})();
export { ListBlockComponent };
