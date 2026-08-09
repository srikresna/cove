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
import { stopPropagation } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { ViewBarIcon } from '@blocksuite/icons/lit';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { baseTheme } from '@toeverything/theme';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
/**
 * Compact zoom indicator for narrow / mobile edgeless viewports.
 * Shows the live zoom percentage and a fit-to-screen action in a pill HUD
 * anchored to the bottom-left of the canvas.
 */
let MobileZoomRuler = (() => {
    let _classSuper = WithDisposable(LitElement);
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    return class MobileZoomRuler extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
      pointer-events: auto;
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    }

    .zoom-pill {
      display: flex;
      align-items: center;
      height: 32px;
      background: var(--affine-background-overlay-panel-color);
      border: 1px solid var(--affine-border-color);
      border-radius: 999px;
      box-shadow: var(--affine-shadow-1);
      overflow: hidden;
    }

    .zoom-label {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      color: var(--affine-text-secondary-color);
      white-space: nowrap;
      user-select: none;
    }

    .divider {
      width: 1px;
      height: 16px;
      background: var(--affine-border-color);
      flex-shrink: 0;
    }

    .fit-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 100%;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--affine-icon-color);
      cursor: pointer;
    }

    .fit-button:hover:not(:disabled) {
      background: var(--affine-hover-color);
      color: var(--affine-primary-color);
    }

    .fit-button:disabled {
      cursor: not-allowed;
      color: var(--affine-text-disable-color);
    }

    .fit-button svg {
      width: 20px;
      height: 20px;
    }
  `; }
        get gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        get viewport() {
            return this.gfx.viewport;
        }
        get zoom() {
            if (!this.viewport) {
                return 1;
            }
            return this.viewport.zoom;
        }
        firstUpdated() {
            const { disposables } = this;
            const viewport = this.viewport;
            if (!viewport) {
                return;
            }
            disposables.add(viewport.viewportUpdated.subscribe(() => this.requestUpdate()));
            disposables.add(viewport.zoomUpdated.subscribe(() => this.requestUpdate()));
        }
        render() {
            const formattedZoom = `${Math.round(this.zoom * 100)}%`;
            const locked = this.viewport?.locked || this.std.store.readonly;
            return html `
      <div
        class="zoom-pill"
        @dblclick=${stopPropagation}
        @mousedown=${stopPropagation}
        @mouseup=${stopPropagation}
        @pointerdown=${stopPropagation}
      >
        <span class="zoom-label">${formattedZoom}</span>
        <span class="divider"></span>
        <button
          class="fit-button"
          aria-label="Fit to screen"
          ?disabled=${locked}
          @click=${() => this.gfx.fitToScreen()}
        >
          ${ViewBarIcon()}
        </button>
      </div>
    `;
        }
        #std_accessor_storage = __runInitializers(this, _std_initializers, void 0);
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _std_extraInitializers);
        }
    };
})();
export { MobileZoomRuler };
