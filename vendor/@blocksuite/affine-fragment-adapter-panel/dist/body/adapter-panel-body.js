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
import { scrollbarStyle } from '@blocksuite/affine-shared/styles';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher } from '@blocksuite/global/lit';
import { consume } from '@lit/context';
import { css, html, LitElement } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { adapterPanelContext, ADAPTERS, } from '../config';
export const AFFINE_ADAPTER_PANEL_BODY = 'affine-adapter-panel-body';
let AdapterPanelBody = (() => {
    let _classSuper = SignalWatcher(LitElement);
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class AdapterPanelBody extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __context_decorators = [consume({ context: adapterPanelContext })];
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .adapter-panel-body {
      width: 100%;
      height: calc(100% - 50px);
      box-sizing: border-box;
      overflow: auto;
      padding: 8px 16px;
    }

    ${scrollbarStyle('.adapter-panel-body')}

    .adapter-content {
      width: 100%;
      height: 100%;
      white-space: pre-wrap;
      color: var(--affine-text-primary-color);
      font-size: var(--affine-font-sm);
      box-sizing: border-box;
    }

    .html-content {
      display: flex;
      gap: 8px;
      flex-direction: column;
      justify-content: space-between;
    }

    .html-preview-container,
    .html-panel-content {
      width: 100%;
      flex: 1 0 0;
      border: none;
      box-sizing: border-box;
      color: var(--affine-text-primary-color);
      overflow: auto;
    }

    ${scrollbarStyle('.html-panel-content')}

    .html-panel-footer {
      width: 100%;
      height: 24px;
      display: flex;
    }

    .html-toggle-container {
      display: flex;
      background: ${unsafeCSSVarV2('segment/background')};
      justify-content: flex-start;
      padding: 2px;
      border-radius: 4px;
    }

    .html-toggle-item {
      cursor: pointer;
      display: flex;
      padding: 0px 4px;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      border-radius: 4px;
      color: ${unsafeCSSVarV2('text/primary')};
    }

    .html-toggle-item:hover {
      background: ${unsafeCSSVarV2('layer/background/hoverOverlay')};
    }

    .html-toggle-item[active] {
      background: ${unsafeCSSVarV2('segment/button')};
      box-shadow:
        var(--Shadow-buttonShadow-1-x, 0px) var(--Shadow-buttonShadow-1-y, 0px)
          var(--Shadow-buttonShadow-1-blur, 1px) 0px
          var(--Shadow-buttonShadow-1-color, rgba(0, 0, 0, 0.12)),
        var(--Shadow-buttonShadow-2-x, 0px) var(--Shadow-buttonShadow-2-y, 1px)
          var(--Shadow-buttonShadow-2-blur, 5px) 0px
          var(--Shadow-buttonShadow-2-color, rgba(0, 0, 0, 0.12));
    }

    .adapter-container {
      display: none;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .adapter-container.active {
      display: block;
    }
  `; }
        get activeAdapter() {
            return this._context.activeAdapter$.value;
        }
        get isHtmlPreview() {
            return this._context.isHtmlPreview$.value;
        }
        get htmlContent() {
            return this._context.htmlContent$.value;
        }
        get markdownContent() {
            return this._context.markdownContent$.value;
        }
        get plainTextContent() {
            return this._context.plainTextContent$.value;
        }
        get docSnapshot() {
            return this._context.docSnapshot$.value;
        }
        _renderHtmlPanel() {
            return html `
      ${this.isHtmlPreview
                ? html `<iframe
            class="html-preview-container"
            .srcdoc=${this.htmlContent}
            sandbox="allow-same-origin"
          ></iframe>`
                : html `<div class="html-panel-content">${this.htmlContent}</div>`}
      <div class="html-panel-footer">
        <div class="html-toggle-container">
          <span
            class="html-toggle-item"
            ?active=${!this.isHtmlPreview}
            @click=${() => (this._context.isHtmlPreview$.value = false)}
            >Source</span
          >
          <span
            class="html-toggle-item"
            ?active=${this.isHtmlPreview}
            @click=${() => (this._context.isHtmlPreview$.value = true)}
            >Preview</span
          >
        </div>
      </div>
    `;
        }
        render() {
            return html `
      <div class="adapter-panel-body">
        ${ADAPTERS.map(adapter => this._renderAdapterContainer(adapter))}
      </div>
    `;
        }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._renderAdapterContent = (adapter) => {
                switch (adapter.id) {
                    case 'html':
                        return this._renderHtmlPanel();
                    case 'markdown':
                        return this.markdownContent;
                    case 'plaintext':
                        return this.plainTextContent;
                    case 'snapshot':
                        return this.docSnapshot
                            ? JSON.stringify(this.docSnapshot, null, 4)
                            : '';
                    default:
                        return '';
                }
            };
            this._renderAdapterContainer = (adapter) => {
                const containerClasses = classMap({
                    'adapter-container': true,
                    active: this.activeAdapter.id === adapter.id,
                });
                const contentClasses = classMap({
                    'adapter-content': true,
                    [`${adapter.id}-content`]: true,
                });
                const content = this._renderAdapterContent(adapter);
                return html `
      <div class=${containerClasses}>
        <div class=${contentClasses}>${content}</div>
      </div>
    `;
            };
            this.#_context_accessor_storage = __runInitializers(this, __context_initializers, void 0);
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { AdapterPanelBody };
