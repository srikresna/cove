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
import { popupTargetFromElement } from '@blocksuite/affine-components/context-menu';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { CenterPeekIcon, MoreHorizontalIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { signal } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';
import { html } from 'lit/static-html.js';
import { openDetail, popCardMenu } from './menu.js';
const styles = css `
  affine-data-view-kanban-card {
    display: flex;
    position: relative;
    flex-direction: column;
    border: 1px solid ${unsafeCSS(cssVarV2.layer.insideBorder.border)};
    box-shadow: 0px 2px 3px 0px rgba(0, 0, 0, 0.05);
    border-radius: 8px;
    transition: background-color 100ms ease-in-out;
    background-color: var(--affine-background-kanban-card-color);
  }

  affine-data-view-kanban-card:hover {
    background-color: var(--affine-hover-color);
  }

  affine-data-view-kanban-card .card-header {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  affine-data-view-kanban-card .card-header-title uni-lit {
    width: 100%;
  }

  .card-header.has-divider {
    border-bottom: 0.5px solid ${unsafeCSS(cssVarV2.layer.insideBorder.border)};
  }

  affine-data-view-kanban-card .card-header-title {
    font-size: var(--data-view-cell-text-size);
    line-height: var(--data-view-cell-text-line-height);
  }

  affine-data-view-kanban-card .card-header-icon {
    padding: 4px;
    background-color: var(--affine-background-secondary-color);
    display: flex;
    align-items: center;
    border-radius: 4px;
    width: max-content;
  }

  affine-data-view-kanban-card .card-header-icon svg {
    width: 16px;
    height: 16px;
    fill: var(--affine-icon-color);
    color: var(--affine-icon-color);
  }

  affine-data-view-kanban-card .card-body {
    display: flex;
    flex-direction: column;
    padding: 8px;
    gap: 4px;
  }

  affine-data-view-kanban-card:hover .card-ops {
    visibility: visible;
  }
  affine-data-view-kanban-card:has(.active) .card-ops {
    visibility: visible;
  }

  affine-data-view-kanban-card:has([data-editing='true']) .card-ops {
    visibility: hidden;
  }

  .card-ops {
    position: absolute;
    right: 8px;
    top: 8px;
    visibility: hidden;
    display: flex;
    gap: 4px;
    cursor: pointer;
  }

  .card-op {
    display: flex;
    position: relative;
    padding: 4px;
    border-radius: 4px;
    box-shadow: 0px 0px 4px 0px rgba(66, 65, 73, 0.14);
    background-color: var(--affine-background-primary-color);
  }

  .card-op:hover:before {
    content: '';
    border-radius: 4px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: var(--affine-hover-color);
  }

  .card-op svg {
    fill: var(--affine-icon-color);
    color: var(--affine-icon-color);
    width: 16px;
    height: 16px;
  }
`;
let KanbanCard = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _cardId_decorators;
    let _cardId_initializers = [];
    let _cardId_extraInitializers = [];
    let _groupKey_decorators;
    let _groupKey_initializers = [];
    let _groupKey_extraInitializers = [];
    let _kanbanViewLogic_decorators;
    let _kanbanViewLogic_initializers = [];
    let _kanbanViewLogic_extraInitializers = [];
    return class KanbanCard extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _cardId_decorators = [property({ attribute: false })];
            _groupKey_decorators = [property({ attribute: false })];
            _kanbanViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _cardId_decorators, { kind: "accessor", name: "cardId", static: false, private: false, access: { has: obj => "cardId" in obj, get: obj => obj.cardId, set: (obj, value) => { obj.cardId = value; } }, metadata: _metadata }, _cardId_initializers, _cardId_extraInitializers);
            __esDecorate(this, null, _groupKey_decorators, { kind: "accessor", name: "groupKey", static: false, private: false, access: { has: obj => "groupKey" in obj, get: obj => obj.groupKey, set: (obj, value) => { obj.groupKey = value; } }, metadata: _metadata }, _groupKey_initializers, _groupKey_extraInitializers);
            __esDecorate(this, null, _kanbanViewLogic_decorators, { kind: "accessor", name: "kanbanViewLogic", static: false, private: false, access: { has: obj => "kanbanViewLogic" in obj, get: obj => obj.kanbanViewLogic, set: (obj, value) => { obj.kanbanViewLogic = value; } }, metadata: _metadata }, _kanbanViewLogic_initializers, _kanbanViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        getSelection() {
            return this.kanbanViewLogic.selectionController;
        }
        renderBody(columns) {
            if (columns.length === 0) {
                return '';
            }
            return html ` <div class="card-body">
      ${repeat(columns, v => v.id, column => {
                if (this.view.isInHeader(column.id)) {
                    return '';
                }
                return html ` <affine-data-view-kanban-cell
            .contentOnly="${false}"
            data-column-id="${column.id}"
            .groupKey="${this.groupKey}"
            .column="${column}"
            .cardId="${this.cardId}"
            .kanbanViewLogic="${this.kanbanViewLogic}"
          ></affine-data-view-kanban-cell>`;
            })}
    </div>`;
        }
        renderHeader(columns) {
            if (!this.view.hasHeader(this.cardId)) {
                return '';
            }
            const classList = classMap({
                'card-header': true,
                'has-divider': columns.length > 0,
            });
            return html `
      <div class="${classList}">${this.renderTitle()} ${this.renderIcon()}</div>
    `;
        }
        renderIcon() {
            const icon = this.view.getHeaderIcon(this.cardId);
            if (!icon) {
                return;
            }
            return html ` <div class="card-header-icon">
      ${icon.cellGetOrCreate(this.cardId).value$.value}
    </div>`;
        }
        renderOps() {
            if (this.view.readonly$.value) {
                return;
            }
            return html `
      <div class="card-ops">
        <div class="card-op" @click="${this.clickEdit}">
          ${CenterPeekIcon()}
        </div>
        <div class="card-op" @click="${this.clickMore}">
          ${MoreHorizontalIcon()}
        </div>
      </div>
    `;
        }
        renderTitle() {
            const title = this.view.getHeaderTitle(this.cardId);
            if (!title) {
                return;
            }
            return html ` <div class="card-header-title">
      <affine-data-view-kanban-cell
        .contentOnly="${true}"
        data-column-id="${title.id}"
        .kanbanViewLogic="${this.kanbanViewLogic}"
        .groupKey="${this.groupKey}"
        .column="${title}"
        .cardId="${this.cardId}"
      ></affine-data-view-kanban-cell>
    </div>`;
        }
        connectedCallback() {
            super.connectedCallback();
            if (this.view.readonly$.value) {
                return;
            }
            this._disposables.addFromEvent(this, 'contextmenu', e => {
                this.contextMenu(e);
            });
            this._disposables.addFromEvent(this, 'click', e => {
                if (e.shiftKey) {
                    this.getSelection()?.shiftClickCard(e);
                    return;
                }
                const selection = this.getSelection();
                const preSelection = selection?.selection;
                if (preSelection?.selectionType !== 'card')
                    return;
                if (selection) {
                    selection.selection = undefined;
                }
                this.kanbanViewLogic.root.openDetailPanel({
                    view: this.view,
                    rowId: this.cardId,
                    onClose: () => {
                        if (selection) {
                            selection.selection = preSelection;
                        }
                    },
                });
            });
        }
        render() {
            const columns = this.view.properties$.value.filter(v => !this.view.isInHeader(v.id));
            this.style.border = this.isFocus$.value
                ? '1px solid var(--affine-primary-color)'
                : '';
            return html `
      ${this.renderHeader(columns)} ${this.renderBody(columns)}
      ${this.renderOps()}
    `;
        }
        #cardId_accessor_storage;
        get cardId() { return this.#cardId_accessor_storage; }
        set cardId(value) { this.#cardId_accessor_storage = value; }
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
            this.clickEdit = (e) => {
                e.stopPropagation();
                const selection = this.getSelection();
                if (selection) {
                    openDetail(this.kanbanViewLogic, this.cardId, selection);
                }
            };
            this.clickMore = (e) => {
                e.stopPropagation();
                const selection = this.getSelection();
                const ele = e.currentTarget;
                if (selection) {
                    selection.selection = {
                        selectionType: 'card',
                        cards: [
                            {
                                groupKey: this.groupKey,
                                cardId: this.cardId,
                            },
                        ],
                    };
                    popCardMenu(this.kanbanViewLogic, popupTargetFromElement(ele), this.cardId, selection);
                }
            };
            this.contextMenu = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const selection = this.getSelection();
                if (selection) {
                    selection.selection = {
                        selectionType: 'card',
                        cards: [
                            {
                                groupKey: this.groupKey,
                                cardId: this.cardId,
                            },
                        ],
                    };
                    const target = e.target;
                    const ref = target.closest('affine-data-view-kanban-cell') ?? this;
                    popCardMenu(this.kanbanViewLogic, popupTargetFromElement(ref), this.cardId, selection);
                }
            };
            this.#cardId_accessor_storage = __runInitializers(this, _cardId_initializers, void 0);
            this.#groupKey_accessor_storage = (__runInitializers(this, _cardId_extraInitializers), __runInitializers(this, _groupKey_initializers, void 0));
            this.isFocus$ = (__runInitializers(this, _groupKey_extraInitializers), signal(false));
            this.#kanbanViewLogic_accessor_storage = __runInitializers(this, _kanbanViewLogic_initializers, void 0);
            __runInitializers(this, _kanbanViewLogic_extraInitializers);
        }
    };
})();
export { KanbanCard };
