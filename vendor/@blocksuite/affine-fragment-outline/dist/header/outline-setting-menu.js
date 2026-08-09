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
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { consume } from '@lit/context';
import { html } from 'lit';
import { tocContext } from '../config';
import * as styles from './outline-setting-menu.css';
export const AFFINE_OUTLINE_NOTE_PREVIEW_SETTING_MENU = 'affine-outline-note-preview-setting-menu';
let OutlineNotePreviewSettingMenu = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class OutlineNotePreviewSettingMenu extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __context_decorators = [consume({ context: tocContext })];
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        render() {
            const showPreviewIcon = this._context.showIcons$.value;
            return html `<div
      class=${styles.notePreviewSettingMenuContainer}
      @click=${(e) => e.stopPropagation()}
    >
      <div class=${styles.notePreviewSettingMenuItem}>
        <div class=${styles.settingLabel}>Settings</div>
      </div>
      <div class="${styles.notePreviewSettingMenuItem} ${styles.action}">
        <div class=${styles.actionLabel}>Show type icon</div>
        <div class=${styles.toggleButton}>
          <toggle-switch
            .on=${showPreviewIcon}
            .onChange=${() => {
                this._context.showIcons$.value = !showPreviewIcon;
            }}
          ></toggle-switch>
        </div>
      </div>
    </div>`;
        }
        #_context_accessor_storage = __runInitializers(this, __context_initializers, void 0);
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { OutlineNotePreviewSettingMenu };
