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
import { requestConnectedFrame } from '@blocksuite/affine-shared/utils';
import { arrow, flip, hide, offset, shift, } from '@floating-ui/dom';
import { css, html, LitElement, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { HoverController } from '../hover/index.js';
const styles = css `
  .affine-tooltip {
    box-sizing: border-box;
    max-width: 280px;
    min-height: 32px;
    font-family: var(--affine-font-family);
    font-size: var(--affine-font-sm);
    border-radius: 4px;
    padding: 6px 12px;
    color: var(--affine-v2-tooltips-foreground, var(--affine-white));
    background: var(--affine-v2-tooltips-background, var(--affine-tooltip));

    overflow-wrap: anywhere;
    white-space: normal;
    word-break: break-word;
  }

  .arrow {
    position: absolute;

    width: 0;
    height: 0;
  }
`;
const TOOLTIP_ARROW_COLOR = 'var(--affine-v2-tooltips-background, var(--affine-tooltip))';
// See http://apps.eky.hk/css-triangle-generator/
const TRIANGLE_HEIGHT = 6;
const triangleMap = {
    top: {
        bottom: '-6px',
        borderStyle: 'solid',
        borderWidth: '6px 5px 0 5px',
        borderColor: `${TOOLTIP_ARROW_COLOR} transparent transparent transparent`,
    },
    right: {
        left: '-6px',
        borderStyle: 'solid',
        borderWidth: '5px 6px 5px 0',
        borderColor: `transparent ${TOOLTIP_ARROW_COLOR} transparent transparent`,
    },
    bottom: {
        top: '-6px',
        borderStyle: 'solid',
        borderWidth: '0 5px 6px 5px',
        borderColor: `transparent transparent ${TOOLTIP_ARROW_COLOR} transparent`,
    },
    left: {
        right: '-6px',
        borderStyle: 'solid',
        borderWidth: '5px 0 5px 6px',
        borderColor: `transparent transparent transparent ${TOOLTIP_ARROW_COLOR}`,
    },
};
// The padding for the autoShift and autoFlip middleware
// It's used to prevent the tooltip from overflowing the screen
const AUTO_SHIFT_PADDING = 12;
const AUTO_FLIP_PADDING = 12;
// Ported from https://floating-ui.com/docs/tutorial#arrow-middleware
const updateArrowStyles = ({ placement, middlewareData, }) => {
    const arrowX = middlewareData.arrow?.x;
    const arrowY = middlewareData.arrow?.y;
    const triangleStyles = triangleMap[placement.split('-')[0]];
    return {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        ...triangleStyles,
    };
};
/**
 * @example
 * ```ts
 * // Simple usage
 * html`
 * <affine-tooltip>Content</affine-tooltip>
 * `
 * // With placement
 * html`
 * <affine-tooltip tip-position="top">
 *   Content
 * </affine-tooltip>
 * `
 *
 * // With custom properties
 * html`
 * <affine-tooltip
 *   .zIndex=${0}
 *   .offset=${4}
 *   .autoFlip=${true}
 *   .arrow=${true}
 *   .tooltipStyle=${css`:host { z-index: 0; --affine-tooltip: #fff; }`}
 *   .allowInteractive=${false}
 * >
 *   Content
 * </affine-tooltip>
 * `
 * ```
 */
let Tooltip = (() => {
    let _classSuper = LitElement;
    let _allowInteractive_decorators;
    let _allowInteractive_initializers = [];
    let _allowInteractive_extraInitializers = [];
    let _arrow_decorators;
    let _arrow_initializers = [];
    let _arrow_extraInitializers = [];
    let _autoFlip_decorators;
    let _autoFlip_initializers = [];
    let _autoFlip_extraInitializers = [];
    let _autoHide_decorators;
    let _autoHide_initializers = [];
    let _autoHide_extraInitializers = [];
    let _autoShift_decorators;
    let _autoShift_initializers = [];
    let _autoShift_extraInitializers = [];
    let _hoverOptions_decorators;
    let _hoverOptions_initializers = [];
    let _hoverOptions_extraInitializers = [];
    let _offsetY_decorators;
    let _offsetY_initializers = [];
    let _offsetY_extraInitializers = [];
    let _offsetX_decorators;
    let _offsetX_initializers = [];
    let _offsetX_extraInitializers = [];
    let _placement_decorators;
    let _placement_initializers = [];
    let _placement_extraInitializers = [];
    let _tooltipStyle_decorators;
    let _tooltipStyle_initializers = [];
    let _tooltipStyle_extraInitializers = [];
    let _zIndex_decorators;
    let _zIndex_initializers = [];
    let _zIndex_extraInitializers = [];
    return class Tooltip extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _allowInteractive_decorators = [property({ attribute: false })];
            _arrow_decorators = [property({ attribute: false })];
            _autoFlip_decorators = [property({ attribute: false })];
            _autoHide_decorators = [property({ attribute: false })];
            _autoShift_decorators = [property({ attribute: false })];
            _hoverOptions_decorators = [property({ attribute: false })];
            _offsetY_decorators = [property({ attribute: false })];
            _offsetX_decorators = [property({ attribute: false })];
            _placement_decorators = [property({ attribute: 'tip-position' })];
            _tooltipStyle_decorators = [property({ attribute: false })];
            _zIndex_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _allowInteractive_decorators, { kind: "accessor", name: "allowInteractive", static: false, private: false, access: { has: obj => "allowInteractive" in obj, get: obj => obj.allowInteractive, set: (obj, value) => { obj.allowInteractive = value; } }, metadata: _metadata }, _allowInteractive_initializers, _allowInteractive_extraInitializers);
            __esDecorate(this, null, _arrow_decorators, { kind: "accessor", name: "arrow", static: false, private: false, access: { has: obj => "arrow" in obj, get: obj => obj.arrow, set: (obj, value) => { obj.arrow = value; } }, metadata: _metadata }, _arrow_initializers, _arrow_extraInitializers);
            __esDecorate(this, null, _autoFlip_decorators, { kind: "accessor", name: "autoFlip", static: false, private: false, access: { has: obj => "autoFlip" in obj, get: obj => obj.autoFlip, set: (obj, value) => { obj.autoFlip = value; } }, metadata: _metadata }, _autoFlip_initializers, _autoFlip_extraInitializers);
            __esDecorate(this, null, _autoHide_decorators, { kind: "accessor", name: "autoHide", static: false, private: false, access: { has: obj => "autoHide" in obj, get: obj => obj.autoHide, set: (obj, value) => { obj.autoHide = value; } }, metadata: _metadata }, _autoHide_initializers, _autoHide_extraInitializers);
            __esDecorate(this, null, _autoShift_decorators, { kind: "accessor", name: "autoShift", static: false, private: false, access: { has: obj => "autoShift" in obj, get: obj => obj.autoShift, set: (obj, value) => { obj.autoShift = value; } }, metadata: _metadata }, _autoShift_initializers, _autoShift_extraInitializers);
            __esDecorate(this, null, _hoverOptions_decorators, { kind: "accessor", name: "hoverOptions", static: false, private: false, access: { has: obj => "hoverOptions" in obj, get: obj => obj.hoverOptions, set: (obj, value) => { obj.hoverOptions = value; } }, metadata: _metadata }, _hoverOptions_initializers, _hoverOptions_extraInitializers);
            __esDecorate(this, null, _offsetY_decorators, { kind: "accessor", name: "offsetY", static: false, private: false, access: { has: obj => "offsetY" in obj, get: obj => obj.offsetY, set: (obj, value) => { obj.offsetY = value; } }, metadata: _metadata }, _offsetY_initializers, _offsetY_extraInitializers);
            __esDecorate(this, null, _offsetX_decorators, { kind: "accessor", name: "offsetX", static: false, private: false, access: { has: obj => "offsetX" in obj, get: obj => obj.offsetX, set: (obj, value) => { obj.offsetX = value; } }, metadata: _metadata }, _offsetX_initializers, _offsetX_extraInitializers);
            __esDecorate(this, null, _placement_decorators, { kind: "accessor", name: "placement", static: false, private: false, access: { has: obj => "placement" in obj, get: obj => obj.placement, set: (obj, value) => { obj.placement = value; } }, metadata: _metadata }, _placement_initializers, _placement_extraInitializers);
            __esDecorate(this, null, _tooltipStyle_decorators, { kind: "accessor", name: "tooltipStyle", static: false, private: false, access: { has: obj => "tooltipStyle" in obj, get: obj => obj.tooltipStyle, set: (obj, value) => { obj.tooltipStyle = value; } }, metadata: _metadata }, _tooltipStyle_initializers, _tooltipStyle_extraInitializers);
            __esDecorate(this, null, _zIndex_decorators, { kind: "accessor", name: "zIndex", static: false, private: false, access: { has: obj => "zIndex" in obj, get: obj => obj.zIndex, set: (obj, value) => { obj.zIndex = value; } }, metadata: _metadata }, _zIndex_initializers, _zIndex_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      display: none;
    }
  `; }
        _getStyles() {
            return css `
      ${styles}
      :host {
        z-index: ${unsafeCSS(this.zIndex)};
        opacity: 0;
        // All the styles are applied to the portal element
        ${unsafeCSS(this.style.cssText)}
      }

      ${this.allowInteractive
                ? css ``
                : css `
            :host {
              pointer-events: none;
            }
          `}

      ${this.tooltipStyle}
    `;
        }
        connectedCallback() {
            super.connectedCallback();
            this._setUpHoverController();
        }
        getPortal() {
            return this._hoverController.portal;
        }
        #allowInteractive_accessor_storage;
        /**
         * Allow the tooltip to be interactive.
         * eg. allow the user to select text in the tooltip.
         */
        get allowInteractive() { return this.#allowInteractive_accessor_storage; }
        set allowInteractive(value) { this.#allowInteractive_accessor_storage = value; }
        #arrow_accessor_storage;
        /**
         * Show a triangle arrow pointing to the reference element.
         */
        get arrow() { return this.#arrow_accessor_storage; }
        set arrow(value) { this.#arrow_accessor_storage = value; }
        #autoFlip_accessor_storage;
        /**
         * changes the placement of the floating element in order to keep it in view,
         * with the ability to flip to any placement.
         *
         * See https://floating-ui.com/docs/flip
         */
        get autoFlip() { return this.#autoFlip_accessor_storage; }
        set autoFlip(value) { this.#autoFlip_accessor_storage = value; }
        #autoHide_accessor_storage;
        /**
         * Hide the tooltip when the reference element is not in view.
         *
         * See https://floating-ui.com/docs/hide
         */
        get autoHide() { return this.#autoHide_accessor_storage; }
        set autoHide(value) { this.#autoHide_accessor_storage = value; }
        #autoShift_accessor_storage;
        /**
         * shifts the floating element to keep it in view.
         * this prevents the floating element from
         * overflowing along its axis of alignment,
         * thereby preserving the side it’s placed on.
         *
         * See https://floating-ui.com/docs/shift
         */
        get autoShift() { return this.#autoShift_accessor_storage; }
        set autoShift(value) { this.#autoShift_accessor_storage = value; }
        #hoverOptions_accessor_storage;
        get hoverOptions() { return this.#hoverOptions_accessor_storage; }
        set hoverOptions(value) { this.#hoverOptions_accessor_storage = value; }
        #offsetY_accessor_storage;
        /**
         * Default is `4px`
         *
         * See https://floating-ui.com/docs/offset
         */
        get offsetY() { return this.#offsetY_accessor_storage; }
        set offsetY(value) { this.#offsetY_accessor_storage = value; }
        #offsetX_accessor_storage;
        get offsetX() { return this.#offsetX_accessor_storage; }
        set offsetX(value) { this.#offsetX_accessor_storage = value; }
        #placement_accessor_storage;
        get placement() { return this.#placement_accessor_storage; }
        set placement(value) { this.#placement_accessor_storage = value; }
        #tooltipStyle_accessor_storage;
        get tooltipStyle() { return this.#tooltipStyle_accessor_storage; }
        set tooltipStyle(value) { this.#tooltipStyle_accessor_storage = value; }
        #zIndex_accessor_storage;
        get zIndex() { return this.#zIndex_accessor_storage; }
        set zIndex(value) { this.#zIndex_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._setUpHoverController = () => {
                this._hoverController = new HoverController(this, () => {
                    // const parentElement = this.parentElement;
                    // if (
                    //   parentElement &&
                    //   'disabled' in parentElement &&
                    //   parentElement.disabled
                    // )
                    //   return null;
                    if (this.hidden)
                        return null;
                    let arrowStyles = {};
                    let tooltipStyles = {};
                    return {
                        template: ({ positionSlot, updatePortal }) => {
                            positionSlot.subscribe(data => {
                                // The tooltip placement may change,
                                // so we need to update the arrow position
                                if (this.arrow) {
                                    arrowStyles = updateArrowStyles(data);
                                }
                                else {
                                    arrowStyles = {};
                                }
                                if (this.autoHide) {
                                    tooltipStyles.visibility = data.middlewareData.hide
                                        ?.referenceHidden
                                        ? 'hidden'
                                        : '';
                                    arrowStyles.visibility = tooltipStyles.visibility;
                                }
                                updatePortal();
                            });
                            const children = Array.from(this.childNodes).map(node => node.cloneNode(true));
                            return html `
              <style>
                ${this._getStyles()}
              </style>
              <div
                class="affine-tooltip"
                role="tooltip"
                style=${styleMap(tooltipStyles)}
              >
                ${children}
              </div>
              <div class="arrow" style=${styleMap(arrowStyles)}></div>
            `;
                        },
                        computePosition: portalRoot => ({
                            referenceElement: this.parentElement,
                            placement: this.placement,
                            middleware: [
                                this.autoFlip && flip({ padding: AUTO_FLIP_PADDING }),
                                this.autoShift && shift({ padding: AUTO_SHIFT_PADDING }),
                                offset({
                                    mainAxis: (this.arrow ? TRIANGLE_HEIGHT : 0) + this.offsetY,
                                    crossAxis: this.offsetX,
                                }),
                                arrow({
                                    element: portalRoot.shadowRoot.querySelector('.arrow'),
                                }),
                                this.autoHide && hide({ strategy: 'referenceHidden' }),
                            ],
                            autoUpdate: true,
                        }),
                    };
                }, {
                    leaveDelay: 0,
                    // The tooltip is not interactive by default
                    safeBridge: false,
                    allowMultiple: true,
                    ...this.hoverOptions,
                });
                const parent = this.parentElement;
                if (!parent) {
                    console.error('Tooltip must have a parent element');
                    return;
                }
                // Wait for render
                requestConnectedFrame(() => {
                    this._hoverController.setReference(parent);
                }, this);
            };
            this.#allowInteractive_accessor_storage = __runInitializers(this, _allowInteractive_initializers, false);
            this.#arrow_accessor_storage = (__runInitializers(this, _allowInteractive_extraInitializers), __runInitializers(this, _arrow_initializers, false));
            this.#autoFlip_accessor_storage = (__runInitializers(this, _arrow_extraInitializers), __runInitializers(this, _autoFlip_initializers, true));
            this.#autoHide_accessor_storage = (__runInitializers(this, _autoFlip_extraInitializers), __runInitializers(this, _autoHide_initializers, false));
            this.#autoShift_accessor_storage = (__runInitializers(this, _autoHide_extraInitializers), __runInitializers(this, _autoShift_initializers, false));
            this.#hoverOptions_accessor_storage = (__runInitializers(this, _autoShift_extraInitializers), __runInitializers(this, _hoverOptions_initializers, {}));
            this.#offsetY_accessor_storage = (__runInitializers(this, _hoverOptions_extraInitializers), __runInitializers(this, _offsetY_initializers, 6));
            this.#offsetX_accessor_storage = (__runInitializers(this, _offsetY_extraInitializers), __runInitializers(this, _offsetX_initializers, 0));
            this.#placement_accessor_storage = (__runInitializers(this, _offsetX_extraInitializers), __runInitializers(this, _placement_initializers, 'top'));
            this.#tooltipStyle_accessor_storage = (__runInitializers(this, _placement_extraInitializers), __runInitializers(this, _tooltipStyle_initializers, css ``));
            this.#zIndex_accessor_storage = (__runInitializers(this, _tooltipStyle_extraInitializers), __runInitializers(this, _zIndex_initializers, 'var(--affine-z-index-popover)'));
            __runInitializers(this, _zIndex_extraInitializers);
        }
    };
})();
export { Tooltip };
