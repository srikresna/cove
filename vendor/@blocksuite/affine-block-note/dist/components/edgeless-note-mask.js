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
import { almostEqual, Bound } from '@blocksuite/global/gfx';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ACTIVE_NOTE_EXTRA_PADDING } from '../note-edgeless-block.css';
let EdgelessNoteMask = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _disableMask_decorators;
    let _disableMask_initializers = [];
    let _disableMask_extraInitializers = [];
    let _editing_decorators;
    let _editing_initializers = [];
    let _editing_extraInitializers = [];
    let _host_decorators;
    let _host_initializers = [];
    let _host_extraInitializers = [];
    let _model_decorators;
    let _model_initializers = [];
    let _model_extraInitializers = [];
    let _zoom_decorators;
    let _zoom_initializers = [];
    let _zoom_extraInitializers = [];
    return class EdgelessNoteMask extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _disableMask_decorators = [property({ attribute: false })];
            _editing_decorators = [property({ attribute: false })];
            _host_decorators = [property({ attribute: false })];
            _model_decorators = [property({ attribute: false })];
            _zoom_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _disableMask_decorators, { kind: "accessor", name: "disableMask", static: false, private: false, access: { has: obj => "disableMask" in obj, get: obj => obj.disableMask, set: (obj, value) => { obj.disableMask = value; } }, metadata: _metadata }, _disableMask_initializers, _disableMask_extraInitializers);
            __esDecorate(this, null, _editing_decorators, { kind: "accessor", name: "editing", static: false, private: false, access: { has: obj => "editing" in obj, get: obj => obj.editing, set: (obj, value) => { obj.editing = value; } }, metadata: _metadata }, _editing_initializers, _editing_extraInitializers);
            __esDecorate(this, null, _host_decorators, { kind: "accessor", name: "host", static: false, private: false, access: { has: obj => "host" in obj, get: obj => obj.host, set: (obj, value) => { obj.host = value; } }, metadata: _metadata }, _host_initializers, _host_extraInitializers);
            __esDecorate(this, null, _model_decorators, { kind: "accessor", name: "model", static: false, private: false, access: { has: obj => "model" in obj, get: obj => obj.model, set: (obj, value) => { obj.model = value; } }, metadata: _metadata }, _model_initializers, _model_extraInitializers);
            __esDecorate(this, null, _zoom_decorators, { kind: "accessor", name: "zoom", static: false, private: false, access: { has: obj => "zoom" in obj, get: obj => obj.zoom, set: (obj, value) => { obj.zoom = value; } }, metadata: _metadata }, _zoom_initializers, _zoom_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        firstUpdated() {
            const maskDOM = this.renderRoot.querySelector('.affine-note-mask');
            const observer = new ResizeObserver(entries => {
                if (this.model.store.readonly)
                    return;
                for (const entry of entries) {
                    if (!this.model.props.edgeless.collapse) {
                        const bound = Bound.deserialize(this.model.xywh);
                        const scale = this.model.props.edgeless.scale ?? 1;
                        const height = entry.contentRect.height * scale;
                        if (!height || almostEqual(bound.h, height)) {
                            return;
                        }
                        bound.h = height;
                        this.model.stash('xywh');
                        this.model.xywh = bound.serialize();
                        this.model.pop('xywh');
                    }
                }
            });
            observer.observe(maskDOM);
            this._disposables.add(() => {
                observer.disconnect();
            });
        }
        render() {
            const extra = this.editing ? ACTIVE_NOTE_EXTRA_PADDING : 0;
            return html `
      <div
        class="affine-note-mask"
        style=${styleMap({
                position: 'absolute',
                top: `${-extra}px`,
                left: `${-extra}px`,
                bottom: `${-extra}px`,
                right: `${-extra}px`,
                zIndex: '1',
                pointerEvents: this.editing || this.disableMask ? 'none' : 'auto',
                borderRadius: `${this.model.props.edgeless.style.borderRadius * this.zoom}px`,
            })}
      ></div>
    `;
        }
        #disableMask_accessor_storage = __runInitializers(this, _disableMask_initializers, void 0);
        get disableMask() { return this.#disableMask_accessor_storage; }
        set disableMask(value) { this.#disableMask_accessor_storage = value; }
        #editing_accessor_storage = (__runInitializers(this, _disableMask_extraInitializers), __runInitializers(this, _editing_initializers, void 0));
        get editing() { return this.#editing_accessor_storage; }
        set editing(value) { this.#editing_accessor_storage = value; }
        #host_accessor_storage = (__runInitializers(this, _editing_extraInitializers), __runInitializers(this, _host_initializers, void 0));
        get host() { return this.#host_accessor_storage; }
        set host(value) { this.#host_accessor_storage = value; }
        #model_accessor_storage = (__runInitializers(this, _host_extraInitializers), __runInitializers(this, _model_initializers, void 0));
        get model() { return this.#model_accessor_storage; }
        set model(value) { this.#model_accessor_storage = value; }
        #zoom_accessor_storage = (__runInitializers(this, _model_extraInitializers), __runInitializers(this, _zoom_initializers, void 0));
        get zoom() { return this.#zoom_accessor_storage; }
        set zoom(value) { this.#zoom_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _zoom_extraInitializers);
        }
    };
})();
export { EdgelessNoteMask };
