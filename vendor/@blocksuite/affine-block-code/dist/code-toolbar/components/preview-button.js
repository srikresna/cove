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
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { css, html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CodeBlockPreviewIdentifier } from '../../code-preview-extension';
let PreviewButton = (() => {
    let _classSuper = WithDisposable(SignalWatcher(LitElement));
    let _blockComponent_decorators;
    let _blockComponent_initializers = [];
    let _blockComponent_extraInitializers = [];
    return class PreviewButton extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _blockComponent_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _blockComponent_decorators, { kind: "accessor", name: "blockComponent", static: false, private: false, access: { has: obj => "blockComponent" in obj, get: obj => obj.blockComponent, set: (obj, value) => { obj.blockComponent = value; } }, metadata: _metadata }, _blockComponent_initializers, _blockComponent_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      margin-right: auto;
    }

    .preview-toggle-container {
      display: flex;
      padding: 2px;
      align-items: flex-start;
      gap: 4px;
      border-radius: 4px;
      background: ${unsafeCSSVarV2('segment/background')};
    }

    .toggle-button {
      display: flex;
      padding: 0px 4px;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 4px;
      color: ${unsafeCSSVarV2('text/primary')};
      font-family: Inter;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }

    .toggle-button:hover {
      background: ${unsafeCSSVarV2('layer/background/hoverOverlay')};
    }

    .toggle-button.active {
      background: ${unsafeCSSVarV2('segment/button')};
      box-shadow:
        var(--Shadow-buttonShadow-1-x, 0px) var(--Shadow-buttonShadow-1-y, 0px)
          var(--Shadow-buttonShadow-1-blur, 1px) 0px
          var(--Shadow-buttonShadow-1-color, rgba(0, 0, 0, 0.12)),
        var(--Shadow-buttonShadow-2-x, 0px) var(--Shadow-buttonShadow-2-y, 1px)
          var(--Shadow-buttonShadow-2-blur, 5px) 0px
          var(--Shadow-buttonShadow-2-color, rgba(0, 0, 0, 0.12));
    }
  `; }
        get preview() {
            return this.blockComponent.preview$.value;
        }
        render() {
            const lang = this.blockComponent.model.props.language$.value ?? '';
            const previewContext = this.blockComponent.std.getOptional(CodeBlockPreviewIdentifier(lang));
            if (!previewContext)
                return nothing;
            return html `
      <div class="preview-toggle-container">
        <div
          class=${classMap({
                'toggle-button': true,
                active: !this.preview,
            })}
          @click=${() => this._toggle(false)}
        >
          Code
        </div>
        <div
          class=${classMap({
                'toggle-button': true,
                active: this.preview,
            })}
          @click=${() => this._toggle(true)}
        >
          Preview
        </div>
      </div>
    `;
        }
        #blockComponent_accessor_storage;
        get blockComponent() { return this.#blockComponent_accessor_storage; }
        set blockComponent(value) { this.#blockComponent_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._toggle = (value) => {
                this.blockComponent.setPreviewState(value);
                const std = this.blockComponent.std;
                const mode = std.getOptional(DocModeProvider)?.getEditorMode() ?? 'page';
                const telemetryService = std.getOptional(TelemetryProvider);
                if (!telemetryService)
                    return;
                telemetryService.track('htmlBlockTogglePreview', {
                    page: mode,
                    segment: 'code block',
                    module: 'code toolbar container',
                    control: 'preview toggle button',
                });
            };
            this.#blockComponent_accessor_storage = __runInitializers(this, _blockComponent_initializers, void 0);
            __runInitializers(this, _blockComponent_extraInitializers);
        }
    };
})();
export { PreviewButton };
