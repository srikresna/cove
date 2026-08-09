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
import { getHostName, isValidUrl, normalizeUrl, } from '@blocksuite/affine-shared/utils';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit-html';
let LinkPreview = (() => {
    let _classDecorators = [requiredProperties({
            url: PropTypes.string,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _url_decorators;
    let _url_initializers = [];
    let _url_extraInitializers = [];
    var LinkPreview = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _url_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _url_decorators, { kind: "accessor", name: "url", static: false, private: false, access: { has: obj => "url" in obj, get: obj => obj.url, set: (obj, value) => { obj.url = value; } }, metadata: _metadata }, _url_initializers, _url_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            LinkPreview = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .affine-link-preview {
      display: flex;
      justify-content: flex-start;
      min-width: 60px;
      max-width: 140px;
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

    .affine-link-preview > span {
      display: inline-block;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;

      text-overflow: ellipsis;
      overflow: hidden;
    }
  `; }
        #url_accessor_storage = __runInitializers(this, _url_initializers, void 0);
        get url() { return this.#url_accessor_storage; }
        set url(value) { this.#url_accessor_storage = value; }
        render() {
            const { url } = this;
            const normalizedUrl = normalizeUrl(url);
            const safeUrl = normalizedUrl && isValidUrl(normalizedUrl) ? normalizedUrl : null;
            const hostName = getHostName(safeUrl ?? url);
            if (!safeUrl) {
                return html `
        <span class="affine-link-preview">
          <span>${hostName}</span>
        </span>
      `;
            }
            return html `
      <a
        class="affine-link-preview"
        rel="noopener noreferrer"
        target="_blank"
        href=${safeUrl}
      >
        <span>${hostName}</span>
      </a>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _url_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return LinkPreview = _classThis;
})();
export { LinkPreview };
