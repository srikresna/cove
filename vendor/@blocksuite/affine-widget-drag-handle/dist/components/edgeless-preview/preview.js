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
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { EmbedIcon, FrameIcon, ImageIcon, PageIcon, ShapeIcon, } from '@blocksuite/icons/lit';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
const BLOCK_PREVIEW_ICON_MAP = {
    shape: {
        icon: ShapeIcon,
        name: 'Edgeless shape',
    },
    'affine:image': {
        icon: ImageIcon,
        name: 'Image block',
    },
    'affine:note': {
        icon: PageIcon,
        name: 'Note block',
    },
    'affine:frame': {
        icon: FrameIcon,
        name: 'Frame block',
    },
    'affine:embed-': {
        icon: EmbedIcon,
        name: 'Embed block',
    },
};
export const EDGELESS_DND_PREVIEW_ELEMENT = 'edgeless-dnd-preview-element';
let EdgelessDndPreviewElement = (() => {
    let _classSuper = LitElement;
    let _elementTypes_decorators;
    let _elementTypes_initializers = [];
    let _elementTypes_extraInitializers = [];
    return class EdgelessDndPreviewElement extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _elementTypes_decorators = [property({ type: Array })];
            __esDecorate(this, null, _elementTypes_decorators, { kind: "accessor", name: "elementTypes", static: false, private: false, access: { has: obj => "elementTypes" in obj, get: obj => obj.elementTypes, set: (obj, value) => { obj.elementTypes = value; } }, metadata: _metadata }, _elementTypes_initializers, _elementTypes_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .edgeless-dnd-preview-container {
      position: relative;
      padding: 12px;
      width: 264px;
      height: 80px;
    }

    .edgeless-dnd-preview-block {
      display: flex;
      position: absolute;

      width: 234px;

      align-items: flex-start;
      box-sizing: border-box;

      border-radius: 8px;
      background-color: ${unsafeCSSVarV2('layer/background/overlayPanel', '#FBFBFC')};

      padding: 8px 20px;
      gap: 8px;

      transform-origin: center;

      font-family: var(--affine-font-family);
      box-shadow: 0px 0px 0px 0.5px #e3e3e4 inset;
    }

    .edgeless-dnd-preview-block > svg {
      color: ${unsafeCSSVarV2('icon/primary', '#77757D')};
    }

    .edgeless-dnd-preview-block > .text {
      color: ${unsafeCSSVarV2('text/primary', '#121212')};
      font-size: 14px;
      line-height: 24px;
    }
  `; }
        #elementTypes_accessor_storage = __runInitializers(this, _elementTypes_initializers, []);
        get elementTypes() { return this.#elementTypes_accessor_storage; }
        set elementTypes(value) { this.#elementTypes_accessor_storage = value; }
        _getPreviewIcon(type) {
            if (BLOCK_PREVIEW_ICON_MAP[type]) {
                return BLOCK_PREVIEW_ICON_MAP[type];
            }
            if (type.startsWith('affine:embed-')) {
                return BLOCK_PREVIEW_ICON_MAP['affine:embed-'];
            }
            return {
                icon: ShapeIcon,
                name: 'Edgeless content',
            };
        }
        render() {
            const blocks = repeat(this.elementTypes.slice(0, 3), ({ type }, index) => {
                const { icon, name } = this._getPreviewIcon(type);
                return html `<div
        class="edgeless-dnd-preview-block"
        style=${styleMap({
                    transform: `rotate(${index * -2}deg)`,
                    zIndex: 3 - index,
                })}
      >
        ${icon({ width: '24px', height: '24px' })}
        <span class="text">${name}</span>
      </div>`;
            });
            return html `<div class="edgeless-dnd-preview-container">${blocks}</div>`;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _elementTypes_extraInitializers);
        }
    };
})();
export { EdgelessDndPreviewElement };
