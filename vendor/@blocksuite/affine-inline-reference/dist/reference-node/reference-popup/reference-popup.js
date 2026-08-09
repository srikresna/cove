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
import { REFERENCE_NODE } from '@blocksuite/affine-shared/consts';
import { TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { fontXSStyle, panelBaseStyle } from '@blocksuite/affine-shared/styles';
import { stopPropagation } from '@blocksuite/affine-shared/utils';
import { SignalWatcher, WithDisposable } from '@blocksuite/global/lit';
import { DoneIcon, ResetIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { computePosition, inline, offset, shift } from '@floating-ui/dom';
import { signal } from '@preact/signals-core';
import { css, html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
let ReferencePopup = (() => {
    let _classSuper = SignalWatcher(WithDisposable(ShadowlessElement));
    let _abortController_decorators;
    let _abortController_initializers = [];
    let _abortController_extraInitializers = [];
    let _docTitle_decorators;
    let _docTitle_initializers = [];
    let _docTitle_extraInitializers = [];
    let _inlineEditor_decorators;
    let _inlineEditor_initializers = [];
    let _inlineEditor_extraInitializers = [];
    let _inlineRange_decorators;
    let _inlineRange_initializers = [];
    let _inlineRange_extraInitializers = [];
    let _inputElement_decorators;
    let _inputElement_initializers = [];
    let _inputElement_extraInitializers = [];
    let _overlayMask_decorators;
    let _overlayMask_initializers = [];
    let _overlayMask_extraInitializers = [];
    let _popoverContainer_decorators;
    let _popoverContainer_initializers = [];
    let _popoverContainer_extraInitializers = [];
    let _referenceInfo_decorators;
    let _referenceInfo_initializers = [];
    let _referenceInfo_extraInitializers = [];
    let _saveButton_decorators;
    let _saveButton_initializers = [];
    let _saveButton_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    return class ReferencePopup extends _classSuper {
        constructor() {
            super(...arguments);
            this._onSave = () => {
                const title = this.title$.value.trim();
                if (!title) {
                    this.remove();
                    return;
                }
                this._setTitle(title);
                track(this.std, 'SavedAlias', { control: 'save' });
                this.remove();
            };
            this._updateTitle = (e) => {
                const target = e.target;
                const value = target.value;
                this.title$.value = value;
            };
            this.#abortController_accessor_storage = __runInitializers(this, _abortController_initializers, void 0);
            this.#docTitle_accessor_storage = (__runInitializers(this, _abortController_extraInitializers), __runInitializers(this, _docTitle_initializers, void 0));
            this.#inlineEditor_accessor_storage = (__runInitializers(this, _docTitle_extraInitializers), __runInitializers(this, _inlineEditor_initializers, void 0));
            this.#inlineRange_accessor_storage = (__runInitializers(this, _inlineEditor_extraInitializers), __runInitializers(this, _inlineRange_initializers, void 0));
            this.#inputElement_accessor_storage = (__runInitializers(this, _inlineRange_extraInitializers), __runInitializers(this, _inputElement_initializers, void 0));
            this.#overlayMask_accessor_storage = (__runInitializers(this, _inputElement_extraInitializers), __runInitializers(this, _overlayMask_initializers, void 0));
            this.#popoverContainer_accessor_storage = (__runInitializers(this, _overlayMask_extraInitializers), __runInitializers(this, _popoverContainer_initializers, void 0));
            this.#referenceInfo_accessor_storage = (__runInitializers(this, _popoverContainer_extraInitializers), __runInitializers(this, _referenceInfo_initializers, void 0));
            this.#saveButton_accessor_storage = (__runInitializers(this, _referenceInfo_extraInitializers), __runInitializers(this, _saveButton_initializers, void 0));
            this.#std_accessor_storage = (__runInitializers(this, _saveButton_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            this.#title$_accessor_storage = (__runInitializers(this, _std_extraInitializers), signal(''));
        }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _abortController_decorators = [property({ attribute: false })];
            _docTitle_decorators = [property({ attribute: false })];
            _inlineEditor_decorators = [property({ attribute: false })];
            _inlineRange_decorators = [property({ attribute: false })];
            _inputElement_decorators = [query('input#alias-title')];
            _overlayMask_decorators = [query('.overlay-mask')];
            _popoverContainer_decorators = [query('.popover-container')];
            _referenceInfo_decorators = [property({ type: Object })];
            _saveButton_decorators = [query('editor-icon-button.save')];
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _abortController_decorators, { kind: "accessor", name: "abortController", static: false, private: false, access: { has: obj => "abortController" in obj, get: obj => obj.abortController, set: (obj, value) => { obj.abortController = value; } }, metadata: _metadata }, _abortController_initializers, _abortController_extraInitializers);
            __esDecorate(this, null, _docTitle_decorators, { kind: "accessor", name: "docTitle", static: false, private: false, access: { has: obj => "docTitle" in obj, get: obj => obj.docTitle, set: (obj, value) => { obj.docTitle = value; } }, metadata: _metadata }, _docTitle_initializers, _docTitle_extraInitializers);
            __esDecorate(this, null, _inlineEditor_decorators, { kind: "accessor", name: "inlineEditor", static: false, private: false, access: { has: obj => "inlineEditor" in obj, get: obj => obj.inlineEditor, set: (obj, value) => { obj.inlineEditor = value; } }, metadata: _metadata }, _inlineEditor_initializers, _inlineEditor_extraInitializers);
            __esDecorate(this, null, _inlineRange_decorators, { kind: "accessor", name: "inlineRange", static: false, private: false, access: { has: obj => "inlineRange" in obj, get: obj => obj.inlineRange, set: (obj, value) => { obj.inlineRange = value; } }, metadata: _metadata }, _inlineRange_initializers, _inlineRange_extraInitializers);
            __esDecorate(this, null, _inputElement_decorators, { kind: "accessor", name: "inputElement", static: false, private: false, access: { has: obj => "inputElement" in obj, get: obj => obj.inputElement, set: (obj, value) => { obj.inputElement = value; } }, metadata: _metadata }, _inputElement_initializers, _inputElement_extraInitializers);
            __esDecorate(this, null, _overlayMask_decorators, { kind: "accessor", name: "overlayMask", static: false, private: false, access: { has: obj => "overlayMask" in obj, get: obj => obj.overlayMask, set: (obj, value) => { obj.overlayMask = value; } }, metadata: _metadata }, _overlayMask_initializers, _overlayMask_extraInitializers);
            __esDecorate(this, null, _popoverContainer_decorators, { kind: "accessor", name: "popoverContainer", static: false, private: false, access: { has: obj => "popoverContainer" in obj, get: obj => obj.popoverContainer, set: (obj, value) => { obj.popoverContainer = value; } }, metadata: _metadata }, _popoverContainer_initializers, _popoverContainer_extraInitializers);
            __esDecorate(this, null, _referenceInfo_decorators, { kind: "accessor", name: "referenceInfo", static: false, private: false, access: { has: obj => "referenceInfo" in obj, get: obj => obj.referenceInfo, set: (obj, value) => { obj.referenceInfo = value; } }, metadata: _metadata }, _referenceInfo_initializers, _referenceInfo_extraInitializers);
            __esDecorate(this, null, _saveButton_decorators, { kind: "accessor", name: "saveButton", static: false, private: false, access: { has: obj => "saveButton" in obj, get: obj => obj.saveButton, set: (obj, value) => { obj.saveButton = value; } }, metadata: _metadata }, _saveButton_initializers, _saveButton_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    :host {
      box-sizing: border-box;
    }

    .overlay-mask {
      position: fixed;
      z-index: var(--affine-z-index-popover);
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
    }

    ${panelBaseStyle('.popover-container')}
    .popover-container {
      position: absolute;
      display: flex;
      gap: 8px;
      box-sizing: content-box;
      justify-content: space-between;
      align-items: center;
      animation: affine-popover-fade-in 0.2s ease;
      z-index: var(--affine-z-index-popover);
    }

    @keyframes affine-popover-fade-in {
      from {
        opacity: 0;
        transform: translateY(-3px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    input {
      display: flex;
      flex: 1;
      padding: 0;
      border: none;
      background: transparent;
      color: var(--affine-text-primary-color);
    }
    ${fontXSStyle('input')}
    input::placeholder {
      color: var(--affine-placeholder-color);
    }
    input:focus {
      outline: none;
    }

    ${fontXSStyle('editor-icon-button.save .label')}
    editor-icon-button.save .label {
      color: inherit;
      text-transform: none;
    }
  `; }
        _onKeydown(e) {
            e.stopPropagation();
            if (!e.isComposing) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.remove();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._onSave();
                }
            }
        }
        _onReset() {
            this.title$.value = this.docTitle;
            this._setTitle();
            track(this.std, 'ResetedAlias', { control: 'reset' });
            this.remove();
        }
        _setTitle(title) {
            const reference = {
                type: 'LinkedPage',
                ...this.referenceInfo,
            };
            if (title) {
                reference.title = title;
            }
            else {
                delete reference.title;
                delete reference.description;
            }
            this.inlineEditor.insertText(this.inlineRange, REFERENCE_NODE, {
                reference,
            });
            this.inlineEditor.setInlineRange({
                index: this.inlineRange.index + REFERENCE_NODE.length,
                length: 0,
            });
        }
        connectedCallback() {
            super.connectedCallback();
            this.title$.value = this.referenceInfo.title ?? this.docTitle;
        }
        firstUpdated() {
            this.disposables.addFromEvent(this, 'keydown', this._onKeydown);
            this.disposables.addFromEvent(this, 'copy', stopPropagation);
            this.disposables.addFromEvent(this, 'cut', stopPropagation);
            this.disposables.addFromEvent(this, 'paste', stopPropagation);
            this.disposables.addFromEvent(this.overlayMask, 'click', e => {
                e.stopPropagation();
                this.remove();
            });
            this.inputElement.focus();
            this.inputElement.select();
        }
        render() {
            return html `
      <div class="overlay-root">
        <div class="overlay-mask"></div>
        <div class="popover-container">
          <input
            id="alias-title"
            type="text"
            placeholder="Add a custom title"
            .value=${live(this.title$.value)}
            @input=${this._updateTitle}
          />
          <editor-icon-button
            aria-label="Reset"
            class="reset"
            .iconContainerPadding=${4}
            .tooltip=${'Reset'}
            @click=${this._onReset}
          >
            ${ResetIcon({ width: '16px', height: '16px' })}
          </editor-icon-button>
          <editor-toolbar-separator></editor-toolbar-separator>
          <editor-icon-button
            aria-label="Save"
            class="save"
            .active=${true}
            @click=${this._onSave}
          >
            ${DoneIcon({ width: '16px', height: '16px' })}
            <span class="label">Save</span>
          </editor-icon-button>
        </div>
      </div>
    `;
        }
        updated() {
            const range = this.inlineEditor.toDomRange(this.inlineRange);
            if (!range)
                return;
            const visualElement = {
                getBoundingClientRect: () => range.getBoundingClientRect(),
                getClientRects: () => range.getClientRects(),
            };
            const popover = this.popoverContainer;
            computePosition(visualElement, popover, {
                middleware: [
                    offset(10),
                    inline(),
                    shift({
                        padding: 6,
                    }),
                ],
            })
                .then(({ x, y }) => {
                popover.style.left = `${x}px`;
                popover.style.top = `${y}px`;
            })
                .catch(console.error);
        }
        #abortController_accessor_storage;
        get abortController() { return this.#abortController_accessor_storage; }
        set abortController(value) { this.#abortController_accessor_storage = value; }
        #docTitle_accessor_storage;
        get docTitle() { return this.#docTitle_accessor_storage; }
        set docTitle(value) { this.#docTitle_accessor_storage = value; }
        #inlineEditor_accessor_storage;
        get inlineEditor() { return this.#inlineEditor_accessor_storage; }
        set inlineEditor(value) { this.#inlineEditor_accessor_storage = value; }
        #inlineRange_accessor_storage;
        get inlineRange() { return this.#inlineRange_accessor_storage; }
        set inlineRange(value) { this.#inlineRange_accessor_storage = value; }
        #inputElement_accessor_storage;
        get inputElement() { return this.#inputElement_accessor_storage; }
        set inputElement(value) { this.#inputElement_accessor_storage = value; }
        #overlayMask_accessor_storage;
        get overlayMask() { return this.#overlayMask_accessor_storage; }
        set overlayMask(value) { this.#overlayMask_accessor_storage = value; }
        #popoverContainer_accessor_storage;
        get popoverContainer() { return this.#popoverContainer_accessor_storage; }
        set popoverContainer(value) { this.#popoverContainer_accessor_storage = value; }
        #referenceInfo_accessor_storage;
        get referenceInfo() { return this.#referenceInfo_accessor_storage; }
        set referenceInfo(value) { this.#referenceInfo_accessor_storage = value; }
        #saveButton_accessor_storage;
        get saveButton() { return this.#saveButton_accessor_storage; }
        set saveButton(value) { this.#saveButton_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        #title$_accessor_storage;
        get title$() { return this.#title$_accessor_storage; }
        set title$(value) { this.#title$_accessor_storage = value; }
    };
})();
export { ReferencePopup };
function track(std, event, props) {
    std.getOptional(TelemetryProvider)?.track(event, {
        segment: 'doc',
        page: 'doc editor',
        module: 'toolbar',
        category: 'linked doc',
        type: 'inline view',
        ...props,
    });
}
