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
import { createLitPortal } from '@blocksuite/affine-components/portal';
import { SignalWatcher } from '@blocksuite/global/lit';
import { ArrowDownSmallIcon, FlipDirectionIcon } from '@blocksuite/icons/lit';
import { flip, offset } from '@floating-ui/dom';
import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { adapterPanelContext } from '../config';
export const AFFINE_ADAPTER_PANEL_HEADER = 'affine-adapter-panel-header';
let AdapterPanelHeader = (() => {
    let _classSuper = SignalWatcher(LitElement);
    let __adapterPanelHeader_decorators;
    let __adapterPanelHeader_initializers = [];
    let __adapterPanelHeader_extraInitializers = [];
    let __adapterSelector_decorators;
    let __adapterSelector_initializers = [];
    let __adapterSelector_extraInitializers = [];
    let _updateActiveContent_decorators;
    let _updateActiveContent_initializers = [];
    let _updateActiveContent_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class AdapterPanelHeader extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __adapterPanelHeader_decorators = [query('.adapter-panel-header')];
            __adapterSelector_decorators = [query('.adapter-selector')];
            _updateActiveContent_decorators = [property({ attribute: false })];
            __context_decorators = [consume({ context: adapterPanelContext })];
            __esDecorate(this, null, __adapterPanelHeader_decorators, { kind: "accessor", name: "_adapterPanelHeader", static: false, private: false, access: { has: obj => "_adapterPanelHeader" in obj, get: obj => obj._adapterPanelHeader, set: (obj, value) => { obj._adapterPanelHeader = value; } }, metadata: _metadata }, __adapterPanelHeader_initializers, __adapterPanelHeader_extraInitializers);
            __esDecorate(this, null, __adapterSelector_decorators, { kind: "accessor", name: "_adapterSelector", static: false, private: false, access: { has: obj => "_adapterSelector" in obj, get: obj => obj._adapterSelector, set: (obj, value) => { obj._adapterSelector = value; } }, metadata: _metadata }, __adapterSelector_initializers, __adapterSelector_extraInitializers);
            __esDecorate(this, null, _updateActiveContent_decorators, { kind: "accessor", name: "updateActiveContent", static: false, private: false, access: { has: obj => "updateActiveContent" in obj, get: obj => obj.updateActiveContent, set: (obj, value) => { obj.updateActiveContent = value; } }, metadata: _metadata }, _updateActiveContent_initializers, _updateActiveContent_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .adapter-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--affine-background-primary-color);
    }
    .adapter-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100px;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid var(--affine-border-color);
      padding: 4px 8px;
    }
    .adapter-selector:hover {
      background: var(--affine-hover-color);
    }
    .adapter-selector-label {
      display: flex;
      align-items: center;
      color: var(--affine-text-primary-color);
      font-size: var(--affine-font-xs);
    }
    .update-button {
      height: 20px;
      width: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      cursor: pointer;
      color: var(--affine-icon-color);
    }
    .update-button:hover {
      background-color: var(--affine-hover-color);
    }
  `; }
        get activeAdapter() {
            return this._context.activeAdapter$.value;
        }
        render() {
            return html `
      <div class="adapter-panel-header">
        <div class="adapter-selector" @click="${this._toggleAdapterMenu}">
          <span class="adapter-selector-label">
            ${this.activeAdapter.label}
          </span>
          ${ArrowDownSmallIcon({ width: '16px', height: '16px' })}
        </div>
        <div class="update-button" @click="${this.updateActiveContent}">
          ${FlipDirectionIcon({ width: '16px', height: '16px' })}
        </div>
      </div>
    `;
        }
        #_adapterPanelHeader_accessor_storage;
        get _adapterPanelHeader() { return this.#_adapterPanelHeader_accessor_storage; }
        set _adapterPanelHeader(value) { this.#_adapterPanelHeader_accessor_storage = value; }
        #_adapterSelector_accessor_storage;
        get _adapterSelector() { return this.#_adapterSelector_accessor_storage; }
        set _adapterSelector(value) { this.#_adapterSelector_accessor_storage = value; }
        #updateActiveContent_accessor_storage;
        get updateActiveContent() { return this.#updateActiveContent_accessor_storage; }
        set updateActiveContent(value) { this.#updateActiveContent_accessor_storage = value; }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._adapterMenuAbortController = null;
            this._toggleAdapterMenu = () => {
                if (this._adapterMenuAbortController) {
                    this._adapterMenuAbortController.abort();
                }
                this._adapterMenuAbortController = new AbortController();
                createLitPortal({
                    template: html `<affine-adapter-menu
        .abortController=${this._adapterMenuAbortController}
      ></affine-adapter-menu>`,
                    portalStyles: {
                        zIndex: 'var(--affine-z-index-popover)',
                    },
                    container: this._adapterPanelHeader,
                    computePosition: {
                        referenceElement: this._adapterSelector,
                        placement: 'bottom-start',
                        middleware: [flip(), offset(4)],
                        autoUpdate: { animationFrame: true },
                    },
                    abortController: this._adapterMenuAbortController,
                    closeOnClickAway: true,
                });
            };
            this.#_adapterPanelHeader_accessor_storage = __runInitializers(this, __adapterPanelHeader_initializers, void 0);
            this.#_adapterSelector_accessor_storage = (__runInitializers(this, __adapterPanelHeader_extraInitializers), __runInitializers(this, __adapterSelector_initializers, void 0));
            this.#updateActiveContent_accessor_storage = (__runInitializers(this, __adapterSelector_extraInitializers), __runInitializers(this, _updateActiveContent_initializers, () => { }));
            this.#_context_accessor_storage = (__runInitializers(this, _updateActiveContent_extraInitializers), __runInitializers(this, __context_initializers, void 0));
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { AdapterPanelHeader };
