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
import { PlusIcon, ToggleDownIcon, ToggleRightIcon, } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { signal } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, html, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { GroupTitle } from '../../../core/group-by/group-title.js';
import { getCollapsedState, setCollapsedState } from '../collapsed-state.js';
import { LEFT_TOOL_BAR_WIDTH } from '../consts.js';
const styles = css `
  .data-view-table-group-add-row {
    display: flex;
    width: 100%;
    height: 28px;
    position: relative;
    z-index: 0;
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
    padding: 4px 8px;
    border-bottom: 1px solid ${unsafeCSS(cssVarV2.layer.insideBorder.border)};
  }

  .data-view-table-group-add-row-button {
    position: sticky;
    left: ${8 + LEFT_TOOL_BAR_WIDTH}px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    user-select: none;
    font-size: 12px;
    line-height: 20px;
    color: var(--affine-text-secondary-color);
  }

  .group-toggle-btn {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 150ms cubic-bezier(0.42, 0, 1, 1);
  }

  .group-toggle-btn:hover {
    background: var(--affine-hover-color);
  }

  .group-toggle-btn svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    user-select: none;
  }
`;
let MobileTableGroup = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _group_decorators;
    let _group_initializers = [];
    let _group_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class MobileTableGroup extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _group_decorators = [property({ attribute: false })];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _group_decorators, { kind: "accessor", name: "group", static: false, private: false, access: { has: obj => "group" in obj, get: obj => obj.group, set: (obj, value) => { obj.group = value; } }, metadata: _metadata }, _group_initializers, _group_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        _loadCollapsedState() {
            if (this.storageLoaded)
                return;
            this.storageLoaded = true;
            const view = this.tableViewLogic?.view;
            if (!view)
                return;
            const value = getCollapsedState(view.id, this.group?.key ?? 'all');
            this.collapsed$.value = value;
        }
        get rows() {
            return this.group?.rows ?? this.view.rows$.value;
        }
        renderRows(rows) {
            return html `
      <mobile-table-header
        .tableViewManager="${this.view}"
      ></mobile-table-header>
      <div class="mobile-affine-table-body">
        ${repeat(rows, row => row.rowId, (row, idx) => {
                return html ` <mobile-table-row
              data-row-index="${idx}"
              data-row-id="${row.rowId}"
              .tableViewLogic="${this.tableViewLogic}"
              .rowId="${row.rowId}"
              .rowIndex="${idx}"
            ></mobile-table-row>`;
            })}
      </div>
      ${this.view.readonly$.value
                ? null
                : html ` <div
            class="data-view-table-group-add-row dv-hover"
            @click="${this.clickAddRow}"
          >
            <div
              class="data-view-table-group-add-row-button dv-icon-16"
              data-test-id="affine-database-add-row-button"
              role="button"
            >
              ${PlusIcon()}<span style="font-size: 12px">New Record</span>
            </div>
          </div>`}
    `;
        }
        willUpdate(changed) {
            super.willUpdate(changed);
            if (!this.storageLoaded &&
                (changed.has('group') || changed.has('tableViewLogic'))) {
                this._loadCollapsedState();
            }
        }
        connectedCallback() {
            super.connectedCallback();
            this._loadCollapsedState();
        }
        render() {
            return html `
      ${this.collapsed$.value ? this.renderGroupHeader() : nothing}
      ${this.collapsed$.value ? nothing : this.renderRows(this.rows)}
    `;
        }
        #group_accessor_storage;
        get group() { return this.#group_accessor_storage; }
        set group(value) { this.#group_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        get view() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this.collapsed$ = signal(false);
            this.storageLoaded = false;
            this._toggleCollapse = (e) => {
                e?.stopPropagation();
                const next = !this.collapsed$.value;
                this.collapsed$.value = next;
                const view = this.tableViewLogic?.view;
                if (view) {
                    setCollapsedState(view.id, this.group?.key ?? 'all', next);
                }
            };
            this.clickAddRow = () => {
                this.view.rowAdd('end', this.group?.key);
                this.requestUpdate();
            };
            this.clickAddRowInStart = () => {
                this.view.rowAdd('start', this.group?.key);
                this.requestUpdate();
            };
            this.clickGroupOptions = (e) => {
                const group = this.group;
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
                            this.view.rowsDelete(group.rows.map(row => row.rowId));
                            this.requestUpdate();
                        },
                    }),
                ]);
            };
            this.renderGroupHeader = () => {
                if (!this.group) {
                    return null;
                }
                return html `
      <div
        style="position: sticky;left: 0;width: max-content;padding: 6px 0;margin-bottom: 4px;display:flex;align-items:center;gap: 12px;max-width: 400px"
      >
        <div
          class=${`group-toggle-btn ${this.collapsed$.value ? '' : 'expanded'}`}
          role="button"
          aria-expanded=${this.collapsed$.value ? 'false' : 'true'}
          aria-label=${this.collapsed$.value
                    ? 'Expand group'
                    : 'Collapse group'}
          tabindex="0"
          @click=${this._toggleCollapse}
          @keydown=${(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this._toggleCollapse();
                    }
                }}
        >
          ${this.collapsed$.value
                    ? ToggleRightIcon({ width: '16px', height: '16px' })
                    : ToggleDownIcon({ width: '16px', height: '16px' })}
        </div>

        ${GroupTitle(this.group, {
                    readonly: this.view.readonly$.value,
                    clickAdd: this.clickAddRowInStart,
                    clickOps: this.clickGroupOptions,
                })}
      </div>
    `;
            };
            this.#group_accessor_storage = __runInitializers(this, _group_initializers, undefined);
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _group_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { MobileTableGroup };
