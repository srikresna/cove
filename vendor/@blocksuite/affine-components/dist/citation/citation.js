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
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, nothing, unsafeCSS, } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
let CitationCard = (() => {
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _icon_decorators;
    let _icon_initializers = [];
    let _icon_extraInitializers = [];
    let _citationTitle_decorators;
    let _citationTitle_initializers = [];
    let _citationTitle_extraInitializers = [];
    let _citationContent_decorators;
    let _citationContent_initializers = [];
    let _citationContent_extraInitializers = [];
    let _citationIdentifier_decorators;
    let _citationIdentifier_initializers = [];
    let _citationIdentifier_extraInitializers = [];
    let _onClickCallback_decorators;
    let _onClickCallback_initializers = [];
    let _onClickCallback_extraInitializers = [];
    let _onDoubleClickCallback_decorators;
    let _onDoubleClickCallback_initializers = [];
    let _onDoubleClickCallback_extraInitializers = [];
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    return class CitationCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _icon_decorators = [property({ attribute: false })];
            _citationTitle_decorators = [property({ attribute: false })];
            _citationContent_decorators = [property({ attribute: false })];
            _citationIdentifier_decorators = [property({ attribute: false })];
            _onClickCallback_decorators = [property({ attribute: false })];
            _onDoubleClickCallback_decorators = [property({ attribute: false })];
            _active_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _icon_decorators, { kind: "accessor", name: "icon", static: false, private: false, access: { has: obj => "icon" in obj, get: obj => obj.icon, set: (obj, value) => { obj.icon = value; } }, metadata: _metadata }, _icon_initializers, _icon_extraInitializers);
            __esDecorate(this, null, _citationTitle_decorators, { kind: "accessor", name: "citationTitle", static: false, private: false, access: { has: obj => "citationTitle" in obj, get: obj => obj.citationTitle, set: (obj, value) => { obj.citationTitle = value; } }, metadata: _metadata }, _citationTitle_initializers, _citationTitle_extraInitializers);
            __esDecorate(this, null, _citationContent_decorators, { kind: "accessor", name: "citationContent", static: false, private: false, access: { has: obj => "citationContent" in obj, get: obj => obj.citationContent, set: (obj, value) => { obj.citationContent = value; } }, metadata: _metadata }, _citationContent_initializers, _citationContent_extraInitializers);
            __esDecorate(this, null, _citationIdentifier_decorators, { kind: "accessor", name: "citationIdentifier", static: false, private: false, access: { has: obj => "citationIdentifier" in obj, get: obj => obj.citationIdentifier, set: (obj, value) => { obj.citationIdentifier = value; } }, metadata: _metadata }, _citationIdentifier_initializers, _citationIdentifier_extraInitializers);
            __esDecorate(this, null, _onClickCallback_decorators, { kind: "accessor", name: "onClickCallback", static: false, private: false, access: { has: obj => "onClickCallback" in obj, get: obj => obj.onClickCallback, set: (obj, value) => { obj.onClickCallback = value; } }, metadata: _metadata }, _onClickCallback_initializers, _onClickCallback_extraInitializers);
            __esDecorate(this, null, _onDoubleClickCallback_decorators, { kind: "accessor", name: "onDoubleClickCallback", static: false, private: false, access: { has: obj => "onDoubleClickCallback" in obj, get: obj => obj.onDoubleClickCallback, set: (obj, value) => { obj.onDoubleClickCallback = value; } }, metadata: _metadata }, _onDoubleClickCallback_initializers, _onDoubleClickCallback_extraInitializers);
            __esDecorate(this, null, _active_decorators, { kind: "accessor", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .citation-container {
      width: 100%;
      box-sizing: border-box;
      border-radius: 8px;
      display: flex;
      gap: 2px;
      flex-direction: column;
      align-items: flex-start;
      align-self: stretch;
      padding: 4px 8px;
      background-color: ${unsafeCSSVarV2('layer/background/primary')};
      border: 0.5px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      cursor: pointer;
    }

    .citation-header {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;

      .citation-icon {
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

      .citation-title {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
        line-height: 22px;
        color: ${unsafeCSSVarV2('text/primary')};
        font-size: var(--affine-font-sm);
        font-weight: 500;
      }

      .citation-identifier {
        display: flex;
        width: 14px;
        height: 14px;
        justify-content: center;
        align-items: center;
        border-radius: 36px;
        background: ${unsafeCSSVarV2('block/footnote/numberBg')};
        color: ${unsafeCSSVarV2('text/primary')};
        text-align: center;
        font-size: 10px;
        font-style: normal;
        font-weight: 400;
        line-height: 22px; /* 220% */
        transition: background-color 0.3s ease-in-out;
      }
    }

    .citation-container:hover .citation-identifier,
    .citation-identifier.active {
      background: ${unsafeCSSVarV2('button/primary')};
      color: ${unsafeCSSVarV2('button/pureWhiteText')};
    }

    .citation-content {
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      color: ${unsafeCSSVarV2('text/primary')};
      font-feature-settings:
        'liga' off,
        'clig' off;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--affine-font-xs);
      font-style: normal;
      font-weight: 400;
      line-height: 20px; /* 166.667% */
    }
  `; }
        render() {
            const citationIdentifierClasses = classMap({
                'citation-identifier': true,
                active: this.active,
            });
            return html `
      <div
        class="citation-container"
        @click=${this.onClickCallback}
        @dblclick=${this.onDoubleClickCallback}
      >
        <div class="citation-header">
          ${this.icon
                ? html `<div class="citation-icon">
                ${this._IconTemplate(this.icon)}
              </div>`
                : nothing}
          <div class="citation-title">${this.citationTitle}</div>
          <div class=${citationIdentifierClasses}>
            ${this.citationIdentifier}
          </div>
        </div>
        ${this.citationContent
                ? html `<div class="citation-content">${this.citationContent}</div>`
                : nothing}
      </div>
    `;
        }
        #icon_accessor_storage;
        get icon() { return this.#icon_accessor_storage; }
        set icon(value) { this.#icon_accessor_storage = value; }
        #citationTitle_accessor_storage;
        get citationTitle() { return this.#citationTitle_accessor_storage; }
        set citationTitle(value) { this.#citationTitle_accessor_storage = value; }
        #citationContent_accessor_storage;
        get citationContent() { return this.#citationContent_accessor_storage; }
        set citationContent(value) { this.#citationContent_accessor_storage = value; }
        #citationIdentifier_accessor_storage;
        get citationIdentifier() { return this.#citationIdentifier_accessor_storage; }
        set citationIdentifier(value) { this.#citationIdentifier_accessor_storage = value; }
        #onClickCallback_accessor_storage;
        get onClickCallback() { return this.#onClickCallback_accessor_storage; }
        set onClickCallback(value) { this.#onClickCallback_accessor_storage = value; }
        #onDoubleClickCallback_accessor_storage;
        get onDoubleClickCallback() { return this.#onDoubleClickCallback_accessor_storage; }
        set onDoubleClickCallback(value) { this.#onDoubleClickCallback_accessor_storage = value; }
        #active_accessor_storage;
        get active() { return this.#active_accessor_storage; }
        set active(value) { this.#active_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._IconTemplate = (icon) => {
                if (typeof icon === 'string') {
                    return html `<img src="${icon}" alt="favicon" />`;
                }
                return icon;
            };
            this.#icon_accessor_storage = __runInitializers(this, _icon_initializers, undefined);
            this.#citationTitle_accessor_storage = (__runInitializers(this, _icon_extraInitializers), __runInitializers(this, _citationTitle_initializers, ''));
            this.#citationContent_accessor_storage = (__runInitializers(this, _citationTitle_extraInitializers), __runInitializers(this, _citationContent_initializers, undefined));
            this.#citationIdentifier_accessor_storage = (__runInitializers(this, _citationContent_extraInitializers), __runInitializers(this, _citationIdentifier_initializers, ''));
            this.#onClickCallback_accessor_storage = (__runInitializers(this, _citationIdentifier_extraInitializers), __runInitializers(this, _onClickCallback_initializers, undefined));
            this.#onDoubleClickCallback_accessor_storage = (__runInitializers(this, _onClickCallback_extraInitializers), __runInitializers(this, _onDoubleClickCallback_initializers, undefined));
            this.#active_accessor_storage = (__runInitializers(this, _onDoubleClickCallback_extraInitializers), __runInitializers(this, _active_initializers, false));
            __runInitializers(this, _active_extraInitializers);
        }
    };
})();
export { CitationCard };
