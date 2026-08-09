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
import { DefaultTool, EdgelessCRUDIdentifier, } from '@blocksuite/affine-block-surface';
import { getLineHeight } from '@blocksuite/affine-gfx-text';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { almostEqual } from '@blocksuite/affine-shared/utils';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Bound, Vec } from '@blocksuite/global/gfx';
import { WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement, stdContext, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { RANGE_SYNC_EXCLUDE_ATTR } from '@blocksuite/std/inline';
import { consume } from '@lit/context';
import { css, html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import * as Y from 'yjs';
const HORIZONTAL_PADDING = 2;
const VERTICAL_PADDING = 2;
const BORDER_WIDTH = 1;
export function mountConnectorLabelEditor(connector, edgeless, point) {
    const mountElm = edgeless.querySelector('.edgeless-mount-point');
    if (!mountElm) {
        throw new BlockSuiteError(ErrorCode.ValueNotExists, "edgeless block's mount point does not exist");
    }
    const gfx = edgeless.std.get(GfxControllerIdentifier);
    gfx.tool.setTool(DefaultTool);
    gfx.selection.set({
        elements: [connector.id],
        editing: true,
    });
    if (!connector.text) {
        const text = new Y.Text();
        const labelOffset = connector.labelOffset;
        let labelXYWH = connector.labelXYWH ?? [0, 0, 16, 16];
        if (point) {
            const center = connector.getNearestPoint(point);
            const distance = connector.getOffsetDistanceByPoint(center);
            const bounds = Bound.fromXYWH(labelXYWH);
            bounds.center = center;
            labelOffset.distance = distance;
            labelXYWH = bounds.toXYWH();
        }
        edgeless.std.get(EdgelessCRUDIdentifier).updateElement(connector.id, {
            text,
            labelXYWH,
            labelOffset: { ...labelOffset },
        });
    }
    const editor = new EdgelessConnectorLabelEditor();
    editor.connector = connector;
    mountElm.append(editor);
    editor.updateComplete
        .then(() => {
        editor.inlineEditor?.focusEnd();
    })
        .catch(console.error);
}
let EdgelessConnectorLabelEditor = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _connector_decorators;
    let _connector_initializers = [];
    let _connector_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _richText_decorators;
    let _richText_initializers = [];
    let _richText_extraInitializers = [];
    return class EdgelessConnectorLabelEditor extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _connector_decorators = [property({ attribute: false })];
            _std_decorators = [consume({
                    context: stdContext,
                })];
            _richText_decorators = [query('rich-text')];
            __esDecorate(this, null, _connector_decorators, { kind: "accessor", name: "connector", static: false, private: false, access: { has: obj => "connector" in obj, get: obj => obj.connector, set: (obj, value) => { obj.connector = value; } }, metadata: _metadata }, _connector_initializers, _connector_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _richText_decorators, { kind: "accessor", name: "richText", static: false, private: false, access: { has: obj => "richText" in obj, get: obj => obj.richText, set: (obj, value) => { obj.richText = value; } }, metadata: _metadata }, _richText_initializers, _richText_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .edgeless-connector-label-editor {
      position: absolute;
      left: 0;
      top: 0;
      transform-origin: center;
      z-index: 10;
      padding: ${VERTICAL_PADDING}px ${HORIZONTAL_PADDING}px;
      border: ${BORDER_WIDTH}px solid var(--affine-primary-color, #1e96eb);
      background: var(--affine-background-primary-color, #fff);
      border-radius: 2px;
      box-shadow: 0px 0px 0px 2px rgba(30, 150, 235, 0.3);
      box-sizing: border-box;
      overflow: visible;

      .inline-editor {
        white-space: pre-wrap !important;
        outline: none;
      }

      .inline-editor span {
        word-break: normal !important;
        overflow-wrap: anywhere !important;
      }

      .edgeless-connector-label-editor-placeholder {
        pointer-events: none;
        color: var(--affine-text-disable-color);
        white-space: nowrap;
      }
    }
  `; }
        get crud() {
            return this.std.get(EdgelessCRUDIdentifier);
        }
        get gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        get selection() {
            return this.gfx.selection;
        }
        get inlineEditor() {
            return this.richText.inlineEditor;
        }
        get inlineEditorContainer() {
            return this.inlineEditor?.rootElement;
        }
        connectedCallback() {
            super.connectedCallback();
            this.setAttribute(RANGE_SYNC_EXCLUDE_ATTR, 'true');
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._resizeObserver?.disconnect();
            this._resizeObserver = null;
        }
        firstUpdated() {
            const { connector, selection, std } = this;
            const dispatcher = std.event;
            this._resizeObserver = new ResizeObserver(() => {
                this._updateLabelRect();
                this.requestUpdate();
            });
            this._resizeObserver.observe(this.richText);
            this.connector.stash('labelXYWH');
            this.updateComplete
                .then(() => {
                if (!this.inlineEditor)
                    return;
                this.inlineEditor.selectAll();
                this.inlineEditor.slots.renderComplete.subscribe(() => {
                    this.requestUpdate();
                });
                this.disposables.add(dispatcher.add('keyDown', ctx => {
                    const state = ctx.get('keyboardState');
                    const { key, ctrlKey, metaKey, altKey, shiftKey, isComposing } = state.raw;
                    const onlyCmd = (ctrlKey || metaKey) && !altKey && !shiftKey;
                    const isModEnter = onlyCmd && key === 'Enter';
                    const isEscape = key === 'Escape';
                    if (!isComposing && (isModEnter || isEscape)) {
                        this.inlineEditorContainer?.blur();
                        selection.set({
                            elements: [connector.id],
                            editing: false,
                        });
                        return true;
                    }
                    return false;
                }));
                const surface = this.gfx.surface;
                if (surface) {
                    this.disposables.add(surface.elementUpdated.subscribe(({ id }) => {
                        if (id === connector.id)
                            this.requestUpdate();
                    }));
                }
                this.disposables.add(this.gfx.viewport.viewportUpdated.subscribe(() => {
                    this.requestUpdate();
                }));
                this.disposables.add(dispatcher.add('click', () => true));
                this.disposables.add(dispatcher.add('doubleClick', () => true));
                this.disposables.add(() => {
                    if (connector.text) {
                        const text = connector.text.toString();
                        const trimed = text.trim();
                        const len = trimed.length;
                        if (len === 0) {
                            // reset
                            this.crud.updateElement(connector.id, {
                                text: undefined,
                                labelXYWH: undefined,
                                labelOffset: undefined,
                            });
                        }
                        else if (len < text.length) {
                            this.crud.updateElement(connector.id, {
                                // @TODO: trim in Y.Text?
                                text: new Y.Text(trimed),
                            });
                        }
                    }
                    connector.labelEditing = false;
                    connector.pop('labelXYWH');
                    selection.set({
                        elements: [],
                        editing: false,
                    });
                });
                if (!this.inlineEditorContainer)
                    return;
                this.disposables.addFromEvent(this.inlineEditorContainer, 'blur', () => {
                    if (this._keeping)
                        return;
                    this.remove();
                });
                this.disposables.addFromEvent(this.inlineEditorContainer, 'compositionstart', () => {
                    this._isComposition = true;
                    this.requestUpdate();
                });
                this.disposables.addFromEvent(this.inlineEditorContainer, 'compositionend', () => {
                    this._isComposition = false;
                    this.requestUpdate();
                });
                connector.labelEditing = true;
            })
                .catch(console.error);
        }
        async getUpdateComplete() {
            const result = await super.getUpdateComplete();
            await this.richText?.updateComplete;
            return result;
        }
        render() {
            const { connector } = this;
            const { labelOffset: { distance }, labelStyle: { fontFamily, fontSize, fontStyle, fontWeight, textAlign, color: labelColor, }, labelConstraints: { hasMaxWidth, maxWidth }, } = connector;
            const lineHeight = getLineHeight(fontFamily, fontSize, fontWeight);
            const { translateX, translateY, zoom } = this.gfx.viewport;
            const [x, y] = Vec.mul(connector.getPointByOffsetDistance(distance), zoom);
            const transformOperation = [
                'translate(-50%, -50%)',
                `translate(${translateX}px, ${translateY}px)`,
                `translate(${x}px, ${y}px)`,
                `scale(${zoom})`,
            ];
            const isEmpty = !connector.text?.length && !this._isComposition;
            const color = this.std
                .get(ThemeProvider)
                .generateColorProperty(labelColor, '#000000');
            return html `
      <div
        class="edgeless-connector-label-editor"
        style=${styleMap({
                fontFamily: `"${fontFamily}"`,
                fontSize: `${fontSize}px`,
                fontStyle,
                fontWeight,
                textAlign,
                lineHeight: `${lineHeight}px`,
                maxWidth: hasMaxWidth
                    ? `${maxWidth + BORDER_WIDTH * 2 + HORIZONTAL_PADDING * 2}px`
                    : 'initial',
                color,
                transform: transformOperation.join(' '),
            })}
      >
        <rich-text
          .yText=${connector.text}
          .enableFormat=${false}
          style=${isEmpty
                ? styleMap({
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    padding: `${VERTICAL_PADDING}px ${HORIZONTAL_PADDING}px`,
                })
                : nothing}
        ></rich-text>
        ${isEmpty
                ? html `
              <span class="edgeless-connector-label-editor-placeholder">
                Add text
              </span>
            `
                : nothing}
      </div>
    `;
        }
        setKeeping(keeping) {
            this._keeping = keeping;
        }
        #connector_accessor_storage;
        get connector() { return this.#connector_accessor_storage; }
        set connector(value) { this.#connector_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #richText_accessor_storage;
        get richText() { return this.#richText_accessor_storage; }
        set richText(value) { this.#richText_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._isComposition = false;
            this._keeping = false;
            this._resizeObserver = null;
            this._updateLabelRect = () => {
                const { connector, isConnected } = this;
                if (!connector || !isConnected)
                    return;
                if (!this.inlineEditorContainer)
                    return;
                const newWidth = this.inlineEditorContainer.scrollWidth;
                const newHeight = this.inlineEditorContainer.scrollHeight;
                const center = connector.getPointByOffsetDistance(connector.labelOffset.distance);
                const bounds = Bound.fromCenter(center, newWidth, newHeight);
                const labelXYWH = bounds.toXYWH();
                if (!connector.labelXYWH ||
                    labelXYWH.some((p, i) => !almostEqual(p, connector.labelXYWH[i]))) {
                    this.crud.updateElement(connector.id, {
                        labelXYWH,
                    });
                }
            };
            this.#connector_accessor_storage = __runInitializers(this, _connector_initializers, void 0);
            this.#std_accessor_storage = (__runInitializers(this, _connector_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            this.#richText_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _richText_initializers, void 0));
            __runInitializers(this, _richText_extraInitializers);
        }
    };
})();
export { EdgelessConnectorLabelEditor };
