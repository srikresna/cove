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
import { ShadowlessElement } from '@blocksuite/std';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
export const SURFACE_IMAGE_CARD_WIDTH = 220;
export const SURFACE_IMAGE_CARD_HEIGHT = 122;
export const NOTE_IMAGE_CARD_WIDTH = 752;
export const NOTE_IMAGE_CARD_HEIGHT = 78;
let ImageBlockFallbackCard = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _state_decorators;
    let _state_initializers = [];
    let _state_extraInitializers = [];
    return class ImageBlockFallbackCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _state_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _state_decorators, { kind: "accessor", name: "state", static: false, private: false, access: { has: obj => "state" in obj, get: obj => obj.state, set: (obj, value) => { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    affine-image-fallback-card {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .affine-image-fallback-card {
      display: flex;
      flex: 1;
      gap: 8px;
      align-self: stretch;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 8px;
      border: 1px solid ${unsafeCSSVarV2('layer/background/tertiary')};
      background: ${unsafeCSSVarV2('layer/background/secondary')};
      padding: 12px;
    }

    .truncate {
      align-self: stretch;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .affine-image-fallback-card-title {
      display: flex;
      flex-direction: row;
      gap: 8px;
      align-items: center;
      align-self: stretch;
    }

    .affine-image-fallback-card-title-icon {
      display: flex;
      width: 16px;
      height: 16px;
      align-items: center;
      justify-content: center;
      color: var(--affine-text-primary-color);
    }

    .affine-image-fallback-card-title-text {
      color: var(--affine-placeholder-color);
      font-family: var(--affine-font-family);
      font-size: var(--affine-font-sm);
      font-style: normal;
      font-weight: 600;
      line-height: 22px;
    }

    .affine-image-fallback-card-description {
      color: var(--affine-text-secondary-color);
      font-family: var(--affine-font-family);
      font-size: var(--affine-font-xs);
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }

    .affine-image-fallback-card.loading {
      .affine-image-fallback-card-title {
        color: var(--affine-placeholder-color);
      }
    }

    .affine-image-fallback-card.error {
      .affine-image-fallback-card-title-icon {
        color: ${unsafeCSSVarV2('status/error')};
      }
    }
  `; }
        render() {
            const { icon, title, description, loading, error } = this.state;
            const classInfo = {
                'affine-image-fallback-card': true,
                'drag-target': true,
                loading,
                error,
            };
            return html `
      <div class=${classMap(classInfo)}>
        <div class="affine-image-fallback-card-title">
          <div class="affine-image-fallback-card-title-icon">${icon}</div>
          <div class="affine-image-fallback-card-title-text truncate">
            ${title}
          </div>
        </div>
        <div class="affine-image-fallback-card-description truncate">
          ${description}
        </div>
      </div>
    `;
        }
        #state_accessor_storage = __runInitializers(this, _state_initializers, void 0);
        get state() { return this.#state_accessor_storage; }
        set state(value) { this.#state_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _state_extraInitializers);
        }
    };
})();
export { ImageBlockFallbackCard };
