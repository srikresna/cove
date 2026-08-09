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
import { SignalWatcher } from '@blocksuite/global/lit';
import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { adapterPanelContext, ADAPTERS, } from '../config';
export const AFFINE_ADAPTER_MENU = 'affine-adapter-menu';
let AdapterMenu = (() => {
    let _classSuper = SignalWatcher(LitElement);
    let _abortController_decorators;
    let _abortController_initializers = [];
    let _abortController_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class AdapterMenu extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _abortController_decorators = [property({ attribute: false })];
            __context_decorators = [consume({ context: adapterPanelContext })];
            __esDecorate(this, null, _abortController_decorators, { kind: "accessor", name: "abortController", static: false, private: false, access: { has: obj => "abortController" in obj, get: obj => obj.abortController, set: (obj, value) => { obj.abortController = value; } }, metadata: _metadata }, _abortController_initializers, _abortController_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .adapter-menu {
      min-width: 120px;
      padding: 4px;
      background: var(--affine-background-primary-color);
      border: 1px solid var(--affine-border-color);
      border-radius: 4px;
      box-shadow: var(--affine-shadow-1);
    }
    .adapter-menu-item {
      display: block;
      width: 100%;
      padding: 6px 8px;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      color: var(--affine-text-primary-color);
      font-family: var(--affine-font-family);
      font-size: var(--affine-font-xs);
      border-radius: 4px;
    }
    .adapter-menu-item:hover {
      background: var(--affine-hover-color);
    }
    .adapter-menu-item.active {
      color: var(--affine-primary-color);
      background: var(--affine-hover-color);
    }
  `; }
        get activeAdapter() {
            return this._context.activeAdapter$.value;
        }
        render() {
            return html `<div class="adapter-menu">
      ${ADAPTERS.map(adapter => {
                const classes = classMap({
                    'adapter-menu-item': true,
                    active: this.activeAdapter.id === adapter.id,
                });
                return html `
          <button
            class=${classes}
            @click=${() => this._handleAdapterChange(adapter)}
          >
            ${adapter.label}
          </button>
        `;
            })}
    </div>`;
        }
        #abortController_accessor_storage;
        get abortController() { return this.#abortController_accessor_storage; }
        set abortController(value) { this.#abortController_accessor_storage = value; }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._handleAdapterChange = async (adapter) => {
                this._context.activeAdapter$.value = adapter;
                this.abortController?.abort();
            };
            this.#abortController_accessor_storage = __runInitializers(this, _abortController_initializers, null);
            this.#_context_accessor_storage = (__runInitializers(this, _abortController_extraInitializers), __runInitializers(this, __context_initializers, void 0));
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { AdapterMenu };
