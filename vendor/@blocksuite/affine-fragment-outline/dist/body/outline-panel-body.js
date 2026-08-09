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
import { changeNoteDisplayMode } from '@blocksuite/affine-block-note';
import { NoteBlockModel, NoteDisplayMode } from '@blocksuite/affine-model';
import { DocModeProvider } from '@blocksuite/affine-shared/services';
import { focusTitle, matchModels } from '@blocksuite/affine-shared/utils';
import { Bound } from '@blocksuite/global/gfx';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { BlockSelection, ShadowlessElement, SurfaceSelection, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { consume } from '@lit/context';
import { batch, computed, effect, signal, } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { when } from 'lit/directives/when.js';
import { tocContext } from '../config';
import { getHeadingBlocksFromDoc, getNotesFromStore, isHeadingBlock, } from '../utils/query';
import { observeActiveHeadingDuringScroll, scrollToBlockWithHighlight, } from '../utils/scroll';
import * as styles from './outline-panel-body.css';
export const AFFINE_OUTLINE_PANEL_BODY = 'affine-outline-panel-body';
let OutlinePanelBody = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let __pageVisibleList_decorators;
    let __pageVisibleList_initializers = [];
    let __pageVisibleList_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class OutlinePanelBody extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __pageVisibleList_decorators = [query('.page-visible-card-list')];
            __context_decorators = [consume({ context: tocContext })];
            __esDecorate(this, null, __pageVisibleList_decorators, { kind: "accessor", name: "_pageVisibleList", static: false, private: false, access: { has: obj => "_pageVisibleList" in obj, get: obj => obj._pageVisibleList, set: (obj, value) => { obj._pageVisibleList = value; } }, metadata: _metadata }, __pageVisibleList_initializers, __pageVisibleList_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get _shouldRenderEmptyPanel() {
            return (this._pageVisibleNotes$.value.length === 0 &&
                this._edgelessOnlyNotes$.value.length === 0);
        }
        get editor() {
            return this._context.editor$.value;
        }
        get store() {
            return this.editor.store;
        }
        get viewportPadding() {
            const fitPadding = this._context.fitPadding$.value;
            return fitPadding.length === 4
                ? [0, 0, 0, 0].map((val, idx) => Number.isFinite(fitPadding[idx]) ? fitPadding[idx] : val)
                : [0, 0, 0, 0];
        }
        _deSelectNoteInEdgelessMode(note) {
            const gfx = this.editor.std.get(GfxControllerIdentifier);
            const selection = gfx.selection;
            if (!selection.has(note.id))
                return;
            const selectedIds = selection.selectedIds.filter(id => id !== note.id);
            selection.set({
                elements: selectedIds,
                editing: false,
            });
        }
        _renderEmptyPanel() {
            return html `<div class=${styles.emptyPanel}>
      <div
        data-testid="empty-panel-placeholder"
        class=${styles.emptyPanelPlaceholder}
      >
        Use headings to create a table of contents.
      </div>
    </div>`;
        }
        _fitToElement(e) {
            const gfx = this.editor.std.get(GfxControllerIdentifier);
            const { block } = e.detail;
            const bound = Bound.deserialize(block.xywh);
            gfx.viewport.setViewportByBound(bound, this.viewportPadding, true);
        }
        // when display mode change to page only, we should de-select the note if it is selected in edgeless mode
        _handleDisplayModeChange(e) {
            const { note, newMode } = e.detail;
            this.editor.std.command.exec(changeNoteDisplayMode, {
                noteId: note.id,
                mode: newMode,
                stopCapture: true,
            });
            // When the display mode of a note changed to page only
            // We should check if the note is selected in edgeless mode
            // If so, we should de-select it
            if (newMode === NoteDisplayMode.DocOnly) {
                this._deSelectNoteInEdgelessMode(note);
            }
        }
        _moveSelectedNotes(insertIndex) {
            if (!this.store.root)
                return;
            const pageVisibleNotes = this._pageVisibleNotes$.peek();
            const selected = this._allSelectedNotes$.peek();
            const children = this.store.root.children.slice();
            const noteIndex = new Map();
            children.forEach((block, index) => {
                if (matchModels(block, [NoteBlockModel])) {
                    noteIndex.set(block, index);
                }
            });
            let targetIndex = null;
            if (insertIndex === pageVisibleNotes.length) {
                const temp = noteIndex.get(pageVisibleNotes[insertIndex - 1]);
                if (temp)
                    targetIndex = temp + 1;
            }
            else {
                targetIndex = noteIndex.get(pageVisibleNotes[insertIndex]) ?? null;
            }
            if (targetIndex === null)
                return;
            const removeSelectedNoteFilter = (block) => !matchModels(block, [NoteBlockModel]) || !selected.includes(block);
            const leftPart = children
                .slice(0, targetIndex)
                .filter(removeSelectedNoteFilter);
            const rightPart = children
                .slice(targetIndex)
                .filter(removeSelectedNoteFilter);
            const newChildren = [...leftPart, ...selected, ...rightPart];
            this.store.updateBlock(this.store.root, {
                children: newChildren,
            });
        }
        async _scrollToBlock(blockId) {
            // if focus title
            if (blockId === this.store.root?.id) {
                this.editor.std.selection.setGroup('note', []);
                this.editor.std.event.active = false;
                focusTitle(this.editor);
            }
            else {
                this.editor.std.event.active = true;
                this.editor.std.selection.setGroup('note', [
                    this.editor.std.selection.create(BlockSelection, {
                        blockId,
                    }),
                ]);
            }
            this._lockActiveHeadingId = true;
            this._activeHeadingId$.value = blockId;
            this._clearHighlightMask = await scrollToBlockWithHighlight(this.editor, blockId);
            this._lockActiveHeadingId = false;
        }
        _selectNote(e) {
            const { selected, id, multiselect } = e.detail;
            const gfx = this.editor.std.get(GfxControllerIdentifier);
            const editorMode = this.editor.std.get(DocModeProvider).getEditorMode();
            const note = this.store.getBlock(id)?.model;
            if (!note || !matchModels(note, [NoteBlockModel]))
                return;
            // map from signal to value
            const selectedNotes = Object.fromEntries(Object.entries(this._selectedNotes$).map(([k, v]) => [k, v.peek()]));
            if (multiselect) {
                selectedNotes[note.props.displayMode] = selected
                    ? [...selectedNotes[note.props.displayMode], note]
                    : selectedNotes[note.props.displayMode].filter(_note => _note !== note);
            }
            else {
                selectedNotes[note.props.displayMode] = selected ? [note] : [];
                Object.keys(this._selectedNotes$).forEach(mode => {
                    if (mode !== note.props.displayMode) {
                        selectedNotes[mode] = [];
                    }
                });
            }
            // We use gfx.selection and effect to keep sync between canvas and outline panel
            if (editorMode === 'edgeless') {
                gfx.selection.set({
                    elements: [...selectedNotes.both, ...selectedNotes.edgeless].map(({ id }) => id),
                    editing: false,
                });
                this._selectedNotes$.doc.value = selectedNotes.doc;
            }
            else {
                [NoteDisplayMode.DocOnly, NoteDisplayMode.DocAndEdgeless].forEach(mode => {
                    this._selectedNotes$[mode].value = selectedNotes[mode];
                });
            }
        }
        _watchSelectedNotes() {
            return effect(() => {
                const { std, store } = this.editor;
                const docModeService = this.editor.std.get(DocModeProvider);
                const mode = docModeService.getEditorMode();
                if (mode !== 'edgeless')
                    return;
                const currSelectedNotes = std.selection
                    .filter(SurfaceSelection)
                    .map(({ blockId }) => store.getBlock(blockId)?.model)
                    .filter(model => {
                    return !!model && matchModels(model, [NoteBlockModel]);
                });
                // update selected notes from edgeless selection
                batch(() => {
                    [NoteDisplayMode.DocAndEdgeless, NoteDisplayMode.EdgelessOnly].forEach(mode => {
                        this._selectedNotes$[mode].value = currSelectedNotes.filter(note => note.props.displayMode === mode);
                    });
                });
            });
        }
        _watchNotes() {
            this.disposables.add(effect(() => {
                const isRenderableNote = (note) => {
                    let hasHeadings = false;
                    for (const block of note.children) {
                        if (isHeadingBlock(block)) {
                            hasHeadings = true;
                            break;
                        }
                    }
                    return hasHeadings || this._context.enableSorting$.value;
                };
                this._pageVisibleNotes$.value = getNotesFromStore(this.store, [
                    NoteDisplayMode.DocAndEdgeless,
                    NoteDisplayMode.DocOnly,
                ]).filter(isRenderableNote);
                this._edgelessOnlyNotes$.value = getNotesFromStore(this.store, [
                    NoteDisplayMode.EdgelessOnly,
                ]).filter(isRenderableNote);
            }));
        }
        _watchDragAndDrop() {
            const std = this.editor.std;
            this.disposables.add(std.dnd.monitor({
                onDragStart: () => {
                    this._dragging$.value = true;
                },
                onDrag: data => {
                    const target = data.location.current.dropTargets[0];
                    if (!target)
                        return;
                    const edge = target.data.edge;
                    const rect = target.element.getBoundingClientRect();
                    const parentRect = this._pageVisibleList.getBoundingClientRect();
                    this._indicatorTranslateY$.value =
                        edge === 'top'
                            ? rect.top - parentRect.top
                            : rect.bottom - parentRect.top;
                },
                onDrop: data => {
                    this._dragging$.value = false;
                    const target = data.location.current.dropTargets[0];
                    if (!target)
                        return;
                    const edge = target.data.edge;
                    const index = this._pageVisibleNotes$
                        .peek()
                        .findIndex(({ id }) => id === target.data.noteId);
                    if (index === -1)
                        return;
                    this._moveSelectedNotes(edge === 'top' ? index : index + 1);
                },
            }));
            this.disposables.add(std.dnd.autoScroll({
                element: this,
            }));
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add(styles.outlinePanelBody);
            this.disposables.add(observeActiveHeadingDuringScroll(() => this.editor, newHeadingId => {
                if (this._lockActiveHeadingId)
                    return;
                this._activeHeadingId$.value = newHeadingId;
            }));
            this._watchNotes();
            this._watchSelectedNotes();
            this._watchDragAndDrop();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this._clearHighlightMask();
        }
        _renderDocTitle() {
            if (!this.store.root)
                return nothing;
            const hasNotEmptyHeadings = getHeadingBlocksFromDoc(this.store, [NoteDisplayMode.DocOnly, NoteDisplayMode.DocAndEdgeless], true).length > 0;
            if (!hasNotEmptyHeadings)
                return nothing;
            const rootId = this.store.root.id;
            const active = rootId === this._activeHeadingId$.value;
            return html `<affine-outline-block-preview
      class=${classMap({ active: active })}
      .block=${this.store.root}
      @click=${() => {
                this._scrollToBlock(rootId).catch(console.error);
            }}
    ></affine-outline-block-preview>`;
        }
        _renderNoteCards(notes) {
            return repeat(notes, ({ id }) => id, (note, index) => html `<affine-outline-note-card
          data-note-id=${note.id}
          index=${index}
          .note=${note}
          .activeHeadingId=${this._activeHeadingId$.value}
          .status=${this._allSelectedNotes$.value.includes(note)
                ? this._dragging$.value
                    ? 'dragging'
                    : 'selected'
                : 'normal'}
          @fitview=${this._fitToElement}
          @select=${this._selectNote}
          @displaymodechange=${this._handleDisplayModeChange}
          @clickblock=${(e) => {
                this._scrollToBlock(e.detail.blockId).catch(console.error);
            }}
        ></affine-outline-note-card>`);
        }
        _renderPageVisibleCardList() {
            return html `<div class=${`page-visible-card-list ${styles.cardList}`}>
      ${when(this._dragging$.value, () => html `<div
            class=${styles.insertIndicator}
            style=${`transform: translateY(${this._indicatorTranslateY$.value}px)`}
          ></div>`)}
      ${this._renderNoteCards(this._pageVisibleNotes$.value)}
    </div>`;
        }
        _renderEdgelessOnlyCardList() {
            const items = this._edgelessOnlyNotes$.value;
            return html `<div class=${styles.cardList}>
      ${when(items.length > 0, () => html `<div class=${styles.edgelessCardListTitle}>Hidden Contents</div>`)}
      ${this._renderNoteCards(items)}
    </div>`;
        }
        render() {
            return html `
      ${this._renderDocTitle()}
      ${when(this._shouldRenderEmptyPanel, () => this._renderEmptyPanel(), () => html `
          ${this._renderPageVisibleCardList()}
          ${this._renderEdgelessOnlyCardList()}
        `)}
    `;
        }
        #_pageVisibleList_accessor_storage;
        get _pageVisibleList() { return this.#_pageVisibleList_accessor_storage; }
        set _pageVisibleList(value) { this.#_pageVisibleList_accessor_storage = value; }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._activeHeadingId$ = signal(null);
            this._dragging$ = signal(false);
            this._indicatorTranslateY$ = signal(0);
            this._pageVisibleNotes$ = signal([]);
            this._edgelessOnlyNotes$ = signal([]);
            this._selectedNotes$ = {
                [NoteDisplayMode.DocOnly]: signal([]),
                [NoteDisplayMode.DocAndEdgeless]: signal([]),
                [NoteDisplayMode.EdgelessOnly]: signal([]),
            };
            this._allSelectedNotes$ = computed(() => [
                NoteDisplayMode.DocAndEdgeless,
                NoteDisplayMode.DocOnly,
                NoteDisplayMode.EdgelessOnly,
            ].flatMap(mode => this._selectedNotes$[mode].value));
            this._clearHighlightMask = () => { };
            this._lockActiveHeadingId = false;
            this.#_pageVisibleList_accessor_storage = __runInitializers(this, __pageVisibleList_initializers, void 0);
            this.#_context_accessor_storage = (__runInitializers(this, __pageVisibleList_extraInitializers), __runInitializers(this, __context_initializers, void 0));
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { OutlinePanelBody };
