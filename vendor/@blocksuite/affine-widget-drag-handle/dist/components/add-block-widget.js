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
import { PlusIcon } from '@blocksuite/icons/lit';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
let AffineAddBlockWidget = (() => {
    let _classSuper = LitElement;
    let _visible_decorators;
    let _visible_initializers = [];
    let _visible_extraInitializers = [];
    return class AffineAddBlockWidget extends _classSuper {
        constructor() {
            super(...arguments);
            this.#visible_accessor_storage = __runInitializers(this, _visible_initializers, false);
            this._handleClick = (__runInitializers(this, _visible_extraInitializers), (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.dispatchEvent(new CustomEvent('add-block', { bubbles: true, composed: true }));
            });
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _visible_decorators = [property({ type: Boolean })];
            __esDecorate(this, null, _visible_decorators, { kind: "accessor", name: "visible", static: false, private: false, access: { has: obj => "visible" in obj, get: obj => obj.visible, set: (obj, value) => { obj.visible = value; } }, metadata: _metadata }, _visible_initializers, _visible_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: block;
      pointer-events: none;
    }

    .affine-add-block-widget {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-top: 8px;
      cursor: pointer;
      border-radius: 4px;
      color: var(--affine-placeholder-color);
      background: transparent;
      border: none;
      padding: 0;
      transition:
        color 0.2s ease,
        background 0.2s ease;
      pointer-events: auto;
      user-select: none;
      box-sizing: border-box;
    }

    .affine-add-block-widget:hover {
      background: var(--affine-hover-color);
      color: var(--affine-text-primary-color);
    }

    .affine-add-block-widget svg {
      width: 12px;
      height: 12px;
      flex-shrink: 0;
    }
  `; }
        #visible_accessor_storage;
        get visible() { return this.#visible_accessor_storage; }
        set visible(value) { this.#visible_accessor_storage = value; }
        render() {
            if (!this.visible)
                return html ``;
            return html `
      <button
        class="affine-add-block-widget"
        title="Click to add a block below"
        aria-label="Add block below"
        @click=${this._handleClick}
      >
        ${PlusIcon({ width: '12', height: '12' })}
      </button>
    `;
        }
    };
})();
export { AffineAddBlockWidget };
