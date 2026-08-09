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
import { menu, popFilterableSimpleMenu, popupTargetFromElement, } from '@blocksuite/affine-components/context-menu';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { AddCursorIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { css, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { html } from 'lit/static-html.js';
import { GroupTitle } from '../../../core/group-by/group-title.js';
import { dragHandler } from '../../../core/utils/wc-dnd/dnd-context.js';
const styles = css `
  mobile-kanban-group {
    width: 260px;
    flex-shrink: 0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
  }

  .mobile-group-header {
    height: 32px;
    padding: 6px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    overflow: hidden;
  }

  .mobile-group-body {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    padding: 0 4px;
    gap: 12px;
  }

  .mobile-add-card {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
    font-size: var(--data-view-cell-text-size);
    line-height: var(--data-view-cell-text-line-height);
    color: var(--affine-text-secondary-color);
  }
`;
let MobileKanbanGroup = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _group_decorators;
    let _group_initializers = [];
    let _group_extraInitializers = [];
    let _kanbanViewLogic_decorators;
    let _kanbanViewLogic_initializers = [];
    let _kanbanViewLogic_extraInitializers = [];
    return class MobileKanbanGroup extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _group_decorators = [property({ attribute: false })];
            _kanbanViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _group_decorators, { kind: "accessor", name: "group", static: false, private: false, access: { has: obj => "group" in obj, get: obj => obj.group, set: (obj, value) => { obj.group = value; } }, metadata: _metadata }, _group_initializers, _group_extraInitializers);
            __esDecorate(this, null, _kanbanViewLogic_decorators, { kind: "accessor", name: "kanbanViewLogic", static: false, private: false, access: { has: obj => "kanbanViewLogic" in obj, get: obj => obj.kanbanViewLogic, set: (obj, value) => { obj.kanbanViewLogic = value; } }, metadata: _metadata }, _kanbanViewLogic_initializers, _kanbanViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        render() {
            const cards = this.group.rows;
            return html `
      <div class="mobile-group-header" ${dragHandler(this.group.key)}>
        ${GroupTitle(this.group, {
                readonly: this.view.readonly$.value,
                clickAdd: this.clickAddCardInStart,
                clickOps: this.clickGroupOptions,
            })}
      </div>
      <div class="mobile-group-body">
        ${repeat(cards, row => row.rowId, row => {
                return html `
              <mobile-kanban-card
                data-card-id="${row.rowId}"
                .groupKey="${this.group.key}"
                .cardId="${row.rowId}"
                .kanbanViewLogic="${this.kanbanViewLogic}"
              ></mobile-kanban-card>
            `;
            })}
        ${this.view.readonly$.value
                ? nothing
                : html ` <div class="mobile-add-card" @click="${this.clickAddCard}">
              <div
                style="margin-right: 4px;width: 16px;height: 16px;display:flex;align-items:center;"
              >
                ${AddCursorIcon()}
              </div>
              Add
            </div>`}
      </div>
    `;
        }
        #group_accessor_storage;
        get group() { return this.#group_accessor_storage; }
        set group(value) { this.#group_accessor_storage = value; }
        #kanbanViewLogic_accessor_storage;
        get kanbanViewLogic() { return this.#kanbanViewLogic_accessor_storage; }
        set kanbanViewLogic(value) { this.#kanbanViewLogic_accessor_storage = value; }
        get view() {
            return this.kanbanViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this.clickAddCard = () => {
                this.view.addCard('end', this.group.key);
                this.requestUpdate();
            };
            this.clickAddCardInStart = () => {
                this.view.addCard('start', this.group.key);
                this.requestUpdate();
            };
            this.clickGroupOptions = (e) => {
                const ele = e.currentTarget;
                popFilterableSimpleMenu(popupTargetFromElement(ele), [
                    menu.group({
                        items: [
                            menu.action({
                                name: 'Ungroup',
                                hide: () => this.group.value == null,
                                select: () => {
                                    this.group.rows.forEach(row => {
                                        this.group.manager.removeFromGroup(row.rowId, this.group.key);
                                    });
                                    this.requestUpdate();
                                },
                            }),
                            menu.action({
                                name: 'Delete Cards',
                                select: () => {
                                    this.view.rowsDelete(this.group.rows.map(row => row.rowId));
                                    this.requestUpdate();
                                },
                            }),
                        ],
                    }),
                ]);
            };
            this.#group_accessor_storage = __runInitializers(this, _group_initializers, void 0);
            this.#kanbanViewLogic_accessor_storage = (__runInitializers(this, _group_extraInitializers), __runInitializers(this, _kanbanViewLogic_initializers, void 0));
            __runInitializers(this, _kanbanViewLogic_extraInitializers);
        }
    };
})();
export { MobileKanbanGroup };
