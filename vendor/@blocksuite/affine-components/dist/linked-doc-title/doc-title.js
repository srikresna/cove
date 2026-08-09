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
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit-html';
let DocTitle = (() => {
    let _classDecorators = [requiredProperties({
            title: PropTypes.string,
            open: PropTypes.instanceOf(Function),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _open_decorators;
    let _open_initializers = [];
    let _open_extraInitializers = [];
    var DocTitle = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _title_decorators = [property({ attribute: false })];
            _open_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _title_decorators, { kind: "accessor", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(this, null, _open_decorators, { kind: "accessor", name: "open", static: false, private: false, access: { has: obj => "open" in obj, get: obj => obj.open, set: (obj, value) => { obj.open = value; } }, metadata: _metadata }, _open_initializers, _open_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            DocTitle = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    editor-icon-button .label {
      min-width: 60px;
      max-width: 140px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      user-select: none;
      cursor: pointer;
      color: var(--affine-link-color);
      font-feature-settings:
        'clig' off,
        'liga' off;
      font-family: var(--affine-font-family);
      font-size: var(--affine-font-sm);
      font-style: normal;
      font-weight: 400;
      text-decoration: none;
      text-wrap: nowrap;
    }
  `; }
        #title_accessor_storage = __runInitializers(this, _title_initializers, void 0);
        get title() { return this.#title_accessor_storage; }
        set title(value) { this.#title_accessor_storage = value; }
        #open_accessor_storage = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _open_initializers, void 0));
        get open() { return this.#open_accessor_storage; }
        set open(value) { this.#open_accessor_storage = value; }
        render() {
            const { title, open } = this;
            return html `
      <editor-icon-button
        aria-label="Doc title"
        .hover=${false}
        .labelHeight="${'20px'}"
        .tooltip=${title}
        @click=${(event) => open(event)}
      >
        <span class="label">${title}</span>
      </editor-icon-button>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _open_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return DocTitle = _classThis;
})();
export { DocTitle };
