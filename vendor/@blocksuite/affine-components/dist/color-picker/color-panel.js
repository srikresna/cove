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
import { DefaultTheme, resolveColor } from '@blocksuite/affine-model';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { ColorEvent } from '@blocksuite/affine-shared/utils';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { repeat } from 'lit/directives/repeat.js';
import isEqual from 'lodash-es/isEqual';
import { AdditionIcon } from './icons';
let EdgelessColorButton = (() => {
    let _classSuper = LitElement;
    let _active_decorators;
    let _active_initializers = [];
    let _active_extraInitializers = [];
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    let _hollowCircle_decorators;
    let _hollowCircle_initializers = [];
    let _hollowCircle_extraInitializers = [];
    let _label_decorators;
    let _label_initializers = [];
    let _label_extraInitializers = [];
    let _theme_decorators;
    let _theme_initializers = [];
    let _theme_extraInitializers = [];
    return class EdgelessColorButton extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _active_decorators = [property({ attribute: true, type: Boolean })];
            _color_decorators = [property({ attribute: false })];
            _hollowCircle_decorators = [property({ attribute: false })];
            _label_decorators = [property({ attribute: false })];
            _theme_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _active_decorators, { kind: "accessor", name: "active", static: false, private: false, access: { has: obj => "active" in obj, get: obj => obj.active, set: (obj, value) => { obj.active = value; } }, metadata: _metadata }, _active_initializers, _active_extraInitializers);
            __esDecorate(this, null, _color_decorators, { kind: "accessor", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            __esDecorate(this, null, _hollowCircle_decorators, { kind: "accessor", name: "hollowCircle", static: false, private: false, access: { has: obj => "hollowCircle" in obj, get: obj => obj.hollowCircle, set: (obj, value) => { obj.hollowCircle = value; } }, metadata: _metadata }, _hollowCircle_initializers, _hollowCircle_extraInitializers);
            __esDecorate(this, null, _label_decorators, { kind: "accessor", name: "label", static: false, private: false, access: { has: obj => "label" in obj, get: obj => obj.label, set: (obj, value) => { obj.label = value; } }, metadata: _metadata }, _label_initializers, _label_extraInitializers);
            __esDecorate(this, null, _theme_decorators, { kind: "accessor", name: "theme", static: false, private: false, access: { has: obj => "theme" in obj, get: obj => obj.theme, set: (obj, value) => { obj.theme = value; } }, metadata: _metadata }, _theme_initializers, _theme_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      position: relative;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .color-unit {
      position: relative;
      width: 16px;
      height: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      box-sizing: border-box;
    }
    .color-unit svg {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
    }
    :host .color-unit::after {
      position: absolute;
      display: block;
      content: '';
      width: 100%;
      height: 100%;
      border-radius: 50%;
      box-sizing: border-box;
      overflow: hidden;
      border-width: 0.5px;
      border-style: solid;
      border-color: ${unsafeCSSVarV2('layer/insideBorder/blackBorder')};
    }
    :host(.black) .color-unit:after {
      border-color: ${unsafeCSSVarV2('layer/insideBorder/border')};
    }

    :host(.large) {
      width: 24px;
      height: 24px;
    }
    :host(.large) .color-unit {
      width: 20px;
      height: 20px;
    }
    :host::after {
      position: absolute;
      display: block;
      content: '';
      width: 27px;
      height: 27px;
      border-radius: 50%;
      box-sizing: border-box;
      overflow: hidden;
      pointer-events: none;
    }

    :host([active])::after {
      border: 1.5px solid var(--affine-primary-color);
    }
  `; }
        get preprocessColor() {
            const value = resolveColor(this.color, this.theme);
            return value.startsWith('--') ? `var(${value})` : value;
        }
        render() {
            const { label, preprocessColor, hollowCircle } = this;
            const additionIcon = AdditionIcon(preprocessColor, !!hollowCircle);
            return html `<div class="color-unit" aria-label=${ifDefined(label)}>
      ${additionIcon}
    </div>`;
        }
        #active_accessor_storage = __runInitializers(this, _active_initializers, false);
        get active() { return this.#active_accessor_storage; }
        set active(value) { this.#active_accessor_storage = value; }
        #color_accessor_storage = (__runInitializers(this, _active_extraInitializers), __runInitializers(this, _color_initializers, void 0));
        get color() { return this.#color_accessor_storage; }
        set color(value) { this.#color_accessor_storage = value; }
        #hollowCircle_accessor_storage = (__runInitializers(this, _color_extraInitializers), __runInitializers(this, _hollowCircle_initializers, false));
        get hollowCircle() { return this.#hollowCircle_accessor_storage; }
        set hollowCircle(value) { this.#hollowCircle_accessor_storage = value; }
        #label_accessor_storage = (__runInitializers(this, _hollowCircle_extraInitializers), __runInitializers(this, _label_initializers, undefined));
        get label() { return this.#label_accessor_storage; }
        set label(value) { this.#label_accessor_storage = value; }
        #theme_accessor_storage = (__runInitializers(this, _label_extraInitializers), __runInitializers(this, _theme_initializers, void 0));
        get theme() { return this.#theme_accessor_storage; }
        set theme(value) { this.#theme_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _theme_extraInitializers);
        }
    };
})();
export { EdgelessColorButton };
let EdgelessColorPanel = (() => {
    let _classSuper = LitElement;
    let _hasTransparent_decorators;
    let _hasTransparent_initializers = [];
    let _hasTransparent_extraInitializers = [];
    let _hollowCircle_decorators;
    let _hollowCircle_initializers = [];
    let _hollowCircle_extraInitializers = [];
    let _palettes_decorators;
    let _palettes_initializers = [];
    let _palettes_extraInitializers = [];
    let _theme_decorators;
    let _theme_initializers = [];
    let _theme_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    let _columns_decorators;
    let _columns_initializers = [];
    let _columns_extraInitializers = [];
    return class EdgelessColorPanel extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _hasTransparent_decorators = [property({ attribute: false })];
            _hollowCircle_decorators = [property({ attribute: false })];
            _palettes_decorators = [property({ type: Array })];
            _theme_decorators = [property({ attribute: false })];
            _value_decorators = [property({ attribute: false })];
            _columns_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _hasTransparent_decorators, { kind: "accessor", name: "hasTransparent", static: false, private: false, access: { has: obj => "hasTransparent" in obj, get: obj => obj.hasTransparent, set: (obj, value) => { obj.hasTransparent = value; } }, metadata: _metadata }, _hasTransparent_initializers, _hasTransparent_extraInitializers);
            __esDecorate(this, null, _hollowCircle_decorators, { kind: "accessor", name: "hollowCircle", static: false, private: false, access: { has: obj => "hollowCircle" in obj, get: obj => obj.hollowCircle, set: (obj, value) => { obj.hollowCircle = value; } }, metadata: _metadata }, _hollowCircle_initializers, _hollowCircle_extraInitializers);
            __esDecorate(this, null, _palettes_decorators, { kind: "accessor", name: "palettes", static: false, private: false, access: { has: obj => "palettes" in obj, get: obj => obj.palettes, set: (obj, value) => { obj.palettes = value; } }, metadata: _metadata }, _palettes_initializers, _palettes_extraInitializers);
            __esDecorate(this, null, _theme_decorators, { kind: "accessor", name: "theme", static: false, private: false, access: { has: obj => "theme" in obj, get: obj => obj.theme, set: (obj, value) => { obj.theme = value; } }, metadata: _metadata }, _theme_initializers, _theme_extraInitializers);
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            __esDecorate(this, null, _columns_decorators, { kind: "accessor", name: "columns", static: false, private: false, access: { has: obj => "columns" in obj, get: obj => obj.columns, set: (obj, value) => { obj.columns = value; } }, metadata: _metadata }, _columns_initializers, _columns_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: grid;
      grid-gap: 4px;
      grid-template-columns: repeat(var(--columns, 9), 1fr);
    }

    /* note */
    :host(.small) {
      grid-template-columns: repeat(var(--columns, 6), 1fr);
      grid-gap: 8px;
    }

    /* edgeless toolbar */
    :host(.one-way) {
      display: flex;
      flex-wrap: nowrap;
      padding: 0 2px;
      gap: 14px;
      box-sizing: border-box;
      background: var(--affine-background-overlay-panel-color);
    }

    :host(.one-way.small) {
      display: flex;
      gap: 4px;
      background: unset;
    }
  `; }
        select(palette) {
            this.dispatchEvent(new ColorEvent('select', {
                detail: palette,
                bubbles: true,
                composed: true,
                cancelable: true,
            }));
        }
        get resolvedValue() {
            return this.value && resolveColor(this.value, this.theme);
        }
        willUpdate(changedProperties) {
            if (changedProperties.has('columns')) {
                if (this.columns) {
                    this.style.setProperty('--columns', this.columns.toString());
                }
                else {
                    this.style.removeProperty('--columns');
                }
            }
        }
        render() {
            return html `
      ${repeat(this.palettes, palette => palette.key, palette => {
                const resolvedColor = resolveColor(palette.value, this.theme);
                const activated = isEqual(resolvedColor, this.resolvedValue);
                return html `<edgeless-color-button
            class=${classMap({ large: true })}
            .label=${palette.key}
            .color=${palette.value}
            .theme=${this.theme}
            .hollowCircle=${this.hollowCircle}
            ?active=${activated}
            @click=${() => {
                    this.select(palette);
                    this.value = resolvedColor;
                }}
          >
          </edgeless-color-button>`;
            })}
      <slot name="custom"></slot>
    `;
        }
        #hasTransparent_accessor_storage = __runInitializers(this, _hasTransparent_initializers, true);
        get hasTransparent() { return this.#hasTransparent_accessor_storage; }
        set hasTransparent(value) { this.#hasTransparent_accessor_storage = value; }
        #hollowCircle_accessor_storage = (__runInitializers(this, _hasTransparent_extraInitializers), __runInitializers(this, _hollowCircle_initializers, false));
        get hollowCircle() { return this.#hollowCircle_accessor_storage; }
        set hollowCircle(value) { this.#hollowCircle_accessor_storage = value; }
        #palettes_accessor_storage = (__runInitializers(this, _hollowCircle_extraInitializers), __runInitializers(this, _palettes_initializers, DefaultTheme.Palettes));
        get palettes() { return this.#palettes_accessor_storage; }
        set palettes(value) { this.#palettes_accessor_storage = value; }
        #theme_accessor_storage = (__runInitializers(this, _palettes_extraInitializers), __runInitializers(this, _theme_initializers, void 0));
        get theme() { return this.#theme_accessor_storage; }
        set theme(value) { this.#theme_accessor_storage = value; }
        #value_accessor_storage = (__runInitializers(this, _theme_extraInitializers), __runInitializers(this, _value_initializers, null));
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        #columns_accessor_storage = (__runInitializers(this, _value_extraInitializers), __runInitializers(this, _columns_initializers, undefined));
        get columns() { return this.#columns_accessor_storage; }
        set columns(value) { this.#columns_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _columns_extraInitializers);
        }
    };
})();
export { EdgelessColorPanel };
let EdgelessTextColorIcon = (() => {
    let _classSuper = LitElement;
    let _color_decorators;
    let _color_initializers = [];
    let _color_extraInitializers = [];
    return class EdgelessTextColorIcon extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _color_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _color_decorators, { kind: "accessor", name: "color", static: false, private: false, access: { has: obj => "color" in obj, get: obj => obj.color, set: (obj, value) => { obj.color = value; } }, metadata: _metadata }, _color_initializers, _color_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 20px;
      height: 20px;
    }
  `; }
        get preprocessColor() {
            const color = this.color;
            return color.startsWith('--') ? `var(${color})` : color;
        }
        render() {
            return html `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          fill="currentColor"
          d="M8.71093 3.85123C8.91241 3.31395 9.42603 2.95801 9.99984 2.95801C10.5737 2.95801 11.0873 3.31395 11.2888 3.85123L14.7517 13.0858C14.8729 13.409 14.7092 13.7692 14.386 13.8904C14.0628 14.0116 13.7025 13.8479 13.5813 13.5247L12.5648 10.8141H7.43487L6.41838 13.5247C6.29718 13.8479 5.93693 14.0116 5.61373 13.8904C5.29052 13.7692 5.12677 13.409 5.24797 13.0858L8.71093 3.85123ZM7.90362 9.56405H12.0961L10.1183 4.29013C10.0998 4.24073 10.0526 4.20801 9.99984 4.20801C9.94709 4.20801 9.89986 4.24073 9.88134 4.29013L7.90362 9.56405Z"
        />
        <rect
          x="3.3335"
          y="15"
          width="13.3333"
          height="2.08333"
          rx="1"
          fill=${this.preprocessColor}
        />
      </svg>
    `;
        }
        #color_accessor_storage = __runInitializers(this, _color_initializers, void 0);
        get color() { return this.#color_accessor_storage; }
        set color(value) { this.#color_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _color_extraInitializers);
        }
    };
})();
export { EdgelessTextColorIcon };
