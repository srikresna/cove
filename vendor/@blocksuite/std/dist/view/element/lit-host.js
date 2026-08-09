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
import { BlockSuiteError, ErrorCode, handleError, } from '@blocksuite/global/exceptions';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { Store, } from '@blocksuite/store';
import { createContext, provide } from '@lit/context';
import { css, LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { html, unsafeStatic } from 'lit/static-html.js';
import { WidgetViewIdentifier } from '../../identifier.js';
import { PropTypes, requiredProperties } from '../decorators/index.js';
import { BLOCK_ID_ATTR, WIDGET_ID_ATTR } from './consts.js';
import { ShadowlessElement } from './shadowless-element.js';
export const storeContext = createContext('store');
export const stdContext = createContext('std');
function isMatchFlavour(widgetFlavour, block) {
    if (widgetFlavour.endsWith('/*')) {
        const path = widgetFlavour.slice(0, -2).split('/');
        let current = block.parent;
        for (let i = path.length - 1; i >= 0; i--) {
            if (!current || current.flavour !== path[i]) {
                return false;
            }
            current = current.parent;
        }
        return true;
    }
    return block.flavour === widgetFlavour;
}
let EditorHost = (() => {
    let _classDecorators = [requiredProperties({
            store: PropTypes.instanceOf(Store),
            std: PropTypes.object,
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _store_decorators;
    let _store_initializers = [];
    let _store_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    var EditorHost = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _store_decorators = [provide({ context: storeContext }), property({ attribute: false })];
            _std_decorators = [provide({ context: stdContext }), property({ attribute: false })];
            __esDecorate(this, null, _store_decorators, { kind: "accessor", name: "store", static: false, private: false, access: { has: obj => "store" in obj, get: obj => obj.store, set: (obj, value) => { obj.store = value; } }, metadata: _metadata }, _store_initializers, _store_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EditorHost = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    editor-host {
      outline: none;
      isolation: isolate;
      display: block;
      height: 100%;
    }
  `; }
        get command() {
            return this.std.command;
        }
        get event() {
            return this.std.event;
        }
        get range() {
            return this.std.range;
        }
        get selection() {
            return this.std.selection;
        }
        get view() {
            return this.std.view;
        }
        connectedCallback() {
            super.connectedCallback();
            if (!this.store.root) {
                throw new BlockSuiteError(ErrorCode.NoRootModelError, 'This doc is missing root block. Please initialize the default block structure before connecting the editor to DOM.');
            }
            this.std.mount();
            this.tabIndex = 0;
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.std.unmount();
        }
        async getUpdateComplete() {
            try {
                const result = await super.getUpdateComplete();
                const rootModel = this.store.root;
                if (!rootModel)
                    return result;
                const view = this.std.getView(rootModel.flavour);
                if (!view)
                    return result;
                const widgetViews = this.std.provider.getAll(WidgetViewIdentifier(rootModel.flavour));
                const widgetTags = Object.entries(widgetViews).reduce((mapping, [key, tag]) => {
                    const [widgetFlavour, id] = key.split('|');
                    if (widgetFlavour === rootModel.flavour) {
                        mapping[id] = tag;
                    }
                    return mapping;
                }, {});
                const elementsTags = [
                    typeof view === 'function' ? view(rootModel) : view,
                    ...Object.values(widgetTags),
                ];
                await Promise.all(elementsTags.map(async (tag) => {
                    const element = this.renderRoot.querySelector(tag._$litStatic$);
                    if (element instanceof LitElement) {
                        return await element.updateComplete;
                    }
                    return null;
                }));
                return result;
            }
            catch (e) {
                if (e instanceof Error) {
                    handleError(e);
                }
                else {
                    console.error(e);
                }
                return true;
            }
        }
        render() {
            const { root } = this.store;
            if (!root)
                return nothing;
            return this._renderModel(root);
        }
        #store_accessor_storage;
        get store() { return this.#store_accessor_storage; }
        set store(value) { this.#store_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._renderModel = (model) => {
                const { flavour } = model;
                const block = this.store.getBlock(model.id);
                if (!block || block.blockViewType === 'hidden') {
                    return html `${nothing}`;
                }
                const schema = this.store.schema.flavourSchemaMap.get(flavour);
                const view = this.std.getView(flavour);
                if (!schema || !view) {
                    console.warn(`Cannot find render flavour ${flavour}.`);
                    return html `${nothing}`;
                }
                const widgetViews = this.std.provider.getAll(WidgetViewIdentifier);
                const widgets = Array.from(widgetViews.entries()).reduce((mapping, [key, tag]) => {
                    const [widgetFlavour, id] = key.split('|');
                    if (isMatchFlavour(widgetFlavour, model)) {
                        const template = html `<${tag} ${unsafeStatic(WIDGET_ID_ATTR)}=${id}></${tag}>`;
                        mapping[id] = template;
                    }
                    return mapping;
                }, {});
                const tag = typeof view === 'function' ? view(model) : view;
                return html `<${tag}
      ${unsafeStatic(BLOCK_ID_ATTR)}=${model.id}
      .widgets=${widgets}
      .viewType=${block.blockViewType}
    ></${tag}>`;
            };
            this.renderChildren = (model, filter) => {
                return html `${repeat(model.children.filter(filter ?? (() => true)), child => child.id, child => this._renderModel(child))}`;
            };
            this.#store_accessor_storage = __runInitializers(this, _store_initializers, void 0);
            this.#std_accessor_storage = (__runInitializers(this, _store_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            __runInitializers(this, _std_extraInitializers);
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return EditorHost = _classThis;
})();
export { EditorHost };
