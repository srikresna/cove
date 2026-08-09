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
import { createButtonPopper } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { SettingsIcon, SortIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { consume } from '@lit/context';
import { signal } from '@preact/signals-core';
import { html } from 'lit';
import { query } from 'lit/decorators.js';
import { tocContext } from '../config';
import * as styles from './outline-panel-header.css';
export const AFFINE_OUTLINE_PANEL_HEADER = 'affine-outline-panel-header';
let OutlinePanelHeader = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let __notePreviewSettingMenu_decorators;
    let __notePreviewSettingMenu_initializers = [];
    let __notePreviewSettingMenu_extraInitializers = [];
    let __noteSettingButton_decorators;
    let __noteSettingButton_initializers = [];
    let __noteSettingButton_extraInitializers = [];
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class OutlinePanelHeader extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __notePreviewSettingMenu_decorators = [query(`.${styles.notePreviewSettingContainer}`)];
            __noteSettingButton_decorators = [query(`.${styles.noteSettingContainer}`)];
            __context_decorators = [consume({ context: tocContext })];
            __esDecorate(this, null, __notePreviewSettingMenu_decorators, { kind: "accessor", name: "_notePreviewSettingMenu", static: false, private: false, access: { has: obj => "_notePreviewSettingMenu" in obj, get: obj => obj._notePreviewSettingMenu, set: (obj, value) => { obj._notePreviewSettingMenu = value; } }, metadata: _metadata }, __notePreviewSettingMenu_initializers, __notePreviewSettingMenu_extraInitializers);
            __esDecorate(this, null, __noteSettingButton_decorators, { kind: "accessor", name: "_noteSettingButton", static: false, private: false, access: { has: obj => "_noteSettingButton" in obj, get: obj => obj._noteSettingButton, set: (obj, value) => { obj._noteSettingButton = value; } }, metadata: _metadata }, __noteSettingButton_initializers, __noteSettingButton_extraInitializers);
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        firstUpdated() {
            this._notePreviewSettingMenuPopper = createButtonPopper({
                reference: this._noteSettingButton,
                popperElement: this._notePreviewSettingMenu,
                stateUpdated: ({ display }) => {
                    this._settingPopperShow$.value = display === 'show';
                },
                mainAxis: 14,
                crossAxis: -30,
            });
            this.disposables.add(this._notePreviewSettingMenuPopper);
        }
        render() {
            const sortingEnabled = this._context.enableSorting$.value;
            const showSettingPopper = this._settingPopperShow$.value;
            return html `<div class=${styles.container}>
        <div class=${styles.noteSettingContainer}>
          <span class=${styles.label}>Table of Contents</span>
          <edgeless-tool-icon-button
            data-testid="toggle-toc-setting-button"
            class="${showSettingPopper ? 'active' : ''}"
            .tooltip=${showSettingPopper ? '' : 'Preview Settings'}
            .tipPosition=${'bottom'}
            .active=${showSettingPopper}
            .activeMode=${'background'}
            @click=${() => this._notePreviewSettingMenuPopper?.toggle()}
          >
            ${SettingsIcon({ width: '20px', height: '20px' })}
          </edgeless-tool-icon-button>
        </div>
        <edgeless-tool-icon-button
          data-testid="toggle-notes-sorting-button"
          class="${sortingEnabled ? 'active' : ''}"
          .tooltip=${'Visibility and sort'}
          .tipPosition=${'left'}
          .iconContainerPadding=${0}
          .active=${sortingEnabled}
          .activeMode=${'color'}
          @click=${() => {
                this._context.enableSorting$.value = !sortingEnabled;
            }}
        >
          ${SortIcon({ width: '20px', height: '20px' })}
        </edgeless-tool-icon-button>
      </div>
      <div class=${styles.notePreviewSettingContainer}>
        <affine-outline-note-preview-setting-menu></affine-outline-note-preview-setting-menu>
      </div>`;
        }
        #_notePreviewSettingMenu_accessor_storage;
        get _notePreviewSettingMenu() { return this.#_notePreviewSettingMenu_accessor_storage; }
        set _notePreviewSettingMenu(value) { this.#_notePreviewSettingMenu_accessor_storage = value; }
        #_noteSettingButton_accessor_storage;
        get _noteSettingButton() { return this.#_noteSettingButton_accessor_storage; }
        set _noteSettingButton(value) { this.#_noteSettingButton_accessor_storage = value; }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._notePreviewSettingMenuPopper = null;
            this._settingPopperShow$ = signal(false);
            this.#_notePreviewSettingMenu_accessor_storage = __runInitializers(this, __notePreviewSettingMenu_initializers, void 0);
            this.#_noteSettingButton_accessor_storage = (__runInitializers(this, __notePreviewSettingMenu_extraInitializers), __runInitializers(this, __noteSettingButton_initializers, void 0));
            this.#_context_accessor_storage = (__runInitializers(this, __noteSettingButton_extraInitializers), __runInitializers(this, __context_initializers, void 0));
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { OutlinePanelHeader };
