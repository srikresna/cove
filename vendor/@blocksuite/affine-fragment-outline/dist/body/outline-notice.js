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
import { NoteDisplayMode } from '@blocksuite/affine-model';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { CloseIcon, SortIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { consume } from '@lit/context';
import { effect, signal } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { tocContext } from '../config';
import { getNotesFromStore } from '../utils/query';
import * as styles from './outline-notice.css';
export const AFFINE_OUTLINE_NOTICE = 'affine-outline-notice';
let OutlineNotice = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let __context_decorators;
    let __context_initializers = [];
    let __context_extraInitializers = [];
    return class OutlineNotice extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __context_decorators = [consume({ context: tocContext })];
            __esDecorate(this, null, __context_decorators, { kind: "accessor", name: "_context", static: false, private: false, access: { has: obj => "_context" in obj, get: obj => obj._context, set: (obj, value) => { obj._context = value; } }, metadata: _metadata }, __context_initializers, __context_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        connectedCallback() {
            super.connectedCallback();
            this.disposables.add(effect(() => {
                const enableSorting = this._context.enableSorting$.value;
                if (enableSorting) {
                    if (this._visible$.peek()) {
                        this._visible$.value = false;
                    }
                    return;
                }
                const shouldShowNotice = getNotesFromStore(this._context.editor$.value.store, [
                    NoteDisplayMode.DocOnly,
                ]).length > 0;
                if (shouldShowNotice && !this._visible$.peek()) {
                    this._visible$.value = true;
                }
            }));
        }
        render() {
            if (!this._visible$.value) {
                return nothing;
            }
            return html `
      <div data-testid=${AFFINE_OUTLINE_NOTICE} class=${styles.outlineNotice}>
        <div class=${styles.outlineNoticeHeader}>
          <span class=${styles.outlineNoticeLabel}>SOME CONTENTS HIDDEN</span>
          <span
            data-testid="outline-notice-close-button"
            class=${styles.outlineNoticeCloseButton}
            @click=${() => {
                this._visible$.value = false;
            }}
            >${CloseIcon({ width: '16px', height: '16px' })}</span
          >
        </div>
        <div class=${styles.outlineNoticeBody}>
          <div class="${styles.notice}">
            Some contents are not visible on edgeless.
          </div>
          <div
            data-testid="outline-notice-sort-button"
            class="${styles.button}"
            @click=${() => {
                this._context.enableSorting$.value = true;
                this._visible$.value = false;
            }}
          >
            <span class=${styles.buttonSpan}>Click here or</span>
            <span class=${styles.buttonSpan}
              >${SortIcon({ width: '20px', height: '20px' })}</span
            >
            <span class=${styles.buttonSpan}>to organize content.</span>
          </div>
        </div>
      </div>
    `;
        }
        #_context_accessor_storage;
        get _context() { return this.#_context_accessor_storage; }
        set _context(value) { this.#_context_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._visible$ = signal(false);
            this.#_context_accessor_storage = __runInitializers(this, __context_initializers, void 0);
            __runInitializers(this, __context_extraInitializers);
        }
    };
})();
export { OutlineNotice };
