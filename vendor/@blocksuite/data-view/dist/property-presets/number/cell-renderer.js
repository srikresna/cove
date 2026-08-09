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
import { IS_MAC } from '@blocksuite/global/env';
import { html } from 'lit';
import { query } from 'lit/decorators.js';
import { BaseCellRenderer } from '../../core/property/index.js';
import { createFromBaseCellRenderer } from '../../core/property/renderer.js';
import { stopPropagation } from '../../core/utils/event.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { numberInputStyle, numberStyle } from './cell-renderer-css.js';
import { numberPropertyModelConfig } from './define.js';
import { formatNumber, parseNumber, } from './utils/formatter.js';
let NumberCell = (() => {
    let _classSuper = BaseCellRenderer;
    let __inputEle_decorators;
    let __inputEle_initializers = [];
    let __inputEle_extraInitializers = [];
    return class NumberCell extends _classSuper {
        constructor() {
            super(...arguments);
            this.#_inputEle_accessor_storage = __runInitializers(this, __inputEle_initializers, void 0);
            this._keydown = (__runInitializers(this, __inputEle_extraInitializers), (e) => {
                const ctrlKey = IS_MAC ? e.metaKey : e.ctrlKey;
                if (e.key.toLowerCase() === 'z' && ctrlKey) {
                    e.stopPropagation();
                    return;
                }
                if (e.key === 'Enter' && !e.isComposing) {
                    requestAnimationFrame(() => {
                        this.selectCurrentCell(false);
                    });
                }
            });
            this._setValue = (str = this._inputEle?.value) => {
                if (!str) {
                    this.valueSetNextTick(undefined);
                    return;
                }
                const value = parseNumber(str);
                if (isNaN(value)) {
                    if (this._inputEle) {
                        this._inputEle.value = this.value
                            ? this._getFormattedString(this.value)
                            : '';
                    }
                    return;
                }
                if (this._inputEle) {
                    this._inputEle.value = this._getFormattedString(value);
                }
                this.valueSetNextTick(value);
            };
            this.focusEnd = () => {
                if (!this._inputEle)
                    return;
                const end = this._inputEle.value.length;
                this._inputEle.focus();
                this._inputEle.setSelectionRange(end, end);
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __inputEle_decorators = [query('input')];
            __esDecorate(this, null, __inputEle_decorators, { kind: "accessor", name: "_inputEle", static: false, private: false, access: { has: obj => "_inputEle" in obj, get: obj => obj._inputEle, set: (obj, value) => { obj._inputEle = value; } }, metadata: _metadata }, __inputEle_initializers, __inputEle_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #_inputEle_accessor_storage;
        get _inputEle() { return this.#_inputEle_accessor_storage; }
        set _inputEle(value) { this.#_inputEle_accessor_storage = value; }
        _getFormattedString(value = this.value) {
            const decimals = this.property.data$.value.decimal ?? 0;
            const formatMode = (this.property.data$.value.format ??
                'number');
            return value != undefined ? formatNumber(value, formatMode, decimals) : '';
        }
        _blur() {
            this.selectCurrentCell(false);
        }
        _focus() {
            if (!this.isEditing$.value) {
                this.selectCurrentCell(true);
            }
        }
        afterEnterEditingMode() {
            this.focusEnd();
        }
        beforeExitEditingMode() {
            this._setValue();
        }
        render() {
            if (this.isEditing$.value) {
                const formatted = this.value ? this._getFormattedString(this.value) : '';
                return html `<input
        type="text"
        autocomplete="off"
        .value="${formatted}"
        @keydown="${this._keydown}"
        @blur="${this._blur}"
        @focus="${this._focus}"
        class="${numberInputStyle} number"
        @pointerdown="${stopPropagation}"
      />`;
            }
            else {
                return html ` <div class="${numberStyle} number">
        ${this._getFormattedString()}
      </div>`;
            }
        }
    };
})();
export { NumberCell };
export const numberPropertyConfig = numberPropertyModelConfig.createPropertyMeta({
    icon: createIcon('NumberIcon'),
    cellRenderer: {
        view: createFromBaseCellRenderer(NumberCell),
    },
});
