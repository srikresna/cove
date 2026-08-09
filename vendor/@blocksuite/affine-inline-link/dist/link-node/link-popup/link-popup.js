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
import { isValidUrl, normalizeUrl, stopPropagation, } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { DoneIcon } from '@blocksuite/icons/lit';
import { ShadowlessElement, TextSelection, } from '@blocksuite/std';
import { autoUpdate, computePosition, inline, offset, shift, } from '@floating-ui/dom';
import { html } from 'lit';
import { property, query } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { linkPopupStyle } from './styles';
let LinkPopup = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let _abortController_decorators;
    let _abortController_initializers = [];
    let _abortController_extraInitializers = [];
    let _confirmButton_decorators;
    let _confirmButton_initializers = [];
    let _confirmButton_extraInitializers = [];
    let _inlineEditor_decorators;
    let _inlineEditor_initializers = [];
    let _inlineEditor_extraInitializers = [];
    let _linkInput_decorators;
    let _linkInput_initializers = [];
    let _linkInput_extraInitializers = [];
    let _mockSelectionContainer_decorators;
    let _mockSelectionContainer_initializers = [];
    let _mockSelectionContainer_extraInitializers = [];
    let _overlayMask_decorators;
    let _overlayMask_initializers = [];
    let _overlayMask_extraInitializers = [];
    let _popoverContainer_decorators;
    let _popoverContainer_initializers = [];
    let _popoverContainer_extraInitializers = [];
    let _targetInlineRange_decorators;
    let _targetInlineRange_initializers = [];
    let _targetInlineRange_extraInitializers = [];
    let _textInput_decorators;
    let _textInput_initializers = [];
    let _textInput_extraInitializers = [];
    let _type_decorators;
    let _type_initializers = [];
    let _type_extraInitializers = [];
    let _std_decorators;
    let _std_initializers = [];
    let _std_extraInitializers = [];
    return class LinkPopup extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _abortController_decorators = [property({ attribute: false })];
            _confirmButton_decorators = [query('.affine-confirm-button')];
            _inlineEditor_decorators = [property({ attribute: false })];
            _linkInput_decorators = [query('#link-input')];
            _mockSelectionContainer_decorators = [query('.mock-selection-container')];
            _overlayMask_decorators = [query('.overlay-mask')];
            _popoverContainer_decorators = [query('.popover-container')];
            _targetInlineRange_decorators = [property({ attribute: false })];
            _textInput_decorators = [query('#text-input')];
            _type_decorators = [property()];
            _std_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _abortController_decorators, { kind: "accessor", name: "abortController", static: false, private: false, access: { has: obj => "abortController" in obj, get: obj => obj.abortController, set: (obj, value) => { obj.abortController = value; } }, metadata: _metadata }, _abortController_initializers, _abortController_extraInitializers);
            __esDecorate(this, null, _confirmButton_decorators, { kind: "accessor", name: "confirmButton", static: false, private: false, access: { has: obj => "confirmButton" in obj, get: obj => obj.confirmButton, set: (obj, value) => { obj.confirmButton = value; } }, metadata: _metadata }, _confirmButton_initializers, _confirmButton_extraInitializers);
            __esDecorate(this, null, _inlineEditor_decorators, { kind: "accessor", name: "inlineEditor", static: false, private: false, access: { has: obj => "inlineEditor" in obj, get: obj => obj.inlineEditor, set: (obj, value) => { obj.inlineEditor = value; } }, metadata: _metadata }, _inlineEditor_initializers, _inlineEditor_extraInitializers);
            __esDecorate(this, null, _linkInput_decorators, { kind: "accessor", name: "linkInput", static: false, private: false, access: { has: obj => "linkInput" in obj, get: obj => obj.linkInput, set: (obj, value) => { obj.linkInput = value; } }, metadata: _metadata }, _linkInput_initializers, _linkInput_extraInitializers);
            __esDecorate(this, null, _mockSelectionContainer_decorators, { kind: "accessor", name: "mockSelectionContainer", static: false, private: false, access: { has: obj => "mockSelectionContainer" in obj, get: obj => obj.mockSelectionContainer, set: (obj, value) => { obj.mockSelectionContainer = value; } }, metadata: _metadata }, _mockSelectionContainer_initializers, _mockSelectionContainer_extraInitializers);
            __esDecorate(this, null, _overlayMask_decorators, { kind: "accessor", name: "overlayMask", static: false, private: false, access: { has: obj => "overlayMask" in obj, get: obj => obj.overlayMask, set: (obj, value) => { obj.overlayMask = value; } }, metadata: _metadata }, _overlayMask_initializers, _overlayMask_extraInitializers);
            __esDecorate(this, null, _popoverContainer_decorators, { kind: "accessor", name: "popoverContainer", static: false, private: false, access: { has: obj => "popoverContainer" in obj, get: obj => obj.popoverContainer, set: (obj, value) => { obj.popoverContainer = value; } }, metadata: _metadata }, _popoverContainer_initializers, _popoverContainer_extraInitializers);
            __esDecorate(this, null, _targetInlineRange_decorators, { kind: "accessor", name: "targetInlineRange", static: false, private: false, access: { has: obj => "targetInlineRange" in obj, get: obj => obj.targetInlineRange, set: (obj, value) => { obj.targetInlineRange = value; } }, metadata: _metadata }, _targetInlineRange_initializers, _targetInlineRange_extraInitializers);
            __esDecorate(this, null, _textInput_decorators, { kind: "accessor", name: "textInput", static: false, private: false, access: { has: obj => "textInput" in obj, get: obj => obj.textInput, set: (obj, value) => { obj.textInput = value; } }, metadata: _metadata }, _textInput_initializers, _textInput_extraInitializers);
            __esDecorate(this, null, _type_decorators, { kind: "accessor", name: "type", static: false, private: false, access: { has: obj => "type" in obj, get: obj => obj.type, set: (obj, value) => { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
            __esDecorate(this, null, _std_decorators, { kind: "accessor", name: "std", static: false, private: false, access: { has: obj => "std" in obj, get: obj => obj.std, set: (obj, value) => { obj.std = value; } }, metadata: _metadata }, _std_initializers, _std_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = linkPopupStyle; }
        get currentLink() {
            return this.inlineEditor.getFormat(this.targetInlineRange).link;
        }
        get currentText() {
            return this.inlineEditor.yTextString.slice(this.targetInlineRange.index, this.targetInlineRange.index + this.targetInlineRange.length);
        }
        _confirmBtnTemplate() {
            return html `
      <editor-icon-button
        class="affine-confirm-button"
        .iconSize="${'24px'}"
        .disabled=${true}
        @click=${this._onConfirm}
      >
        ${DoneIcon()}
      </editor-icon-button>
    `;
        }
        _onConfirm() {
            if (!this.inlineEditor.isValidInlineRange(this.targetInlineRange))
                return;
            if (!this.linkInput)
                return;
            const linkInputValue = this.linkInput.value;
            if (!linkInputValue || !isValidUrl(linkInputValue))
                return;
            const link = normalizeUrl(linkInputValue);
            if (this.type === 'create') {
                this.inlineEditor.formatText(this.targetInlineRange, {
                    link: link,
                    reference: null,
                });
                this.inlineEditor.setInlineRange(this.targetInlineRange);
            }
            else if (this.type === 'edit') {
                const text = this.textInput?.value ?? link;
                this.inlineEditor.insertText(this.targetInlineRange, text, {
                    link: link,
                    reference: null,
                });
                this.inlineEditor.setInlineRange({
                    index: this.targetInlineRange.index,
                    length: text.length,
                });
            }
            const textSelection = this.std.host.selection.find(TextSelection);
            if (textSelection) {
                this.std.range.syncTextSelectionToRange(textSelection);
            }
            this.abortController.abort();
        }
        _onKeydown(e) {
            e.stopPropagation();
            if (!e.isComposing) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    this.abortController.abort();
                    this.std.host.selection.clear();
                    return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this._onConfirm();
                }
            }
        }
        _updateConfirmBtn() {
            if (!this.confirmButton) {
                return;
            }
            const link = this.linkInput?.value.trim();
            const disabled = !(link && isValidUrl(link));
            this.confirmButton.disabled = disabled;
            this.confirmButton.active = !disabled;
            this.confirmButton.requestUpdate();
        }
        updateMockSelection(rects) {
            if (!this.mockSelectionContainer) {
                return;
            }
            this.mockSelectionContainer
                .querySelectorAll('div')
                .forEach(e => e.remove());
            const fragment = document.createDocumentFragment();
            rects.forEach(domRect => {
                const mockSelection = document.createElement('div');
                mockSelection.classList.add('mock-selection');
                // Get the container's bounding rect to account for its position
                const containerRect = this.mockSelectionContainer.getBoundingClientRect();
                // Adjust the position by subtracting the container's offset
                mockSelection.style.left = `${domRect.left - containerRect.left}px`;
                mockSelection.style.top = `${domRect.top - containerRect.top}px`;
                mockSelection.style.width = `${domRect.width}px`;
                mockSelection.style.height = `${domRect.height}px`;
                fragment.append(mockSelection);
            });
            this.mockSelectionContainer.append(fragment);
        }
        connectedCallback() {
            super.connectedCallback();
            if (this.targetInlineRange.length === 0) {
                return;
            }
            // disable body scroll
            this._bodyOverflowStyle = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            this.disposables.add({
                dispose: () => {
                    document.body.style.overflow = this._bodyOverflowStyle;
                },
            });
        }
        firstUpdated() {
            this.disposables.addFromEvent(this, 'keydown', this._onKeydown);
            this.disposables.addFromEvent(this, 'copy', stopPropagation);
            this.disposables.addFromEvent(this, 'cut', stopPropagation);
            this.disposables.addFromEvent(this, 'paste', stopPropagation);
            this.disposables.addFromEvent(this.overlayMask, 'click', e => {
                e.stopPropagation();
                this.std.host.selection.setGroup('note', []);
                this.abortController.abort();
            });
            const range = this.inlineEditor.toDomRange(this.targetInlineRange);
            if (!range) {
                return;
            }
            const visualElement = {
                getBoundingClientRect: () => range.getBoundingClientRect(),
                getClientRects: () => range.getClientRects(),
            };
            const popover = this.popoverContainer;
            this.disposables.add(autoUpdate(visualElement, popover, () => {
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
                    this.updateMockSelection(Array.from(visualElement.getClientRects()));
                })
                    .catch(console.error);
            }));
        }
        render() {
            return html `
      <div class="overlay-root">
        <div class="overlay-mask"></div>
        <div class="popover-container">
          ${choose(this.type, [
                ['create', this._createTemplate],
                ['edit', this._editTemplate],
            ])}
        </div>
        <div class="mock-selection-container"></div>
      </div>
    `;
        }
        #abortController_accessor_storage;
        get abortController() { return this.#abortController_accessor_storage; }
        set abortController(value) { this.#abortController_accessor_storage = value; }
        #confirmButton_accessor_storage;
        get confirmButton() { return this.#confirmButton_accessor_storage; }
        set confirmButton(value) { this.#confirmButton_accessor_storage = value; }
        #inlineEditor_accessor_storage;
        get inlineEditor() { return this.#inlineEditor_accessor_storage; }
        set inlineEditor(value) { this.#inlineEditor_accessor_storage = value; }
        #linkInput_accessor_storage;
        get linkInput() { return this.#linkInput_accessor_storage; }
        set linkInput(value) { this.#linkInput_accessor_storage = value; }
        #mockSelectionContainer_accessor_storage;
        get mockSelectionContainer() { return this.#mockSelectionContainer_accessor_storage; }
        set mockSelectionContainer(value) { this.#mockSelectionContainer_accessor_storage = value; }
        #overlayMask_accessor_storage;
        get overlayMask() { return this.#overlayMask_accessor_storage; }
        set overlayMask(value) { this.#overlayMask_accessor_storage = value; }
        #popoverContainer_accessor_storage;
        get popoverContainer() { return this.#popoverContainer_accessor_storage; }
        set popoverContainer(value) { this.#popoverContainer_accessor_storage = value; }
        #targetInlineRange_accessor_storage;
        get targetInlineRange() { return this.#targetInlineRange_accessor_storage; }
        set targetInlineRange(value) { this.#targetInlineRange_accessor_storage = value; }
        #textInput_accessor_storage;
        get textInput() { return this.#textInput_accessor_storage; }
        set textInput(value) { this.#textInput_accessor_storage = value; }
        #type_accessor_storage;
        get type() { return this.#type_accessor_storage; }
        set type(value) { this.#type_accessor_storage = value; }
        #std_accessor_storage;
        get std() { return this.#std_accessor_storage; }
        set std(value) { this.#std_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._bodyOverflowStyle = '';
            this._createTemplate = () => {
                this.updateComplete
                    .then(() => {
                    this.linkInput?.focus();
                    this._updateConfirmBtn();
                })
                    .catch(console.error);
                return html `
      <div class="affine-link-popover create">
        <input
          id="link-input"
          class="affine-link-popover-input"
          type="text"
          spellcheck="false"
          placeholder="Paste or type a link"
          @paste=${this._updateConfirmBtn}
          @input=${this._updateConfirmBtn}
        />
        ${this._confirmBtnTemplate()}
      </div>
    `;
            };
            this._editTemplate = () => {
                this.updateComplete
                    .then(() => {
                    if (!this.textInput ||
                        !this.linkInput ||
                        !this.currentText ||
                        !this.currentLink)
                        return;
                    this.textInput.value = this.currentText;
                    this.linkInput.value = this.currentLink;
                    this.textInput.select();
                    this._updateConfirmBtn();
                })
                    .catch(console.error);
                return html `
      <div class="affine-link-edit-popover">
        <div class="affine-edit-area text">
          <input
            class="affine-edit-input"
            id="text-input"
            type="text"
            placeholder="Enter text"
            @input=${this._updateConfirmBtn}
          />
          <label class="affine-edit-label" for="text-input">Text</label>
        </div>
        <div class="affine-edit-area link">
          <input
            id="link-input"
            class="affine-edit-input"
            type="text"
            spellcheck="false"
            placeholder="Paste or type a link"
            @input=${this._updateConfirmBtn}
          />
          <label class="affine-edit-label" for="link-input">Link</label>
        </div>
        ${this._confirmBtnTemplate()}
      </div>
    `;
            };
            this.#abortController_accessor_storage = __runInitializers(this, _abortController_initializers, void 0);
            this.#confirmButton_accessor_storage = (__runInitializers(this, _abortController_extraInitializers), __runInitializers(this, _confirmButton_initializers, null));
            this.#inlineEditor_accessor_storage = (__runInitializers(this, _confirmButton_extraInitializers), __runInitializers(this, _inlineEditor_initializers, void 0));
            this.#linkInput_accessor_storage = (__runInitializers(this, _inlineEditor_extraInitializers), __runInitializers(this, _linkInput_initializers, null));
            this.#mockSelectionContainer_accessor_storage = (__runInitializers(this, _linkInput_extraInitializers), __runInitializers(this, _mockSelectionContainer_initializers, void 0));
            this.#overlayMask_accessor_storage = (__runInitializers(this, _mockSelectionContainer_extraInitializers), __runInitializers(this, _overlayMask_initializers, void 0));
            this.#popoverContainer_accessor_storage = (__runInitializers(this, _overlayMask_extraInitializers), __runInitializers(this, _popoverContainer_initializers, void 0));
            this.#targetInlineRange_accessor_storage = (__runInitializers(this, _popoverContainer_extraInitializers), __runInitializers(this, _targetInlineRange_initializers, void 0));
            this.#textInput_accessor_storage = (__runInitializers(this, _targetInlineRange_extraInitializers), __runInitializers(this, _textInput_initializers, null));
            this.#type_accessor_storage = (__runInitializers(this, _textInput_extraInitializers), __runInitializers(this, _type_initializers, 'create'));
            this.#std_accessor_storage = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _std_initializers, void 0));
            __runInitializers(this, _std_extraInitializers);
        }
    };
})();
export { LinkPopup };
