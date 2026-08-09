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
import { panelBaseStyle, scrollbarStyle, } from '@blocksuite/affine-shared/styles';
import { createButtonPopper, } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { css, html, LitElement, } from 'lit';
import { property, query } from 'lit/decorators.js';
let EditorMenuButton = (() => {
    let _classSuper = WithDisposable(LitElement);
    let __content_decorators;
    let __content_initializers = [];
    let __content_extraInitializers = [];
    let __trigger_decorators;
    let __trigger_initializers = [];
    let __trigger_extraInitializers = [];
    let _button_decorators;
    let _button_initializers = [];
    let _button_extraInitializers = [];
    let _contentPadding_decorators;
    let _contentPadding_initializers = [];
    let _contentPadding_extraInitializers = [];
    let _popperOptions_decorators;
    let _popperOptions_initializers = [];
    let _popperOptions_extraInitializers = [];
    return class EditorMenuButton extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __content_decorators = [query('editor-menu-content')];
            __trigger_decorators = [query('editor-icon-button')];
            _button_decorators = [property({ attribute: false })];
            _contentPadding_decorators = [property({ attribute: false })];
            _popperOptions_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __content_decorators, { kind: "accessor", name: "_content", static: false, private: false, access: { has: obj => "_content" in obj, get: obj => obj._content, set: (obj, value) => { obj._content = value; } }, metadata: _metadata }, __content_initializers, __content_extraInitializers);
            __esDecorate(this, null, __trigger_decorators, { kind: "accessor", name: "_trigger", static: false, private: false, access: { has: obj => "_trigger" in obj, get: obj => obj._trigger, set: (obj, value) => { obj._trigger = value; } }, metadata: _metadata }, __trigger_initializers, __trigger_extraInitializers);
            __esDecorate(this, null, _button_decorators, { kind: "accessor", name: "button", static: false, private: false, access: { has: obj => "button" in obj, get: obj => obj.button, set: (obj, value) => { obj.button = value; } }, metadata: _metadata }, _button_initializers, _button_extraInitializers);
            __esDecorate(this, null, _contentPadding_decorators, { kind: "accessor", name: "contentPadding", static: false, private: false, access: { has: obj => "contentPadding" in obj, get: obj => obj.contentPadding, set: (obj, value) => { obj.contentPadding = value; } }, metadata: _metadata }, _contentPadding_initializers, _contentPadding_extraInitializers);
            __esDecorate(this, null, _popperOptions_decorators, { kind: "accessor", name: "popperOptions", static: false, private: false, access: { has: obj => "popperOptions" in obj, get: obj => obj.popperOptions, set: (obj, value) => { obj.popperOptions = value; } }, metadata: _metadata }, _popperOptions_initializers, _popperOptions_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  `; }
        _updatePopper() {
            this._popper?.dispose();
            this._popper = createButtonPopper({
                reference: this._trigger,
                popperElement: this._content,
                stateUpdated: ({ display }) => {
                    const opened = display === 'show';
                    this._trigger.showTooltip = !opened;
                    this.dispatchEvent(new CustomEvent('toggle', {
                        detail: opened,
                        bubbles: false,
                        cancelable: false,
                        composed: true,
                    }));
                    if (opened) {
                        this.dataset.open = 'true';
                    }
                    else {
                        delete this.dataset.open;
                    }
                },
                mainAxis: 0,
                offsetHeight: 6 * 4,
                topLayer: true,
                ...this.popperOptions,
            });
        }
        willUpdate(changedProperties) {
            if (changedProperties.has('contentPadding')) {
                this.style.setProperty('--content-padding', this.contentPadding ?? '');
            }
            if (this.hasUpdated && changedProperties.has('popperOptions')) {
                this._updatePopper();
            }
        }
        firstUpdated() {
            this._updatePopper();
            this._disposables.addFromEvent(this, 'keydown', (e) => {
                e.stopPropagation();
                if (e.key === 'Escape') {
                    this._popper?.hide();
                }
            });
            this._disposables.addFromEvent(this._trigger, 'click', (_) => {
                this._popper?.toggle();
            });
            this._disposables.add(() => this._popper?.dispose());
        }
        hide() {
            this._popper?.hide();
        }
        render() {
            return html `
      ${this.button}
      <editor-menu-content role="menu" tabindex="-1">
        <slot></slot>
      </editor-menu-content>
    `;
        }
        show(force = false) {
            this._popper?.show(force);
        }
        #_content_accessor_storage;
        get _content() { return this.#_content_accessor_storage; }
        set _content(value) { this.#_content_accessor_storage = value; }
        #_trigger_accessor_storage;
        get _trigger() { return this.#_trigger_accessor_storage; }
        set _trigger(value) { this.#_trigger_accessor_storage = value; }
        #button_accessor_storage;
        get button() { return this.#button_accessor_storage; }
        set button(value) { this.#button_accessor_storage = value; }
        #contentPadding_accessor_storage;
        get contentPadding() { return this.#contentPadding_accessor_storage; }
        set contentPadding(value) { this.#contentPadding_accessor_storage = value; }
        #popperOptions_accessor_storage;
        get popperOptions() { return this.#popperOptions_accessor_storage; }
        set popperOptions(value) { this.#popperOptions_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._popper = null;
            this.#_content_accessor_storage = __runInitializers(this, __content_initializers, void 0);
            this.#_trigger_accessor_storage = (__runInitializers(this, __content_extraInitializers), __runInitializers(this, __trigger_initializers, void 0));
            this.#button_accessor_storage = (__runInitializers(this, __trigger_extraInitializers), __runInitializers(this, _button_initializers, void 0));
            this.#contentPadding_accessor_storage = (__runInitializers(this, _button_extraInitializers), __runInitializers(this, _contentPadding_initializers, undefined));
            this.#popperOptions_accessor_storage = (__runInitializers(this, _contentPadding_extraInitializers), __runInitializers(this, _popperOptions_initializers, {}));
            __runInitializers(this, _popperOptions_extraInitializers);
        }
    };
})();
export { EditorMenuButton };
export class EditorMenuContent extends LitElement {
    static { this.styles = css `
    :host {
      padding: 12px 0;
      display: none;
      outline: none;
    }

    :host([popover]) {
      inset: auto;
      margin: 0;
      border: 0;
      background: transparent;
      color: inherit;
    }

    :host([data-show]) {
      display: flex;
      justify-content: center;
    }

    ${panelBaseStyle('.content-wrapper')}
    ${scrollbarStyle('.content-wrapper')}
    .content-wrapper {
      overscroll-behavior: contain;
      overflow-y: auto;
      padding: var(--content-padding, 0 6px);
    }

    ::slotted(:not(.custom)) {
      display: flex;
      align-items: center;
      align-self: stretch;
      gap: 8px;
      min-height: 36px;
    }

    ::slotted([data-size]) {
      min-width: 146px;
    }

    ::slotted([data-size='small']) {
      min-width: 164px;
    }

    ::slotted([data-size='large']) {
      min-width: 176px;
    }

    ::slotted([data-orientation='vertical']) {
      flex-direction: column;
      align-items: stretch;
      gap: unset;
      min-height: fit-content;
    }
  `; }
    render() {
        return html `<div class="content-wrapper"><slot></slot></div>`;
    }
}
export class EditorMenuAction extends LitElement {
    static { this.styles = css `
    :host {
      display: flex;
      width: 100%;
      align-items: center;
      white-space: nowrap;
      box-sizing: border-box;
      padding: 4px 8px;
      border-radius: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
      gap: 8px;
      color: var(--affine-text-primary-color);
      font-weight: 400;
      min-height: 30px; // 22 + 8
      user-select: none;
    }

    :host(:hover),
    :host([data-selected]) {
      background-color: var(--affine-hover-color);
    }

    :host([data-selected]) {
      pointer-events: none;
    }

    :host(:hover.delete),
    :host(:hover.delete) ::slotted(svg) {
      background-color: var(--affine-background-error-color);
      color: var(--affine-error-color);
    }

    :host([disabled]) {
      pointer-events: none;
      cursor: not-allowed;
      color: var(--affine-text-disable-color);
    }

    ::slotted(svg) {
      color: var(--affine-icon-color);
      font-size: 20px;
    }

    ::slotted(.label) {
      color: inherit !important;
    }
    ::slotted(.label.capitalize) {
      text-transform: capitalize !important;
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        this.role = 'button';
    }
    render() {
        return html `<slot></slot>`;
    }
}
