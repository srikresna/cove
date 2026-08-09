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
import { getScrollContainer } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { PlusIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { autoUpdate } from '@floating-ui/dom';
import { nothing } from 'lit';
import { property, query } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit/static-html.js';
import { cellDivider } from '../../styles.js';
import { tableStyle } from '../table-view-style';
import {} from '../table-view-ui-logic.js';
import { styles } from './styles.js';
let DatabaseColumnHeader = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _renderGroupHeader_decorators;
    let _renderGroupHeader_initializers = [];
    let _renderGroupHeader_extraInitializers = [];
    let _scaleDiv_decorators;
    let _scaleDiv_initializers = [];
    let _scaleDiv_extraInitializers = [];
    let _tableViewLogic_decorators;
    let _tableViewLogic_initializers = [];
    let _tableViewLogic_extraInitializers = [];
    return class DatabaseColumnHeader extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _renderGroupHeader_decorators = [property({ attribute: false })];
            _scaleDiv_decorators = [query('.scale-div')];
            _tableViewLogic_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _renderGroupHeader_decorators, { kind: "accessor", name: "renderGroupHeader", static: false, private: false, access: { has: obj => "renderGroupHeader" in obj, get: obj => obj.renderGroupHeader, set: (obj, value) => { obj.renderGroupHeader = value; } }, metadata: _metadata }, _renderGroupHeader_initializers, _renderGroupHeader_extraInitializers);
            __esDecorate(this, null, _scaleDiv_decorators, { kind: "accessor", name: "scaleDiv", static: false, private: false, access: { has: obj => "scaleDiv" in obj, get: obj => obj.scaleDiv, set: (obj, value) => { obj.scaleDiv = value; } }, metadata: _metadata }, _scaleDiv_initializers, _scaleDiv_extraInitializers);
            __esDecorate(this, null, _tableViewLogic_decorators, { kind: "accessor", name: "tableViewLogic", static: false, private: false, access: { has: obj => "tableViewLogic" in obj, get: obj => obj.tableViewLogic, set: (obj, value) => { obj.tableViewLogic = value; } }, metadata: _metadata }, _tableViewLogic_initializers, _tableViewLogic_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = styles; }
        get readonly() {
            return this.tableViewManager.readonly$.value;
        }
        autoSetHeaderPosition(group, scrollContainer) {
            const referenceRect = group.getBoundingClientRect();
            const floatingRect = this.getBoundingClientRect();
            const rootRect = scrollContainer.getBoundingClientRect();
            let moveX = 0;
            if (rootRect.top > referenceRect.top) {
                moveX =
                    Math.min(referenceRect.bottom - floatingRect.height, rootRect.top) -
                        referenceRect.top;
            }
            if (moveX === 0 && this.preMove === 0) {
                return;
            }
            this.preMove = moveX;
            this.style.transform = `translate3d(0,${moveX / this.getScale()}px,0)`;
        }
        connectedCallback() {
            super.connectedCallback();
            const scrollContainer = getScrollContainer(this.closest('affine-data-view-renderer'));
            const group = this.closest('affine-data-view-table-group');
            if (group) {
                const cancel = autoUpdate(group, this, () => {
                    if (!scrollContainer) {
                        return;
                    }
                    this.autoSetHeaderPosition(group, scrollContainer);
                });
                this.disposables.add(cancel);
            }
        }
        getScale() {
            return this.scaleDiv?.getBoundingClientRect().width ?? 1;
        }
        render() {
            return html `
      ${this.renderGroupHeader?.()}
      <div class="affine-database-column-header database-row">
        ${this.readonly
                ? nothing
                : html `<div class="${tableStyle.leftToolBarStyle}"></div>`}
        ${repeat(this.tableViewManager.properties$.value, column => column.id, (column, index) => {
                const style = styleMap({
                    width: `${column.width$.value}px`,
                    border: index === 0 ? 'none' : undefined,
                });
                return html `
              <affine-database-header-column
                style="${style}"
                data-column-id="${column.id}"
                data-column-index="${index}"
                class="affine-database-column database-cell"
                .column="${column}"
                .tableViewLogic="${this.tableViewLogic}"
              ></affine-database-header-column>
              <div class="${cellDivider}" style="height: auto;"></div>
            `;
            })}
        <div
          @click="${this._onAddColumn}"
          class="header-add-column-button dv-hover"
        >
          ${PlusIcon()}
        </div>
        <div class="scale-div" style="width: 1px;height: 1px;"></div>
      </div>
    `;
        }
        #renderGroupHeader_accessor_storage;
        get renderGroupHeader() { return this.#renderGroupHeader_accessor_storage; }
        set renderGroupHeader(value) { this.#renderGroupHeader_accessor_storage = value; }
        #scaleDiv_accessor_storage;
        get scaleDiv() { return this.#scaleDiv_accessor_storage; }
        set scaleDiv(value) { this.#scaleDiv_accessor_storage = value; }
        #tableViewLogic_accessor_storage;
        get tableViewLogic() { return this.#tableViewLogic_accessor_storage; }
        set tableViewLogic(value) { this.#tableViewLogic_accessor_storage = value; }
        get tableViewManager() {
            return this.tableViewLogic.view;
        }
        constructor() {
            super(...arguments);
            this._onAddColumn = (e) => {
                if (this.readonly)
                    return;
                this.tableViewManager.propertyAdd('end');
                const ele = e.currentTarget;
                requestAnimationFrame(() => {
                    this.editLastColumnTitle();
                    ele.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                });
            };
            this.editLastColumnTitle = () => {
                const columns = this.querySelectorAll('affine-database-header-column');
                const column = columns.item(columns.length - 1);
                column.editTitle();
            };
            this.preMove = 0;
            this.#renderGroupHeader_accessor_storage = __runInitializers(this, _renderGroupHeader_initializers, void 0);
            this.#scaleDiv_accessor_storage = (__runInitializers(this, _renderGroupHeader_extraInitializers), __runInitializers(this, _scaleDiv_initializers, void 0));
            this.#tableViewLogic_accessor_storage = (__runInitializers(this, _scaleDiv_extraInitializers), __runInitializers(this, _tableViewLogic_initializers, void 0));
            __runInitializers(this, _tableViewLogic_extraInitializers);
        }
    };
})();
export { DatabaseColumnHeader };
