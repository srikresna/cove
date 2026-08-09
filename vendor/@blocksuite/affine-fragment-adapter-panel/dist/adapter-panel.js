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
import { HtmlAdapterFactoryIdentifier, MarkdownAdapterFactoryIdentifier, PlainTextAdapterFactoryIdentifier, } from '@blocksuite/affine-shared/adapters';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { provide } from '@lit/context';
import { effect, signal } from '@preact/signals-core';
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { adapterPanelContext, ADAPTERS, } from './config';
export const AFFINE_ADAPTER_PANEL = 'affine-adapter-panel';
let AdapterPanel = (() => {
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _store_decorators;
    let _store_initializers = [];
    let _store_extraInitializers = [];
    let _transformerMiddlewares_decorators;
    let _transformerMiddlewares_initializers = [];
    let _transformerMiddlewares_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class AdapterPanel extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _store_decorators = [property({ attribute: false })];
            _transformerMiddlewares_decorators = [property({ attribute: false })];
            __context_decorators = [provide({ context: adapterPanelContext })];
            __esDecorate(this, null, _store_decorators, { kind: "accessor", name: "store", static: false, private: false, access: { has: obj => "store" in obj, get: obj => obj.store, set: (obj, value) => { obj.store = value; } }, metadata: _metadata }, _store_initializers, _store_extraInitializers);
            __esDecorate(this, null, _transformerMiddlewares_decorators, { kind: "accessor", name: "transformerMiddlewares", static: false, private: false, access: { has: obj => "transformerMiddlewares" in obj, get: obj => obj.transformerMiddlewares, set: (obj, value) => { obj.transformerMiddlewares = value; } }, metadata: _metadata }, _transformerMiddlewares_initializers, _transformerMiddlewares_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .adapters-container {
      width: 100%;
      height: 100%;
      background-color: var(--affine-background-primary-color);
      box-sizing: border-box;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    }
  `; }
        get activeAdapter() {
            return this._context.activeAdapter$.value;
        }
        _createJob() {
            return this.store.getTransformer(this.transformerMiddlewares);
        }
        _getDocSnapshot() {
            const job = this._createJob();
            const result = job.docToSnapshot(this.store);
            return result;
        }
        async _getHtmlContent() {
            try {
                const job = this._createJob();
                const htmlAdapterFactory = this.store.get(HtmlAdapterFactoryIdentifier);
                const htmlAdapter = htmlAdapterFactory.get(job);
                const result = await htmlAdapter.fromDoc(this.store);
                return result?.file;
            }
            catch (error) {
                console.error('Failed to get html content', error);
                return '';
            }
        }
        async _getMarkdownContent() {
            try {
                const job = this._createJob();
                const markdownAdapterFactory = this.store.get(MarkdownAdapterFactoryIdentifier);
                const markdownAdapter = markdownAdapterFactory.get(job);
                const result = await markdownAdapter.fromDoc(this.store);
                return result?.file;
            }
            catch (error) {
                console.error('Failed to get markdown content', error);
                return '';
            }
        }
        async _getPlainTextContent() {
            try {
                const job = this._createJob();
                const plainTextAdapterFactory = this.store.get(PlainTextAdapterFactoryIdentifier);
                const plainTextAdapter = plainTextAdapterFactory.get(job);
                const result = await plainTextAdapter.fromDoc(this.store);
                return result?.file;
            }
            catch (error) {
                console.error('Failed to get plain text content', error);
                return '';
            }
        }
        connectedCallback() {
            super.connectedCallback();
            this._context = {
                activeAdapter$: signal(ADAPTERS[0]),
                isHtmlPreview$: signal(false),
                docSnapshot$: signal(null),
                htmlContent$: signal(''),
                markdownContent$: signal(''),
                plainTextContent$: signal(''),
            };
        }
        willUpdate(changedProperties) {
            if (changedProperties.has('store')) {
                this._updateActiveContent().catch(console.error);
            }
        }
        firstUpdated() {
            this.disposables.add(effect(() => {
                if (this.activeAdapter) {
                    this._updateActiveContent().catch(console.error);
                }
            }));
        }
        render() {
            return html `
      <div class="adapters-container">
        <affine-adapter-panel-header
          .updateActiveContent=${this._updateActiveContent}
        ></affine-adapter-panel-header>
        <affine-adapter-panel-body></affine-adapter-panel-body>
      </div>
    `;
        }
        #store_accessor_storage;
        get store() { return this.#store_accessor_storage; }
        set store(value) { this.#store_accessor_storage = value; }
        #transformerMiddlewares_accessor_storage;
        get transformerMiddlewares() { return this.#transformerMiddlewares_accessor_storage; }
        set transformerMiddlewares(value) { this.#transformerMiddlewares_accessor_storage = value; }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._updateActiveContent = async () => {
                const activeId = this.activeAdapter.id;
                switch (activeId) {
                    case 'markdown':
                        this._context.markdownContent$.value =
                            (await this._getMarkdownContent()) || '';
                        break;
                    case 'html':
                        this._context.htmlContent$.value = (await this._getHtmlContent()) || '';
                        break;
                    case 'plaintext':
                        this._context.plainTextContent$.value =
                            (await this._getPlainTextContent()) || '';
                        break;
                    case 'snapshot':
                        this._context.docSnapshot$.value = this._getDocSnapshot() || null;
                        break;
                }
            };
            this.#store_accessor_storage = __runInitializers(this, _store_initializers, void 0);
            this.#transformerMiddlewares_accessor_storage = (__runInitializers(this, _store_extraInitializers), __runInitializers(this, _transformerMiddlewares_initializers, []));
            this.#_context_accessor_storage = (__runInitializers(this, _transformerMiddlewares_extraInitializers), __runInitializers(this, __context_initializers, void 0));
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { AdapterPanel };
