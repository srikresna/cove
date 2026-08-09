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
import { NoteDisplayMode } from '@blocksuite/affine-model';
import { createButtonPopper } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ArrowDownSmallIcon, InvisibleIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { consume, ContextProvider } from '@lit/context';
import { signal } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { tocContext } from '../config';
import * as styles from './outline-card.css';
export const AFFINE_OUTLINE_NOTE_CARD = 'affine-outline-note-card';
let OutlineNoteCard = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let __displayModeButtonGroup_decorators;
    let __displayModeButtonGroup_initializers = [];
    let __displayModeButtonGroup_extraInitializers = [];
    let __displayModePanel_decorators;
    let __displayModePanel_initializers = [];
    let __displayModePanel_extraInitializers = [];
    let _activeHeadingId_decorators;
    let _activeHeadingId_initializers = [];
    let _activeHeadingId_extraInitializers = [];
    let _note_decorators;
    let _note_initializers = [];
    let _note_extraInitializers = [];
    let _index_decorators;
    let _index_initializers = [];
    let _index_extraInitializers = [];
    let _status_decorators;
    let _status_initializers = [];
    let _status_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class OutlineNoteCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __displayModeButtonGroup_decorators = [query(`.${styles.displayModeButtonGroup}`)];
            __displayModePanel_decorators = [query('note-display-mode-panel')];
            _activeHeadingId_decorators = [property({ attribute: false })];
            _note_decorators = [property({ attribute: false })];
            _index_decorators = [property({ attribute: true, type: Number })];
            _status_decorators = [property({ attribute: false })];
            __context_decorators = [consume({ context: tocContext })];
            __esDecorate(this, null, __displayModeButtonGroup_decorators, { kind: "accessor", name: "_displayModeButtonGroup", static: false, private: false, access: { has: obj => "_displayModeButtonGroup" in obj, get: obj => obj._displayModeButtonGroup, set: (obj, value) => { obj._displayModeButtonGroup = value; } }, metadata: _metadata }, __displayModeButtonGroup_initializers, __displayModeButtonGroup_extraInitializers);
            __esDecorate(this, null, __displayModePanel_decorators, { kind: "accessor", name: "_displayModePanel", static: false, private: false, access: { has: obj => "_displayModePanel" in obj, get: obj => obj._displayModePanel, set: (obj, value) => { obj._displayModePanel = value; } }, metadata: _metadata }, __displayModePanel_initializers, __displayModePanel_extraInitializers);
            __esDecorate(this, null, _activeHeadingId_decorators, { kind: "accessor", name: "activeHeadingId", static: false, private: false, access: { has: obj => "activeHeadingId" in obj, get: obj => obj.activeHeadingId, set: (obj, value) => { obj.activeHeadingId = value; } }, metadata: _metadata }, _activeHeadingId_initializers, _activeHeadingId_extraInitializers);
            __esDecorate(this, null, _note_decorators, { kind: "accessor", name: "note", static: false, private: false, access: { has: obj => "note" in obj, get: obj => obj.note, set: (obj, value) => { obj.note = value; } }, metadata: _metadata }, _note_initializers, _note_extraInitializers);
            __esDecorate(this, null, _index_decorators, { kind: "accessor", name: "index", static: false, private: false, access: { has: obj => "index" in obj, get: obj => obj.index, set: (obj, value) => { obj.index = value; } }, metadata: _metadata }, _index_initializers, _index_extraInitializers);
            __esDecorate(this, null, _status_decorators, { kind: "accessor", name: "status", static: false, private: false, access: { has: obj => "status" in obj, get: obj => obj.status, set: (obj, value) => { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        _dispatchClickBlockEvent(block) {
            const event = new CustomEvent('clickblock', {
                detail: {
                    blockId: block.id,
                },
            });
            this.dispatchEvent(event);
        }
        _dispatchDisplayModeChangeEvent(newMode) {
            const event = new CustomEvent('displaymodechange', {
                detail: {
                    note: this.note,
                    newMode,
                },
            });
            this.dispatchEvent(event);
        }
        _dispatchFitViewEvent(e) {
            e.stopPropagation();
            const event = new CustomEvent('fitview', {
                detail: {
                    block: this.note,
                },
            });
            this.dispatchEvent(event);
        }
        _dispatchSelectEvent(e) {
            e.stopPropagation();
            const event = new CustomEvent('select', {
                detail: {
                    id: this.note.id,
                    selected: this.status !== 'selected',
                    multiselect: e.shiftKey,
                },
            });
            this.dispatchEvent(event);
        }
        _getCurrentModeLabel(mode) {
            switch (mode) {
                case NoteDisplayMode.DocAndEdgeless:
                    return 'Both';
                case NoteDisplayMode.EdgelessOnly:
                    return 'Edgeless';
                case NoteDisplayMode.DocOnly:
                    return 'Page';
                default:
                    return 'Both';
            }
        }
        _watchDragEvents() {
            const std = this._context.editor$.value.std;
            this.disposables.add(std.dnd.draggable({
                element: this,
                canDrag: () => this.note.props.displayMode !== NoteDisplayMode.EdgelessOnly,
                onDragStart: () => {
                    if (this.status !== 'selected') {
                        this.dispatchEvent(new CustomEvent('select', {
                            detail: {
                                id: this.note.id,
                                selected: true,
                                multiselect: false,
                            },
                        }));
                    }
                },
                setDragData: () => ({
                    type: 'toc-card',
                    noteId: this.note.id,
                }),
                setDragPreview: ({ container, setOffset, location }) => {
                    const preview = document.createElement(AFFINE_OUTLINE_NOTE_CARD);
                    preview.note = this.note;
                    preview.index = this.index;
                    preview._context = this._context;
                    const { clientX, clientY } = location.current.input;
                    const { left, top } = this.getBoundingClientRect();
                    setOffset({ x: clientX - left, y: clientY - top });
                    container.style.width = `${this.parentElement?.clientWidth ?? 0}px`;
                    container.style.maxHeight = '500px';
                    container.style.overflow = 'hidden';
                    container.style.backgroundColor = cssVarV2('layer/background/primary');
                    container.append(preview);
                    const provider = new ContextProvider(container, {
                        context: tocContext,
                        initialValue: this._context,
                    });
                    provider.hostConnected();
                },
            }));
            this.disposables.add(std.dnd.dropTarget({
                element: this,
                setDropData: () => ({
                    noteId: this.note.id,
                }),
                canDrop: () => {
                    return this.note.props.displayMode !== NoteDisplayMode.EdgelessOnly;
                },
            }));
        }
        connectedCallback() {
            super.connectedCallback();
            this._watchDragEvents();
        }
        firstUpdated() {
            this._displayModePopper = createButtonPopper({
                reference: this._displayModeButtonGroup,
                popperElement: this._displayModePanel,
                stateUpdated: ({ display }) => {
                    this._showPopper$.value = display === 'show';
                },
                mainAxis: 0,
                crossAxis: -60,
            });
            this.disposables.add(this._displayModePopper);
        }
        render() {
            const { displayMode } = this.note.props;
            const { children } = this.note;
            const currentMode = this._getCurrentModeLabel(displayMode);
            const invisible = this.note.props.displayMode$.value === NoteDisplayMode.EdgelessOnly;
            const enableSorting = this._context.enableSorting$.value;
            return html `
      <div
        data-visibility=${this.note.props.displayMode}
        data-sortable=${enableSorting}
        data-status=${this.status}
        class=${styles.outlineCard}
      >
        <div
          class=${styles.cardPreview}
          @click=${this._dispatchSelectEvent}
          @dblclick=${this._dispatchFitViewEvent}
        >
        ${html `<div class=${styles.cardHeader}>
          ${invisible
                ? html `<span class=${styles.headerIcon}
                  >${InvisibleIcon({ width: '20px', height: '20px' })}</span
                >`
                : html `<span class=${styles.headerNumber}
                  >${this.index + 1}</span
                >`}
          <span class=${styles.divider}></span>
          <div class=${styles.displayModeButtonGroup}>
            <span>Show in</span>
            <edgeless-tool-icon-button
              .tooltip=${this._showPopper$.value ? '' : 'Display Mode'}
              .tipPosition=${'left-start'}
              .iconContainerPadding=${0}
              data-testid="display-mode-button"
              @click=${(e) => {
                e.stopPropagation();
                this._displayModePopper?.toggle();
            }}
              @dblclick=${(e) => e.stopPropagation()}
            >
              <div class=${styles.displayModeButton}>
                <span class=${styles.currentModeLabel}>${currentMode}</span>
                ${ArrowDownSmallIcon({ width: '16px', height: '16px' })}
              </div>
            </edgeless-tool-icon-button>
          </div>
          </div>
          <note-display-mode-panel
            class=${styles.modeChangePanel}
            .displayMode=${displayMode}
            .panelWidth=${220}
            .onSelect=${(newMode) => {
                this._dispatchDisplayModeChangeEvent(newMode);
                this._displayModePopper?.hide();
            }}
          >
          </note-display-mode-panel>
        </div>`}
          <div class=${styles.cardContent}>
            ${children.map(block => {
                return html `<affine-outline-block-preview
                class=${classMap({ active: this.activeHeadingId === block.id })}
                .block=${block}
                .disabledIcon=${invisible}
                @click=${() => {
                    if (invisible)
                        return;
                    this._dispatchClickBlockEvent(block);
                }}
              ></affine-outline-block-preview>`;
            })}
            </div>
          </div>
        </div>
      </div>
    `;
        }
        #_displayModeButtonGroup_accessor_storage;
        get _displayModeButtonGroup() { return this.#_displayModeButtonGroup_accessor_storage; }
        set _displayModeButtonGroup(value) { this.#_displayModeButtonGroup_accessor_storage = value; }
        #_displayModePanel_accessor_storage;
        get _displayModePanel() { return this.#_displayModePanel_accessor_storage; }
        set _displayModePanel(value) { this.#_displayModePanel_accessor_storage = value; }
        #activeHeadingId_accessor_storage;
        get activeHeadingId() { return this.#activeHeadingId_accessor_storage; }
        set activeHeadingId(value) { this.#activeHeadingId_accessor_storage = value; }
        #note_accessor_storage;
        get note() { return this.#note_accessor_storage; }
        set note(value) { this.#note_accessor_storage = value; }
        #index_accessor_storage;
        get index() { return this.#index_accessor_storage; }
        set index(value) { this.#index_accessor_storage = value; }
        #status_accessor_storage;
        get status() { return this.#status_accessor_storage; }
        set status(value) { this.#status_accessor_storage = value; }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._displayModePopper = null;
            this._showPopper$ = signal(false);
            this.#_displayModeButtonGroup_accessor_storage = __runInitializers(this, __displayModeButtonGroup_initializers, void 0);
            this.#_displayModePanel_accessor_storage = (__runInitializers(this, __displayModeButtonGroup_extraInitializers), __runInitializers(this, __displayModePanel_initializers, void 0));
            this.#activeHeadingId_accessor_storage = (__runInitializers(this, __displayModePanel_extraInitializers), __runInitializers(this, _activeHeadingId_initializers, null));
            this.#note_accessor_storage = (__runInitializers(this, _activeHeadingId_extraInitializers), __runInitializers(this, _note_initializers, void 0));
            this.#index_accessor_storage = (__runInitializers(this, _note_extraInitializers), __runInitializers(this, _index_initializers, 0));
            this.#status_accessor_storage = (__runInitializers(this, _index_extraInitializers), __runInitializers(this, _status_initializers, 'normal'));
            this.#_context_accessor_storage = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, __context_initializers, void 0));
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { OutlineNoteCard };
