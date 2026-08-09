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
import { DefaultTool } from '@blocksuite/affine-block-surface';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { Bound } from '@blocksuite/global/gfx';
import { WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement, stdContext, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { RANGE_SYNC_EXCLUDE_ATTR } from '@blocksuite/std/inline';
import { consume } from '@lit/context';
import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { GROUP_TITLE_FONT_SIZE, GROUP_TITLE_OFFSET, GROUP_TITLE_PADDING, } from '../renderer/consts';
export function mountGroupTitleEditor(group, edgeless) {
    const mountElm = edgeless.querySelector('.edgeless-mount-point');
    if (!mountElm) {
        throw new BlockSuiteError(ErrorCode.ValueNotExists, "edgeless block's mount point does not exist");
    }
    const gfx = edgeless.std.get(GfxControllerIdentifier);
    gfx.tool.setTool(DefaultTool);
    gfx.selection.set({
        elements: [group.id],
        editing: true,
    });
    const groupEditor = new EdgelessGroupTitleEditor();
    groupEditor.group = group;
    mountElm.append(groupEditor);
}
let EdgelessGroupTitleEditor = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _group_decorators;
    let _group_initializers = [];
    let _group_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _richText_decorators;
    let _richText_initializers = [];
    let _richText_extraInitializers = [];
    return class EdgelessGroupTitleEditor extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _group_decorators = [property({ attribute: false })];
            _std_decorators = [consume({
                    context: stdContext,
                })];
            _richText_decorators = [query('rich-text')];
            __esDecorate(this, null, _group_decorators, { kind: "accessor", name: "group", static: false, private: false, access: { has: obj => "group" in obj, get: obj => obj.group, set: (obj, value) => { obj.group = value; } }, metadata: _metadata }, _group_initializers, _group_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _richText_decorators, { kind: "accessor", name: "richText", static: false, private: false, access: { has: obj => "richText" in obj, get: obj => obj.richText, set: (obj, value) => { obj.richText = value; } }, metadata: _metadata }, _richText_initializers, _richText_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get inlineEditor() {
            return this.richText.inlineEditor;
        }
        get inlineEditorContainer() {
            return this.inlineEditor?.rootElement;
        }
        get gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        get selection() {
            return this.gfx.selection;
        }
        _unmount() {
            // dispose in advance to avoid execute `this.remove()` twice
            this.disposables.dispose();
            this.group.showTitle = true;
            this.selection.set({
                elements: [this.group.id],
                editing: false,
            });
            this.remove();
        }
        connectedCallback() {
            super.connectedCallback();
            this.setAttribute(RANGE_SYNC_EXCLUDE_ATTR, 'true');
        }
        firstUpdated() {
            const dispatcher = this.std.event;
            this.updateComplete
                .then(() => {
                if (!this.inlineEditor)
                    return;
                this.inlineEditor.selectAll();
                this.group.showTitle = false;
                this.inlineEditor.slots.renderComplete.subscribe(() => {
                    this.requestUpdate();
                });
                this.disposables.add(dispatcher.add('keyDown', ctx => {
                    const state = ctx.get('keyboardState');
                    if (state.raw.key === 'Enter' && !state.raw.isComposing) {
                        this._unmount();
                        return true;
                    }
                    requestAnimationFrame(() => {
                        this.requestUpdate();
                    });
                    return false;
                }));
                this.disposables.add(this.gfx.viewport.viewportUpdated.subscribe(() => {
                    this.requestUpdate();
                }));
                this.disposables.add(dispatcher.add('click', () => true));
                this.disposables.add(dispatcher.add('doubleClick', () => true));
                if (!this.inlineEditorContainer)
                    return;
                this.disposables.addFromEvent(this.inlineEditorContainer, 'blur', () => {
                    this._unmount();
                });
            })
                .catch(console.error);
        }
        async getUpdateComplete() {
            const result = await super.getUpdateComplete();
            await this.richText?.updateComplete;
            return result;
        }
        render() {
            if (!this.group.externalXYWH) {
                console.error('group.externalXYWH is not set');
                return nothing;
            }
            const viewport = this.gfx.viewport;
            const bound = Bound.deserialize(this.group.externalXYWH);
            const [x, y] = viewport.toViewCoord(bound.x, bound.y);
            const inlineEditorStyle = styleMap({
                transformOrigin: 'top left',
                borderRadius: '2px',
                width: 'fit-content',
                maxHeight: '30px',
                height: 'fit-content',
                padding: `${GROUP_TITLE_PADDING[1]}px ${GROUP_TITLE_PADDING[0]}px`,
                fontSize: GROUP_TITLE_FONT_SIZE + 'px',
                position: 'absolute',
                left: x + 'px',
                top: `${y - GROUP_TITLE_OFFSET + 2}px`,
                minWidth: '8px',
                fontFamily: 'var(--affine-font-family)',
                color: 'var(--affine-text-primary-color)',
                background: 'var(--affine-white-10)',
                outline: 'none',
                zIndex: '1',
                border: `1px solid
        var(--affine-primary-color)`,
                boxShadow: 'var(--affine-active-shadow)',
            });
            return html `<rich-text
      .yText=${this.group.title}
      .enableFormat=${false}
      .enableAutoScrollHorizontally=${false}
      style=${inlineEditorStyle}
    ></rich-text>`;
        }
        #group_accessor_storage = __runInitializers(this, _group_initializers, void 0);
        get group() { return this.#group_accessor_storage; }
        set group(value) { this.#group_accessor_storage = value; }
        #std_accessor_storage = (__runInitializers(this, _group_extraInitializers), __runInitializers(this, _std_initializers, void 0));
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #richText_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _richText_initializers, void 0));
        get richText() { return this.#richText_accessor_storage; }
        set richText(value) { this.#richText_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, _richText_extraInitializers);
        }
    };
})();
export { EdgelessGroupTitleEditor };
