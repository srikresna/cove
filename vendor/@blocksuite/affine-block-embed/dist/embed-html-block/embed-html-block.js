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
import { BlockSelection } from '@blocksuite/std';
import { html } from 'lit';
import { query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { EmbedBlockComponent } from '../common/embed-block-element.js';
import { HtmlIcon, styles } from './styles.js';
let EmbedHtmlBlockComponent = (() => {
    let _classSuper = EmbedBlockComponent;
    let _iframeWrapper_decorators;
    let _iframeWrapper_initializers = [];
    let _iframeWrapper_extraInitializers = [];
    return class EmbedHtmlBlockComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _iframeWrapper_decorators = [query('.embed-html-block-iframe-wrapper')];
            __esDecorate(this, null, _iframeWrapper_decorators, { kind: "accessor", name: "iframeWrapper", static: false, private: false, access: { has: obj => "iframeWrapper" in obj, get: obj => obj.iframeWrapper, set: (obj, value) => { obj.iframeWrapper = value; } }, metadata: _metadata }, _iframeWrapper_initializers, _iframeWrapper_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        _handleDoubleClick(event) {
            event.stopPropagation();
            this.open();
        }
        _selectBlock() {
            const selectionManager = this.host.selection;
            const blockSelection = selectionManager.create(BlockSelection, {
                blockId: this.blockId,
            });
            selectionManager.setGroup('note', [blockSelection]);
        }
        _handleClick(event) {
            event.stopPropagation();
            this._selectBlock();
        }
        connectedCallback() {
            super.connectedCallback();
            this._cardStyle = this.model.props.style;
        }
        renderBlock() {
            const titleText = 'Basic HTML Page Structure';
            const htmlSrc = `
      <style>
        body {
          margin: 0;
        }
      </style>
      ${this.model.props.html}
    `;
            return this.renderEmbed(() => {
                if (!this.model.props.html) {
                    return html ` <div class="affine-html-empty">Empty</div>`;
                }
                return html `
        <div
          class=${classMap({
                    'affine-embed-html-block': true,
                    selected: this.selected$.value,
                })}
          style=${styleMap(this.embedHtmlStyle)}
          @click=${this._handleClick}
          @dblclick=${this._handleDoubleClick}
        >
          <div class="affine-embed-html">
            <div class="affine-embed-html-iframe-container">
              <div class="embed-html-block-iframe-wrapper" allowfullscreen>
                <iframe
                  class="embed-html-block-iframe"
                  sandbox="allow-scripts"
                  scrolling="no"
                  .srcdoc=${htmlSrc}
                  loading="lazy"
                ></iframe>
                <embed-html-fullscreen-toolbar
                  .embedHtml=${this}
                ></embed-html-fullscreen-toolbar>
              </div>

              <!-- overlay to prevent the iframe from capturing pointer events -->
              <div
                class=${classMap({
                    'affine-embed-html-iframe-overlay': true,
                    hide: !this.showOverlay$.value,
                })}
              ></div>
            </div>
          </div>

          <div class="affine-embed-html-title">
            <div class="affine-embed-html-title-icon">${HtmlIcon}</div>

            <div class="affine-embed-html-title-text">${titleText}</div>
          </div>
        </div>
      `;
            });
        }
        #iframeWrapper_accessor_storage;
        get iframeWrapper() { return this.#iframeWrapper_accessor_storage; }
        set iframeWrapper(value) { this.#iframeWrapper_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._cardStyle = 'html';
            this.close = () => {
                document.exitFullscreen().catch(console.error);
            };
            this.embedHtmlStyle = {};
            this.open = () => {
                this.iframeWrapper?.requestFullscreen().catch(console.error);
            };
            this.refreshData = () => { };
            this.#iframeWrapper_accessor_storage = __runInitializers(this, _iframeWrapper_initializers, void 0);
            __runInitializers(this, _iframeWrapper_extraInitializers);
        }
    };
})();
export { EmbedHtmlBlockComponent };
