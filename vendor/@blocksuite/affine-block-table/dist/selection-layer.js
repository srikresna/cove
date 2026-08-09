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
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed, effect, signal } from '@preact/signals-core';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
export const SelectionLayerComponentName = 'affine-table-selection-layer';
let SelectionLayer = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _selectionController_decorators;
    let _selectionController_initializers = [];
    let _selectionController_extraInitializers = [];
    let _getRowRect_decorators;
    let _getRowRect_initializers = [];
    let _getRowRect_extraInitializers = [];
    let _getColumnRect_decorators;
    let _getColumnRect_initializers = [];
    let _getColumnRect_extraInitializers = [];
    let _getAreaRect_decorators;
    let _getAreaRect_initializers = [];
    let _getAreaRect_extraInitializers = [];
    return class SelectionLayer extends _classSuper {
        constructor() {
            super(...arguments);
            this.#selectionController_accessor_storage = __runInitializers(this, _selectionController_initializers, void 0);
            this.#getRowRect_accessor_storage = (__runInitializers(this, _selectionController_extraInitializers), __runInitializers(this, _getRowRect_initializers, void 0));
            this.#getColumnRect_accessor_storage = (__runInitializers(this, _getRowRect_extraInitializers), __runInitializers(this, _getColumnRect_initializers, void 0));
            this.#getAreaRect_accessor_storage = (__runInitializers(this, _getColumnRect_extraInitializers), __runInitializers(this, _getAreaRect_initializers, void 0));
            this.selection$ = (__runInitializers(this, _getAreaRect_extraInitializers), computed(() => {
                return this.selectionController.selected$.value;
            }));
            this.computeRect = () => {
                const selection = this.selection$.value;
                if (!selection)
                    return;
                if (selection.type === 'row') {
                    const rect = this.getRowRect(selection.rowId);
                    return rect;
                }
                if (selection.type === 'column') {
                    const rect = this.getColumnRect(selection.columnId);
                    return rect;
                }
                if (selection.type === 'area') {
                    const rect = this.getAreaRect(selection.rowStartIndex, selection.rowEndIndex, selection.columnStartIndex, selection.columnEndIndex);
                    return rect;
                }
                return;
            };
            this.rect$ = signal();
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _selectionController_decorators = [property({ attribute: false })];
            _getRowRect_decorators = [property({ attribute: false })];
            _getColumnRect_decorators = [property({ attribute: false })];
            _getAreaRect_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _selectionController_decorators, { kind: "accessor", name: "selectionController", static: false, private: false, access: { has: obj => "selectionController" in obj, get: obj => obj.selectionController, set: (obj, value) => { obj.selectionController = value; } }, metadata: _metadata }, _selectionController_initializers, _selectionController_extraInitializers);
            __esDecorate(this, null, _getRowRect_decorators, { kind: "accessor", name: "getRowRect", static: false, private: false, access: { has: obj => "getRowRect" in obj, get: obj => obj.getRowRect, set: (obj, value) => { obj.getRowRect = value; } }, metadata: _metadata }, _getRowRect_initializers, _getRowRect_extraInitializers);
            __esDecorate(this, null, _getColumnRect_decorators, { kind: "accessor", name: "getColumnRect", static: false, private: false, access: { has: obj => "getColumnRect" in obj, get: obj => obj.getColumnRect, set: (obj, value) => { obj.getColumnRect = value; } }, metadata: _metadata }, _getColumnRect_initializers, _getColumnRect_extraInitializers);
            __esDecorate(this, null, _getAreaRect_decorators, { kind: "accessor", name: "getAreaRect", static: false, private: false, access: { has: obj => "getAreaRect" in obj, get: obj => obj.getAreaRect, set: (obj, value) => { obj.getAreaRect = value; } }, metadata: _metadata }, _getAreaRect_initializers, _getAreaRect_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #selectionController_accessor_storage;
        get selectionController() { return this.#selectionController_accessor_storage; }
        set selectionController(value) { this.#selectionController_accessor_storage = value; }
        #getRowRect_accessor_storage;
        get getRowRect() { return this.#getRowRect_accessor_storage; }
        set getRowRect(value) { this.#getRowRect_accessor_storage = value; }
        #getColumnRect_accessor_storage;
        get getColumnRect() { return this.#getColumnRect_accessor_storage; }
        set getColumnRect(value) { this.#getColumnRect_accessor_storage = value; }
        #getAreaRect_accessor_storage;
        get getAreaRect() { return this.#getAreaRect_accessor_storage; }
        set getAreaRect(value) { this.#getAreaRect_accessor_storage = value; }
        getSelectionStyle() {
            const rect = this.rect$.value;
            if (!rect)
                return styleMap({
                    display: 'none',
                });
            const border = '2px solid var(--affine-primary-color)';
            return styleMap({
                position: 'absolute',
                pointerEvents: 'none',
                top: `${rect.top}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                borderRadius: '2px',
                border,
            });
        }
        connectedCallback() {
            super.connectedCallback();
            const ob = new ResizeObserver(() => {
                this.rect$.value = this.computeRect();
            });
            this.disposables.add(effect(() => {
                this.rect$.value = this.computeRect();
            }));
            const table = this.selectionController.host.querySelector('table');
            if (table) {
                ob.observe(table);
                this.disposables.add(() => {
                    ob.unobserve(table);
                });
            }
        }
        render() {
            return html ` <div style=${this.getSelectionStyle()}></div> `;
        }
    };
})();
export { SelectionLayer };
