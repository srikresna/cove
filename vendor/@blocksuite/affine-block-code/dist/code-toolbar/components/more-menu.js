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
import { renderGroups } from '@blocksuite/affine-components/toolbar';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
let AffineCodeMoreMenu = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _context_decorators;
    let _context_initializers = [];
    let _context_extraInitializers = [];
    let _moreGroups_decorators;
    let _moreGroups_initializers = [];
    let _moreGroups_extraInitializers = [];
    return class AffineCodeMoreMenu extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _context_decorators = [property({ attribute: false })];
            _moreGroups_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _context_decorators, { kind: "accessor", name: "context", static: false, private: false, access: { has: obj => "context" in obj, get: obj => obj.context, set: (obj, value) => { obj.context = value; } }, metadata: _metadata }, _context_initializers, _context_extraInitializers);
            __esDecorate(this, null, _moreGroups_decorators, { kind: "accessor", name: "moreGroups", static: false, private: false, access: { has: obj => "moreGroups" in obj, get: obj => obj.moreGroups, set: (obj, value) => { obj.moreGroups = value; } }, metadata: _metadata }, _moreGroups_initializers, _moreGroups_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        firstUpdated() {
            this.disposables.add(this.context.blockComponent.model.propsUpdated.subscribe(({ key }) => {
                if (key === 'wrap' || key === 'lineNumber') {
                    this.requestUpdate();
                }
            }));
        }
        render() {
            return html `
      <editor-menu-content
        data-show
        class="more-popup-menu"
        style=${styleMap({
                '--content-padding': '8px',
                '--packed-height': '4px',
            })}
      >
        <div data-size="large" data-orientation="vertical">
          ${renderGroups(this.moreGroups, this.context)}
        </div>
      </editor-menu-content>
    `;
        }
        #context_accessor_storage = __runInitializers(this, _context_initializers, void 0);
        get context() { return this.#context_accessor_storage; }
        set context(value) { this.#context_accessor_storage = value; }
        #moreGroups_accessor_storage = (__runInitializers(this, _context_extraInitializers), __runInitializers(this, _moreGroups_initializers, void 0));
        get moreGroups() { return this.#moreGroups_accessor_storage; }
        set moreGroups(value) { this.#moreGroups_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _moreGroups_extraInitializers);
        }
    };
})();
export { AffineCodeMoreMenu };
