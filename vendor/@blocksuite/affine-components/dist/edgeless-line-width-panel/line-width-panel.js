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
import { BRUSH_LINE_WIDTHS, LineWidth } from '@blocksuite/affine-model';
import { WithDisposable } from '@blocksuite/global/lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
let EdgelessLineWidthPanel = (() => {
    let _classSuper = WithDisposable(LitElement);
    let _disabled_decorators;
    let _disabled_initializers = [];
    let _disabled_extraInitializers = [];
    let _hasTooltip_decorators;
    let _hasTooltip_initializers = [];
    let _hasTooltip_extraInitializers = [];
    let _lineWidths_decorators;
    let _lineWidths_initializers = [];
    let _lineWidths_extraInitializers = [];
    let _selectedSize_decorators;
    let _selectedSize_initializers = [];
    let _selectedSize_extraInitializers = [];
    return class EdgelessLineWidthPanel extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _disabled_decorators = [property({ attribute: false })];
            _hasTooltip_decorators = [property({ attribute: false })];
            _lineWidths_decorators = [property({ attribute: false })];
            _selectedSize_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _disabled_decorators, { kind: "accessor", name: "disabled", static: false, private: false, access: { has: obj => "disabled" in obj, get: obj => obj.disabled, set: (obj, value) => { obj.disabled = value; } }, metadata: _metadata }, _disabled_initializers, _disabled_extraInitializers);
            __esDecorate(this, null, _hasTooltip_decorators, { kind: "accessor", name: "hasTooltip", static: false, private: false, access: { has: obj => "hasTooltip" in obj, get: obj => obj.hasTooltip, set: (obj, value) => { obj.hasTooltip = value; } }, metadata: _metadata }, _hasTooltip_initializers, _hasTooltip_extraInitializers);
            __esDecorate(this, null, _lineWidths_decorators, { kind: "accessor", name: "lineWidths", static: false, private: false, access: { has: obj => "lineWidths" in obj, get: obj => obj.lineWidths, set: (obj, value) => { obj.lineWidths = value; } }, metadata: _metadata }, _lineWidths_initializers, _lineWidths_extraInitializers);
            __esDecorate(this, null, _selectedSize_decorators, { kind: "accessor", name: "selectedSize", static: false, private: false, access: { has: obj => "selectedSize" in obj, get: obj => obj.selectedSize, set: (obj, value) => { obj.selectedSize = value; } }, metadata: _metadata }, _selectedSize_initializers, _selectedSize_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _onSelect(lineWidth) {
            this.dispatchEvent(new CustomEvent('select', {
                detail: lineWidth,
                bubbles: true,
                composed: true,
                cancelable: true,
            }));
        }
        render() {
            return html `<affine-slider
      ?disabled=${this.disabled}
      .range=${{ points: this.lineWidths }}
      .value=${this.selectedSize}
      .tooltip=${this.hasTooltip ? 'Thickness' : undefined}
      @select=${(e) => {
                e.stopPropagation();
                this._onSelect(e.detail.value);
            }}
    ></affine-slider>`;
        }
        #disabled_accessor_storage = __runInitializers(this, _disabled_initializers, false);
        get disabled() { return this.#disabled_accessor_storage; }
        set disabled(value) { this.#disabled_accessor_storage = value; }
        #hasTooltip_accessor_storage = (__runInitializers(this, _disabled_extraInitializers), __runInitializers(this, _hasTooltip_initializers, true));
        get hasTooltip() { return this.#hasTooltip_accessor_storage; }
        set hasTooltip(value) { this.#hasTooltip_accessor_storage = value; }
        #lineWidths_accessor_storage = (__runInitializers(this, _hasTooltip_extraInitializers), __runInitializers(this, _lineWidths_initializers, BRUSH_LINE_WIDTHS));
        get lineWidths() { return this.#lineWidths_accessor_storage; }
        set lineWidths(value) { this.#lineWidths_accessor_storage = value; }
        #selectedSize_accessor_storage = (__runInitializers(this, _lineWidths_extraInitializers), __runInitializers(this, _selectedSize_initializers, LineWidth.Two));
        get selectedSize() { return this.#selectedSize_accessor_storage; }
        set selectedSize(value) { this.#selectedSize_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _selectedSize_extraInitializers);
        }
    };
})();
export { EdgelessLineWidthPanel };
