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
import { stopPropagation } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { DoneIcon } from '@blocksuite/icons/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { when } from 'lit-html/directives/when.js';
import clamp from 'lodash-es/clamp';
import { EditorChevronDown } from '../toolbar';
const MIN_SIZE = 0;
const MAX_SIZE = 400;
const SIZE_LIST = [
    { value: 50 },
    { value: 100 },
    { value: 200 },
];
let SizeDropdownMenu = (() => {
    let _classDecorators = [requiredProperties({
            sizeSignal: PropTypes.object,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _sizes_decorators;
    let _sizes_initializers = [];
    let _sizes_extraInitializers = [];
    let _sizeSignal_decorators;
    let _sizeSignal_initializers = [];
    let _sizeSignal_extraInitializers = [];
    let _maxSize_decorators;
    let _maxSize_initializers = [];
    let _maxSize_extraInitializers = [];
    let _minSize_decorators;
    let _minSize_initializers = [];
    let _minSize_extraInitializers = [];
    let _format_decorators;
    let _format_initializers = [];
    let _format_extraInitializers = [];
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let _icon_decorators;
    let _icon_initializers = [];
    let _icon_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _input_decorators;
    let _input_initializers = [];
    let _input_extraInitializers = [];
    let _menuButton_decorators;
    let _menuButton_initializers = [];
    let _menuButton_extraInitializers = [];
    var SizeDropdownMenu = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _sizes_decorators = [property({ attribute: false })];
            _sizeSignal_decorators = [property({ attribute: false })];
            _maxSize_decorators = [property({ attribute: false })];
            _minSize_decorators = [property({ attribute: false })];
            _format_decorators = [property({ attribute: false })];
            _label_decorators = [property({ attribute: false })];
            _icon_decorators = [property({ attribute: false })];
            _type_decorators = [property({ attribute: 'data-type' })];
            _input_decorators = [query('input')];
            _menuButton_decorators = [query('editor-menu-button')];
            __esDecorate(this, null, _sizes_decorators, { kind: "accessor", name: "sizes", static: false, private: false, access: { has: obj => "sizes" in obj, get: obj => obj.sizes, set: (obj, value) => { obj.sizes = value; } }, metadata: _metadata }, _sizes_initializers, _sizes_extraInitializers);
            __esDecorate(this, null, _sizeSignal_decorators, { kind: "accessor", name: "sizeSignal", static: false, private: false, access: { has: obj => "sizeSignal" in obj, get: obj => obj.sizeSignal, set: (obj, value) => { obj.sizeSignal = value; } }, metadata: _metadata }, _sizeSignal_initializers, _sizeSignal_extraInitializers);
            __esDecorate(this, null, _maxSize_decorators, { kind: "accessor", name: "maxSize", static: false, private: false, access: { has: obj => "maxSize" in obj, get: obj => obj.maxSize, set: (obj, value) => { obj.maxSize = value; } }, metadata: _metadata }, _maxSize_initializers, _maxSize_extraInitializers);
            __esDecorate(this, null, _minSize_decorators, { kind: "accessor", name: "minSize", static: false, private: false, access: { has: obj => "minSize" in obj, get: obj => obj.minSize, set: (obj, value) => { obj.minSize = value; } }, metadata: _metadata }, _minSize_initializers, _minSize_extraInitializers);
            __esDecorate(this, null, _format_decorators, { kind: "accessor", name: "format", static: false, private: false, access: { has: obj => "format" in obj, get: obj => obj.format, set: (obj, value) => { obj.format = value; } }, metadata: _metadata }, _format_initializers, _format_extraInitializers);
            __esDecorate(this, null, _label_decorators, { kind: "accessor", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(this, null, _icon_decorators, { kind: "accessor", name: "icon", static: false, private: false, access: { has: obj => "icon" in obj, get: obj => obj.icon, set: (obj, value) => { obj.icon = value; } }, metadata: _metadata }, _icon_initializers, _icon_extraInitializers);
            __esDecorate(this, null, _type_decorators, { kind: "accessor", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(this, null, _input_decorators, { kind: "accessor", name: "input", static: false, private: false, access: { has: obj => "input" in obj, get: obj => obj.input, set: (obj, value) => { obj.input = value; } }, metadata: _metadata }, _input_initializers, _input_extraInitializers);
            __esDecorate(this, null, _menuButton_decorators, { kind: "accessor", name: "menuButton", static: false, private: false, access: { has: obj => "menuButton" in obj, get: obj => obj.menuButton, set: (obj, value) => { obj.menuButton = value; } }, metadata: _metadata }, _menuButton_initializers, _menuButton_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            SizeDropdownMenu = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    div[data-orientation] {
      width: 68px;
      gap: 4px;
      min-width: unset;
      overflow: unset;
    }

    editor-menu-action {
      justify-content: space-between;
      color: var(--affine-icon-color);
    }

    :host([data-type='check']) editor-menu-action[data-selected] {
      color: var(--affine-primary-color);
      background-color: unset;
    }

    input {
      display: flex;
      align-self: stretch;
      border: 0.5px solid var(--affine-border-color);
      border-radius: 8px;
      padding: 4px 8px;
      box-sizing: border-box;
    }

    input:focus {
      outline-color: var(--affine-primary-color);
      outline-width: 0.5px;
    }

    input::placeholder {
      color: var(--affine-placeholder-color);
    }
  `; }
        #sizes_accessor_storage;
        get sizes() { return this.#sizes_accessor_storage; }
        set sizes(value) { this.#sizes_accessor_storage = value; }
        #sizeSignal_accessor_storage;
        get sizeSignal() { return this.#sizeSignal_accessor_storage; }
        set sizeSignal(value) { this.#sizeSignal_accessor_storage = value; }
        #maxSize_accessor_storage;
        get maxSize() { return this.#maxSize_accessor_storage; }
        set maxSize(value) { this.#maxSize_accessor_storage = value; }
        #minSize_accessor_storage;
        get minSize() { return this.#minSize_accessor_storage; }
        set minSize(value) { this.#minSize_accessor_storage = value; }
        #format_accessor_storage;
        get format() { return this.#format_accessor_storage; }
        set format(value) { this.#format_accessor_storage = value; }
        #label_accessor_storage;
        get label() { return this.#label_accessor_storage; }
        set label(value) { this.#label_accessor_storage = value; }
        #icon_accessor_storage;
        get icon() { return this.#icon_accessor_storage; }
        set icon(value) { this.#icon_accessor_storage = value; }
        #type_accessor_storage;
        get type() { return this.#type_accessor_storage; }
        set type(value) { this.#type_accessor_storage = value; }
        clamp(value, min = this.minSize, max = this.maxSize) {
            return clamp(value, min, max);
        }
        select(value) {
            const detail = this.clamp(value);
            this.dispatchEvent(new CustomEvent('select', { detail }));
        }
        #input_accessor_storage;
        get input() { return this.#input_accessor_storage; }
        set input(value) { this.#input_accessor_storage = value; }
        #menuButton_accessor_storage;
        get menuButton() { return this.#menuButton_accessor_storage; }
        set menuButton(value) { this.#menuButton_accessor_storage = value; }
        firstUpdated() {
            this.disposables.addFromEvent(this.menuButton, 'toggle', (e) => {
                const opened = e.detail;
                if (opened)
                    return;
                this.input.value = '';
            });
        }
        render() {
            const { sizes, format, type, icon, label, sizeSignal: { value: size }, } = this;
            const isCheckType = type === 'check';
            const placeholder = format?.(Math.trunc(size)) ?? Math.trunc(size);
            return html `
      <editor-menu-button
        class="${`${label.toLowerCase()}-menu`}"
        .contentPadding="${'8px'}"
        .button=${html `
          <editor-icon-button
            aria-label="${label}"
            .tooltip="${label}"
            .justify="${'space-between'}"
            .labelHeight="${'20px'}"
            .iconContainerWidth="${icon ? 'unset' : '65px'}"
          >
            ${icon ??
                html `<span class="label">${format?.(size) ?? size}</span>`}
            ${EditorChevronDown}
          </editor-icon-button>
        `}
      >
        <div data-orientation="vertical">
          ${repeat(sizes, ({ key, value }) => key ?? value, ({ key, value }) => html `
              <editor-menu-action
                aria-label="${key ?? value}"
                ?data-selected="${size === value}"
                @click=${() => this.select(value)}
              >
                ${key ?? format?.(value) ?? value}
                ${when(isCheckType && size === value, () => DoneIcon())}
              </editor-menu-action>
            `)}

          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            min="${this.minSize}"
            max="${this.maxSize}"
            placeholder="${placeholder}"
            @keydown=${this._onKeydown}
            @input=${stopPropagation}
            @click=${stopPropagation}
            @pointerdown=${stopPropagation}
            @cut=${stopPropagation}
            @copy=${stopPropagation}
            @paste=${stopPropagation}
          />
        </div>
      </editor-menu-button>
    `;
        }
        constructor() {
            super(...arguments);
            this.#sizes_accessor_storage = __runInitializers(this, _sizes_initializers, SIZE_LIST);
            this.#sizeSignal_accessor_storage = (__runInitializers(this, _sizes_extraInitializers), __runInitializers(this, _sizeSignal_initializers, void 0));
            this.#maxSize_accessor_storage = (__runInitializers(this, _sizeSignal_extraInitializers), __runInitializers(this, _maxSize_initializers, MAX_SIZE));
            this.#minSize_accessor_storage = (__runInitializers(this, _maxSize_extraInitializers), __runInitializers(this, _minSize_initializers, MIN_SIZE));
            this.#format_accessor_storage = (__runInitializers(this, _minSize_extraInitializers), __runInitializers(this, _format_initializers, void 0));
            this.#label_accessor_storage = (__runInitializers(this, _format_extraInitializers), __runInitializers(this, _label_initializers, 'Scale'));
            this.#icon_accessor_storage = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _icon_initializers, void 0));
            this.#type_accessor_storage = (__runInitializers(this, _icon_extraInitializers), __runInitializers(this, _type_initializers, 'normal'));
            this._onKeydown = (__runInitializers(this, _type_extraInitializers), (e) => {
                e.stopPropagation();
                if (e.isComposing)
                    return;
                if (e.key !== 'Enter')
                    return;
                e.preventDefault();
                const input = e.target;
                const value = parseInt(input.value.trim());
                // Handle edge case where user enters a non-number
                if (isNaN(value)) {
                    input.value = '';
                    return;
                }
                // Handle edge case when user enters a number that is out of range
                this.select(value);
                input.value = '';
                this.menuButton.hide();
            });
            this.#input_accessor_storage = __runInitializers(this, _input_initializers, void 0);
            this.#menuButton_accessor_storage = (__runInitializers(this, _input_extraInitializers), __runInitializers(this, _menuButton_initializers, void 0));
            __runInitializers(this, _menuButton_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return SizeDropdownMenu = _classThis;
})();
export { SizeDropdownMenu };
