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
import { PropTypes, requiredProperties } from '@blocksuite/std';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';
import { EditorChevronDown } from '../toolbar';
const colors = [
    'default',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'purple',
    'grey',
];
// TODO(@fundon): these recent settings should be added to the dropdown menu
// tests/blocksutie/e2e/format-bar.spec.ts#253
//
// let latestHighlightColor: string | null = null;
// let latestHighlightType: HighlightType = 'background';
let HighlightDropdownMenu = (() => {
    let _classDecorators = [requiredProperties({
            updateHighlight: PropTypes.instanceOf(Function),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = LitElement;
    let _updateHighlight_decorators;
    let _updateHighlight_initializers = [];
    let _updateHighlight_extraInitializers = [];
    var HighlightDropdownMenu = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#updateHighlight_accessor_storage = __runInitializers(this, _updateHighlight_initializers, void 0);
            this._update = (__runInitializers(this, _updateHighlight_extraInitializers), (style) => {
                // latestHighlightColor = value;
                // latestHighlightType = type;
                this.updateHighlight(style);
            });
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _updateHighlight_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _updateHighlight_decorators, { kind: "accessor", name: "updateHighlight", static: false, private: false, access: { has: obj => "updateHighlight" in obj, get: obj => obj.updateHighlight, set: (obj, value) => { obj.updateHighlight = value; } }, metadata: _metadata }, _updateHighlight_initializers, _updateHighlight_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            HighlightDropdownMenu = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        #updateHighlight_accessor_storage;
        get updateHighlight() { return this.#updateHighlight_accessor_storage; }
        set updateHighlight(value) { this.#updateHighlight_accessor_storage = value; }
        render() {
            const prefix = '--affine-text-highlight';
            return html `
      <editor-menu-button
        .contentPadding="${'8px'}"
        .button=${html `
          <editor-icon-button aria-label="highlight" .tooltip="${'Highlight'}">
            <affine-highlight-duotone-icon
              style=${styleMap({
                '--color': 
                // latestHighlightColor ?? 'var(--affine-text-primary-color)',
                'var(--affine-text-primary-color)',
            })}
            ></affine-highlight-duotone-icon>
            ${EditorChevronDown}
          </editor-icon-button>
        `}
      >
        <div data-size="large" data-orientation="vertical">
          <div class="highlight-heading">Color</div>
          ${repeat(colors, color => {
                const isDefault = color === 'default';
                const value = isDefault
                    ? null
                    : `var(${prefix}-foreground-${color})`;
                return html `
              <editor-menu-action
                data-testid="foreground-${color}"
                @click=${() => this._update({ color: value })}
              >
                <affine-text-duotone-icon
                  style=${styleMap({
                    '--color': value ?? 'var(--affine-text-primary-color)',
                })}
                ></affine-text-duotone-icon>
                <span class="label capitalize"
                  >${isDefault ? `${color} color` : color}</span
                >
              </editor-menu-action>
            `;
            })}

          <div class="highlight-heading">Background</div>
          ${repeat(colors, color => {
                const isDefault = color === 'default';
                const value = isDefault ? null : `var(${prefix}-${color})`;
                return html `
              <editor-menu-action
                data-testid="background-${color}"
                @click=${() => this._update({ background: value })}
              >
                <affine-text-duotone-icon
                  style=${styleMap({
                    '--color': 'var(--affine-text-primary-color)',
                    '--background': value ?? 'transparent',
                })}
                ></affine-text-duotone-icon>

                <span class="label capitalize"
                  >${isDefault ? `${color} background` : color}</span
                >
              </editor-menu-action>
            `;
            })}
        </div>
      </editor-menu-button>
    `;
        }
    };
    return HighlightDropdownMenu = _classThis;
})();
export { HighlightDropdownMenu };
