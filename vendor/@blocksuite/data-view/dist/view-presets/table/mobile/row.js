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
import { unsafeCSSVarV2 } from '@blocksuite/affine-shared/theme';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { CenterPeekIcon, MoreHorizontalIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { cssVarV2 } from '@toeverything/theme/v2';
import { css, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';
import { cellDivider } from '../styles.js';
import { popMobileRowMenu } from './menu.js';
let MobileTableRow = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    let _rowId_decorators;
    let _rowId_initializers = [];
    let _rowId_extraInitializers = [];
    let _rowIndex_decorators;
    let _rowIndex_initializers = [];
    let _rowIndex_extraInitializers = [];
    return class MobileTableRow extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _tableViewLogic_decorators = [property({ attribute: false })];
            _rowId_decorators = [property({ attribute: false })];
            _rowIndex_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            __esDecorate(this, null, _rowId_decorators, { kind: "accessor", name: "rowId", static: false, private: false, access: { has: obj => "rowId" in obj, get: obj => obj.rowId, set: (obj, value) => { obj.rowId = value; } }, metadata: _metadata }, _rowId_initializers, _rowId_extraInitializers);
            __esDecorate(this, null, _rowIndex_decorators, { kind: "accessor", name: "rowIndex", static: false, private: false, access: { has: obj => "rowIndex" in obj, get: obj => obj.rowIndex, set: (obj, value) => { obj.rowIndex = value; } }, metadata: _metadata }, _rowIndex_initializers, _rowIndex_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .mobile-table-row {
      width: 100%;
      display: flex;
      flex-direction: row;
      border-bottom: 1px solid ${unsafeCSS(cssVarV2.layer.insideBorder.border)};
      position: relative;
      min-height: 34px;
    }

    .mobile-row-ops {
      position: relative;
      width: 0;
      margin-top: 5px;
      height: max-content;
      display: flex;
      gap: 4px;
      cursor: pointer;
      justify-content: end;
      right: 8px;
    }

    .affine-database-block-row:has([data-editing='true']) .mobile-row-ops {
      visibility: hidden;
      opacity: 0;
    }

    .mobile-row-op {
      display: flex;
      padding: 4px;
      border-radius: 4px;
      box-shadow: 0px 0px 4px 0px rgba(66, 65, 73, 0.14);
      background-color: var(--affine-background-primary-color);
      position: relative;
      font-size: 16px;
      color: ${unsafeCSSVarV2('icon/primary')};
    }
  `; }
        get groupKey() {
            return this.closest('affine-data-view-table-group')?.group?.key;
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add('mobile-table-row');
        }
        render() {
            const view = this.view;
            return html `
      ${repeat(view.properties$.value, v => v.id, (column, i) => {
                const clickDetail = () => {
                    this.tableViewLogic.root.openDetailPanel({
                        view: this.view,
                        rowId: this.rowId,
                    });
                };
                const openMenu = (e) => {
                    const ele = e.currentTarget;
                    popMobileRowMenu(popupTargetFromElement(ele), this.rowId, this.tableViewLogic, this.view);
                };
                return html `
            <div style="display: flex;">
              <mobile-table-cell
                class="mobile-table-cell"
                style=${styleMap({
                    width: `${column.width$.value}px`,
                    border: i === 0 ? 'none' : undefined,
                })}
                .tableViewLogic="${this.tableViewLogic}"
                .column="${column}"
                .rowId="${this.rowId}"
                data-row-id="${this.rowId}"
                .rowIndex="${this.rowIndex}"
                data-row-index="${this.rowIndex}"
                .columnId="${column.id}"
                data-column-id="${column.id}"
                .columnIndex="${i}"
                data-column-index="${i}"
              >
              </mobile-table-cell>
              <div class="${cellDivider}"></div>
            </div>
            ${!column.readonly$.value &&
                    column.view.mainProperties$.value.titleColumn === column.id
                    ? html ` <div class="mobile-row-ops">
                  <div class="mobile-row-op" @click="${clickDetail}">
                    ${CenterPeekIcon()}
                  </div>
                  ${!view.readonly$.value
                        ? html ` <div class="mobile-row-op" @click="${openMenu}">
                        ${MoreHorizontalIcon()}
                      </div>`
                        : nothing}
                </div>`
                    : nothing}
          `;
            })}
      <div class="database-cell add-column-button"></div>
    `;
        }
        #tableViewLogic_accessor_storage = __runInitializers(this, _tableViewLogic_initializers, void 0);
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        #rowId_accessor_storage = (__runInitializers(this, _tableViewLogic_extraInitializers), __runInitializers(this, _rowId_initializers, void 0));
        get rowId() { return this.#rowId_accessor_storage; }
        set rowId(value) { this.#rowId_accessor_storage = value; }
        #rowIndex_accessor_storage = (__runInitializers(this, _rowId_extraInitializers), __runInitializers(this, _rowIndex_initializers, void 0));
        get rowIndex() { return this.#rowIndex_accessor_storage; }
        set rowIndex(value) { this.#rowIndex_accessor_storage = value; }
        get view() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            __runInitializers(this, _rowIndex_extraInitializers);
        }
    };
})();
export { MobileTableRow };
