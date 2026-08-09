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
import { on, once } from '@blocksuite/affine-shared/utils';
import { clamp } from '@blocksuite/global/gfx';
import { WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { html, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styles } from './styles';
import { isDiscreteRange } from './utils';
const defaultSliderStyle = {
    width: '100%',
    itemSize: 16,
    itemIconSize: 8,
    dragHandleSize: 14,
};
let Slider = (() => {
    let _classDecorators = [requiredProperties({
            range: PropTypes.of(isDiscreteRange),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = WithDisposable(LitElement);
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _disabled_decorators;
    let _disabled_initializers = [];
    let _disabled_extraInitializers = [];
    let _tooltip_decorators;
    let _tooltip_initializers = [];
    let _tooltip_extraInitializers = [];
    let _range_decorators;
    let _range_initializers = [];
    let _range_extraInitializers = [];
    let _sliderStyle_decorators;
    let _sliderStyle_initializers = [];
    let _sliderStyle_extraInitializers = [];
    var Slider = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#value_accessor_storage = __runInitializers(this, _value_initializers, 0);
            this.#disabled_accessor_storage = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _disabled_initializers, false));
            this.#tooltip_accessor_storage = (__runInitializers(this, _disabled_extraInitializers), __runInitializers(this, _tooltip_initializers, undefined));
            this.#range_accessor_storage = (__runInitializers(this, _tooltip_extraInitializers), __runInitializers(this, _range_initializers, void 0));
            this.#sliderStyle_accessor_storage = (__runInitializers(this, _range_extraInitializers), __runInitializers(this, _sliderStyle_initializers, defaultSliderStyle));
            this._getDragHandlePosition = (__runInitializers(this, _sliderStyle_extraInitializers), (e) => {
                const width = this.getBoundingClientRect().width;
                return clamp(e.offsetX, 0, width);
            });
            this._onPointerDown = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._onPointerMove(e);
                const dispose = on(this, 'pointermove', this._onPointerMove);
                this._disposables.add(once(this, 'pointerup', dispose));
                this._disposables.add(once(this, 'pointerleave', dispose));
            };
            this._onPointerMove = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const x = this._getDragHandlePosition(e);
                this._updateLineWidthPanelByDragHandlePosition(x);
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _value_decorators = [property({ attribute: false })];
            _disabled_decorators = [property({ attribute: true, type: Boolean })];
            _tooltip_decorators = [property({ attribute: false })];
            _range_decorators = [property({ attribute: false })];
            _sliderStyle_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(this, null, _disabled_decorators, { kind: "accessor", name: "disabled", static: false, private: false, access: { has: obj => "disabled" in obj, get: obj => obj.disabled, set: (obj, value) => { obj.disabled = value; } }, metadata: _metadata }, _disabled_initializers, _disabled_extraInitializers);
            __esDecorate(this, null, _tooltip_decorators, { kind: "accessor", name: "tooltip", static: false, private: false, access: { has: obj => "tooltip" in obj, get: obj => obj.tooltip, set: (obj, value) => { obj.tooltip = value; } }, metadata: _metadata }, _tooltip_initializers, _tooltip_extraInitializers);
            __esDecorate(this, null, _range_decorators, { kind: "accessor", name: "range", static: false, private: false, access: { has: obj => "range" in obj, get: obj => obj.range, set: (obj, value) => { obj.range = value; } }, metadata: _metadata }, _range_initializers, _range_extraInitializers);
            __esDecorate(this, null, _sliderStyle_decorators, { kind: "accessor", name: "sliderStyle", static: false, private: false, access: { has: obj => "sliderStyle" in obj, get: obj => obj.sliderStyle, set: (obj, value) => { obj.sliderStyle = value; } }, metadata: _metadata }, _sliderStyle_initializers, _sliderStyle_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Slider = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        #value_accessor_storage;
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        #disabled_accessor_storage;
        get disabled() { return this.#disabled_accessor_storage; }
        set disabled(value) { this.#disabled_accessor_storage = value; }
        #tooltip_accessor_storage;
        get tooltip() { return this.#tooltip_accessor_storage; }
        set tooltip(value) { this.#tooltip_accessor_storage = value; }
        #range_accessor_storage;
        get range() { return this.#range_accessor_storage; }
        set range(value) { this.#range_accessor_storage = value; }
        #sliderStyle_accessor_storage;
        get sliderStyle() { return this.#sliderStyle_accessor_storage; }
        set sliderStyle(value) { this.#sliderStyle_accessor_storage = value; }
        get _sliderStyle() {
            return {
                ...defaultSliderStyle,
                ...this.sliderStyle,
            };
        }
        _onSelect(value) {
            this.dispatchEvent(new CustomEvent('select', {
                detail: { value },
                bubbles: true,
                composed: true,
            }));
        }
        _updateLineWidthPanelByDragHandlePosition(x) {
            // Calculate the selected size based on the drag handle position.
            // Need to select the nearest size.
            const { _sliderStyle: { itemSize }, } = this;
            const width = this.getBoundingClientRect().width;
            const { points } = this.range;
            const count = points.length;
            const targetWidth = width - itemSize;
            const halfItemSize = itemSize / 2;
            const offsetX = halfItemSize + (width - itemSize * count) / (count - 1) / 2;
            const selectedSize = points.findLast((_, n) => {
                const cx = halfItemSize + (n / (count - 1)) * targetWidth;
                return x >= cx - offsetX && x < cx + offsetX;
            });
            if (!selectedSize)
                return;
            this._onSelect(selectedSize);
        }
        connectedCallback() {
            super.connectedCallback();
            this._disposables.addFromEvent(this, 'pointerdown', this._onPointerDown);
            this._disposables.addFromEvent(this, 'click', e => {
                e.stopPropagation();
            });
        }
        willUpdate(changedProperties) {
            const { style } = this;
            if (changedProperties.has('sliderStyle')) {
                const { _sliderStyle: { width, itemSize, itemIconSize, dragHandleSize }, } = this;
                style.setProperty('--width', width);
                style.setProperty('--item-size', `${itemSize}px`);
                style.setProperty('--item-icon-size', `${itemIconSize}px`);
                style.setProperty('--drag-handle-size', `${dragHandleSize}px`);
            }
            if (changedProperties.has('range')) {
                style.setProperty('--count', `${this.range.points.length}`);
            }
            if (changedProperties.has('value')) {
                const index = this.range.points.findIndex(p => p === this.value);
                style.setProperty('--cursor', `${index}`);
            }
        }
        render() {
            return html `<div class="slider-container">
      ${repeat(this.range.points, w => w, (w, n) => html `<div
            class="point-button"
            aria-label=${w}
            data-index=${n}
            ?data-selected=${w <= this.value}
          >
            <div class="point-circle"></div>
          </div>`)}
      <div class="drag-handle"></div>
      <div class="bottom-line"></div>
      <div class="slider-selected-overlay"></div>
      ${this.tooltip
                ? html `<affine-tooltip .offset=${8}>${this.tooltip}</affine-tooltip>`
                : nothing}
    </div>`;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return Slider = _classThis;
})();
export { Slider };
