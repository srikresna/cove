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
import { html } from 'lit';
import { query } from 'lit/decorators.js';
import { BaseCellRenderer } from '../../core/property/index.js';
import { createFromBaseCellRenderer } from '../../core/property/renderer.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { textInputStyle, textStyle } from './cell-renderer-css.js';
import { textPropertyModelConfig } from './define.js';
let TextCell = (() => {
    let _classSuper = BaseCellRenderer;
    let __inputEle_decorators;
    let __inputEle_initializers = [];
    let __inputEle_extraInitializers = [];
    return class TextCell extends _classSuper {
        constructor() {
            super(...arguments);
            this.#_inputEle_accessor_storage = __runInitializers(this, __inputEle_initializers, void 0);
            this._keydown = (__runInitializers(this, __inputEle_extraInitializers), (e) => {
                if (e.key === 'Enter' && !e.isComposing) {
                    this._setValue();
                    setTimeout(() => {
                        this.selectCurrentCell(false);
                    });
                }
            });
            this._setValue = (str = this._inputEle?.value) => {
                if (this._inputEle) {
                    this._inputEle.value = `${this.value ?? ''}`;
                }
                this.valueSetNextTick(str);
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
        afterEnterEditingMode() {
            this.focusEnd();
        }
        beforeExitEditingMode() {
            this._setValue();
        }
        render() {
            if (this.isEditing$.value) {
                return html `<input
        .value="${this.value ?? ''}"
        @keydown="${this._keydown}"
        class="${textInputStyle}"
      />`;
            }
            else {
                return html `<div class="${textStyle}">${this.value ?? ''}</div>`;
            }
        }
    };
})();
export { TextCell };
export const textPropertyConfig = textPropertyModelConfig.createPropertyMeta({
    icon: createIcon('TextIcon'),
    cellRenderer: {
        view: createFromBaseCellRenderer(TextCell),
    },
});
