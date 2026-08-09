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
import { DocModeProvider, TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { WithDisposable } from '@blocksuite/global/lit';
import { EditIcon, InformationIcon, ResetIcon } from '@blocksuite/icons/lit';
import { flip, offset } from '@floating-ui/dom';
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, nothing, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ERROR_CARD_DEFAULT_HEIGHT } from '../consts';
const LINK_EDIT_POPUP_OFFSET = 12;
let EmbedIframeErrorCard = (() => {
    let _classSuper = WithDisposable(LitElement);
    let __editButton_decorators;
    let __editButton_initializers = [];
    let __editButton_extraInitializers = [];
    let _error_decorators;
    let _error_initializers = [];
    let _error_extraInitializers = [];
    let _onRetry_decorators;
    let _onRetry_initializers = [];
    let _onRetry_extraInitializers = [];
    let _model_decorators;
    let _model_initializers = [];
    let _model_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _inSurface_decorators;
    let _inSurface_initializers = [];
    let _inSurface_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    return class EmbedIframeErrorCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __editButton_decorators = [query('.button.edit')];
            _error_decorators = [property({ attribute: false })];
            _onRetry_decorators = [property({ attribute: false })];
            _model_decorators = [property({ attribute: false })];
            _std_decorators = [property({ attribute: false })];
            _inSurface_decorators = [property({ attribute: false })];
            _options_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __editButton_decorators, { kind: "accessor", name: "_editButton", static: false, private: false, access: { has: obj => "_editButton" in obj, get: obj => obj._editButton, set: (obj, value) => { obj._editButton = value; } }, metadata: _metadata }, __editButton_initializers, __editButton_extraInitializers);
            __esDecorate(this, null, _error_decorators, { kind: "accessor", name: "error", static: false, private: false, access: { has: obj => "error" in obj, get: obj => obj.error, set: (obj, value) => { obj.error = value; } }, metadata: _metadata }, _error_initializers, _error_extraInitializers);
            __esDecorate(this, null, _onRetry_decorators, { kind: "accessor", name: "onRetry", static: false, private: false, access: { has: obj => "onRetry" in obj, get: obj => obj.onRetry, set: (obj, value) => { obj.onRetry = value; } }, metadata: _metadata }, _onRetry_initializers, _onRetry_extraInitializers);
            __esDecorate(this, null, _model_decorators, { kind: "accessor", name: "model", static: false, private: false, access: { has: obj => "model" in obj, get: obj => obj.model, set: (obj, value) => { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _inSurface_decorators, { kind: "accessor", name: "inSurface", static: false, private: false, access: { has: obj => "inSurface" in obj, get: obj => obj.inSurface, set: (obj, value) => { obj.inSurface = value; } }, metadata: _metadata }, _inSurface_initializers, _inSurface_extraInitializers);
            __esDecorate(this, null, _options_decorators, { kind: "accessor", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      width: 100%;
      height: 100%;
    }

    .affine-embed-iframe-error-card {
      container: affine-embed-iframe-error-card / size;
      display: flex;
      box-sizing: border-box;
      user-select: none;
      padding: 12px;
      gap: 12px;
      overflow: hidden;
      border-radius: 8px;
      border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
      background: ${unsafeCSSVarV2('layer/background/secondary')};
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      user-select: none;

      .error-content {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .error-title {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;

          .error-icon {
            display: flex;
            justify-content: center;
            align-items: center;
            color: ${unsafeCSSVarV2('status/error')};
          }

          .error-title-text {
            color: ${unsafeCSSVarV2('text/primary')};
            text-align: justify;
            /* Client/smBold */
            font-size: var(--affine-font-sm);
            font-style: normal;
            font-weight: 600;
            line-height: 22px; /* 157.143% */
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .error-message {
          display: flex;
          align-self: stretch;
          color: ${unsafeCSSVarV2('text/secondary')};
          overflow: hidden;
          font-feature-settings:
            'liga' off,
            'clig' off;
          text-overflow: ellipsis;
          /* Client/xs */
          font-size: var(--affine-font-xs);
          font-style: normal;
          font-weight: 400;
          line-height: 20px; /* 166.667% */
        }

        .error-info {
          display: flex;
          align-items: center;
          gap: 8px;
          overflow: hidden;
          .button {
            display: flex;
            padding: 0px 4px;
            align-items: center;
            border-radius: 4px;
            cursor: pointer;

            .icon {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .text {
              padding: 0px 4px;
              font-size: var(--affine-font-xs);
              font-style: normal;
              font-weight: 500;
              line-height: 20px; /* 166.667% */
            }
          }

          .button.edit {
            color: ${unsafeCSSVarV2('text/secondary')};
          }

          .button.retry {
            color: ${unsafeCSSVarV2('text/emphasis')};
          }
        }
      }
    }

    .affine-embed-iframe-error-card.horizontal {
      flex-direction: row;
      align-items: flex-start;

      .error-content {
        align-items: flex-start;
        flex: 1 0 0;

        .error-message {
          height: 40px;
          align-items: flex-start;
        }
      }

      @container affine-embed-iframe-error-card (width < 480px) {
        .error-banner {
          display: none;
        }
      }
    }

    .affine-embed-iframe-error-card.vertical {
      flex-direction: column-reverse;
      align-items: center;
      justify-content: center;

      .error-content {
        justify-content: center;
        align-items: center;

        .error-message {
          justify-content: center;
          align-items: center;
        }
      }

      .icon-box {
        svg {
          transform: scale(1.6) translateY(-14px);
        }
      }

      @container affine-embed-iframe-error-card (height < 300px) or (width < 300px) {
        .error-banner {
          display: none;
        }
      }
    }
  `; }
        render() {
            const { layout, width, height } = this.options;
            const cardClasses = classMap({
                'affine-embed-iframe-error-card': true,
                horizontal: layout === 'horizontal',
                vertical: layout === 'vertical',
            });
            const cardWidth = width ? `${width}px` : '100%';
            const cardHeight = height ? `${height}px` : '100%';
            const cardStyle = styleMap({
                width: cardWidth,
                height: cardHeight,
            });
            return html `
      <div class=${cardClasses} style=${cardStyle}>
        <div class="error-content">
          <div class="error-title">
            <span class="error-icon">
              ${InformationIcon({ width: '16px', height: '16px' })}
            </span>
            <span class="error-title-text">This link couldn’t be loaded.</span>
          </div>
          <div class="error-message">
            ${this.error?.message || 'Failed to load embedded content'}
          </div>
          <div class="error-info">
            ${this.readonly
                ? nothing
                : html `
                  <div class="button edit" @click=${this._toggleEdit}>
                    <span class="icon"
                      >${EditIcon({ width: '16px', height: '16px' })}</span
                    >
                    <span class="text">Edit</span>
                  </div>
                `}
            <div class="button retry" @click=${this._handleRetry}>
              <span class="icon"
                >${ResetIcon({ width: '16px', height: '16px' })}</span
              >
              <span class="text">Reload</span>
            </div>
          </div>
        </div>
        <div class="error-banner">
          <div class="icon-box">${EmbedIframeErrorIcon}</div>
        </div>
      </div>
    `;
        }
        get host() {
            return this.std.host;
        }
        get readonly() {
            return this.model.store.readonly;
        }
        get telemetryService() {
            return this.std.getOptional(TelemetryProvider);
        }
        get editorMode() {
            const docModeService = this.std.get(DocModeProvider);
            const mode = docModeService.getEditorMode();
            return mode ?? 'page';
        }
        #_editButton_accessor_storage;
        get _editButton() { return this.#_editButton_accessor_storage; }
        set _editButton(value) { this.#_editButton_accessor_storage = value; }
        #error_accessor_storage;
        get error() { return this.#error_accessor_storage; }
        set error(value) { this.#error_accessor_storage = value; }
        #onRetry_accessor_storage;
        get onRetry() { return this.#onRetry_accessor_storage; }
        set onRetry(value) { this.#onRetry_accessor_storage = value; }
        #model_accessor_storage;
        get model() { return this.#model_accessor_storage; }
        set model(value) { this.#model_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #inSurface_accessor_storage;
        get inSurface() { return this.#inSurface_accessor_storage; }
        set inSurface(value) { this.#inSurface_accessor_storage = value; }
        #options_accessor_storage;
        get options() { return this.#options_accessor_storage; }
        set options(value) { this.#options_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._editAbortController = null;
            this._toggleEdit = (e) => {
                e.stopPropagation();
                if (!this._editButton || this.readonly) {
                    return;
                }
                if (this._editAbortController) {
                    this._editAbortController.abort();
                }
                this._editAbortController = new AbortController();
                createLitPortal({
                    template: html `<embed-iframe-link-edit-popup
        .model=${this.model}
        .abortController=${this._editAbortController}
        .std=${this.std}
        .inSurface=${this.inSurface}
      ></embed-iframe-link-edit-popup>`,
                    container: document.body,
                    computePosition: {
                        referenceElement: this._editButton,
                        placement: 'bottom-start',
                        middleware: [flip(), offset(LINK_EDIT_POPUP_OFFSET)],
                        autoUpdate: { animationFrame: true },
                    },
                    abortController: this._editAbortController,
                    closeOnClickAway: true,
                });
            };
            this._handleRetry = async (e) => {
                e.stopPropagation();
                const success = await this.onRetry();
                // track retry event
                this.telemetryService?.track('ReloadLink', {
                    type: 'embed iframe block',
                    page: this.editorMode === 'page' ? 'doc editor' : 'whiteboard editor',
                    segment: 'editor',
                    module: 'embed block',
                    control: 'reload button',
                    result: success ? 'success' : 'failure',
                });
            };
            this.#_editButton_accessor_storage = __runInitializers(this, __editButton_initializers, null);
            this.#error_accessor_storage = (__runInitializers(this, __editButton_extraInitializers), __runInitializers(this, _error_initializers, null));
            this.#onRetry_accessor_storage = (__runInitializers(this, _error_extraInitializers), __runInitializers(this, _onRetry_initializers, void 0));
            this.#model_accessor_storage = (__runInitializers(this, _onRetry_extraInitializers), __runInitializers(this, _model_initializers, void 0));
            this.#std_accessor_storage = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            this.#inSurface_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _inSurface_initializers, false));
            this.#options_accessor_storage = (__runInitializers(this, _inSurface_extraInitializers), __runInitializers(this, _options_initializers, {
                layout: 'horizontal',
                height: ERROR_CARD_DEFAULT_HEIGHT,
            }));
            __runInitializers(this, _options_extraInitializers);
        }
    };
})();
export { EmbedIframeErrorCard };
export const EmbedIframeErrorIcon = html `<svg
  width="204"
  height="102"
  viewBox="0 0 204 102"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <g clip-path="url(#clip0_2676_106795)">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M94.6838 8.45092L106.173 31.9276L84.6593 57.0514L90.5888 64.9202C88.6083 64.6092 86.5089 65.0701 84.7813 66.3719L78.4802 71.1202C75.0967 73.6698 74.4207 78.4796 76.9704 81.8631C79.5201 85.2467 84.3299 85.9227 87.7134 83.373L89.4487 82.0654C90.3714 81.37 90.5558 80.0582 89.8604 79.1354C89.1651 78.2127 87.8533 78.0283 86.9305 78.7237L85.1952 80.0313C83.6573 81.1902 81.471 80.883 80.3121 79.345C79.1531 77.807 79.4604 75.6208 80.9984 74.4618L87.2995 69.7136C88.8375 68.5547 91.0237 68.8619 92.1827 70.3999C92.8645 71.3047 94.1389 71.4996 95.0582 70.8513L95.8982 71.966L94.6469 72.9089C93.109 74.0679 90.9227 73.7606 89.7638 72.2227C89.0684 71.2999 87.7566 71.1155 86.8339 71.8109C85.9111 72.5062 85.7267 73.818 86.4221 74.7408C88.9718 78.1243 93.7816 78.8003 97.1651 76.2506L98.4164 75.3077L99.8156 77.1646L86.8434 102.707L89.291 114.735L42.1397 108.108L56.3354 7.10072C56.6429 4.91308 58.6655 3.38889 60.8532 3.69634L94.6838 8.45092ZM122.987 12.4287L119.974 33.8672L95.4607 58.4925C98.7006 56.8928 102.722 57.7678 104.976 60.7594C107.526 64.1429 106.85 68.9527 103.466 71.5024L102.718 72.0665L105.949 78.0266L92.2105 103.461L92.9872 115.254L147.108 122.86L161.304 21.8531C161.611 19.6654 160.087 17.6428 157.899 17.3353L122.987 12.4287ZM100.701 68.3471L100.948 68.1607C102.486 67.0018 102.793 64.8155 101.634 63.2775C100.625 61.9381 98.8364 61.5321 97.3755 62.2152L100.701 68.3471ZM88.8231 36.502C84.6277 35.9124 80.7486 38.8354 80.159 43.0308L79.1885 49.9367C79.0277 51.0809 79.8249 52.1388 80.9691 52.2996C82.1133 52.4604 83.1712 51.6632 83.332 50.519L84.3025 43.6132C84.5705 41.7062 86.3337 40.3775 88.2407 40.6455L95.1466 41.6161C96.2908 41.7769 97.3487 40.9797 97.5095 39.8355C97.6703 38.6913 96.8731 37.6334 95.7289 37.4726L88.8231 36.502ZM115.065 40.1901C113.921 40.0293 112.863 40.8265 112.702 41.9707C112.542 43.1149 113.339 44.1728 114.483 44.3336L121.389 45.3042C123.296 45.5722 124.625 47.3354 124.357 49.2424L123.386 56.1483C123.225 57.2925 124.022 58.3504 125.167 58.5112C126.311 58.672 127.369 57.8748 127.529 56.7306L128.5 49.8247C129.09 45.6293 126.167 41.7503 121.971 41.1607L115.065 40.1901ZM123.031 73.7041C124.176 73.8649 124.973 74.9228 124.812 76.067L123.841 82.9728C123.252 87.1682 119.373 90.0913 115.177 89.5017L106.89 88.337C105.746 88.1762 104.949 87.1183 105.11 85.9741C105.27 84.8299 106.328 84.0327 107.473 84.1935L115.76 85.3582C117.667 85.6262 119.43 84.2975 119.698 82.3905L120.668 75.4847C120.829 74.3405 121.887 73.5433 123.031 73.7041Z"
      fill="#E6E6E6"
    />
  </g>
  <defs>
    <clipPath id="clip0_2676_106795">
      <rect width="204" height="102" fill="white" />
    </clipPath>
  </defs>
</svg>`;
