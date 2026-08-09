import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import { signal } from '@preact/signals-core';
import { nothing, render } from 'lit';
import { Subject } from 'rxjs';
import { INLINE_ROOT_ATTR } from './consts.js';
import { InlineHookService } from './services/hook.js';
import { AttributeService, DeltaService, EventService, RangeService, } from './services/index.js';
import { RenderService } from './services/render.js';
import { InlineTextService } from './services/text.js';
import { nativePointToTextPoint, textPointToDomPoint } from './utils/index.js';
import { getTextNodesFromElement } from './utils/text.js';
export class InlineEditor {
    static { this.getTextNodesFromElement = getTextNodesFromElement; }
    static { this.nativePointToTextPoint = nativePointToTextPoint; }
    static { this.textPointToDomPoint = textPointToDomPoint; }
    get marks() {
        return this.attributeService.marks;
    }
    get embedDeltas() {
        return this.deltaService.embedDeltas;
    }
    get lastStartRelativePosition() {
        return this.rangeService.lastStartRelativePosition;
    }
    get lastEndRelativePosition() {
        return this.rangeService.lastEndRelativePosition;
    }
    get isComposing() {
        return this.eventService.isComposing;
    }
    get rendering() {
        return this.renderService.rendering;
    }
    get hooks() {
        return this.hooksService.hooks;
    }
    get eventSource() {
        return this._eventSource;
    }
    get isReadonly() {
        return this._isReadonly;
    }
    get mounted() {
        return this._mounted;
    }
    get rootElement() {
        return this._rootElement;
    }
    get inlineRangeProviderOverride() {
        return this._inlineRangeProviderOverride;
    }
    get inlineRange$() {
        return this.inlineRangeProvider.inlineRange$;
    }
    get yTextDeltas() {
        return this.yText.toDelta();
    }
    get yTextLength() {
        return this.yText.length;
    }
    get yTextString() {
        return this.yText.toString();
    }
    constructor(yText, ops = {}) {
        this.disposables = new DisposableGroup();
        this.attributeService = new AttributeService(this);
        this.getFormat = this.attributeService.getFormat;
        this.normalizeAttributes = this.attributeService.normalizeAttributes;
        this.resetMarks = this.attributeService.resetMarks;
        this.setAttributeRenderer = this.attributeService.setAttributeRenderer;
        this.setAttributeSchema = this.attributeService.setAttributeSchema;
        this.setMarks = this.attributeService.setMarks;
        this.textService = new InlineTextService(this);
        this.deleteText = this.textService.deleteText;
        this.formatText = this.textService.formatText;
        this.insertLineBreak = this.textService.insertLineBreak;
        this.insertText = this.textService.insertText;
        this.resetText = this.textService.resetText;
        this.setText = this.textService.setText;
        this.deltaService = new DeltaService(this);
        this.getDeltaByRangeIndex = this.deltaService.getDeltaByRangeIndex;
        this.getDeltasByInlineRange = this.deltaService.getDeltasByInlineRange;
        this.mapDeltasInInlineRange = this.deltaService.mapDeltasInInlineRange;
        this.rangeService = new RangeService(this);
        this.focusEnd = this.rangeService.focusEnd;
        this.focusIndex = this.rangeService.focusIndex;
        this.focusStart = this.rangeService.focusStart;
        this.getInlineRangeFromElement = this.rangeService.getInlineRangeFromElement;
        this.isFirstLine = this.rangeService.isFirstLine;
        this.isLastLine = this.rangeService.isLastLine;
        this.isValidInlineRange = this.rangeService.isValidInlineRange;
        this.selectAll = this.rangeService.selectAll;
        this.syncInlineRange = this.rangeService.syncInlineRange;
        this.toDomRange = this.rangeService.toDomRange;
        this.toInlineRange = this.rangeService.toInlineRange;
        this.getLine = this.rangeService.getLine;
        this.getNativeRange = this.rangeService.getNativeRange;
        this.getNativeSelection = this.rangeService.getNativeSelection;
        this.getTextPoint = this.rangeService.getTextPoint;
        this.eventService = new EventService(this);
        this.renderService = new RenderService(this);
        this.waitForUpdate = this.renderService.waitForUpdate;
        this.rerenderWholeEditor = this.renderService.rerenderWholeEditor;
        this.render = this.renderService.render;
        this._eventSource = null;
        this._isReadonly = false;
        this._mounted = false;
        this._rootElement = null;
        this.inlineRangeProvider = {
            inlineRange$: signal(null),
            setInlineRange: inlineRange => {
                this.inlineRange$.value = inlineRange;
            },
        };
        this.setInlineRange = (inlineRange) => {
            this.inlineRangeProvider.setInlineRange(inlineRange);
        };
        this.getInlineRange = () => {
            return this.inlineRange$.peek();
        };
        this.slots = {
            mounted: new Subject(),
            unmounted: new Subject(),
            renderComplete: new Subject(),
            textChange: new Subject(),
            inlineRangeSync: new Subject(),
            /**
             * Corresponding to the `compositionUpdate` and `beforeInput` events, and triggered only when the `inlineRange` is not null.
             * The parameter is the `event.data`.
             */
            inputting: new Subject(),
            /**
             * Triggered only when the `inlineRange` is not null.
             */
            keydown: new Subject(),
        };
        if (!yText.doc) {
            throw new BlockSuiteError(ErrorCode.InlineEditorError, 'yText must be attached to a Y.Doc');
        }
        if (yText.toString().includes('\r')) {
            throw new BlockSuiteError(ErrorCode.InlineEditorError, 'yText must not contain "\\r" because it will break the range synchronization');
        }
        const { isEmbed = () => false, hooks = {}, inlineRangeProvider, vLineRenderer = null, } = ops;
        this._inlineRangeProviderOverride = false;
        this.yText = yText;
        this.isEmbed = isEmbed;
        this.vLineRenderer = vLineRenderer;
        this.hooksService = new InlineHookService(this, hooks);
        if (inlineRangeProvider) {
            this.inlineRangeProvider = inlineRangeProvider;
            this._inlineRangeProviderOverride = true;
        }
    }
    mount(rootElement, eventSource = rootElement, isReadonly = false) {
        const inlineRoot = rootElement;
        inlineRoot.inlineEditor = this;
        this._rootElement = inlineRoot;
        this._eventSource = eventSource;
        this._eventSource.style.outline = 'none';
        this._rootElement.dataset.vRoot = 'true';
        this.setReadonly(isReadonly);
        this._rootElement.replaceChildren();
        delete this.rootElement['_$litPart$'];
        this.eventService.mount();
        this.rangeService.mount();
        this.renderService.mount();
        this._mounted = true;
        this.slots.mounted.next();
        this.render();
    }
    unmount() {
        if (this.rootElement) {
            if (this.rootElement.isConnected) {
                render(nothing, this.rootElement);
            }
            this.rootElement.removeAttribute(INLINE_ROOT_ATTR);
        }
        this._rootElement = null;
        this._mounted = false;
        this.disposables.dispose();
        this.slots.unmounted.next();
    }
    setReadonly(isReadonly) {
        const value = isReadonly ? 'false' : 'true';
        if (this.rootElement && this.rootElement.contentEditable !== value) {
            this.rootElement.contentEditable = value;
        }
        this._isReadonly = isReadonly;
    }
    /**
     * @param withoutTransact Execute a transaction without capturing the history.
     */
    transact(fn, withoutTransact = false) {
        const doc = this.yText.doc;
        if (!doc) {
            throw new BlockSuiteError(ErrorCode.InlineEditorError, 'yText is not attached to a doc');
        }
        doc.transact(fn, withoutTransact ? null : doc.clientID);
    }
}
