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
import { ShadowlessElement } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { TableViewAreaSelection } from '../../../selection';
import * as styles from './group-header-css';
import { GroupTitle } from './group-title';
let TableGroupHeader = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    let _gridGroup_decorators;
    let _gridGroup_initializers = [];
    let _gridGroup_extraInitializers = [];
    return class TableGroupHeader extends _classSuper {
        constructor() {
            super(...arguments);
            this.#tableViewLogic_accessor_storage = __runInitializers(this, _tableViewLogic_initializers, void 0);
            this.#gridGroup_accessor_storage = (__runInitializers(this, _tableViewLogic_extraInitializers), __runInitializers(this, _gridGroup_initializers, void 0));
            this.group$ = (__runInitializers(this, _gridGroup_extraInitializers), computed(() => {
                const groups = this.tableViewLogic.groupTrait$.value?.groupsDataList$.value ?? [];
                return groups
                    .filter((group) => group != null)
                    .find(g => g.key === this.gridGroup.groupId);
            }));
            this.groupKey$ = computed(() => {
                return this.group$.value?.key;
            });
            this.clickAddRowInStart = () => {
                const group = this.group$.value;
                if (!group) {
                    return;
                }
                this.tableViewManager.rowAdd('start', group.key);
                this.requestUpdate();
                const selectionController = this.selectionController;
                selectionController.selection = undefined;
                requestAnimationFrame(() => {
                    const index = this.tableViewManager.properties$.value.findIndex(v => v.type$.value === 'title');
                    selectionController.selection = TableViewAreaSelection.create({
                        groupKey: group.key,
                        focus: {
                            rowIndex: 0,
                            columnIndex: index,
                        },
                        isEditing: true,
                    });
                });
            };
            this.clickGroupOptions = (e) => {
                const group = this.group$.value;
                if (!group) {
                    return;
                }
                const ele = e.currentTarget;
                popFilterableSimpleMenu(popupTargetFromElement(ele), [
                    menu.action({
                        name: 'Ungroup',
                        hide: () => group.value == null,
                        select: () => {
                            group.rows.forEach(row => {
                                group.manager.removeFromGroup(row.rowId, group.key);
                            });
                        },
                    }),
                    menu.action({
                        name: 'Delete Cards',
                        select: () => {
                            this.tableViewManager.rowsDelete(group.rows.map(row => row.rowId));
                            this.requestUpdate();
                        },
                    }),
                ]);
            };
            this.renderGroupHeader = () => {
                const group = this.group$.value;
                if (!group) {
                    return null;
                }
                return html `
      <div
        style="position: sticky;left: 0;width: max-content;padding: 6px 0;margin-bottom: 4px;display:flex;align-items:center;gap: 12px;max-width: 400px"
      >
        ${GroupTitle(group, {
                    groupHover: this.gridGroup.data.headerHover$.value,
                    readonly: this.tableViewManager.readonly$.value,
                    clickAdd: this.clickAddRowInStart,
                    clickOps: this.clickGroupOptions,
                })}
      </div>
    `;
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _tableViewLogic_decorators = [property({ attribute: false })];
            _gridGroup_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            __esDecorate(this, null, _gridGroup_decorators, { kind: "accessor", name: "gridGroup", static: false, private: false, access: { has: obj => "gridGroup" in obj, get: obj => obj.gridGroup, set: (obj, value) => { obj.gridGroup = value; } }, metadata: _metadata }, _gridGroup_initializers, _gridGroup_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        #gridGroup_accessor_storage;
        get gridGroup() { return this.#gridGroup_accessor_storage; }
        set gridGroup(value) { this.#gridGroup_accessor_storage = value; }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add(styles.groupHeader);
            this.disposables.addFromEvent(this, 'mouseenter', () => {
                this.gridGroup.data.headerHover$.value = true;
            });
            this.disposables.addFromEvent(this, 'mouseleave', () => {
                this.gridGroup.data.headerHover$.value = false;
            });
        }
        get tableViewManager() {
            return this.tableViewLogic.view;
        }
        get selectionController() {
            return this.tableViewLogic.selectionController;
        }
        render() {
            return html `
      ${this.renderGroupHeader()}
      <virtual-table-header
        .tableViewLogic="${this.tableViewLogic}"
      ></virtual-table-header>
    `;
        }
    };
})();
export { TableGroupHeader };
