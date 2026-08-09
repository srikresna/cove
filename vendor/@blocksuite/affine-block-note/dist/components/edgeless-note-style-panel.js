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
import { EdgelessCRUDIdentifier } from '@blocksuite/affine-block-surface';
import { packColorsWith, preprocessColor, } from '@blocksuite/affine-components/color-picker';
import { DefaultTheme, NoteBlockModel, resolveColor, } from '@blocksuite/affine-model';
import { ThemeProvider } from '@blocksuite/affine-shared/services';
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { getMostCommonResolvedValue, stopPropagation, } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ArrowLeftSmallIcon, PaletteIcon } from '@blocksuite/icons/lit';
import { BlockStdScope, PropTypes, requiredProperties } from '@blocksuite/std';
import { css, html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
let EdgelessNoteStylePanel = (() => {
    let _classDecorators = [requiredProperties({
            notes: PropTypes.arrayOf(model => model instanceof NoteBlockModel),
            std: PropTypes.instanceOf(BlockStdScope),
        })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = SignalWatcher(WithDisposable(LitElement));
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    let _tabType_decorators;
    let _tabType_initializers = [];
    let _tabType_extraInitializers = [];
    let _container_decorators;
    let _container_initializers = [];
    let _container_extraInitializers = [];
    var EdgelessNoteStylePanel = class extends _classSuper {
        static { _classThis = this; }
        constructor() {
            super(...arguments);
            this.#notes_accessor_storage = __runInitializers(this, _notes_initializers, void 0);
            this.#std_accessor_storage = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            this.#tabType_accessor_storage = (__runInitializers(this, _std_extraInitializers), __runInitializers(this, _tabType_initializers, 'style'));
            this.#container_accessor_storage = (__runInitializers(this, _tabType_extraInitializers), __runInitializers(this, _container_initializers, void 0));
            this._styleChanged = (__runInitializers(this, _container_extraInitializers), false);
            this._switchToCustomColorTab = () => {
                this.tabType = 'customColor';
            };
            this._switchToStyleTab = () => {
                this.tabType = 'style';
            };
            this._selectColor = (e) => {
                this._beforeChange();
                const color = e.detail.value;
                const crud = this.std.get(EdgelessCRUDIdentifier);
                this.notes.forEach(note => {
                    crud.updateElement(note.id, {
                        background: color,
                    });
                });
            };
            this._pickColor = (e) => {
                switch (e.type) {
                    case 'pick':
                        {
                            const color = e.detail.value;
                            const crud = this.std.get(EdgelessCRUDIdentifier);
                            this.notes.forEach(note => {
                                crud.updateElement(note.id, {
                                    background: color,
                                });
                            });
                        }
                        break;
                    case 'start':
                        this._beforeChange();
                        this.notes.forEach(note => {
                            note.stash('background');
                        });
                        break;
                    case 'end':
                        this.std.store.transact(() => {
                            this.notes.forEach(note => {
                                note.pop('background');
                            });
                        });
                        break;
                }
            };
            this._selectShadow = (e) => {
                this._beforeChange();
                const shadowType = e.detail;
                const crud = this.std.get(EdgelessCRUDIdentifier);
                this.notes.forEach(note => {
                    crud.updateElement(note.id, {
                        edgeless: {
                            ...note.props.edgeless,
                            style: {
                                ...note.props.edgeless.style,
                                shadowType,
                            },
                        },
                    });
                });
            };
            this._selectBorder = (e) => {
                this._beforeChange();
                const { type, value } = e.detail;
                const crud = this.std.get(EdgelessCRUDIdentifier);
                if (type === 'size') {
                    const borderSize = value;
                    this.notes.forEach(note => {
                        const edgeless = note.props.edgeless;
                        crud.updateElement(note.id, {
                            edgeless: {
                                ...edgeless,
                                style: {
                                    ...edgeless.style,
                                    borderSize,
                                },
                            },
                        });
                    });
                }
                else {
                    const borderStyle = value;
                    this.notes.forEach(note => {
                        const edgeless = note.props.edgeless;
                        crud.updateElement(note.id, {
                            edgeless: { ...edgeless, style: { ...edgeless.style, borderStyle } },
                        });
                    });
                }
            };
            this._selectBorderRadius = (e) => {
                this._beforeChange();
                let borderRadius = this._borderRadius;
                if (e instanceof InputEvent) {
                    const target = e.target;
                    const value = parseInt(target.value);
                    if (isNaN(value)) {
                        return;
                    }
                    borderRadius = value;
                }
                else {
                    borderRadius = e.detail.value;
                }
                const crud = this.std.get(EdgelessCRUDIdentifier);
                this.notes.forEach(note => {
                    crud.updateElement(note.id, {
                        edgeless: {
                            ...note.props.edgeless,
                            style: { ...note.props.edgeless.style, borderRadius },
                        },
                    });
                });
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _notes_decorators = [property({ attribute: false })];
            _std_decorators = [property({ attribute: false })];
            _tabType_decorators = [state()];
            _container_decorators = [query('div.edgeless-note-style-panel-container')];
            __esDecorate(this, null, _notes_decorators, { kind: "accessor", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            __esDecorate(this, null, _tabType_decorators, { kind: "accessor", name: "tabType", static: false, private: false, access: { has: obj => "tabType" in obj, get: obj => obj.tabType, set: (obj, value) => { obj.tabType = value; } }, metadata: _metadata }, _tabType_initializers, _tabType_extraInitializers);
            __esDecorate(this, null, _container_decorators, { kind: "accessor", name: "container", static: false, private: false, access: { has: obj => "container" in obj, get: obj => obj.container, set: (obj, value) => { obj.container = value; } }, metadata: _metadata }, _container_initializers, _container_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EdgelessNoteStylePanel = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #notes_accessor_storage;
        get notes() { return this.#notes_accessor_storage; }
        set notes(value) { this.#notes_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #tabType_accessor_storage;
        get tabType() { return this.#tabType_accessor_storage; }
        set tabType(value) { this.#tabType_accessor_storage = value; }
        #container_accessor_storage;
        get container() { return this.#container_accessor_storage; }
        set container(value) { this.#container_accessor_storage = value; }
        static { this.styles = css `
    .edgeless-note-style-panel {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .edgeless-note-style-section {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .edgeless-note-style-section-title {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 4px;
      height: 22px;
      align-self: stretch;
      color: ${unsafeCSSVarV2('text/secondary')};
      font-feature-settings:
        'liga' off,
        'clig' off;

      /* Client/sm */
      font-family: var(--affine-font-family);
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px; /* 157.143% */
    }

    edgeless-line-styles-panel {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }

    .edgeless-note-corner-radius-panel {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 8px;

      affine-slider {
        width: 168px;
      }

      input {
        border: 0.5px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
        border-radius: 4px;
        text-indent: 4px;
        box-sizing: border-box;
        width: 88px;
        color: ${unsafeCSSVarV2('text/placeholder')};
      }

      input:focus {
        outline: none;
        border-color: ${unsafeCSSVarV2('input/border/active')};
        color: ${unsafeCSSVarV2('text/primary')};
      }
    }

    .edgeless-note-style-custom-color-panel {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .edgeless-note-custom-color-picker {
      padding-top: 0px;
    }
  `; }
        _beforeChange() {
            if (!this._styleChanged) {
                // record the history
                this.std.store.captureSync();
                this._styleChanged = true;
            }
        }
        get _theme() {
            return this.std.get(ThemeProvider).edgeless$.value;
        }
        get _background() {
            return (getMostCommonResolvedValue(this.notes.map(model => model.props), 'background', background => resolveColor(background, this._theme)) ?? resolveColor(DefaultTheme.noteBackgrounColor, this._theme));
        }
        get _originalBackground() {
            return this.notes[0].props.background;
        }
        get _shadow() {
            return this.notes[0].props.edgeless.style.shadowType;
        }
        get _borderSize() {
            return this.notes[0].props.edgeless.style.borderSize;
        }
        get _borderStyle() {
            return this.notes[0].props.edgeless.style.borderStyle;
        }
        get _borderRadius() {
            return this.notes[0].props.edgeless.style.borderRadius;
        }
        _renderStylePanel() {
            return html `<div class="edgeless-note-style-panel">
      <div class="edgeless-note-style-section">
        <div class="edgeless-note-style-section-title">Fill color</div>
        <edgeless-color-panel
          role="listbox"
          .value=${this._background}
          .theme=${this._theme}
          .palettes=${DefaultTheme.NoteBackgroundColorPalettes}
          .hasTransparent=${false}
          .columns=${DefaultTheme.NoteBackgroundColorPalettes.length + 1}
          @select=${this._selectColor}
        >
          <edgeless-color-custom-button
            slot="custom"
            @click=${this._switchToCustomColorTab}
          ></edgeless-color-custom-button>
        </edgeless-color-panel>
      </div>
      <div class="edgeless-note-style-section">
        <div class="edgeless-note-style-section-title">Shadow</div>
        <edgeless-note-shadow-menu
          .background=${this._background}
          .theme=${this._theme}
          .value=${this._shadow}
          @select=${this._selectShadow}
        ></edgeless-note-shadow-menu>
      </div>
      <div
        class="edgeless-note-style-section"
        data-testid="affine-note-border-style-panel"
      >
        <div class="edgeless-note-style-section-title">Border</div>
        <edgeless-line-styles-panel
          .lineSize=${this._borderSize}
          .lineStyle=${this._borderStyle}
          @select=${this._selectBorder}
        ></edgeless-line-styles-panel>
      </div>
      <div
        class="edgeless-note-style-section"
        data-testid="affine-note-corner-radius-panel"
      >
        <div class="edgeless-note-style-section-title">Corner Radius</div>
        <div class="edgeless-note-corner-radius-panel">
          <affine-slider
            .value=${this._borderRadius}
            .range=${{
                points: [0, 4, 8, 16, 24, 32],
            }}
            @select=${this._selectBorderRadius}
          ></affine-slider>

          <editor-toolbar-separator></editor-toolbar-separator>

          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            min="0"
            max="32"
            .value=${this._borderRadius}
            @input=${this._selectBorderRadius}
            @click=${stopPropagation}
            @pointerdown=${stopPropagation}
            @cut=${stopPropagation}
            @copy=${stopPropagation}
            @paste=${stopPropagation}
          />
        </div>
      </div>
    </div>`;
        }
        _renderCustomColorPanel() {
            const packed = packColorsWith(this._theme, this._background, this._originalBackground);
            const type = packed.type === 'palette' ? 'normal' : packed.type;
            const modes = packed.colors.map(preprocessColor(window.getComputedStyle(this)));
            return html `<div class="edgeless-note-style-custom-color-panel">
      <div class="edgeless-note-style-section-title">
        <editor-icon-button
          aria-label="Back"
          .iconSize=${'16px'}
          @click=${this._switchToStyleTab}
        >
          ${ArrowLeftSmallIcon()}
        </editor-icon-button>
        Custom color
      </div>
      <edgeless-color-picker
        class="edgeless-note-custom-color-picker"
        .pick=${this._pickColor}
        .colors=${{ type, modes }}
      ></edgeless-color-picker>
    </div>`;
        }
        firstUpdated() {
            if (this.container) {
                this.disposables.addFromEvent(this.container, 'click', e => {
                    e.stopPropagation();
                });
            }
        }
        render() {
            return html `
      <editor-menu-button
        .contentPadding=${'8px'}
        .button=${html `
          <editor-icon-button aria-label="Note Style" .tooltip=${'Note Style'}>
            ${PaletteIcon()}
          </editor-icon-button>
        `}
        @toggle=${(e) => {
                if (!e.detail) {
                    this.tabType = 'style';
                }
            }}
      >
        <div class="edgeless-note-style-panel-container">
          ${choose(this.tabType, [
                ['style', () => this._renderStylePanel()],
                ['customColor', () => this._renderCustomColorPanel()],
            ])}
        </div>
      </editor-menu-button>
    `;
        }
        static {
            __runInitializers(_classThis, _classExtraInitializers);
        }
    };
    return EdgelessNoteStylePanel = _classThis;
})();
export { EdgelessNoteStylePanel };
