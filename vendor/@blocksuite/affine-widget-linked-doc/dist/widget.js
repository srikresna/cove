import { getRangeRects, } from '@blocksuite/affine-shared/commands';
import { FeatureFlagService } from '@blocksuite/affine-shared/services';
import { getViewportElement } from '@blocksuite/affine-shared/utils';
import { IS_MOBILE } from '@blocksuite/global/env';
import { BLOCK_ID_ATTR, WidgetComponent, WidgetViewExtension, } from '@blocksuite/std';
import { GfxControllerIdentifier } from '@blocksuite/std/gfx';
import { INLINE_ROOT_ATTR, } from '@blocksuite/std/inline';
import { signal } from '@preact/signals-core';
import { html, nothing } from 'lit';
import { choose } from 'lit/directives/choose.js';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { literal, unsafeStatic } from 'lit/static-html.js';
import { AFFINE_LINKED_DOC_WIDGET, getMenus, LinkedWidgetConfigExtension, } from './config.js';
import { linkedDocWidgetStyles } from './styles.js';
export class AffineLinkedDocWidget extends WidgetComponent {
    constructor() {
        super(...arguments);
        this._context = null;
        this._inputRects$ = signal([]);
        this._mode$ = signal('none');
        this._renderLinkedDocMenu = () => {
            if (!this.block?.rootComponent)
                return nothing;
            return html `<affine-mobile-linked-doc-menu
      .context=${this._context}
      .rootComponent=${this.block.rootComponent}
    ></affine-mobile-linked-doc-menu>`;
        };
        this._renderLinkedDocPopover = () => {
            return html `<affine-linked-doc-popover
      .context=${this._context}
    ></affine-linked-doc-popover>`;
        };
    }
    static { this.styles = linkedDocWidgetStyles; }
    _addTriggerKey(inlineEditor, triggerKey) {
        const inlineRange = inlineEditor.getInlineRange();
        if (!inlineRange)
            return;
        inlineEditor.insertText({ index: inlineRange.index, length: 0 }, triggerKey);
        inlineEditor.setInlineRange({
            index: inlineRange.index + triggerKey.length,
            length: 0,
        });
    }
    _updateInputRects() {
        if (!this._context)
            return;
        const { inlineEditor, startRange, triggerKey } = this._context;
        const currentInlineRange = inlineEditor.getInlineRange();
        if (!currentInlineRange)
            return;
        const startIndex = startRange.index - triggerKey.length;
        const range = inlineEditor.toDomRange({
            index: startIndex,
            length: currentInlineRange.index - startIndex,
        });
        if (!range)
            return;
        this._inputRects$.value = getRangeRects(range, getViewportElement(this.host));
    }
    get _isCursorAtEnd() {
        if (!this._context)
            return false;
        const { inlineEditor } = this._context;
        const currentInlineRange = inlineEditor.getInlineRange();
        if (!currentInlineRange)
            return false;
        return currentInlineRange.index === inlineEditor.yTextLength;
    }
    _renderInputMask() {
        return html `${repeat(this._inputRects$.value, ({ top, left, width, height }, index) => {
            const last = index === this._inputRects$.value.length - 1 && this._isCursorAtEnd;
            const padding = 2;
            return html `<div
          class="input-mask"
          style=${styleMap({
                top: `${top - padding}px`,
                left: `${left}px`,
                width: `${width + (last ? 10 : 0)}px`,
                height: `${height + 2 * padding}px`,
            })}
        ></div>`;
        })}`;
    }
    _watchInput() {
        this.handleEvent('beforeInput', ctx => {
            if (this._mode$.peek() !== 'none')
                return;
            const event = ctx.get('defaultState').event;
            if (!(event instanceof InputEvent))
                return;
            if (event.data === null)
                return;
            const host = this.std.host;
            const range = host.range.value;
            if (!range || !range.collapsed)
                return;
            const containerElement = range.commonAncestorContainer instanceof Element
                ? range.commonAncestorContainer
                : range.commonAncestorContainer.parentElement;
            if (!containerElement)
                return;
            if (containerElement.closest(this.config.ignoreSelector))
                return;
            const block = containerElement.closest(`[${BLOCK_ID_ATTR}]`);
            if (!block || this.config.ignoreBlockTypes.includes(block.flavour))
                return;
            const inlineRoot = containerElement.closest(`[${INLINE_ROOT_ATTR}]`);
            if (!inlineRoot)
                return;
            const inlineEditor = inlineRoot.inlineEditor;
            const inlineRange = inlineEditor.getInlineRange();
            if (!inlineRange)
                return;
            const triggerKeys = this.config.triggerKeys;
            const primaryTriggerKey = triggerKeys[0];
            const convertTriggerKey = this.config.convertTriggerKey;
            if (primaryTriggerKey.length > inlineRange.index)
                return;
            const matchedText = inlineEditor.yTextString.slice(inlineRange.index - primaryTriggerKey.length, inlineRange.index);
            let converted = false;
            if (matchedText !== primaryTriggerKey && convertTriggerKey) {
                for (const key of triggerKeys.slice(1)) {
                    if (key.length > inlineRange.index)
                        continue;
                    const matchedText = inlineEditor.yTextString.slice(inlineRange.index - key.length, inlineRange.index);
                    if (matchedText === key) {
                        const startIdxBeforeMatchKey = inlineRange.index - key.length;
                        inlineEditor.deleteText({
                            index: startIdxBeforeMatchKey,
                            length: key.length,
                        });
                        inlineEditor.insertText({ index: startIdxBeforeMatchKey, length: 0 }, primaryTriggerKey);
                        inlineEditor.setInlineRange({
                            index: startIdxBeforeMatchKey + primaryTriggerKey.length,
                            length: 0,
                        });
                        converted = true;
                        break;
                    }
                }
            }
            if (matchedText !== primaryTriggerKey && !converted)
                return;
            inlineEditor
                .waitForUpdate()
                .then(() => {
                this.show({
                    inlineEditor,
                    primaryTriggerKey,
                    mode: IS_MOBILE ? 'mobile' : 'desktop',
                });
            })
                .catch(console.error);
        });
    }
    _watchViewportChange() {
        const gfx = this.std.get(GfxControllerIdentifier);
        this.disposables.add(gfx.viewport.viewportUpdated.subscribe(() => {
            this._updateInputRects();
        }));
    }
    get config() {
        return {
            triggerKeys: ['@', '[[', '【【'],
            ignoreBlockTypes: ['affine:code'],
            ignoreSelector: 'edgeless-text-editor, edgeless-shape-text-editor, edgeless-group-title-editor, edgeless-frame-title-editor, edgeless-connector-label-editor',
            convertTriggerKey: true,
            getMenus,
            mobile: {
                scrollContainer: getViewportElement(this.std.host) ?? window,
                scrollTopOffset: 46,
            },
            ...this.std.getOptional(LinkedWidgetConfigExtension.identifier),
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this._watchInput();
        this._watchViewportChange();
    }
    show(props) {
        const host = this.host;
        const { primaryTriggerKey = '@', mode = 'desktop', addTriggerKey = false, } = props ?? {};
        let inlineEditor;
        if (!props?.inlineEditor) {
            const range = host.range.value;
            if (!range || !range.collapsed)
                return;
            const containerElement = range.commonAncestorContainer instanceof Element
                ? range.commonAncestorContainer
                : range.commonAncestorContainer.parentElement;
            if (!containerElement)
                return;
            const inlineRoot = containerElement.closest(`[${INLINE_ROOT_ATTR}]`);
            if (!inlineRoot)
                return;
            inlineEditor = inlineRoot.inlineEditor;
        }
        else {
            inlineEditor = props.inlineEditor;
        }
        if (addTriggerKey) {
            this._addTriggerKey(inlineEditor, primaryTriggerKey);
            // we need to wait the range sync to get the correct startNativeRange
            const subscription = inlineEditor.slots.inlineRangeSync.subscribe(() => {
                this.show({ ...props, addTriggerKey: false });
                subscription.unsubscribe();
            });
            return;
        }
        const startRange = inlineEditor.getInlineRange();
        if (!startRange)
            return;
        const startNativeRange = inlineEditor.getNativeRange();
        if (!startNativeRange)
            return;
        const disposable = inlineEditor.slots.renderComplete.subscribe(() => {
            this._updateInputRects();
        });
        this._context = {
            std: this.std,
            inlineEditor,
            startRange,
            startNativeRange,
            triggerKey: primaryTriggerKey,
            config: this.config,
            close: () => {
                disposable.unsubscribe();
                this._inputRects$.value = [];
                this._mode$.value = 'none';
                this._context = null;
            },
        };
        this._updateInputRects();
        const enableMobile = this.store
            .get(FeatureFlagService)
            .getFlag('enable_mobile_linked_doc_menu');
        this._mode$.value = enableMobile ? mode : 'desktop';
    }
    render() {
        if (this._mode$.value === 'none')
            return nothing;
        return html `${this._renderInputMask()}
      <blocksuite-portal
        .shadowDom=${false}
        .template=${choose(this._mode$.value, [
            ['desktop', this._renderLinkedDocPopover],
            ['mobile', this._renderLinkedDocMenu],
        ], () => html `${nothing}`)}
      ></blocksuite-portal>`;
    }
}
export const linkedDocWidget = WidgetViewExtension('affine:page', AFFINE_LINKED_DOC_WIDGET, literal `${unsafeStatic(AFFINE_LINKED_DOC_WIDGET)}`);
