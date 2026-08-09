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
import { WithDisposable } from '@blocksuite/global/lit';
import { PlusIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computed } from '@preact/signals-core';
import { html } from 'lit';
import { property } from 'lit/decorators.js';
import { TableViewAreaSelection } from '../../../selection';
import * as styles from './group-footer-css';
let TableGroupFooter = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    let _gridGroup_decorators;
    let _gridGroup_initializers = [];
    let _gridGroup_extraInitializers = [];
    return class TableGroupFooter extends _classSuper {
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
            this.clickAddRow = () => {
                const group = this.group$.value;
                const rowId = this.tableViewManager.rowAdd('end', group?.key);
                this.requestUpdate();
                requestAnimationFrame(() => {
                    const rowIndex = this.selectionController.getRow(group?.key, rowId)
                        ?.rowIndex$.value;
                    if (rowIndex == null)
                        return;
                    const index = this.tableViewManager.properties$.value.findIndex(v => v.type$.value === 'title');
                    this.selectionController.selection = undefined;
                    requestAnimationFrame(() => {
                        this.selectionController.selection = TableViewAreaSelection.create({
                            groupKey: group?.key,
                            focus: {
                                rowIndex: rowIndex,
                                columnIndex: index,
                            },
                            isEditing: true,
                        });
                    });
                });
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
        get selectionController() {
            return this.tableViewLogic.selectionController;
        }
        get tableViewManager() {
            return this.tableViewLogic.view;
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add(styles.groupFooter);
            this.disposables.addFromEvent(this, 'mouseenter', () => {
                this.gridGroup.data.footerHover$.value = true;
            });
            this.disposables.addFromEvent(this, 'mouseleave', () => {
                this.gridGroup.data.footerHover$.value = false;
            });
        }
        render() {
            return html `
      ${this.tableViewManager.readonly$.value
                ? null
                : html `
            <div
              class="${styles.addRowWrapper} dv-hover"
              @click="${this.clickAddRow}"
            >
              <div
                class="${styles.addRowButton} dv-icon-16"
                data-test-id="affine-database-add-row-button"
                role="button"
              >
                ${PlusIcon()}<span class="${styles.addRowText}"
                  >New Record</span
                >
              </div>
            </div>
          `}
      <affine-database-virtual-column-stats
        .view="${this.tableViewManager}"
        .group="${this.group$.value}"
      ></affine-database-virtual-column-stats>
    `;
        }
    };
})();
export { TableGroupFooter };
