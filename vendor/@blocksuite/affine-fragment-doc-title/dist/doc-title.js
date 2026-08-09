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
import { CodeBlockModel, ListBlockModel, NoteBlockModel, NoteDisplayMode, ParagraphBlockModel, } from '@blocksuite/affine-model';
import { focusTextModel } from '@blocksuite/affine-rich-text';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { WithDisposable } from '@blocksuite/global/lit';
import { ShadowlessElement } from '@blocksuite/std';
import { effect } from '@preact/signals-core';
import { css, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
const DOC_BLOCK_CHILD_PADDING = 24;
let DocTitle = (() => {
    let _classSuper = WithDisposable(ShadowlessElement);
    let __isComposing_decorators;
    let __isComposing_initializers = [];
    let __isComposing_extraInitializers = [];
    let __isReadonly_decorators;
    let __isReadonly_initializers = [];
    let __isReadonly_extraInitializers = [];
    let __richTextElement_decorators;
    let __richTextElement_initializers = [];
    let __richTextElement_extraInitializers = [];
    let _doc_decorators;
    let _doc_initializers = [];
    let _doc_extraInitializers = [];
    let _wrapText_decorators;
    let _wrapText_initializers = [];
    let _wrapText_extraInitializers = [];
    return class DocTitle extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __isComposing_decorators = [state()];
            __isReadonly_decorators = [state()];
            __richTextElement_decorators = [query('rich-text')];
            _doc_decorators = [property({ attribute: false })];
            _wrapText_decorators = [property({ attribute: false })];
            __esDecorate(this, null, __isComposing_decorators, { kind: "accessor", name: "_isComposing", static: false, private: false, access: { has: obj => "_isComposing" in obj, get: obj => obj._isComposing, set: (obj, value) => { obj._isComposing = value; } }, metadata: _metadata }, __isComposing_initializers, __isComposing_extraInitializers);
            __esDecorate(this, null, __isReadonly_decorators, { kind: "accessor", name: "_isReadonly", static: false, private: false, access: { has: obj => "_isReadonly" in obj, get: obj => obj._isReadonly, set: (obj, value) => { obj._isReadonly = value; } }, metadata: _metadata }, __isReadonly_initializers, __isReadonly_extraInitializers);
            __esDecorate(this, null, __richTextElement_decorators, { kind: "accessor", name: "_richTextElement", static: false, private: false, access: { has: obj => "_richTextElement" in obj, get: obj => obj._richTextElement, set: (obj, value) => { obj._richTextElement = value; } }, metadata: _metadata }, __richTextElement_initializers, __richTextElement_extraInitializers);
            __esDecorate(this, null, _doc_decorators, { kind: "accessor", name: "doc", static: false, private: false, access: { has: obj => "doc" in obj, get: obj => obj.doc, set: (obj, value) => { obj.doc = value; } }, metadata: _metadata }, _doc_initializers, _doc_extraInitializers);
            __esDecorate(this, null, _wrapText_decorators, { kind: "accessor", name: "wrapText", static: false, private: false, access: { has: obj => "wrapText" in obj, get: obj => obj.wrapText, set: (obj, value) => { obj.wrapText = value; } }, metadata: _metadata }, _wrapText_initializers, _wrapText_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static { this.styles = css `
    .doc-title-container {
      font-size: 40px;
      line-height: 50px;
      font-weight: 700;
    }
    .doc-icon-container,
    .doc-title-container {
      box-sizing: border-box;
      font-family: var(--affine-font-family);
      color: var(--affine-text-primary-color);
      outline: none;
      resize: none;
      border: 0;
      width: 100%;
      max-width: var(--affine-editor-width);
      margin-left: auto;
      margin-right: auto;
      padding: 38px 0;

      padding-left: var(
        --affine-editor-side-padding,
        ${DOC_BLOCK_CHILD_PADDING}px
      );
      padding-right: var(
        --affine-editor-side-padding,
        ${DOC_BLOCK_CHILD_PADDING}px
      );
    }
    .doc-icon-container + * .doc-title-container {
      /* when doc icon exists, remove the top padding */
      padding-top: 0;
    }

    /* Extra small devices (phones, 640px and down) */
    @container viewport (width <= 640px) {
      .doc-icon-container,
      .doc-title-container {
        padding-left: ${DOC_BLOCK_CHILD_PADDING}px;
        padding-right: ${DOC_BLOCK_CHILD_PADDING}px;
      }
    }

    .doc-title-container-empty::before {
      content: 'Title';
      color: var(--affine-placeholder-color);
      position: absolute;
      opacity: 0.5;
      pointer-events: none;
    }

    .doc-title-container:disabled {
      background-color: transparent;
    }
  `; }
        _getOrCreateFirstPageVisibleNote() {
            const note = this._rootModel?.children.find((child) => matchModels(child, [NoteBlockModel]) &&
                child.props.displayMode !== NoteDisplayMode.EdgelessOnly);
            if (note)
                return note;
            const noteId = this.doc.addBlock('affine:note', {}, this._rootModel, 0);
            return this.doc.getBlock(noteId)?.model;
        }
        get _std() {
            return this._viewport?.querySelector('editor-host')?.std;
        }
        get _rootModel() {
            return this.doc.root;
        }
        get _viewport() {
            return (this.closest('.affine-page-viewport') ??
                this.closest('.affine-edgeless-viewport'));
        }
        get inlineEditor() {
            return this._richTextElement.inlineEditor;
        }
        get inlineEditorContainer() {
            return this._richTextElement.inlineEditorContainer;
        }
        connectedCallback() {
            super.connectedCallback();
            this._isReadonly = this.doc.readonly;
            this._disposables.add(effect(() => {
                if (this._isReadonly !== this.doc.readonly) {
                    this._isReadonly = this.doc.readonly;
                    this.requestUpdate();
                }
            }));
            this._disposables.addFromEvent(this, 'keydown', this._onTitleKeyDown);
            // Workaround for inline editor skips composition event
            this._disposables.addFromEvent(this, 'compositionstart', () => (this._isComposing = true));
            this._disposables.addFromEvent(this, 'compositionend', () => (this._isComposing = false));
            const updateMetaTitle = () => {
                this._updateTitleInMeta();
                this.requestUpdate();
            };
            if (this._rootModel) {
                const rootModel = this._rootModel;
                rootModel.props.title.yText.observe(updateMetaTitle);
                this._disposables.add(() => {
                    rootModel.props.title.yText.unobserve(updateMetaTitle);
                });
            }
        }
        render() {
            const isEmpty = !this._rootModel?.props.title.length && !this._isComposing;
            return html `
      <div
        class="doc-title-container ${isEmpty
                ? 'doc-title-container-empty'
                : ''}"
        data-block-is-title="true"
      >
        <rich-text
          .yText=${this._rootModel?.props.title.yText}
          .undoManager=${this.doc.history.undoManager}
          .verticalScrollContainerGetter=${() => this._viewport}
          .readonly=${this.doc.readonly}
          .enableFormat=${false}
          .wrapText=${this.wrapText}
        ></rich-text>
      </div>
    `;
        }
        #_isComposing_accessor_storage;
        get _isComposing() { return this.#_isComposing_accessor_storage; }
        set _isComposing(value) { this.#_isComposing_accessor_storage = value; }
        #_isReadonly_accessor_storage;
        get _isReadonly() { return this.#_isReadonly_accessor_storage; }
        set _isReadonly(value) { this.#_isReadonly_accessor_storage = value; }
        #_richTextElement_accessor_storage;
        get _richTextElement() { return this.#_richTextElement_accessor_storage; }
        set _richTextElement(value) { this.#_richTextElement_accessor_storage = value; }
        #doc_accessor_storage;
        get doc() { return this.#doc_accessor_storage; }
        set doc(value) { this.#doc_accessor_storage = value; }
        #wrapText_accessor_storage;
        get wrapText() { return this.#wrapText_accessor_storage; }
        set wrapText(value) { this.#wrapText_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this._onTitleKeyDown = (event) => {
                if (event.isComposing || this.doc.readonly)
                    return;
                if (!this._std)
                    return;
                if (event.key === 'Enter') {
                    this._std.event.active = true;
                    event.preventDefault();
                    event.stopPropagation();
                    const inlineRange = this.inlineEditor?.getInlineRange();
                    if (inlineRange) {
                        const rightText = this._rootModel?.props.title.split(inlineRange.index);
                        const newFirstParagraphId = this.doc.addBlock('affine:paragraph', { text: rightText }, this._getOrCreateFirstPageVisibleNote(), 0);
                        if (this._std)
                            focusTextModel(this._std, newFirstParagraphId);
                    }
                }
                else if (event.key === 'ArrowDown') {
                    this._std.event.active = true;
                    event.preventDefault();
                    event.stopPropagation();
                    const note = this._getOrCreateFirstPageVisibleNote();
                    const firstText = note?.children.find(block => matchModels(block, [
                        ParagraphBlockModel,
                        ListBlockModel,
                        CodeBlockModel,
                    ]));
                    if (firstText) {
                        if (this._std)
                            focusTextModel(this._std, firstText.id);
                    }
                    else {
                        const newFirstParagraphId = this.doc.addBlock('affine:paragraph', {}, note, 0);
                        if (this._std)
                            focusTextModel(this._std, newFirstParagraphId);
                    }
                }
                else if (event.key === 'Tab') {
                    event.preventDefault();
                    event.stopPropagation();
                }
            };
            this._updateTitleInMeta = () => {
                if (!this._rootModel)
                    return;
                this.doc.workspace.meta.setDocMeta(this.doc.id, {
                    title: this._rootModel.props.title.toString(),
                });
            };
            this.#_isComposing_accessor_storage = __runInitializers(this, __isComposing_initializers, false);
            this.#_isReadonly_accessor_storage = (__runInitializers(this, __isComposing_extraInitializers), __runInitializers(this, __isReadonly_initializers, false));
            this.#_richTextElement_accessor_storage = (__runInitializers(this, __isReadonly_extraInitializers), __runInitializers(this, __richTextElement_initializers, void 0));
            this.#doc_accessor_storage = (__runInitializers(this, __richTextElement_extraInitializers), __runInitializers(this, _doc_initializers, void 0));
            this.#wrapText_accessor_storage = (__runInitializers(this, _doc_extraInitializers), __runInitializers(this, _wrapText_initializers, true));
            __runInitializers(this, _wrapText_extraInitializers);
        }
    };
})();
export { DocTitle };
