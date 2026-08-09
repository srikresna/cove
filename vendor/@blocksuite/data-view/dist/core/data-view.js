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
import { IS_MOBILE } from '@blocksuite/global/env';
import { BlockSuiteError } from '@blocksuite/global/exceptions';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement, } from '@blocksuite/std';
import { computed, signal } from '@preact/signals-core';
import { css, unsafeCSS } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ref } from 'lit/directives/ref.js';
import { html } from 'lit/static-html.js';
import { dataViewCommonStyle } from './common/css-variable.js';
import { renderUniLit } from './utils/uni-component/index.js';
export class DataViewRootUILogic {
    get dataSource() {
        return this.config.dataSource;
    }
    get viewManager() {
        return this.dataSource.viewManager;
    }
    createDataViewUILogic(viewId) {
        const view = this.viewManager.viewGet(viewId);
        if (!view) {
            throw new BlockSuiteError(BlockSuiteError.ErrorCode.DatabaseBlockError, `View ${viewId} not found`);
        }
        const pcLogic = view.meta.renderer.pcLogic;
        const mobileLogic = view.meta.renderer.mobileLogic;
        const logic = (IS_MOBILE ? mobileLogic : pcLogic) ?? pcLogic;
        return new (logic(view))(this, view);
    }
    get selection$() {
        return this.config.selection$;
    }
    setSelection(selection) {
        this.config.setSelection(selection);
    }
    constructor(config) {
        this.config = config;
        this._viewsCache = new Map();
        this.views$ = computed(() => {
            const viewDataList = this.dataSource.viewDataList$.value;
            const validIds = new Set(viewDataList.map(viewData => viewData.id));
            for (const cachedId of this._viewsCache.keys()) {
                if (!validIds.has(cachedId)) {
                    this._viewsCache.delete(cachedId);
                }
            }
            return viewDataList.map(viewData => {
                const cached = this._viewsCache.get(viewData.id);
                if (cached && cached.mode === viewData.mode) {
                    return cached.logic;
                }
                const logic = this.createDataViewUILogic(viewData.id);
                this._viewsCache.set(viewData.id, {
                    mode: viewData.mode,
                    logic,
                });
                return logic;
            });
        });
        this.viewsMap$ = computed(() => {
            return Object.fromEntries(this.views$.value.map(logic => [logic.view.id, logic]));
        });
        this._uiRef = signal();
        this.currentViewId$ = computed(() => {
            return this.dataSource.viewManager.currentViewId$.value;
        });
        this.currentView$ = computed(() => {
            const currentViewId = this.currentViewId$.value;
            if (!currentViewId) {
                return;
            }
            return this.viewsMap$.value[currentViewId];
        });
        this.focusFirstCell = () => {
            this.currentView$.value?.focusFirstCell();
        };
        this.openDetailPanel = (ops) => {
            const openDetailPanel = this.config.detailPanelConfig.openDetailPanel;
            const target = this.dataViewRenderer;
            if (openDetailPanel && target) {
                openDetailPanel(target, {
                    view: ops.view,
                    rowId: ops.rowId,
                })
                    .catch(console.error)
                    .finally(ops.onClose);
            }
        };
    }
    get dataViewRenderer() {
        return this._uiRef.value;
    }
    setupViewChangeListener() {
        let preId = undefined;
        return this.currentViewId$.subscribe(current => {
            if (current !== preId) {
                this.config.setSelection(undefined);
            }
            preId = current;
        });
    }
    render() {
        return html ` <affine-data-view-renderer
      ${ref(this._uiRef)}
      .logic="${this}"
    ></affine-data-view-renderer>`;
    }
}
let DataViewRootUI = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _logic_decorators;
    let _logic_initializers = [];
    let _logic_extraInitializers = [];
    let _currentView_decorators;
    let _currentView_initializers = [];
    let _currentView_extraInitializers = [];
    return class DataViewRootUI extends _classSuper {
        constructor() {
            super(...arguments);
            this.#logic_accessor_storage = __runInitializers(this, _logic_initializers, void 0);
            this.#currentView_accessor_storage = (__runInitializers(this, _logic_extraInitializers), __runInitializers(this, _currentView_initializers, undefined));
            this.focusFirstCell = (__runInitializers(this, _currentView_extraInitializers), () => {
                this.logic.focusFirstCell();
            });
            this.openDetailPanel = (ops) => {
                this.logic.openDetailPanel(ops);
            };
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _logic_decorators = [property({ attribute: false })];
            _currentView_decorators = [state()];
            __esDecorate(this, null, _logic_decorators, { kind: "accessor", name: "logic", static: false, private: false, access: { has: obj => "logic" in obj, get: obj => obj.logic, set: (obj, value) => { obj.logic = value; } }, metadata: _metadata }, _logic_initializers, _logic_extraInitializers);
            __esDecorate(this, null, _currentView_decorators, { kind: "accessor", name: "currentView", static: false, private: false, access: { has: obj => "currentView" in obj, get: obj => obj.currentView, set: (obj, value) => { obj.currentView = value; } }, metadata: _metadata }, _currentView_initializers, _currentView_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    ${unsafeCSS(dataViewCommonStyle('affine-data-view-renderer'))}
    affine-data-view-renderer {
      background-color: var(--affine-background-primary-color);
      display: contents;
    }
  `; }
        #logic_accessor_storage;
        get logic() { return this.#logic_accessor_storage; }
        set logic(value) { this.#logic_accessor_storage = value; }
        #currentView_accessor_storage;
        get currentView() { return this.#currentView_accessor_storage; }
        set currentView(value) { this.#currentView_accessor_storage = value; }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.add(this.logic.setupViewChangeListener());
        }
        render() {
            const containerClass = classMap({
                'toolbar-hover-container': true,
                'data-view-root': true,
                'prevent-reference-popup': true,
            });
            const currentView = this.logic.currentView$.value;
            if (!currentView) {
                return;
            }
            return html `
      <div style="display: contents" class="${containerClass}">
        ${renderUniLit(currentView.renderer, {
                logic: currentView,
            })}
      </div>
    `;
        }
    };
})();
export { DataViewRootUI };
