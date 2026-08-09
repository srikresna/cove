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
import { LoadingIcon } from '@blocksuite/affine-components/icons';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { EmbedIcon } from '@blocksuite/icons/lit';
import {} from '@blocksuite/std';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { LOADING_CARD_DEFAULT_HEIGHT } from '../consts';
let EmbedIframeLoadingCard = (() => {
    let _classSuper = LitElement;
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    return class EmbedIframeLoadingCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _std_decorators = [property({ attribute: false })];
            _options_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _options_decorators, { kind: "accessor", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      width: 100%;
      height: 100%;
    }

    .affine-embed-iframe-loading-card {
      container: affine-embed-iframe-loading-card / size;
      display: flex;
      box-sizing: border-box;
      border-radius: 8px;
      user-select: none;
      padding: 12px;
      gap: 12px;
      overflow: hidden;
      border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
      background: ${unsafeCSSVarV2('layer/white')};

      .loading-content {
        display: flex;
        gap: 8px;
        align-self: stretch;

        .loading-spinner {
          display: flex;
          width: 24px;
          height: 24px;
          justify-content: center;
          align-items: center;
        }

        .loading-text {
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          overflow: hidden;
          color: ${unsafeCSSVarV2('text/primary')};
          text-overflow: ellipsis;
          /* Client/smMedium */
          font-family: Inter;
          font-size: var(--affine-font-sm);
          font-style: normal;
          font-weight: 500;
          line-height: 22px; /* 157.143% */
        }
      }

      .loading-banner {
        display: flex;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;

        .icon-box {
          display: flex;
          transform: rotate(8deg);
          justify-content: center;
          align-items: center;
          flex-shrink: 0;
          border-radius: 4px 4px 0px 0px;
          background: ${unsafeCSSVarV2('slashMenu/background')};
          box-shadow: 0px 0px 5px 0px rgba(66, 65, 73, 0.17);

          svg {
            fill: black;
            fill-opacity: 0.07;
          }
        }
      }

      @container affine-embed-iframe-loading-card (width < 360px) {
        .loading-banner {
          display: none;
        }
      }
    }

    .affine-embed-iframe-loading-card.horizontal {
      flex-direction: row;
      align-items: flex-start;

      .loading-content {
        flex: 1 0 0;
        align-items: flex-start;

        .loading-text {
          flex: 1 0 0;
        }
      }

      .loading-banner {
        width: 204px;
        padding: 3.139px 42.14px 0px 42.14px;

        .icon-box {
          width: 106px;
          height: 106px;

          svg {
            width: 66px;
            height: 66px;
          }
        }
      }
    }

    .affine-embed-iframe-loading-card.vertical {
      flex-direction: column-reverse;
      align-items: center;
      justify-content: center;

      .loading-content {
        justify-content: center;
        font-size: 14px;
        transform: translateX(-2%);
      }

      .loading-banner {
        width: 340px;
        padding: 5.23px 70.234px 0px 70.232px;
        overflow-y: hidden;

        .icon-box {
          width: 176px;
          height: 176px;
          transform: rotate(8deg) translateY(15%);

          svg {
            width: 112px;
            height: 112px;
          }
        }
      }

      @container affine-embed-iframe-loading-card (height < 240px) {
        .loading-banner {
          display: none;
        }
      }
    }
  `; }
        render() {
            const { layout, width, height } = this.options;
            const cardClasses = classMap({
                'affine-embed-iframe-loading-card': true,
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
        <div class="loading-content">
          <div class="loading-spinner">${LoadingIcon()}</div>
          <div class="loading-text">Loading...</div>
        </div>
        <div class="loading-banner">
          <div class="icon-box">${EmbedIcon()}</div>
        </div>
      </div>
    `;
        }
        #std_accessor_storage = __runInitializers(this, _std_initializers, void 0);
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #options_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _options_initializers, {
            layout: 'horizontal',
            height: LOADING_CARD_DEFAULT_HEIGHT,
        }));
        get options() { return this.#options_accessor_storage; }
        set options(value) { this.#options_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _options_extraInitializers);
        }
    };
})();
export { EmbedIframeLoadingCard };
