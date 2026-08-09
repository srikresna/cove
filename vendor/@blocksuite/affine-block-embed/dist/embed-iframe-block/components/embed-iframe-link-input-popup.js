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
import { DocModeProvider, TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { unsafeCSSVar, unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { CloseIcon } from '@blocksuite/icons/lit';
import { baseTheme } from '@toeverything/theme';
import { css, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { EmbedIframeLinkInputBase } from './embed-iframe-link-input-base';
const DEFAULT_OPTIONS = {
    showCloseButton: false,
    variant: 'default',
    title: 'Embed Link',
    description: 'Works with links of Google Drive, Spotify…',
    placeholder: 'Paste the Embed link...',
    telemetrySegment: 'editor',
};
let EmbedIframeLinkInputPopup = (() => {
    let _classSuper = EmbedIframeLinkInputBase;
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    return class EmbedIframeLinkInputPopup extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _options_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _options_decorators, { kind: "accessor", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .link-input-popup-main-wrapper {
      box-sizing: border-box;
      width: 340px;
      padding: 12px;
      border-radius: 8px;
      background: ${unsafeCSSVarV2('layer/background/overlayPanel')};
      box-shadow: ${unsafeCSSVar('overlayPanelShadow')};
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    }

    .link-input-popup-content-wrapper {
      display: flex;
      flex-direction: column;
    }

    .popup-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      color: var(--affine-icon-color);
      border-radius: 4px;
    }
    .popup-close-button:hover {
      background-color: var(--affine-hover-color);
    }

    .title {
      /* Client/h6 */
      font-size: var(--affine-font-base);
      font-style: normal;
      font-weight: 500;
      line-height: 24px;
      color: ${unsafeCSSVarV2('text/primary')};
    }

    .description {
      margin-top: 4px;
      font-feature-settings:
        'liga' off,
        'clig' off;
      font-size: var(--affine-font-sm);
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      color: ${unsafeCSSVarV2('text/secondary')};
    }

    .input-container {
      width: 100%;
      margin-top: 12px;
      box-sizing: border-box;

      .link-input {
        box-sizing: border-box;
        width: 100%;
        padding: 4px 10px;
        border-radius: 8px;
        border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
        background: ${unsafeCSSVarV2('input/background')};
      }

      .link-input:focus {
        border-color: var(--affine-blue-700);
        box-shadow: var(--affine-active-shadow);
        outline: none;
      }
      .link-input::placeholder {
        color: ${unsafeCSSVarV2('text/placeholder')};
      }
    }

    .button-container {
      display: flex;
      justify-content: center;
      margin-top: 12px;

      .confirm-button {
        width: 100%;
        height: 32px;
        line-height: 32px;
        text-align: center;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        background: ${unsafeCSSVarV2('button/primary')};
        border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};

        color: ${unsafeCSSVarV2('button/pureWhiteText')};
        /* Client/xsMedium */
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        cursor: pointer;
      }

      .confirm-button[disabled] {
        opacity: 0.5;
      }
    }

    .link-input-popup-main-wrapper.mobile {
      width: 360px;
      border-radius: 22px;
      padding: 12px 0;

      .popup-close-button {
        top: 20px;
        right: 16px;
      }

      .link-input-popup-content-wrapper {
        gap: 0;

        .title {
          padding: 10px 16px;
          font-weight: 500;
        }

        .input-container {
          padding: 4px 12px;
        }

        .link-input {
          padding: 11px 10px;
          font-size: 17px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: -0.43px;
        }

        .title,
        .description {
          font-size: 17px;
          font-style: normal;
          line-height: 22px; /* 129.412% */
          letter-spacing: -0.43px;
        }

        .description {
          font-weight: 400;
          text-align: left;
          order: 2;
          padding: 11px 16px;
          color: ${unsafeCSSVarV2('text/secondary')};
        }

        .input-container {
          order: 1;
        }
      }

      .description,
      .input-container,
      .button-container {
        margin-top: 0;
      }

      .button-container {
        padding: 4px 16px;

        .confirm-button {
          height: 40px;
          line-height: 40px;
          font-size: 17px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: -0.43px;
        }

        .confirm-button[disabled] {
          opacity: 1;
          background: ${unsafeCSSVarV2('button/disable')};
        }
      }
    }
  `; }
        track(status) {
            this.telemetryService?.track('CreateEmbedBlock', {
                type: 'embed iframe block',
                page: this.editorMode === 'page' ? 'doc editor' : 'whiteboard editor',
                segment: this.options?.telemetrySegment ?? 'editor',
                module: 'embed block',
                control: 'confirm embed link',
                result: status,
            });
        }
        render() {
            const options = { ...DEFAULT_OPTIONS, ...this.options };
            const { showCloseButton, variant, title, description, placeholder } = options;
            const modalMainWrapperClass = classMap({
                'link-input-popup-main-wrapper': true,
                mobile: variant === 'mobile',
            });
            return html `
      <div class=${modalMainWrapperClass}>
        ${showCloseButton
                ? html `
              <div class="popup-close-button" @click=${this._onClose}>
                ${CloseIcon({ width: '20', height: '20' })}
              </div>
            `
                : nothing}
        <div class="link-input-popup-content-wrapper">
          <div class="title">${title}</div>
          <div class="description">${description}</div>
          <div class="input-container">
            <input
              class="link-input"
              type="text"
              placeholder=${ifDefined(placeholder)}
              @input=${this.handleInput}
              @keydown=${this.handleKeyDown}
            />
          </div>
        </div>
        <div class="button-container">
          <div
            class="confirm-button"
            @click=${this.onConfirm}
            ?disabled=${this.isInputEmpty()}
          >
            Confirm
          </div>
        </div>
      </div>
    `;
        }
        get telemetryService() {
            return this.std.getOptional(TelemetryProvider);
        }
        get editorMode() {
            const docModeService = this.std.get(DocModeProvider);
            const mode = docModeService.getEditorMode();
            return mode ?? 'page';
        }
        #options_accessor_storage;
        get options() { return this.#options_accessor_storage; }
        set options(value) { this.#options_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._onClose = () => {
                this.abortController?.abort();
            };
            this.#options_accessor_storage = __runInitializers(this, _options_initializers, undefined);
            __runInitializers(this, _options_extraInitializers);
        }
    };
})();
export { EmbedIframeLinkInputPopup };
