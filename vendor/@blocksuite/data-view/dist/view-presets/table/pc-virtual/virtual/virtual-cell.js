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
import { effect } from '@preact/signals-core';
import { property } from 'lit/decorators.js';
let VirtualElementWrapper = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _rect_decorators;
    let _rect_initializers = [];
    let _rect_extraInitializers = [];
    let _updateHeight_decorators;
    let _updateHeight_initializers = [];
    let _updateHeight_extraInitializers = [];
    let _element_decorators;
    let _element_initializers = [];
    let _element_extraInitializers = [];
    return class VirtualElementWrapper extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _rect_decorators = [property({ attribute: false })];
            _updateHeight_decorators = [property({ attribute: false })];
            _element_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _rect_decorators, { kind: "accessor", name: "rect", static: false, private: false, access: { has: obj => "rect" in obj, get: obj => obj.rect, set: (obj, value) => { obj.rect = value; } }, metadata: _metadata }, _rect_initializers, _rect_extraInitializers);
            __esDecorate(this, null, _updateHeight_decorators, { kind: "accessor", name: "updateHeight", static: false, private: false, access: { has: obj => "updateHeight" in obj, get: obj => obj.updateHeight, set: (obj, value) => { obj.updateHeight = value; } }, metadata: _metadata }, _updateHeight_initializers, _updateHeight_extraInitializers);
            __esDecorate(this, null, _element_decorators, { kind: "accessor", name: "element", static: false, private: false, access: { has: obj => "element" in obj, get: obj => obj.element, set: (obj, value) => { obj.element = value; } }, metadata: _metadata }, _element_initializers, _element_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #rect_accessor_storage = __runInitializers(this, _rect_initializers, void 0);
        get rect() { return this.#rect_accessor_storage; }
        set rect(value) { this.#rect_accessor_storage = value; }
        #updateHeight_accessor_storage = (__runInitializers(this, _rect_extraInitializers), __runInitializers(this, _updateHeight_initializers, void 0));
        get updateHeight() { return this.#updateHeight_accessor_storage; }
        set updateHeight(value) { this.#updateHeight_accessor_storage = value; }
        #element_accessor_storage = (__runInitializers(this, _updateHeight_extraInitializers), __runInitializers(this, _element_initializers, void 0));
        get element() { return this.#element_accessor_storage; }
        set element(value) { this.#element_accessor_storage = value; }
        connectedCallback() {
            super.connectedCallback();
            this.style.position = 'absolute';
            this.disposables.add(effect(() => {
                this.style.left = `${this.rect.left$.value ?? -1000}px`;
                this.style.top = `${this.rect.top$.value ?? -1000}px`;
                if (this.rect.width$.value != null) {
                    this.style.width = `${this.rect.width$.value}px`;
                }
                this.style.height = `${this.rect.height$.value ?? 0}px`;
            }));
            const resizeObserver = new ResizeObserver(() => {
                if (this.element.isConnected) {
                    Promise.resolve()
                        .then(() => {
                        this.updateHeight(this.element.clientHeight);
                    })
                        .catch(e => {
                        console.error(e);
                    });
                }
            });
            resizeObserver.observe(this.element);
            this.disposables.add(() => {
                resizeObserver.disconnect();
            });
        }
        render() {
            return this.element;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _element_extraInitializers);
        }
    };
})();
export { VirtualElementWrapper };
