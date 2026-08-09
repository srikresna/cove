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
import { ColorScheme } from '@blocksuite/affine-model';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { DeleteIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import {} from '@blocksuite/std/gfx';
import { css, html, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { DarkDeletedSmallBanner, LightDeletedSmallBanner } from '../icons';
import { getReferenceModelTitle, TYPE_ICON_MAP } from '../utils';
let SurfaceRefPlaceHolder = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _referenceModel_decorators;
    let _referenceModel_initializers = [];
    let _referenceModel_extraInitializers = [];
    let _refFlavour_decorators;
    let _refFlavour_initializers = [];
    let _refFlavour_extraInitializers = [];
    let _inEdgeless_decorators;
    let _inEdgeless_initializers = [];
    let _inEdgeless_extraInitializers = [];
    let _theme_decorators;
    let _theme_initializers = [];
    let _theme_extraInitializers = [];
    return class SurfaceRefPlaceHolder extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _referenceModel_decorators = [property({ attribute: false })];
            _refFlavour_decorators = [property({ attribute: false })];
            _inEdgeless_decorators = [property({ attribute: false })];
            _theme_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _referenceModel_decorators, { kind: "accessor", name: "referenceModel", static: false, private: false, access: { has: obj => "referenceModel" in obj, get: obj => obj.referenceModel, set: (obj, value) => { obj.referenceModel = value; } }, metadata: _metadata }, _referenceModel_initializers, _referenceModel_extraInitializers);
            __esDecorate(this, null, _refFlavour_decorators, { kind: "accessor", name: "refFlavour", static: false, private: false, access: { has: obj => "refFlavour" in obj, get: obj => obj.refFlavour, set: (obj, value) => { obj.refFlavour = value; } }, metadata: _metadata }, _refFlavour_initializers, _refFlavour_extraInitializers);
            __esDecorate(this, null, _inEdgeless_decorators, { kind: "accessor", name: "inEdgeless", static: false, private: false, access: { has: obj => "inEdgeless" in obj, get: obj => obj.inEdgeless, set: (obj, value) => { obj.inEdgeless = value; } }, metadata: _metadata }, _inEdgeless_initializers, _inEdgeless_extraInitializers);
            __esDecorate(this, null, _theme_decorators, { kind: "accessor", name: "theme", static: false, private: false, access: { has: obj => "theme" in obj, get: obj => obj.theme, set: (obj, value) => { obj.theme = value; } }, metadata: _metadata }, _theme_initializers, _theme_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .surface-ref-placeholder {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
    }

    .surface-ref-placeholder.not-found {
      background: ${unsafeCSSVarV2('layer/background/secondary', '#F5F5F5')};
    }

    .surface-ref-placeholder-heading {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      align-self: stretch;

      font-size: 14px;
      font-weight: 500;
      line-height: 22px;

      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;

      color: ${unsafeCSSVarV2('text/primary', '#141414')};
    }

    .surface-ref-placeholder-body {
      position: relative;
      font-size: 12px;
      font-weight: 400;
      line-height: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      color: ${unsafeCSSVarV2('text/disable', '#7a7a7a')};
    }

    .surface-ref-not-found-background {
      position: absolute;
      right: 12px;
      bottom: -5px;
    }
  `; }
        #referenceModel_accessor_storage = __runInitializers(this, _referenceModel_initializers, null);
        get referenceModel() { return this.#referenceModel_accessor_storage; }
        set referenceModel(value) { this.#referenceModel_accessor_storage = value; }
        #refFlavour_accessor_storage = (__runInitializers(this, _referenceModel_extraInitializers), __runInitializers(this, _refFlavour_initializers, ''));
        get refFlavour() { return this.#refFlavour_accessor_storage; }
        set refFlavour(value) { this.#refFlavour_accessor_storage = value; }
        #inEdgeless_accessor_storage = (__runInitializers(this, _refFlavour_extraInitializers), __runInitializers(this, _inEdgeless_initializers, false));
        get inEdgeless() { return this.#inEdgeless_accessor_storage; }
        set inEdgeless(value) { this.#inEdgeless_accessor_storage = value; }
        #theme_accessor_storage = (__runInitializers(this, _inEdgeless_extraInitializers), __runInitializers(this, _theme_initializers, ColorScheme.Light));
        get theme() { return this.#theme_accessor_storage; }
        set theme(value) { this.#theme_accessor_storage = value; }
        render() {
            const { referenceModel, refFlavour, inEdgeless } = this;
            // When surface ref is in page mode and reference exists, don't render placeholder
            if (referenceModel && !inEdgeless)
                return nothing;
            const modelNotFound = !referenceModel;
            const matchedType = TYPE_ICON_MAP[refFlavour] ?? TYPE_ICON_MAP['edgeless'];
            const title = (referenceModel && getReferenceModelTitle(referenceModel)) ??
                matchedType.name;
            const notFoundBackground = this.theme === ColorScheme.Light
                ? LightDeletedSmallBanner
                : DarkDeletedSmallBanner;
            return html `
      <div
        class=${classMap({
                'surface-ref-placeholder': true,
                'not-found': modelNotFound,
            })}
      >
        ${modelNotFound
                ? html `<div class="surface-ref-not-found-background">
              ${notFoundBackground}
            </div>`
                : nothing}
        <div class="surface-ref-placeholder-heading">
          ${modelNotFound ? DeleteIcon() : matchedType.icon}
          <span class="surface-ref-title">
            ${modelNotFound
                ? `This ${matchedType.name} not available`
                : `${title}`}
          </span>
        </div>
        <div class="surface-ref-placeholder-body">
          <span class="surface-ref-text">
            ${modelNotFound
                ? `The ${matchedType.name.toLowerCase()} is deleted or not in this doc.`
                : `The ${matchedType.name.toLowerCase()} is inserted but cannot display in edgeless mode. Switch to page mode to view the block.`}
          </span>
        </div>
      </div>
    `;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _theme_extraInitializers);
        }
    };
})();
export { SurfaceRefPlaceHolder };
