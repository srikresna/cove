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
import { FrameBlockModel, GroupElementModel, MindmapElementModel, ShapeElementModel, } from '@blocksuite/affine-model';
import { unsafeCSSVar, unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { EdgelessIcon, FrameIcon, GroupIcon, MindmapIcon, } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
let SurfaceRefToolbarTitle = (() => {
    let _classSuper = ShadowlessElement;
    let _referenceModel_decorators;
    let _referenceModel_initializers = [];
    let _referenceModel_extraInitializers = [];
    return class SurfaceRefToolbarTitle extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _referenceModel_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _referenceModel_decorators, { kind: "accessor", name: "referenceModel", static: false, private: false, access: { has: obj => "referenceModel" in obj, get: obj => obj.referenceModel, set: (obj, value) => { obj.referenceModel = value; } }, metadata: _metadata }, _referenceModel_initializers, _referenceModel_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    surface-ref-toolbar-title {
      display: flex;
      padding: 2px 4px;
      margin-right: auto;
      align-items: center;
      gap: 4px;
      border-radius: 4px;
      color: ${unsafeCSSVarV2('text/primary')};
      box-shadow: ${unsafeCSSVar('buttonShadow')};
      background: ${unsafeCSSVar('white')};

      svg {
        color: ${unsafeCSSVarV2('icon/primary')};
        width: 16px;
        height: 16px;
      }

      span {
        color: ${unsafeCSSVarV2('text/primary')};
        font-size: 12px;
        font-weight: 500;
        line-height: 20px;
      }
    }
  `; }
        #referenceModel_accessor_storage = __runInitializers(this, _referenceModel_initializers, null);
        get referenceModel() { return this.#referenceModel_accessor_storage; }
        set referenceModel(value) { this.#referenceModel_accessor_storage = value; }
        render() {
            const { referenceModel } = this;
            let title = '';
            let icon = EdgelessIcon();
            if (referenceModel instanceof GroupElementModel) {
                title = referenceModel.title.toString();
                icon = GroupIcon();
            }
            else if (referenceModel instanceof FrameBlockModel) {
                title = referenceModel.props.title.toString();
                icon = FrameIcon();
            }
            else if (referenceModel instanceof MindmapElementModel) {
                const rootElement = referenceModel.tree.element;
                if (rootElement instanceof ShapeElementModel) {
                    title = rootElement.text?.toString() ?? '';
                }
                icon = MindmapIcon();
            }
            return html `${icon}<span>${title}</span>`;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _referenceModel_extraInitializers);
        }
    };
})();
export { SurfaceRefToolbarTitle };
