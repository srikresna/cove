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
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { stopPropagation } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { signal } from '@preact/signals-core';
import { css, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
let DatabaseTitle = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _input_decorators;
    let _input_initializers = [];
    let _input_extraInitializers = [];
    let _titleText_decorators;
    let _titleText_initializers = [];
    let _titleText_extraInitializers = [];
    let _dataViewLogic_decorators;
    let _dataViewLogic_initializers = [];
    let _dataViewLogic_extraInitializers = [];
    return class DatabaseTitle extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _input_decorators = [query('textarea')];
            _titleText_decorators = [property({ attribute: false })];
            _dataViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _input_decorators, { kind: "accessor", name: "input", static: false, private: false, access: { has: obj => "input" in obj, get: obj => obj.input, set: (obj, value) => { obj.input = value; } }, metadata: _metadata }, _input_initializers, _input_extraInitializers);
            __esDecorate(this, null, _titleText_decorators, { kind: "accessor", name: "titleText", static: false, private: false, access: { has: obj => "titleText" in obj, get: obj => obj.titleText, set: (obj, value) => { obj.titleText = value; } }, metadata: _metadata }, _titleText_initializers, _titleText_extraInitializers);
            __esDecorate(this, null, _dataViewLogic_decorators, { kind: "accessor", name: "dataViewLogic", static: false, private: false, access: { has: obj => "dataViewLogic" in obj, get: obj => obj.dataViewLogic, set: (obj, value) => { obj.dataViewLogic = value; } }, metadata: _metadata }, _dataViewLogic_initializers, _dataViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .affine-database-title {
      position: relative;
      flex: 1;
      font-family: inherit;
      font-size: 20px;
      line-height: 28px;
      font-weight: 600;
      color: var(--affine-text-primary-color);
      overflow: hidden;
    }

    .affine-database-title textarea {
      font-size: inherit;
      line-height: inherit;
      font-weight: inherit;
      letter-spacing: inherit;
      font-family: inherit;
      border: none;
      background-color: transparent;
      padding: 0;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      outline: none;
      resize: none;
      scrollbar-width: none;
    }

    .affine-database-title .text {
      user-select: none;
      opacity: 0;
      white-space: pre-wrap;
    }

    .affine-database-title[data-title-focus='false'] textarea {
      opacity: 0;
    }

    .affine-database-title[data-title-focus='false'] .text {
      text-overflow: ellipsis;
      overflow: hidden;
      opacity: 1;
      white-space: pre;
    }

    .affine-database-title [data-title-empty='true']::before {
      content: 'Untitled';
      position: absolute;
      pointer-events: none;
      color: var(--affine-text-primary-color);
    }

    .affine-database-title [data-title-focus='true']::before {
      color: var(--affine-placeholder-color);
    }

    .affine-database-title.comment-highlighted {
      border-bottom: 2px solid
        ${unsafeCSSVarV2('block/comment/highlightUnderline')};
      background-color: ${unsafeCSSVarV2('block/comment/highlightActive')};
    }
  `; }
        get database() {
            return this.closest('affine-database');
        }
        connectedCallback() {
            super.connectedCallback();
            requestAnimationFrame(() => {
                this.updateText();
            });
            this.titleText.yText.observe(this.updateText);
            this.disposables.add(() => {
                this.titleText.yText.unobserve(this.updateText);
            });
        }
        render() {
            const isEmpty = !this.text$.value;
            const classList = classMap({
                'affine-database-title': true,
                ellipsis: !this.isFocus$.value,
                'comment-highlighted': this.database?.isCommentHighlighted ?? false,
            });
            const untitledStyle = styleMap({
                height: isEmpty ? 'auto' : 0,
                opacity: isEmpty && !this.isFocus$.value ? 1 : 0,
            });
            return html ` <div
      class="${classList}"
      data-title-empty="${isEmpty}"
      data-title-focus="${this.isFocus$.value}"
    >
      <div class="text" style="${untitledStyle}">Untitled</div>
      <div class="text">${this.text$.value}</div>
      <textarea
        .disabled="${this.readonly$.value}"
        @input="${this.onInput}"
        @keydown="${this.onKeyDown}"
        @copy="${stopPropagation}"
        @paste="${stopPropagation}"
        @focus="${this.onFocus}"
        @blur="${this.onBlur}"
        @compositionend="${this.compositionEnd}"
        data-block-is-database-title="true"
        title="${this.titleText.toString()}"
      ></textarea>
    </div>`;
        }
        #input_accessor_storage;
        get input() { return this.#input_accessor_storage; }
        set input(value) { this.#input_accessor_storage = value; }
        onPressEnterKey() {
            this.input.blur();
        }
        get readonly$() {
            return this.dataViewLogic.view.readonly$;
        }
        #titleText_accessor_storage;
        get titleText() { return this.#titleText_accessor_storage; }
        set titleText(value) { this.#titleText_accessor_storage = value; }
        #dataViewLogic_accessor_storage;
        get dataViewLogic() { return this.#dataViewLogic_accessor_storage; }
        set dataViewLogic(value) { this.#dataViewLogic_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.compositionEnd = () => {
                this.isComposing$.value = false;
                this.titleText.replace(0, this.titleText.length, this.input.value);
            };
            this.onBlur = () => {
                this.isFocus$.value = false;
            };
            this.onFocus = () => {
                this.isFocus$.value = true;
                if (this.dataViewLogic.selection$.value) {
                    this.dataViewLogic.setSelection(undefined);
                }
            };
            this.onInput = (e) => {
                this.text$.value = this.input.value;
                if (!e.isComposing) {
                    this.titleText.replace(0, this.titleText.length, this.input.value);
                }
            };
            this.onKeyDown = (event) => {
                event.stopPropagation();
                if (event.key === 'Enter' && !event.isComposing) {
                    event.preventDefault();
                    this.onPressEnterKey?.();
                    return;
                }
            };
            this.updateText = () => {
                if (!this.isFocus$.value) {
                    this.input.value = this.titleText.toString();
                    this.text$.value = this.input.value;
                }
            };
            this.#input_accessor_storage = __runInitializers(this, _input_initializers, void 0);
            this.isComposing$ = (__runInitializers(this, _input_extraInitializers), signal(false));
            this.isFocus$ = signal(false);
            this.text$ = signal('');
            this.#titleText_accessor_storage = __runInitializers(this, _titleText_initializers, void 0);
            this.#dataViewLogic_accessor_storage = (__runInitializers(this, _titleText_extraInitializers), __runInitializers(this, _dataViewLogic_initializers, void 0));
            __runInitializers(this, _dataViewLogic_extraInitializers);
        }
    };
})();
export { DatabaseTitle };
