// related component
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
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed, effect, signal } from '@preact/signals-core';
import { css } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { renderUniLit } from '../../../core/utils/uni-component/uni-component.js';
const styles = css `
  mobile-kanban-cell {
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 4px;
    min-height: 20px;
    border: 1px solid transparent;
    box-sizing: border-box;
  }

  .mobile-kanban-cell {
    flex: 1;
    display: block;
    width: 196px;
  }

  .mobile-kanban-cell-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: start;
    margin-right: 12px;
    height: var(--data-view-cell-text-line-height);
    font-size: 16px;
    color: ${unsafeCSSVarV2('icon/primary')};
  }
`;
let MobileKanbanCell = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _cardId_decorators;
    let _cardId_initializers = [];
    let _cardId_extraInitializers = [];
    let _column_decorators;
    let _column_initializers = [];
    let _column_extraInitializers = [];
    let _contentOnly_decorators;
    let _contentOnly_initializers = [];
    let _contentOnly_extraInitializers = [];
    let _groupKey_decorators;
    let _groupKey_initializers = [];
    let _groupKey_extraInitializers = [];
    let _kanbanViewLogic_decorators;
    let _kanbanViewLogic_initializers = [];
    let _kanbanViewLogic_extraInitializers = [];
    return class MobileKanbanCell extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _cardId_decorators = [property({ attribute: false })];
            _column_decorators = [property({ attribute: false })];
            _contentOnly_decorators = [property({ attribute: false })];
            _groupKey_decorators = [property({ attribute: false })];
            _kanbanViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _cardId_decorators, { kind: "accessor", name: "cardId", static: false, private: false, access: { has: obj => "cardId" in obj, get: obj => obj.cardId, set: (obj, value) => { obj.cardId = value; } }, metadata: _metadata }, _cardId_initializers, _cardId_extraInitializers);
            __esDecorate(this, null, _column_decorators, { kind: "accessor", name: "column", static: false, private: false, access: { has: obj => "column" in obj, get: obj => obj.column, set: (obj, value) => { obj.column = value; } }, metadata: _metadata }, _column_initializers, _column_extraInitializers);
            __esDecorate(this, null, _contentOnly_decorators, { kind: "accessor", name: "contentOnly", static: false, private: false, access: { has: obj => "contentOnly" in obj, get: obj => obj.contentOnly, set: (obj, value) => { obj.contentOnly = value; } }, metadata: _metadata }, _contentOnly_initializers, _contentOnly_extraInitializers);
            __esDecorate(this, null, _groupKey_decorators, { kind: "accessor", name: "groupKey", static: false, private: false, access: { has: obj => "groupKey" in obj, get: obj => obj.groupKey, set: (obj, value) => { obj.groupKey = value; } }, metadata: _metadata }, _groupKey_initializers, _groupKey_extraInitializers);
            __esDecorate(this, null, _kanbanViewLogic_decorators, { kind: "accessor", name: "kanbanViewLogic", static: false, private: false, access: { has: obj => "kanbanViewLogic" in obj, get: obj => obj.kanbanViewLogic, set: (obj, value) => { obj.kanbanViewLogic = value; } }, metadata: _metadata }, _kanbanViewLogic_initializers, _kanbanViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        get cell() {
            return this._cell.value;
        }
        connectedCallback() {
            super.connectedCallback();
            if (this.column.readonly$.value)
                return;
            this.disposables.add(effect(() => {
                const isEditing = this.isSelectionEditing$.value;
                if (isEditing && !this.isEditing$.peek()) {
                    this.isEditing$.value = true;
                    requestAnimationFrame(() => {
                        this._cell.value?.afterEnterEditingMode();
                    });
                }
                else if (!isEditing && this.isEditing$.peek()) {
                    this._cell.value?.beforeExitEditingMode();
                    this.isEditing$.value = false;
                }
            }));
            this._disposables.addFromEvent(this, 'click', e => {
                e.stopPropagation();
                if (!this.isEditing$.value) {
                    this.selectCurrentCell(!this.column.readonly$.value);
                }
            });
        }
        render() {
            const props = {
                cell: this.column.cellGetOrCreate(this.cardId),
                isEditing$: this.isEditing$,
                selectCurrentCell: this.selectCurrentCell,
            };
            const renderer = this.column.renderer$.value;
            if (!renderer)
                return;
            const { view } = renderer;
            this.view.lockRows(this.isEditing$.value);
            this.dataset['editing'] = `${this.isEditing$.value}`;
            return html ` ${this.renderIcon()}
    ${renderUniLit(view, props, {
                ref: this._cell,
                class: 'mobile-kanban-cell',
                style: { display: 'block', flex: '1', overflow: 'hidden' },
            })}`;
        }
        renderIcon() {
            if (this.contentOnly) {
                return;
            }
            return html ` <uni-lit
      class="mobile-kanban-cell-icon"
      .uni="${this.column.icon}"
    ></uni-lit>`;
        }
        #cardId_accessor_storage;
        get cardId() { return this.#cardId_accessor_storage; }
        set cardId(value) { this.#cardId_accessor_storage = value; }
        #column_accessor_storage;
        get column() { return this.#column_accessor_storage; }
        set column(value) { this.#column_accessor_storage = value; }
        #contentOnly_accessor_storage;
        get contentOnly() { return this.#contentOnly_accessor_storage; }
        set contentOnly(value) { this.#contentOnly_accessor_storage = value; }
        #groupKey_accessor_storage;
        get groupKey() { return this.#groupKey_accessor_storage; }
        set groupKey(value) { this.#groupKey_accessor_storage = value; }
        #kanbanViewLogic_accessor_storage;
        get kanbanViewLogic() { return this.#kanbanViewLogic_accessor_storage; }
        set kanbanViewLogic(value) { this.#kanbanViewLogic_accessor_storage = value; }
        get view() {
            return this.kanbanViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this._cell = signal();
            this.isSelectionEditing$ = computed(() => {
                const selection = this.kanbanViewLogic.selection$.value;
                if (selection?.selectionType !== 'cell') {
                    return false;
                }
                if (selection.groupKey !== this.groupKey) {
                    return false;
                }
                if (selection.cardId !== this.cardId) {
                    return false;
                }
                if (selection.columnId !== this.column.id) {
                    return false;
                }
                return selection.isEditing;
            });
            this.selectCurrentCell = (editing) => {
                if (this.view.readonly$.value) {
                    return;
                }
                const setSelection = this.kanbanViewLogic.setSelection.bind(this.kanbanViewLogic);
                const viewId = this.kanbanViewLogic.view.id;
                if (setSelection && viewId) {
                    if (editing && this.cell?.beforeEnterEditMode() === false) {
                        return;
                    }
                    setSelection({
                        viewId,
                        type: 'kanban',
                        selectionType: 'cell',
                        groupKey: this.groupKey,
                        cardId: this.cardId,
                        columnId: this.column.id,
                        isEditing: editing,
                    });
                }
            };
            this.#cardId_accessor_storage = __runInitializers(this, _cardId_initializers, void 0);
            this.#column_accessor_storage = (__runInitializers(this, _cardId_extraInitializers), __runInitializers(this, _column_initializers, void 0));
            this.#contentOnly_accessor_storage = (__runInitializers(this, _column_extraInitializers), __runInitializers(this, _contentOnly_initializers, false));
            this.#groupKey_accessor_storage = (__runInitializers(this, _contentOnly_extraInitializers), __runInitializers(this, _groupKey_initializers, void 0));
            this.isEditing$ = (__runInitializers(this, _groupKey_extraInitializers), signal(false));
            this.#kanbanViewLogic_accessor_storage = __runInitializers(this, _kanbanViewLogic_initializers, void 0);
            __runInitializers(this, _kanbanViewLogic_extraInitializers);
        }
    };
})();
export { MobileKanbanCell };
