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
import {} from '@blocksuite/affine-model';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { BlockComponent, BlockSelection } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { css, html } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
let EdgelessSurfaceRefBlockComponent = (() => {
    let _classSuper = BlockComponent;
    let __referenceModel_decorators;
    let __referenceModel_initializers = [];
    let __referenceModel_extraInitializers = [];
    let __focused_decorators;
    let __focused_initializers = [];
    let __focused_extraInitializers = [];
    return class EdgelessSurfaceRefBlockComponent extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __referenceModel_decorators = [state()];
            __focused_decorators = [state()];
            __esDecorate(this, null, __referenceModel_decorators, { kind: "accessor", name: "_referenceModel", static: false, private: false, access: { has: obj => "_referenceModel" in obj, get: obj => obj._referenceModel, set: (obj, value) => { obj._referenceModel = value; } }, metadata: _metadata }, __referenceModel_initializers, __referenceModel_extraInitializers);
            __esDecorate(this, null, __focused_decorators, { kind: "accessor", name: "_focused", static: false, private: false, access: { has: obj => "_focused" in obj, get: obj => obj._focused, set: (obj, value) => { obj._focused = value; } }, metadata: _metadata }, __focused_initializers, __focused_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    affine-edgeless-surface-ref {
      position: relative;
      overflow: hidden;
    }

    .affine-edgeless-surface-ref-container {
      border-radius: 8px;
      border: 1px solid
        ${unsafeCSSVarV2('layer/insideBorder/border', '#e6e6e6')};
      margin: 18px 0;
    }

    .affine-edgeless-surface-ref-container.focused {
      border-color: ${unsafeCSSVarV2('edgeless/frame/border/active')};
    }
  `; }
        connectedCallback() {
            super.connectedCallback();
            const elementModel = this.gfx.getElementById(this.model.props.reference);
            this._referenceModel = elementModel;
            this._initSelection();
        }
        _initSelection() {
            const selection = this.std.selection;
            this._disposables.add(selection.slots.changed.subscribe(selList => {
                this._focused = selList.some(sel => sel.blockId === this.blockId && sel.is(BlockSelection));
            }));
        }
        get gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        #_referenceModel_accessor_storage = __runInitializers(this, __referenceModel_initializers, null);
        get _referenceModel() { return this.#_referenceModel_accessor_storage; }
        set _referenceModel(value) { this.#_referenceModel_accessor_storage = value; }
        #_focused_accessor_storage = (__runInitializers(this, __referenceModel_extraInitializers), __runInitializers(this, __focused_initializers, false));
        get _focused() { return this.#_focused_accessor_storage; }
        set _focused(value) { this.#_focused_accessor_storage = value; }
        renderBlock() {
            return html ` <div
      class=${classMap({
                'affine-edgeless-surface-ref-container': true,
                focused: this._focused,
            })}
    >
      <surface-ref-placeholder
        .referenceModel=${this._referenceModel}
        .refFlavour=${this.model.props.refFlavour$.value}
        .inEdgeless=${true}
      ></surface-ref-placeholder>
    </div>`;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, __focused_extraInitializers);
        }
    };
})();
export { EdgelessSurfaceRefBlockComponent };
