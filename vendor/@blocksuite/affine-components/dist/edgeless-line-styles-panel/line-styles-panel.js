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
import { LineWidth, StrokeStyle } from '@blocksuite/affine-model';
import { WithDisposable } from '@blocksuite/global/lit';
import { BanIcon, DashLineIcon, StraightLineIcon } from '@blocksuite/icons/lit';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
const LINE_STYLE_LIST = [
    {
        key: 'Solid',
        value: StrokeStyle.Solid,
        icon: StraightLineIcon(),
    },
    {
        key: 'Dash',
        value: StrokeStyle.Dash,
        icon: DashLineIcon(),
    },
    {
        key: 'None',
        value: StrokeStyle.None,
        icon: BanIcon(),
    },
];
let EdgelessLineStylesPanel = (() => {
    let _classSuper = WithDisposable(LitElement);
    let _lineStyle_decorators;
    let _lineStyle_initializers = [];
    let _lineStyle_extraInitializers = [];
    let _lineSize_decorators;
    let _lineSize_initializers = [];
    let _lineSize_extraInitializers = [];
    let _lineStyles_decorators;
    let _lineStyles_initializers = [];
    let _lineStyles_extraInitializers = [];
    return class EdgelessLineStylesPanel extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _lineStyle_decorators = [property({ attribute: false })];
            _lineSize_decorators = [property({ attribute: false })];
            _lineStyles_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _lineStyle_decorators, { kind: "accessor", name: "lineStyle", static: false, private: false, access: { has: obj => "lineStyle" in obj, get: obj => obj.lineStyle, set: (obj, value) => { obj.lineStyle = value; } }, metadata: _metadata }, _lineStyle_initializers, _lineStyle_extraInitializers);
            __esDecorate(this, null, _lineSize_decorators, { kind: "accessor", name: "lineSize", static: false, private: false, access: { has: obj => "lineSize" in obj, get: obj => obj.lineSize, set: (obj, value) => { obj.lineSize = value; } }, metadata: _metadata }, _lineSize_initializers, _lineSize_extraInitializers);
            __esDecorate(this, null, _lineStyles_decorators, { kind: "accessor", name: "lineStyles", static: false, private: false, access: { has: obj => "lineStyles" in obj, get: obj => obj.lineStyles, set: (obj, value) => { obj.lineStyles = value; } }, metadata: _metadata }, _lineStyles_initializers, _lineStyles_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    edgeless-line-width-panel {
      flex: 1;
    }
  `; }
        select(detail) {
            this.dispatchEvent(new CustomEvent('select', {
                detail,
                bubbles: true,
                composed: true,
                cancelable: true,
            }));
        }
        render() {
            const { lineSize, lineStyle, lineStyles } = this;
            return html `
      <edgeless-line-width-panel
        .disabled=${lineStyle === StrokeStyle.None}
        .selectedSize=${lineSize}
        @select=${(e) => {
                e.stopPropagation();
                this.select({ type: 'size', value: e.detail });
            }}
      ></edgeless-line-width-panel>

      <editor-toolbar-separator></editor-toolbar-separator>

      ${repeat(LINE_STYLE_LIST.filter(item => lineStyles.includes(item.value)), item => item.value, ({ key, icon, value }) => {
                const active = lineStyle === value;
                const classInfo = {
                    'line-style-button': true,
                    [`mode-${value}`]: true,
                };
                if (active)
                    classInfo['active'] = true;
                return html `
            <editor-icon-button
              class=${classMap(classInfo)}
              .tooltip="${key}"
              .withHover=${active}
              @click=${() => this.select({ type: 'style', value })}
            >
              ${icon}
            </editor-icon-button>
          `;
            })}
    `;
        }
        #lineStyle_accessor_storage = __runInitializers(this, _lineStyle_initializers, void 0);
        get lineStyle() { return this.#lineStyle_accessor_storage; }
        set lineStyle(value) { this.#lineStyle_accessor_storage = value; }
        #lineSize_accessor_storage = (__runInitializers(this, _lineStyle_extraInitializers), __runInitializers(this, _lineSize_initializers, LineWidth.Two));
        get lineSize() { return this.#lineSize_accessor_storage; }
        set lineSize(value) { this.#lineSize_accessor_storage = value; }
        #lineStyles_accessor_storage = (__runInitializers(this, _lineSize_extraInitializers), __runInitializers(this, _lineStyles_initializers, [
            StrokeStyle.Solid,
            StrokeStyle.Dash,
            StrokeStyle.None,
        ]));
        get lineStyles() { return this.#lineStyles_accessor_storage; }
        set lineStyles(value) { this.#lineStyles_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _lineStyles_extraInitializers);
        }
    };
})();
export { EdgelessLineStylesPanel };
