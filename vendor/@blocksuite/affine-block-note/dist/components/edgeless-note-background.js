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
import { DefaultTheme, ListBlockModel, NoteBlockModel, ParagraphBlockModel, StrokeStyle, } from '@blocksuite/affine-model';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { getClosestBlockComponentByPoint, handleNativeRangeAtPoint, matchModels, stopPropagation, } from '@blocksuite/affine-shared/utils';
import { clamp, Point } from '@blocksuite/global/gfx';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PropTypes, requiredProperties, ShadowlessElement, stdContext, TextSelection, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { consume } from '@lit/context';
import { computed, effect } from '@preact/signals-core';
import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { NoteConfigExtension } from '../config';
import * as styles from './edgeless-note-background.css';
let EdgelessNoteBackground = (() => {
    let _classDecorators = [requiredProperties({
            note: PropTypes.instanceOf(NoteBlockModel),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _editing_decorators;
    let _editing_initializers = [];
    let _editing_extraInitializers = [];
    let _note_decorators;
    let _note_initializers = [];
    let _note_extraInitializers = [];
    var EdgelessNoteBackground = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _std_decorators = [consume({ context: stdContext })];
            _editing_decorators = [property({ attribute: false })];
            _note_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _editing_decorators, { kind: "accessor", name: "editing", static: false, private: false, access: { has: obj => "editing" in obj, get: obj => obj.editing, set: (obj, value) => { obj.editing = value; } }, metadata: _metadata }, _editing_initializers, _editing_extraInitializers);
            __esDecorate(this, null, _note_decorators, { kind: "accessor", name: "note", static: false, private: false, access: { has: obj => "note" in obj, get: obj => obj.note, set: (obj, value) => { obj.note = value; } }, metadata: _metadata }, _note_initializers, _note_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EdgelessNoteBackground = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        get gfx() {
            return this.std.get(GfxControllerIdentifier);
        }
        get doc() {
            return this.std.host.store;
        }
        _tryAddParagraph(x, y) {
            const nearest = getClosestBlockComponentByPoint(new Point(x, y));
            if (!nearest)
                return;
            const nearestBBox = nearest.getBoundingClientRect();
            const yRel = y - nearestBBox.top;
            const insertPos = yRel < nearestBBox.height / 2 ? 'before' : 'after';
            const nearestModel = nearest.model;
            const nearestModelIdx = this.note.children.indexOf(nearestModel);
            const children = this.note.children;
            const siblingModel = children[clamp(nearestModelIdx + (insertPos === 'before' ? -1 : 1), 0, children.length)];
            if ((!nearestModel.text ||
                !matchModels(nearestModel, [ParagraphBlockModel, ListBlockModel])) &&
                (!siblingModel ||
                    !siblingModel.text ||
                    !matchModels(siblingModel, [ParagraphBlockModel, ListBlockModel]))) {
                const [pId] = this.doc.addSiblingBlocks(nearestModel, [{ flavour: 'affine:paragraph' }], insertPos);
                this.updateComplete
                    .then(() => {
                    this.std.selection.setGroup('note', [
                        this.std.selection.create(TextSelection, {
                            from: {
                                blockId: pId,
                                index: 0,
                                length: 0,
                            },
                            to: null,
                        }),
                    ]);
                })
                    .catch(console.error);
            }
        }
        _handleClickAtBackground(e) {
            e.stopPropagation();
            if (!this.editing)
                return;
            const { zoom } = this.gfx.viewport;
            const rect = this.getBoundingClientRect();
            const offsetY = 16 * zoom;
            const offsetX = 2 * zoom;
            const x = clamp(e.x, rect.left + offsetX, rect.right - offsetX);
            const y = clamp(e.y, rect.top + offsetY, rect.bottom - offsetY);
            handleNativeRangeAtPoint(x, y);
            if (this.std.host.store.readonly)
                return;
            this._tryAddParagraph(x, y);
        }
        _renderHeader() {
            const header = this.std
                .getOptional(NoteConfigExtension.identifier)
                ?.edgelessNoteHeader({ note: this.note, std: this.std });
            return header;
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add(styles.background);
            this.disposables.add(effect(() => {
                Object.assign(this.style, this.backgroundStyle$.value);
            }));
            this.disposables.addFromEvent(this, 'pointerdown', stopPropagation);
            this.disposables.addFromEvent(this, 'click', this._handleClickAtBackground);
        }
        render() {
            return this.note.isPageBlock() ? this._renderHeader() : nothing;
        }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #editing_accessor_storage;
        get editing() { return this.#editing_accessor_storage; }
        set editing(value) { this.#editing_accessor_storage = value; }
        #note_accessor_storage;
        get note() { return this.#note_accessor_storage; }
        set note(value) { this.#note_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.backgroundStyle$ = computed(() => {
                const themeProvider = this.std.get(ThemeProvider);
                const theme = themeProvider.theme$.value;
                const backgroundColor = themeProvider.generateColorProperty(this.note.props.background$.value, DefaultTheme.noteBackgrounColor, theme);
                const { borderRadius, borderSize, borderStyle, shadowType } = this.note.props.edgeless$.value.style;
                return {
                    borderRadius: borderRadius + 'px',
                    backgroundColor: backgroundColor,
                    borderWidth: `${borderSize}px`,
                    borderStyle: borderStyle === StrokeStyle.Dash ? 'dashed' : borderStyle,
                    boxShadow: !shadowType ? 'none' : `var(${shadowType})`,
                };
            });
            this.#std_accessor_storage = __runInitializers(this, _std_initializers, void 0);
            this.#editing_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _editing_initializers, false));
            this.#note_accessor_storage = (__runInitializers(this, _editing_extraInitializers), __runInitializers(this, _note_initializers, void 0));
            __runInitializers(this, _note_extraInitializers);
        }
    };
    return EdgelessNoteBackground = _classThis;
})();
export { EdgelessNoteBackground };
