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
import { DefaultTheme, resolveColor, } from '@blocksuite/affine-model';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { stopPropagation, } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { batch, signal } from '@preact/signals-core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { choose } from 'lit-html/directives/choose.js';
import { repeat } from 'lit-html/directives/repeat.js';
import { styleMap } from 'lit-html/directives/style-map.js';
import { when } from 'lit-html/directives/when.js';
import { calcCustomButtonStyle, keepColor, packColorsWith, preprocessColor, rgbaToHex8, } from '../color-picker';
let EdgelessShapeColorPicker = (() => {
    let _classSuper = WithDisposable(SignalWatcher(LitElement));
    let _payload_decorators;
    let _payload_initializers = [];
    let _payload_extraInitializers = [];
    let _palettes_decorators;
    let _palettes_initializers = [];
    let _palettes_extraInitializers = [];
    let _menuButton_decorators;
    let _menuButton_initializers = [];
    let _menuButton_extraInitializers = [];
    return class EdgelessShapeColorPicker extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _payload_decorators = [property({ attribute: false })];
            _palettes_decorators = [property({ attribute: false })];
            _menuButton_decorators = [query('editor-menu-button')];
            __esDecorate(this, null, _payload_decorators, { kind: "accessor", name: "payload", static: false, private: false, access: { has: obj => "payload" in obj, get: obj => obj.payload, set: (obj, value) => { obj.payload = value; } }, metadata: _metadata }, _payload_initializers, _payload_extraInitializers);
            __esDecorate(this, null, _palettes_decorators, { kind: "accessor", name: "palettes", static: false, private: false, access: { has: obj => "palettes" in obj, get: obj => obj.palettes, set: (obj, value) => { obj.palettes = value; } }, metadata: _metadata }, _palettes_initializers, _palettes_extraInitializers);
            __esDecorate(this, null, _menuButton_decorators, { kind: "accessor", name: "menuButton", static: false, private: false, access: { has: obj => "menuButton" in obj, get: obj => obj.menuButton, set: (obj, value) => { obj.menuButton = value; } }, metadata: _metadata }, _menuButton_initializers, _menuButton_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .pickers {
      display: flex;
      align-self: stretch;
      gap: 12px;
    }

    .picker {
      display: flex;
      align-self: stretch;
      gap: 8px;
    }

    .picker-label {
      color: ${unsafeCSSVarV2('text/secondary')};
      font-weight: 400;
    }
  `; }
        #pickFillColor;
        #pickStrokeColor;
        #pickColor;
        #pickStrokeStyle;
        #calcCustomButtonStyle(color, isCustomColor) {
            return calcCustomButtonStyle(color, isCustomColor, this);
        }
        #calcCustomButtonState(color, theme) {
            return !this.palettes
                .map(({ value }) => resolveColor(value, theme))
                .includes(color);
        }
        #switchToCustomWith(type) {
            batch(() => {
                this.tabType$.value = 'custom';
                this.colorType$.value = type;
            });
        }
        get fillColorWithoutAlpha() {
            const { fillColor } = this.payload;
            return keepColor(fillColor.startsWith('--')
                ? rgbaToHex8(preprocessColor(window.getComputedStyle(this))({
                    type: 'normal',
                    value: fillColor,
                }).rgba)
                : fillColor);
        }
        firstUpdated() {
            this.disposables.addFromEvent(this.menuButton, 'toggle', (e) => {
                const opened = e.detail;
                if (!opened && this.tabType$.peek() === 'custom') {
                    this.tabType$.value = 'normal';
                }
            });
        }
        render() {
            const { tabType$: { value: tabType }, colorType$: { value: colorType }, palettes, fillColorWithoutAlpha, payload: { fillColor, strokeColor, strokeWidth, strokeStyle, originalFillColor, originalStrokeColor, theme, enableCustomColor, }, } = this;
            return html `
      <editor-menu-button
        .contentPadding="${tabType === 'normal' ? '8px' : '0px'}"
        @click=${stopPropagation}
        .button=${html `
          <editor-icon-button aria-label="Color" .tooltip="${'Color'}">
            <edgeless-color-button
              .color=${fillColorWithoutAlpha}
            ></edgeless-color-button>
          </editor-icon-button>
        `}
      >
        <div class="pickers" data-orientation="vertical">
          ${choose(tabType, [
                [
                    'normal',
                    () => {
                        return html `
                  ${repeat([
                            {
                                label: 'Fill color',
                                type: 'fillColor',
                                value: fillColor,
                                hollowCircle: false,
                                onPick: this.#pickFillColor,
                            },
                            {
                                label: 'Border color',
                                type: 'strokeColor',
                                value: strokeColor,
                                hollowCircle: true,
                                onPick: this.#pickStrokeColor,
                            },
                        ], item => item.type, ({ label, type, value, onPick, hollowCircle }) => html `
                      <div class="picker-label">${label}</div>
                      <edgeless-color-panel
                        aria-label="${label}"
                        role="listbox"
                        .hasTransparent=${false}
                        .hollowCircle=${hollowCircle}
                        .value=${value}
                        .theme=${theme}
                        .palettes=${palettes}
                        @select=${onPick}
                      >
                        ${when(enableCustomColor, () => {
                            const isCustomColor = this.#calcCustomButtonState(value, theme);
                            const styleInfo = this.#calcCustomButtonStyle(value, isCustomColor);
                            return html `
                            <edgeless-color-custom-button
                              slot="custom"
                              style=${styleMap(styleInfo)}
                              ?active=${isCustomColor}
                              @click=${() => this.#switchToCustomWith(type)}
                            ></edgeless-color-custom-button>
                          `;
                        })}
                      </edgeless-color-panel>
                    `)}
                  <div class="picker-label">Border style</div>
                  <edgeless-line-styles-panel
                    class="picker"
                    .lineSize=${strokeWidth}
                    .lineStyle=${strokeStyle}
                    @select=${this.#pickStrokeStyle}
                  ></edgeless-line-styles-panel>
                `;
                    },
                ],
                [
                    'custom',
                    () => {
                        const isFillColor = colorType === 'fillColor';
                        const packed = packColorsWith(theme, isFillColor ? fillColor : strokeColor, isFillColor ? originalFillColor : originalStrokeColor);
                        const type = packed.type === 'palette' ? 'normal' : packed.type;
                        const modes = packed.colors.map(preprocessColor(window.getComputedStyle(this)));
                        return html `
                  <edgeless-color-picker
                    class="custom"
                    .pick=${this.#pickColor}
                    .colors=${{ type, modes }}
                  ></edgeless-color-picker>
                `;
                    },
                ],
            ])}
        </div>
      </editor-menu-button>
    `;
        }
        #payload_accessor_storage;
        get payload() { return this.#payload_accessor_storage; }
        set payload(value) { this.#payload_accessor_storage = value; }
        #palettes_accessor_storage;
        get palettes() { return this.#palettes_accessor_storage; }
        set palettes(value) { this.#palettes_accessor_storage = value; }
        #menuButton_accessor_storage;
        get menuButton() { return this.#menuButton_accessor_storage; }
        set menuButton(value) { this.#menuButton_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.tabType$ = signal('normal');
            this.colorType$ = signal('fillColor');
            this.#pickFillColor = (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('pickFillColor', {
                    detail: {
                        type: 'pick',
                        detail: e.detail,
                    },
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }));
            };
            this.#pickStrokeColor = (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('pickStrokeColor', {
                    detail: {
                        type: 'pick',
                        detail: e.detail,
                    },
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }));
            };
            this.#pickColor = (detail) => {
                const type = this.colorType$.peek() === 'fillColor'
                    ? 'pickFillColor'
                    : 'pickStrokeColor';
                this.dispatchEvent(new CustomEvent(type, {
                    detail,
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }));
            };
            this.#pickStrokeStyle = (e) => {
                e.stopPropagation();
                this.dispatchEvent(new CustomEvent('pickStrokeStyle', {
                    detail: e.detail,
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                }));
            };
            this.#payload_accessor_storage = __runInitializers(this, _payload_initializers, void 0);
            this.#palettes_accessor_storage = (__runInitializers(this, _payload_extraInitializers), __runInitializers(this, _palettes_initializers, DefaultTheme.Palettes));
            this.#menuButton_accessor_storage = (__runInitializers(this, _palettes_extraInitializers), __runInitializers(this, _menuButton_initializers, void 0));
            __runInitializers(this, _menuButton_extraInitializers);
        }
    };
})();
export { EdgelessShapeColorPicker };
