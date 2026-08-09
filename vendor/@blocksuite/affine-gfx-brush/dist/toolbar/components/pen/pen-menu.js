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
import { adjustColorAlpha } from '@blocksuite/affine-components/color-picker';
import { BRUSH_LINE_WIDTHS, DefaultTheme, HIGHLIGHTER_LINE_WIDTHS, } from '@blocksuite/affine-model';
import { FeatureFlagService, ThemeProvider, } from '@blocksuite/affine-shared/services';
import { EdgelessToolbarToolMixin } from '@blocksuite/affine-widget-edgeless-toolbar';
import { SignalWatcher } from '@blocksuite/global/lit';
import { computed, } from '@preact/signals-core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { BrushTool } from '../../../brush-tool';
import { HighlighterTool } from '../../../highlighter-tool';
import { penInfoMap } from './consts';
let EdgelessPenMenu = (() => {
    let _classSuper = EdgelessToolbarToolMixin(SignalWatcher(LitElement));
    let _onChange_decorators;
    let _onChange_initializers = [];
    let _onChange_extraInitializers = [];
    let _colors$_decorators;
    let _colors$_initializers = [];
    let _colors$_extraInitializers = [];
    let _penIconMap$_decorators;
    let _penIconMap$_initializers = [];
    let _penIconMap$_extraInitializers = [];
    let _pen$_decorators;
    let _pen$_initializers = [];
    let _pen$_extraInitializers = [];
    let _penInfo$_decorators;
    let _penInfo$_initializers = [];
    let _penInfo$_extraInitializers = [];
    return class EdgelessPenMenu extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _onChange_decorators = [property({ attribute: false })];
            _colors$_decorators = [property({ attribute: false })];
            _penIconMap$_decorators = [property({ attribute: false })];
            _pen$_decorators = [property({ attribute: false })];
            _penInfo$_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _onChange_decorators, { kind: "accessor", name: "onChange", static: false, private: false, access: { has: obj => "onChange" in obj, get: obj => obj.onChange, set: (obj, value) => { obj.onChange = value; } }, metadata: _metadata }, _onChange_initializers, _onChange_extraInitializers);
            __esDecorate(this, null, _colors$_decorators, { kind: "accessor", name: "colors$", static: false, private: false, access: { has: obj => "colors$" in obj, get: obj => obj.colors$, set: (obj, value) => { obj.colors$ = value; } }, metadata: _metadata }, _colors$_initializers, _colors$_extraInitializers);
            __esDecorate(this, null, _penIconMap$_decorators, { kind: "accessor", name: "penIconMap$", static: false, private: false, access: { has: obj => "penIconMap$" in obj, get: obj => obj.penIconMap$, set: (obj, value) => { obj.penIconMap$ = value; } }, metadata: _metadata }, _penIconMap$_initializers, _penIconMap$_extraInitializers);
            __esDecorate(this, null, _pen$_decorators, { kind: "accessor", name: "pen$", static: false, private: false, access: { has: obj => "pen$" in obj, get: obj => obj.pen$, set: (obj, value) => { obj.pen$ = value; } }, metadata: _metadata }, _pen$_initializers, _pen$_extraInitializers);
            __esDecorate(this, null, _penInfo$_decorators, { kind: "accessor", name: "penInfo$", static: false, private: false, access: { has: obj => "penInfo$" in obj, get: obj => obj.penInfo$, set: (obj, value) => { obj.penInfo$ = value; } }, metadata: _metadata }, _penInfo$_initializers, _penInfo$_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: flex;
      position: absolute;
      z-index: -1;
    }

    .pens {
      display: flex;
      height: 100%;
      padding: 0 4px;
      align-items: flex-end;

      edgeless-tool-icon-button {
        display: flex;
        align-self: flex-start;
      }

      .pen-wrapper {
        display: flex;
        min-width: 38px;
        height: 64px;
        align-items: flex-end;
        justify-content: center;
        position: relative;
        transform: translateY(-2px);
        transition-property: color, transform;
        transition-duration: 300ms;
        transition-timing-function: ease-in-out;
        cursor: pointer;
      }

      .pen-wrapper:hover,
      .pen-wrapper:active,
      .pen-wrapper[data-active] {
        transform: translateY(-22px);
      }
    }

    .menu-content {
      display: flex;
      align-items: center;
    }

    menu-divider {
      display: flex;
      align-self: center;
      height: 24px;
      margin: 0 9px;
    }
  `; }
        render() {
            const { _theme$: { value: theme }, colors$: { value: { brush: brushColor, highlighter: highlighterColor }, }, penIconMap$: { value: { brush: brushIcon, highlighter: highlighterIcon }, }, penInfo$: { value: { type, color, lineWidth }, }, } = this;
            const lineWidths = type === 'brush' ? BRUSH_LINE_WIDTHS : HIGHLIGHTER_LINE_WIDTHS;
            return html `
      <edgeless-slide-menu>
        <div class="pens" slot="prefix">
          <edgeless-tool-icon-button
            class="edgeless-brush-button"
            .tooltip=${html `<affine-tooltip-content-with-shortcut
              data-tip="${penInfoMap.brush.tip}"
              data-shortcut="${penInfoMap.brush.shortcut}"
            ></affine-tooltip-content-with-shortcut>`}
            .tooltipOffset=${20}
            .hover=${false}
            @click=${() => this._onPickPen('brush')}
          >
            <div
              class="pen-wrapper"
              style=${styleMap({ color: brushColor })}
              ?data-active="${type === 'brush'}"
            >
              ${brushIcon}
            </div>
          </edgeless-tool-icon-button>

          <edgeless-tool-icon-button
            class="edgeless-highlighter-button"
            .tooltip=${html `<affine-tooltip-content-with-shortcut
              data-tip="${penInfoMap.highlighter.tip}"
              data-shortcut="${penInfoMap.highlighter.shortcut}"
            ></affine-tooltip-content-with-shortcut>`}
            .tooltipOffset=${20}
            .hover=${false}
            @click=${() => this._onPickPen('highlighter')}
          >
            <div
              class="pen-wrapper"
              style=${styleMap({ color: highlighterColor })}
              ?data-active="${type === 'highlighter'}"
            >
              ${highlighterIcon}
            </div>
          </edgeless-tool-icon-button>
          <menu-divider .vertical=${true}></menu-divider>
        </div>
        <div class="menu-content">
          <edgeless-line-width-panel
            .selectedSize=${lineWidth}
            .lineWidths=${lineWidths}
            @select=${this._onPickLineWidth}
          >
          </edgeless-line-width-panel>
          <menu-divider .vertical=${true}></menu-divider>
          <edgeless-color-panel
            class="one-way"
            @select=${this._onPickColor}
            .value=${color}
            .theme=${theme}
            .palettes=${DefaultTheme.StrokeColorShortPalettes}
            .shouldKeepColor=${true}
            .hasTransparent=${!this.edgeless.store
                .get(FeatureFlagService)
                .getFlag('enable_color_picker')}
          ></edgeless-color-panel>
        </div>
      </edgeless-slide-menu>
    `;
        }
        #onChange_accessor_storage;
        get onChange() { return this.#onChange_accessor_storage; }
        set onChange(value) { this.#onChange_accessor_storage = value; }
        #colors$_accessor_storage;
        get colors$() { return this.#colors$_accessor_storage; }
        set colors$(value) { this.#colors$_accessor_storage = value; }
        #penIconMap$_accessor_storage;
        get penIconMap$() { return this.#penIconMap$_accessor_storage; }
        set penIconMap$(value) { this.#penIconMap$_accessor_storage = value; }
        #pen$_accessor_storage;
        get pen$() { return this.#pen$_accessor_storage; }
        set pen$(value) { this.#pen$_accessor_storage = value; }
        #penInfo$_accessor_storage;
        get penInfo$() { return this.#penInfo$_accessor_storage; }
        set penInfo$(value) { this.#penInfo$_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._theme$ = computed(() => {
                return this.edgeless.std.get(ThemeProvider).theme$.value;
            });
            this._onPickPen = (tool) => {
                this.pen$.value = tool;
                if (tool === 'brush') {
                    this.setEdgelessTool(BrushTool);
                }
                else {
                    this.setEdgelessTool(HighlighterTool);
                }
            };
            this._onPickColor = (e) => {
                let color = e.detail.value;
                if (this.pen$.peek() === 'highlighter') {
                    color = adjustColorAlpha(color, 0.3);
                }
                this.onChange({ color });
            };
            this._onPickLineWidth = (e) => {
                e.stopPropagation();
                this.onChange({ lineWidth: e.detail });
            };
            this.type = [BrushTool, HighlighterTool];
            this.#onChange_accessor_storage = __runInitializers(this, _onChange_initializers, void 0);
            this.#colors$_accessor_storage = (__runInitializers(this, _onChange_extraInitializers), __runInitializers(this, _colors$_initializers, void 0));
            this.#penIconMap$_accessor_storage = (__runInitializers(this, _colors$_extraInitializers), __runInitializers(this, _penIconMap$_initializers, void 0));
            this.#pen$_accessor_storage = (__runInitializers(this, _penIconMap$_extraInitializers), __runInitializers(this, _pen$_initializers, void 0));
            this.#penInfo$_accessor_storage = (__runInitializers(this, _pen$_extraInitializers), __runInitializers(this, _penInfo$_initializers, void 0));
            __runInitializers(this, _penInfo$_extraInitializers);
        }
    };
})();
export { EdgelessPenMenu };
