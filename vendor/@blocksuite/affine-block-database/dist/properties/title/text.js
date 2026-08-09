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
import { DefaultInlineManagerExtension } from '@blocksuite/affine-inline-preset';
import { ParseDocUrlProvider, TelemetryProvider, } from '@blocksuite/affine-shared/services';
import { getViewportElement } from '@blocksuite/affine-shared/utils';
import { BaseCellRenderer } from '@blocksuite/data-view';
import { IS_MAC } from '@blocksuite/global/env';
import { LinkedPageIcon } from '@blocksuite/icons/lit';
import { computed, signal } from '@preact/signals-core';
import { property } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { html } from 'lit/static-html.js';
import { EditorHostKey } from '../../context/host-context.js';
import { getSingleDocIdFromText } from '../../utils/title-doc.js';
import { analyzeTextForUrlPaste, insertUrlTextSegments } from '../paste-url.js';
import { headerAreaIconStyle, titleCellStyle, titleRichTextStyle, } from './cell-renderer-css.js';
let HeaderAreaTextCell = (() => {
    let _classSuper = BaseCellRenderer;
    let _showIcon_decorators;
    let _showIcon_initializers = [];
    let _showIcon_extraInitializers = [];
    return class HeaderAreaTextCell extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _showIcon_decorators = [property({ attribute: false })];
            __esDecorate(this, null, _showIcon_decorators, { kind: "accessor", name: "showIcon", static: false, private: false, access: { has: obj => "showIcon" in obj, get: obj => obj.showIcon, set: (obj, value) => { obj.showIcon = value; } }, metadata: _metadata }, _showIcon_initializers, _showIcon_extraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        get host() {
            return this.view.serviceGet(EditorHostKey);
        }
        get inlineEditor() {
            return this.richText.value?.inlineEditor;
        }
        get inlineManager() {
            return this.host?.std.get(DefaultInlineManagerExtension.identifier);
        }
        get topContenteditableElement() {
            const databaseBlock = this.closest('affine-database');
            return databaseBlock?.topContenteditableElement;
        }
        get std() {
            return this.view.serviceGet(EditorHostKey)?.std;
        }
        connectedCallback() {
            super.connectedCallback();
            this.classList.add(titleCellStyle);
            const yText = this.value?.yText;
            if (yText) {
                const cb = () => {
                    const id = getSingleDocIdFromText(this.value);
                    this.docId$.value = id;
                };
                cb();
                if (this.activity) {
                    yText.observe(cb);
                    this.disposables.add(() => {
                        yText.unobserve(cb);
                    });
                }
            }
            const selectAll = (e) => {
                if (e.key === 'a' && (IS_MAC ? e.metaKey : e.ctrlKey)) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.inlineEditor?.selectAll();
                }
            };
            this.disposables.addFromEvent(this, 'keydown', selectAll);
        }
        firstUpdated(props) {
            super.firstUpdated(props);
            this.richText.value?.updateComplete
                .then(() => {
                if (this.richText.value) {
                    this.disposables.addFromEvent(this.richText.value, 'copy', this._onCopy);
                    this.disposables.addFromEvent(this.richText.value, 'cut', this._onCut);
                    this.disposables.addFromEvent(this.richText.value, 'paste', this._onPaste, true);
                    const inlineEditor = this.inlineEditor;
                    if (inlineEditor) {
                        this.disposables.add(inlineEditor.slots.keydown.subscribe(this._handleKeyDown));
                    }
                }
            })
                .catch(console.error);
        }
        afterEnterEditingMode() {
            this.inlineEditor?.focusEnd();
        }
        render() {
            return html `${this.renderIcon()}${this.renderBlockText()}`;
        }
        renderBlockText() {
            return html ` <rich-text
      ${ref(this.richText)}
      data-disable-ask-ai
      data-not-block-text
      .yText="${this.value}"
      .inlineEventSource="${this.topContenteditableElement}"
      .attributesSchema="${this.inlineManager?.getSchema()}"
      .attributeRenderer="${this.inlineManager?.getRenderer()}"
      .embedChecker="${this.inlineManager?.embedChecker}"
      .markdownMatches="${this.inlineManager?.markdownMatches}"
      .readonly="${!this.isEditing$.value}"
      .enableClipboard="${false}"
      .verticalScrollContainerGetter="${() => this.topContenteditableElement?.host
                ? getViewportElement(this.topContenteditableElement.host)
                : null}"
      data-parent-flavour="affine:database"
      class="${titleRichTextStyle}"
    ></rich-text>`;
        }
        renderIcon() {
            if (!this.showIcon) {
                return;
            }
            if (this.docId$.value) {
                return html ` <div class="${headerAreaIconStyle}">
        ${LinkedPageIcon({})}
      </div>`;
            }
            const icon = this.icon$.value;
            if (!icon)
                return;
            return html ` <div class="${headerAreaIconStyle}">${icon}</div>`;
        }
        #showIcon_accessor_storage;
        get showIcon() { return this.#showIcon_accessor_storage; }
        set showIcon(value) { this.#showIcon_accessor_storage = value; }
        constructor() {
            super(...arguments);
            this.activity = true;
            this.docId$ = signal();
            this._onCopy = (e) => {
                const inlineEditor = this.inlineEditor;
                if (!inlineEditor)
                    return;
                const inlineRange = inlineEditor.getInlineRange();
                if (!inlineRange)
                    return;
                const text = inlineEditor.yTextString.slice(inlineRange.index, inlineRange.index + inlineRange.length);
                e.clipboardData?.setData('text/plain', text);
                e.preventDefault();
                e.stopPropagation();
            };
            this._onCut = (e) => {
                const inlineEditor = this.inlineEditor;
                if (!inlineEditor)
                    return;
                const inlineRange = inlineEditor.getInlineRange();
                if (!inlineRange)
                    return;
                const text = inlineEditor.yTextString.slice(inlineRange.index, inlineRange.index + inlineRange.length);
                inlineEditor.deleteText(inlineRange);
                inlineEditor.setInlineRange({
                    index: inlineRange.index,
                    length: 0,
                });
                e.clipboardData?.setData('text/plain', text);
                e.preventDefault();
                e.stopPropagation();
            };
            this._onPaste = (e) => {
                const inlineEditor = this.inlineEditor;
                const inlineRange = inlineEditor?.getInlineRange();
                if (!inlineEditor || !inlineRange)
                    return;
                e.preventDefault();
                e.stopPropagation();
                if (e.clipboardData) {
                    try {
                        const getDeltas = (snapshot) => {
                            // @ts-expect-error FIXME: ts error
                            const text = snapshot.props?.text?.delta;
                            return text
                                ? [...text, ...(snapshot.children?.flatMap(getDeltas) ?? [])]
                                : snapshot.children?.flatMap(getDeltas);
                        };
                        const snapshot = this.std?.clipboard?.readFromClipboard(e.clipboardData)['BLOCKSUITE/SNAPSHOT'];
                        const deltas = JSON.parse(snapshot).snapshot.content.flatMap(getDeltas);
                        deltas.forEach(delta => this.insertDelta(delta));
                        return;
                    }
                    catch {
                        //
                    }
                }
                const text = e.clipboardData
                    ?.getData('text/plain')
                    ?.replace(/\r?\n|\r/g, '\n');
                if (!text)
                    return;
                const { segments, singleUrl } = analyzeTextForUrlPaste(text);
                if (singleUrl) {
                    const std = this.std;
                    const result = std
                        ?.getOptional(ParseDocUrlProvider)
                        ?.parseDocUrl(singleUrl);
                    if (result) {
                        const text = ' ';
                        inlineEditor.insertText(inlineRange, text, {
                            reference: {
                                type: 'LinkedPage',
                                pageId: result.docId,
                                params: {
                                    blockIds: result.blockIds,
                                    elementIds: result.elementIds,
                                    mode: result.mode,
                                },
                            },
                        });
                        inlineEditor.setInlineRange({
                            index: inlineRange.index + text.length,
                            length: 0,
                        });
                        // Track when a linked doc is created in database title column
                        std?.getOptional(TelemetryProvider)?.track('LinkedDocCreated', {
                            module: 'database title cell',
                            type: 'paste',
                            segment: 'database',
                            parentFlavour: 'affine:database',
                        });
                        return;
                    }
                }
                insertUrlTextSegments(inlineEditor, inlineRange, segments);
            };
            this.insertDelta = (delta) => {
                const inlineEditor = this.inlineEditor;
                const range = inlineEditor?.getInlineRange();
                if (!range || !delta.insert) {
                    return;
                }
                inlineEditor?.insertText(range, delta.insert, delta.attributes);
                inlineEditor?.setInlineRange({
                    index: range.index + delta.insert.length,
                    length: 0,
                });
            };
            this._handleKeyDown = (event) => {
                if (event.key !== 'Escape') {
                    if (event.key === 'Tab') {
                        event.preventDefault();
                        return;
                    }
                    event.stopPropagation();
                }
            };
            this.icon$ = computed(() => {
                const iconColumn = this.view.mainProperties$.value.iconColumn;
                if (!iconColumn)
                    return;
                const icon = this.view.cellGetOrCreate(this.cell.rowId, iconColumn).value$
                    .value;
                if (!icon)
                    return;
                return icon;
            });
            this.richText = createRef();
            this.#showIcon_accessor_storage = __runInitializers(this, _showIcon_initializers, false);
            __runInitializers(this, _showIcon_extraInitializers);
        }
    };
})();
export { HeaderAreaTextCell };
