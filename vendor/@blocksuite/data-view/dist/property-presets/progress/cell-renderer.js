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
import { query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { BaseCellRenderer } from '../../core/property/index.js';
import { createFromBaseCellRenderer } from '../../core/property/renderer.js';
import { startDrag } from '../../core/utils/drag.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { progressBarStyle, progressBgStyle, progressCellStyle, progressContainerStyle, progressDragHandleStyle, progressFgStyle, progressNumberStyle, } from './cell-renderer-css.js';
import { progressPropertyModelConfig } from './define.js';
const progressColors = {
    empty: 'var(--affine-black-10)',
    processing: 'var(--affine-processing-color)',
    success: 'var(--affine-success-color)',
};
let ProgressCell = (() => {
    let _classSuper = BaseCellRenderer;
    let __progressBg_decorators;
    let __progressBg_initializers = [];
    let __progressBg_extraInitializers = [];
    let _tempValue_decorators;
    let _tempValue_initializers = [];
    let _tempValue_extraInitializers = [];
    return class ProgressCell extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __progressBg_decorators = [query(`.${progressBgStyle}`)];
            _tempValue_decorators = [state()];
            __esDecorate(this, null, __progressBg_decorators, { kind: "accessor", name: "_progressBg", static: false, private: false, access: { has: obj => "_progressBg" in obj, get: obj => obj._progressBg, set: (obj, value) => { obj._progressBg = value; } }, metadata: _metadata }, __progressBg_initializers, __progressBg_extraInitializers);
            __esDecorate(this, null, _tempValue_decorators, { kind: "accessor", name: "tempValue", static: false, private: false, access: { has: obj => "tempValue" in obj, get: obj => obj.tempValue, set: (obj, value) => { obj.tempValue = value; } }, metadata: _metadata }, _tempValue_initializers, _tempValue_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get _value() {
            return this.isEditing$.value
                ? (this.tempValue ?? this.value ?? 0)
                : (this.value ?? 0);
        }
        _onChange(value) {
            this.tempValue = value;
        }
        firstUpdated() {
            const disposables = this._disposables;
            disposables.addFromEvent(this._progressBg, 'pointerdown', this.startDrag);
            disposables.addFromEvent(window, 'keydown', evt => {
                if (!this.isEditing$.value) {
                    return;
                }
                if (evt.key === 'ArrowDown' || evt.key === 'ArrowLeft') {
                    evt.preventDefault();
                    this._onChange(Math.max(0, this._value - 1));
                    return;
                }
                if (evt.key === 'ArrowUp' || evt.key === 'ArrowRight') {
                    evt.preventDefault();
                    this._onChange(Math.min(100, this._value + 1));
                    return;
                }
            });
        }
        preventDefault(e) {
            e.stopPropagation();
        }
        onCopy(_e) {
            this.preventDefault(_e);
        }
        onCut(_e) {
            this.preventDefault(_e);
        }
        beforeExitEditingMode() {
            const value = this._value;
            this.valueSetNextTick(value);
        }
        onPaste(_e) {
            this.preventDefault(_e);
        }
        render() {
            const progress = this._value;
            let backgroundColor = progressColors.processing;
            if (progress === 100) {
                backgroundColor = progressColors.success;
            }
            const fgStyles = styleMap({
                width: `${progress}%`,
                backgroundColor,
            });
            const bgStyles = styleMap({
                backgroundColor: progress === 0 ? progressColors.empty : 'var(--affine-hover-color)',
            });
            return html `
      <div class="${progressCellStyle}">
        <div class="${progressContainerStyle}">
          <div class="${progressBarStyle}">
            <div
              class="${progressBgStyle}"
              data-testid="progress-background"
              style=${bgStyles}
            >
              <div class="${progressFgStyle}" style=${fgStyles}></div>
              ${this.isEditing$.value
                ? html ` <div
                    class="${progressDragHandleStyle}"
                    data-testid="progress-drag-handle"
                    style=${styleMap({
                    left: `calc(${progress}% - 3px)`,
                })}
                  ></div>`
                : ''}
            </div>
          </div>
          <span class="${progressNumberStyle}" data-testid="progress"
            >${progress}</span
          >
        </div>
      </div>
    `;
        }
        #_progressBg_accessor_storage;
        get _progressBg() { return this.#_progressBg_accessor_storage; }
        set _progressBg(value) { this.#_progressBg_accessor_storage = value; }
        #tempValue_accessor_storage;
        get tempValue() { return this.#tempValue_accessor_storage; }
        set tempValue(value) { this.#tempValue_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.startDrag = (event) => {
                if (!this.isEditing$.value)
                    return;
                const bgRect = this._progressBg.getBoundingClientRect();
                const min = bgRect.left;
                const max = bgRect.right;
                const setValue = (x) => {
                    this.tempValue = Math.round(((Math.min(max, Math.max(min, x)) - min) / (max - min)) * 100);
                };
                startDrag(event, {
                    onDrag: ({ x }) => {
                        setValue(x);
                        return;
                    },
                    onMove: ({ x }) => {
                        setValue(x);
                        return;
                    },
                    onDrop: () => {
                        //
                    },
                    onClear: () => {
                        //
                    },
                });
            };
            this.#_progressBg_accessor_storage = __runInitializers(this, __progressBg_initializers, void 0);
            this.#tempValue_accessor_storage = (__runInitializers(this, __progressBg_extraInitializers), __runInitializers(this, _tempValue_initializers, undefined));
            __runInitializers(this, _tempValue_extraInitializers);
        }
    };
})();
export { ProgressCell };
export const progressPropertyConfig = progressPropertyModelConfig.createPropertyMeta({
    icon: createIcon('ProgressIcon'),
    cellRenderer: {
        view: createFromBaseCellRenderer(ProgressCell),
    },
});
