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
import { ColorScheme, NoteShadow } from '@blocksuite/affine-model';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { NoteNoShadowIcon, NoteShadowSampleIcon } from './icons';
const SHADOWS = [
    {
        type: NoteShadow.None,
        light: {},
        dark: {},
        style: {},
        tooltip: 'No shadow',
    },
    {
        type: NoteShadow.Box,
        light: {
            '--note-box-shadow-color-1': 'rgba(0, 0, 0, 0.14)',
            '--note-box-shadow-color-2': 'rgba(0, 0, 0, 0.14)',
        },
        dark: {
            '--note-box-shadow-color-1': 'rgba(0, 0, 0, 0.30)',
            '--note-box-shadow-color-2': 'rgba(0, 0, 0, 0.44)',
        },
        style: {
            boxShadow: '0px 0.109px 2.621px var(--note-box-shadow-color-1), 0px 0px 0.874px var(--note-box-shadow-color-2)',
        },
        tooltip: 'Box shadow',
    },
    {
        type: NoteShadow.Sticker,
        light: {
            '--note-sticker-shadow-color-1': 'rgba(0, 0, 0, 0.08)',
            '--note-sticker-shadow-color-2': 'rgba(0, 0, 0, 0.10)',
        },
        dark: {
            '--note-sticker-shadow-color-1': 'rgba(0, 0, 0, 0.22)',
            '--note-sticker-shadow-color-2': 'rgba(0, 0, 0, 0.52)',
        },
        style: {
            boxShadow: '0px 5.243px 5.68px var(--note-sticker-shadow-color-1), 0px 5.68px 3.932px var(--note-sticker-shadow-color-2)',
        },
        tooltip: 'Sticker shadow',
    },
    {
        type: NoteShadow.Paper,
        light: {
            '--note-paper-shadow-color-1': 'rgba(0, 0, 0, 0.14)',
            '--note-paper-shadow-color-2': '#FFF',
        },
        dark: {
            '--note-paper-shadow-color-1': 'rgba(0, 0, 0, 0.30)',
            '--note-paper-shadow-color-2': '#7A7A7A',
        },
        style: {
            border: '2px solid var(--note-paper-shadow-color-2)',
            boxShadow: '0px 0.655px 1.311px var(--note-paper-shadow-color-1)',
        },
        tooltip: 'Paper shadow',
    },
    {
        type: NoteShadow.Float,
        light: {
            '--note-float-shadow-color-1': 'rgba(0, 0, 0, 0.09)',
            '--note-float-shadow-color-2': 'rgba(0, 0, 0, 0.10)',
        },
        dark: {
            '--note-float-shadow-color-1': 'rgba(0, 0, 0, 0.30)',
            '--note-float-shadow-color-2': 'rgba(0, 0, 0, 0.44)',
        },
        style: {
            boxShadow: '0px 2.84px 6.554px var(--note-float-shadow-color-1), 0px 0px 0.218px var(--note-float-shadow-color-2)',
        },
        tooltip: 'Floating shadow',
    },
    {
        type: NoteShadow.Film,
        light: {
            '--note-film-shadow-color-1': '#000',
            '--note-film-shadow-color-2': '#000',
        },
        dark: {
            '--note-film-shadow-color-1': '#7A7A7A',
            '--note-film-shadow-color-2': '#7A7A7A',
        },
        style: {
            border: '1px solid var(--note-film-shadow-color-1)',
            boxShadow: '2px 2px 0px var(--note-film-shadow-color-2)',
        },
        tooltip: 'Film shadow',
    },
];
let EdgelessNoteShadowMenu = (() => {
    let _classSuper = LitElement;
    let _background_decorators;
    let _background_initializers = [];
    let _background_extraInitializers = [];
    let _theme_decorators;
    let _theme_initializers = [];
    let _theme_extraInitializers = [];
    let _value_decorators;
    let _value_initializers = [];
    let _value_extraInitializers = [];
    return class EdgelessNoteShadowMenu extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _background_decorators = [property({ attribute: false })];
            _theme_decorators = [property({ attribute: false })];
            _value_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _background_decorators, { kind: "accessor", name: "background", static: false, private: false, access: { has: obj => "background" in obj, get: obj => obj.background, set: (obj, value) => { obj.background = value; } }, metadata: _metadata }, _background_initializers, _background_extraInitializers);
            __esDecorate(this, null, _theme_decorators, { kind: "accessor", name: "theme", static: false, private: false, access: { has: obj => "theme" in obj, get: obj => obj.theme, set: (obj, value) => { obj.theme = value; } }, metadata: _metadata }, _theme_initializers, _theme_extraInitializers);
            __esDecorate(this, null, _value_decorators, { kind: "accessor", name: "value", static: false, private: false, access: { has: obj => "value" in obj, get: obj => obj.value, set: (obj, value) => { obj.value = value; } }, metadata: _metadata }, _value_initializers, _value_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .item {
      padding: 4.369px;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }

    .item-icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .item-icon svg {
      width: 30px;
      height: auto;
      border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/blackBorder')};
      fill: ${unsafeCSSVarV2('layer/insideBorder/blackBorder')};
    }

    .item-icon svg rect:first-of-type {
      fill: var(--background);
    }

    .item:hover {
      background-color: var(--affine-hover-color);
    }

    .item[data-selected] {
      border: 1px solid var(--affine-brand-color);
    }
  `; }
        select(value) {
            this.dispatchEvent(new CustomEvent('select', { detail: value }));
        }
        willUpdate(changedProperties) {
            if (changedProperties.has('background')) {
                this.style.setProperty('--background', this.background);
            }
        }
        render() {
            const { value, theme } = this;
            const isDark = theme === ColorScheme.Dark;
            return repeat(SHADOWS, shadow => shadow.type, ({ type, tooltip, style, light, dark }, index) => html `<div
          class="item"
          ?data-selected="${value === type}"
          @click=${() => this.select(type)}
        >
          <editor-icon-button
            class="item-icon"
            data-testid="${type.replace('--', '')}"
            .tooltip=${tooltip}
            .tipPosition="${'bottom'}"
            .iconContainerPadding=${0}
            .hover=${false}
            style=${styleMap({
                ...(isDark ? dark : light),
                ...style,
            })}
          >
            ${index === 0 ? NoteNoShadowIcon : NoteShadowSampleIcon}
          </editor-icon-button>
        </div>`);
        }
        #background_accessor_storage = __runInitializers(this, _background_initializers, void 0);
        get background() { return this.#background_accessor_storage; }
        set background(value) { this.#background_accessor_storage = value; }
        #theme_accessor_storage = (__runInitializers(this, _background_extraInitializers), __runInitializers(this, _theme_initializers, void 0));
        get theme() { return this.#theme_accessor_storage; }
        set theme(value) { this.#theme_accessor_storage = value; }
        #value_accessor_storage = (__runInitializers(this, _theme_extraInitializers), __runInitializers(this, _value_initializers, void 0));
        get value() { return this.#value_accessor_storage; }
        set value(value) { this.#value_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _value_extraInitializers);
        }
    };
})();
export { EdgelessNoteShadowMenu };
