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
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { Store } from '@blocksuite/store';
import { consume, provide } from '@lit/context';
import { computed } from '@preact/signals-core';
import { nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { when } from 'lit/directives/when.js';
import { html } from 'lit/static-html.js';
import { BlockServiceIdentifier } from '../../identifier.js';
import { BlockSelection } from '../../selection/index.js';
import { PropTypes, requiredProperties } from '../decorators/index.js';
import { blockComponentSymbol, modelContext, serviceContext, } from './consts.js';
import { stdContext, storeContext } from './lit-host.js';
import { ShadowlessElement } from './shadowless-element.js';
let BlockComponent = (() => {
    var _a;
    let _classDecorators = [requiredProperties({
            store: PropTypes.instanceOf(Store),
            std: PropTypes.object,
            widgets: PropTypes.recordOf(PropTypes.object),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let __model_decorators;
    let __model_initializers = [];
    let __model_extraInitializers = [];
    let __renderers_decorators;
    let __renderers_initializers = [];
    let __renderers_extraInitializers = [];
    let __service_decorators;
    let __service_initializers = [];
    let __service_extraInitializers = [];
    let _store_decorators;
    let _store_initializers = [];
    let _store_extraInitializers = [];
    let _viewType_decorators;
    let _viewType_initializers = [];
    let _viewType_extraInitializers = [];
    let _widgets_decorators;
    let _widgets_initializers = [];
    let _widgets_extraInitializers = [];
    var BlockComponent = class extends _classSuper {
        static { _classThis = this; }
        static { _a = (_std_decorators = [consume({ context: stdContext })], blockComponentSymbol); }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __model_decorators = [provide({ context: modelContext }), state()];
            __renderers_decorators = [state()];
            __service_decorators = [provide({ context: serviceContext }), state()];
            _store_decorators = [consume({ context: storeContext })];
            _viewType_decorators = [property({ attribute: false })];
            _widgets_decorators = [property({
                    attribute: false,
                    hasChanged(value, oldValue) {
                        if (!value || !oldValue) {
                            return value !== oldValue;
                        }
                        // Is empty object
                        if (!Object.keys(value).length && !Object.keys(oldValue).length) {
                            return false;
                        }
                        return value !== oldValue;
                    },
                })];
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, __model_decorators, { kind: "accessor", name: "_model", static: false, private: false, access: { has: obj => "_model" in obj, get: obj => obj._model, set: (obj, value) => { obj._model = value; } }, metadata: _metadata }, __model_initializers, __model_extraInitializers);
            __esDecorate(this, null, __renderers_decorators, { kind: "accessor", name: "_renderers", static: false, private: false, access: { has: obj => "_renderers" in obj, get: obj => obj._renderers, set: (obj, value) => { obj._renderers = value; } }, metadata: _metadata }, __renderers_initializers, __renderers_extraInitializers);
            __esDecorate(this, null, __service_decorators, { kind: "accessor", name: "_service", static: false, private: false, access: { has: obj => "_service" in obj, get: obj => obj._service, set: (obj, value) => { obj._service = value; } }, metadata: _metadata }, __service_initializers, __service_extraInitializers);
            __esDecorate(this, null, _store_decorators, { kind: "accessor", name: "store", static: false, private: false, access: { has: obj => "store" in obj, get: obj => obj.store, set: (obj, value) => { obj.store = value; } }, metadata: _metadata }, _store_initializers, _store_extraInitializers);
            __esDecorate(this, null, _viewType_decorators, { kind: "accessor", name: "viewType", static: false, private: false, access: { has: obj => "viewType" in obj, get: obj => obj.viewType, set: (obj, value) => { obj.viewType = value; } }, metadata: _metadata }, _viewType_initializers, _viewType_extraInitializers);
            __esDecorate(this, null, _widgets_decorators, { kind: "accessor", name: "widgets", static: false, private: false, access: { has: obj => "widgets" in obj, get: obj => obj.widgets, set: (obj, value) => { obj.widgets = value; } }, metadata: _metadata }, _widgets_initializers, _widgets_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            BlockComponent = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        get blockId() {
            return this.dataset.blockId;
        }
        get childBlocks() {
            const childModels = this.model.children;
            return childModels
                .map(child => {
                return this.std.view.getBlock(child.id);
            })
                .filter((x) => !!x);
        }
        get flavour() {
            return this.model.flavour;
        }
        get host() {
            return this.std.host;
        }
        get isVersionMismatch() {
            const schema = this.store.schema.flavourSchemaMap.get(this.model.flavour);
            if (!schema) {
                console.warn(`Schema not found for block ${this.model.id}, flavour ${this.model.flavour}`);
                return true;
            }
            const expectedVersion = schema.version;
            const actualVersion = this.model.version;
            if (expectedVersion !== actualVersion) {
                console.warn(`Version mismatch for block ${this.model.id}, expected ${expectedVersion}, actual ${actualVersion}`);
                return true;
            }
            return false;
        }
        get model() {
            if (this._model) {
                return this._model;
            }
            const model = this.store.getModelById(this.blockId);
            if (!model) {
                throw new BlockSuiteError(ErrorCode.MissingViewModelError, `Cannot find block model for id ${this.blockId}`);
            }
            this._model = model;
            return model;
        }
        get parentComponent() {
            const parent = this.model.parent;
            if (!parent)
                return null;
            return this.std.view.getBlock(parent.id);
        }
        get renderChildren() {
            return this.host.renderChildren.bind(this);
        }
        get rootComponent() {
            const rootId = this.store.root?.id;
            if (!rootId) {
                return null;
            }
            const rootComponent = this.std.view.getBlock(rootId);
            return rootComponent ?? null;
        }
        get selection() {
            return this.std.selection;
        }
        get service() {
            if (this._service) {
                return this._service;
            }
            const service = this.std.getOptional(BlockServiceIdentifier(this.model.flavour));
            this._service = service;
            return service;
        }
        get topContenteditableElement() {
            return this.rootComponent;
        }
        get widgetComponents() {
            return Object.keys(this.widgets).reduce((mapping, key) => ({
                ...mapping,
                [key]: this.std.view.getWidget(key, this.blockId),
            }), {});
        }
        _renderMismatchBlock(content) {
            return when(this.isVersionMismatch, () => {
                const actualVersion = this.model.version;
                const schema = this.store.schema.flavourSchemaMap.get(this.model.flavour);
                const expectedVersion = schema?.version ?? -1;
                return this.renderVersionMismatch(expectedVersion, actualVersion);
            }, () => content);
        }
        _renderViewType(content) {
            return choose(this.viewType, [
                ['display', () => content],
                ['hidden', () => nothing],
                ['bypass', () => this.renderChildren(this.model)],
            ]);
        }
        addRenderer(renderer) {
            this._renderers.push(renderer);
        }
        bindHotKey(keymap, options) {
            const dispose = this.std.event.bindHotkey(keymap, {
                flavour: options?.global
                    ? undefined
                    : options?.flavour
                        ? this.model.flavour
                        : undefined,
                blockId: options?.global || options?.flavour ? undefined : this.blockId,
            });
            this._disposables.add(dispose);
            return dispose;
        }
        connectedCallback() {
            super.connectedCallback();
            this.std.view.setBlock(this);
            const disposable = this.std.store.slots.blockUpdated.subscribe(({ type, id }) => {
                if (id === this.model.id && type === 'delete') {
                    this.std.view.deleteBlock(this);
                    disposable.unsubscribe();
                }
            });
            this._disposables.add(disposable);
            this._disposables.add(this.model.propsUpdated.subscribe(() => {
                this.requestUpdate();
            }));
        }
        async getUpdateComplete() {
            const result = await super.getUpdateComplete();
            await Promise.all(this.childBlocks.map(el => el.updateComplete));
            return result;
        }
        render() {
            return this._renderers.reduce((acc, cur) => cur.call(this, acc), nothing);
        }
        renderBlock() {
            return nothing;
        }
        /**
         * Render a warning message when the block version is mismatched.
         * @param expectedVersion If the schema is not found, the expected version is -1.
         *        Which means the block is not supported in the current editor.
         * @param actualVersion The version of the block's crdt data.
         */
        renderVersionMismatch(expectedVersion, actualVersion) {
            return html `
      <dl class="version-mismatch-warning" contenteditable="false">
        <dt>
          <h4>Block Version Mismatched</h4>
        </dt>
        <dd>
          <p>
            We can not render this <var>${this.model.flavour}</var> block
            because the version is mismatched.
          </p>
          <p>Editor version: <var>${expectedVersion}</var></p>
          <p>Data version: <var>${actualVersion}</var></p>
        </dd>
      </dl>
    `;
        }
        #_model_accessor_storage;
        get _model() { return this.#_model_accessor_storage; }
        set _model(value) { this.#_model_accessor_storage = value; }
        #_renderers_accessor_storage;
        get _renderers() { return this.#_renderers_accessor_storage; }
        set _renderers(value) { this.#_renderers_accessor_storage = value; }
        #_service_accessor_storage;
        get _service() { return this.#_service_accessor_storage; }
        set _service(value) { this.#_service_accessor_storage = value; }
        #store_accessor_storage;
        get store() { return this.#store_accessor_storage; }
        set store(value) { this.#store_accessor_storage = value; }
        #viewType_accessor_storage;
        get viewType() { return this.#viewType_accessor_storage; }
        set viewType(value) { this.#viewType_accessor_storage = value; }
        #widgets_accessor_storage;
        get widgets() { return this.#widgets_accessor_storage; }
        set widgets(value) { this.#widgets_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.#std_accessor_storage = __runInitializers(this, _std_initializers, void 0);
            this.selected$ = (__runInitializers(this, _std_extraInitializers), computed(() => {
                const selection = this.std.selection.value.find(selection => selection.blockId === this.model?.id);
                if (!selection)
                    return false;
                return selection.is(BlockSelection);
            }));
            this[_a] = true;
            this.handleEvent = (name, handler, options) => {
                this._disposables.add(this.std.event.add(name, handler, {
                    flavour: options?.global
                        ? undefined
                        : options?.flavour
                            ? this.model?.flavour
                            : undefined,
                    blockId: options?.global || options?.flavour ? undefined : this.blockId,
                }));
            };
            this.#_model_accessor_storage = __runInitializers(this, __model_initializers, null);
            this.#_renderers_accessor_storage = (__runInitializers(this, __model_extraInitializers), __runInitializers(this, __renderers_initializers, [
                this.renderBlock,
                this._renderMismatchBlock,
                this._renderViewType,
            ]));
            this.#_service_accessor_storage = (__runInitializers(this, __renderers_extraInitializers), __runInitializers(this, __service_initializers, null));
            this.#store_accessor_storage = (__runInitializers(this, __service_extraInitializers), __runInitializers(this, _store_initializers, void 0));
            this.#viewType_accessor_storage = (__runInitializers(this, _store_extraInitializers), __runInitializers(this, _viewType_initializers, 'display'));
            this.#widgets_accessor_storage = (__runInitializers(this, _viewType_extraInitializers), __runInitializers(this, _widgets_initializers, void 0));
            __runInitializers(this, _widgets_extraInitializers);
        }
    };
    return BlockComponent = _classThis;
})();
export { BlockComponent };
