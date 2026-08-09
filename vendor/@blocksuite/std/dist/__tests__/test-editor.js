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
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { BlockStdScope } from '../scope/index.js';
import { ShadowlessElement } from '../view/index.js';
let TestEditorContainer = (() => {
    let _classDecorators = [customElement('test-editor-container')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _doc_decorators;
    let _doc_initializers = [];
    let _doc_extraInitializers = [];
    let _specs_decorators;
    let _specs_initializers = [];
    let _specs_extraInitializers = [];
    var TestEditorContainer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _doc_decorators = [property({ attribute: false })];
            _specs_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _doc_decorators, { kind: "accessor", name: "doc", static: false, private: false, access: { has: obj => "doc" in obj, get: obj => obj.doc, set: (obj, value) => { obj.doc = value; } }, metadata: _metadata }, _doc_initializers, _doc_extraInitializers);
            __esDecorate(this, null, _specs_decorators, { kind: "accessor", name: "specs", static: false, private: false, access: { has: obj => "specs" in obj, get: obj => obj.specs, set: (obj, value) => { obj.specs = value; } }, metadata: _metadata }, _specs_initializers, _specs_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            TestEditorContainer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get std() {
            return this._std;
        }
        connectedCallback() {
            super.connectedCallback();
            this._std = new BlockStdScope({
                store: this.doc,
                extensions: this.specs,
            });
        }
        render() {
            return html ` <div class="test-editor-container">
      ${this._std.render()}
    </div>`;
        }
        #doc_accessor_storage = __runInitializers(this, _doc_initializers, void 0);
        get doc() { return this.#doc_accessor_storage; }
        set doc(value) { this.#doc_accessor_storage = value; }
        #specs_accessor_storage = (__runInitializers(this, _doc_extraInitializers), __runInitializers(this, _specs_initializers, []));
        get specs() { return this.#specs_accessor_storage; }
        set specs(value) { this.#specs_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _specs_extraInitializers);
        }
    };
    return TestEditorContainer = _classThis;
})();
export { TestEditorContainer };
