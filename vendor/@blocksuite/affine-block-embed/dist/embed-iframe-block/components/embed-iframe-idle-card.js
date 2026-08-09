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
import { WithDisposable } from '@blocksuite/global/lit';
import { EmbedIcon } from '@blocksuite/icons/lit';
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import { IDLE_CARD_DEFAULT_HEIGHT } from '../consts';
let EmbedIframeIdleCard = (() => {
    let _classSuper = WithDisposable(LitElement);
    let _options_decorators;
    let _options_initializers = [];
    let _options_extraInitializers = [];
    return class EmbedIframeIdleCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _options_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _options_decorators, { kind: "accessor", name: "options", static: false, private: false, access: { has: obj => "options" in obj, get: obj => obj.options, set: (obj, value) => { obj.options = value; } }, metadata: _metadata }, _options_initializers, _options_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      width: 100%;
      height: 100%;
    }

    .affine-embed-iframe-idle-card {
      container: affine-embed-iframe-idle-card / size;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      padding: 12px;
      gap: 8px;
      border-radius: 8px;
      background-color: ${unsafeCSSVarV2('layer/background/secondary')};

      .icon {
        display: flex;
        justify-content: center;
        align-items: center;
        color: ${unsafeCSSVarV2('icon/secondary')};
        flex-shrink: 0;
      }

      .text {
        /* Client/base */
        font-size: 15px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px; /* 160% */
        font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
        color: ${unsafeCSSVarV2('text/secondary')};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .affine-embed-iframe-idle-card:hover {
      cursor: pointer;
    }

    .affine-embed-iframe-idle-card.horizontal {
      flex-direction: row;

      .icon {
        width: 24px;
        height: 24px;

        svg {
          width: 24px;
          height: 24px;
        }
      }
    }

    .affine-embed-iframe-idle-card.vertical {
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      gap: 12px;

      .icon {
        width: 176px;
        height: 112px;
        overflow-y: hidden;

        svg {
          width: 112px;
          height: 112px;
          transform: rotate(12deg) translateY(18%);
        }
      }

      .text {
        text-align: center;
        white-space: normal;
        word-break: break-word;
      }

      @container affine-embed-iframe-idle-card (height < 180px) {
        .icon {
          display: none;
        }
      }
    }
  `; }
        render() {
            const { layout, width, height } = this.options;
            const cardClasses = classMap({
                'affine-embed-iframe-idle-card': true,
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
        <span class="icon"> ${EmbedIcon()} </span>
        <span class="text">
          Embed anything (Google Drive, Google Docs, Spotify, Miro…)
        </span>
      </div>
    `;
        }
        #options_accessor_storage = __runInitializers(this, _options_initializers, {
            layout: 'horizontal',
            height: IDLE_CARD_DEFAULT_HEIGHT,
        });
        get options() { return this.#options_accessor_storage; }
        set options(value) { this.#options_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _options_extraInitializers);
        }
    };
})();
export { EmbedIframeIdleCard };
