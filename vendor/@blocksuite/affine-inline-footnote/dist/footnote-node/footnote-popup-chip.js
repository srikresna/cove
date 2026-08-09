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
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, nothing, unsafeCSS, } from 'lit';
import { property } from 'lit/decorators.js';
let FootNotePopupChip = (() => {
    let _classSuper = LitElement;
    let _prefixIcon_decorators;
    let _prefixIcon_initializers = [];
    let _prefixIcon_extraInitializers = [];
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let _tooltip_decorators;
    let _tooltip_initializers = [];
    let _tooltip_extraInitializers = [];
    return class FootNotePopupChip extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _prefixIcon_decorators = [property({ attribute: false })];
            _label_decorators = [property({ attribute: false })];
            _tooltip_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _prefixIcon_decorators, { kind: "accessor", name: "prefixIcon", static: false, private: false, access: { has: obj => "prefixIcon" in obj, get: obj => obj.prefixIcon, set: (obj, value) => { obj.prefixIcon = value; } }, metadata: _metadata }, _prefixIcon_initializers, _prefixIcon_extraInitializers);
            __esDecorate(this, null, _label_decorators, { kind: "accessor", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(this, null, _tooltip_decorators, { kind: "accessor", name: "tooltip", static: false, private: false, access: { has: obj => "tooltip" in obj, get: obj => obj.tooltip, set: (obj, value) => { obj.tooltip = value; } }, metadata: _metadata }, _tooltip_initializers, _tooltip_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .popup-chip-container {
      display: flex;
      height: 22px;
      align-items: center;
      gap: 8px;
      box-sizing: border-box;
    }

    .prefix-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 16px;
      width: 16px;
      color: ${unsafeCSSVarV2('icon/primary')};
      border-radius: 4px;

      svg,
      img {
        width: 16px;
        height: 16px;
        fill: ${unsafeCSSVarV2('icon/primary')};
      }
    }

    .popup-chip-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: left;
      height: 22px;
      line-height: 22px;
      color: ${unsafeCSSVarV2('text/primary')};
      font-size: var(--affine-font-sm);
      font-weight: 500;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    }
  `; }
        render() {
            return html `
      <div class="popup-chip-container">
        ${this.prefixIcon
                ? html `<div class="prefix-icon">${this.prefixIcon}</div>`
                : nothing}
        <div class="popup-chip-label" title=${this.tooltip}>${this.label}</div>
      </div>
    `;
        }
        #prefixIcon_accessor_storage = __runInitializers(this, _prefixIcon_initializers, undefined);
        get prefixIcon() { return this.#prefixIcon_accessor_storage; }
        set prefixIcon(value) { this.#prefixIcon_accessor_storage = value; }
        #label_accessor_storage = (__runInitializers(this, _prefixIcon_extraInitializers), __runInitializers(this, _label_initializers, ''));
        get label() { return this.#label_accessor_storage; }
        set label(value) { this.#label_accessor_storage = value; }
        #tooltip_accessor_storage = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _tooltip_initializers, ''));
        get tooltip() { return this.#tooltip_accessor_storage; }
        set tooltip(value) { this.#tooltip_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _tooltip_extraInitializers);
        }
    };
})();
export { FootNotePopupChip };
