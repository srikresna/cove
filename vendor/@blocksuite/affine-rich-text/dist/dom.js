import { DatabaseBlockModel } from '@blocksuite/affine-model';
import { asyncGetBlockComponent, getCurrentNativeRange, matchModels, } from '@blocksuite/affine-shared/utils';
import { TextSelection } from '@blocksuite/std';
import { BlockModel } from '@blocksuite/store';
/**
 * In most cases, you not need RichText, you can use {@link getInlineEditorByModel} instead.
 */
export function getRichTextByModel(std, id) {
    const blockComponent = std.view.getBlock(id);
    const richText = blockComponent?.querySelector('rich-text');
    if (!richText)
        return null;
    return richText;
}
export async function asyncGetRichText(std, id) {
    const blockComponent = await asyncGetBlockComponent(std, id);
    if (!blockComponent)
        return null;
    await blockComponent.updateComplete;
    const richText = blockComponent?.querySelector('rich-text');
    if (!richText)
        return null;
    return richText;
}
export function getInlineEditorByModel(std, model) {
    const blockModel = typeof model === 'string' ? std.store.getBlock(model)?.model : model;
    if (!blockModel || matchModels(blockModel, [DatabaseBlockModel])) {
        // Not support database model since it's may be have multiple inline editor instances.
        // Support to enter the editing state through the Enter key in the database.
        return null;
    }
    const richText = getRichTextByModel(std, blockModel.id);
    if (!richText)
        return null;
    return richText.inlineEditor;
}
export async function asyncSetInlineRange(std, model, inlineRange) {
    const richText = await asyncGetRichText(std, model.id);
    if (!richText) {
        return;
    }
    await richText.updateComplete;
    const inlineEditor = richText.inlineEditor;
    if (!inlineEditor) {
        return;
    }
    inlineEditor.setInlineRange(inlineRange);
}
export function focusTextModel(std, id, offset = 0) {
    std.event.active = true;
    selectTextModel(std, id, offset);
}
export function selectTextModel(std, id, index = 0, length = 0) {
    const { selection } = std;
    selection.setGroup('note', [
        selection.create(TextSelection, {
            from: { blockId: id, index, length },
            to: null,
        }),
    ]);
}
export async function onModelTextUpdated(std, model, callback) {
    const richText = await asyncGetRichText(std, model.id);
    if (!richText) {
        console.error('RichText is not ready yet.');
        return;
    }
    await richText.updateComplete;
    const inlineEditor = richText.inlineEditor;
    if (!inlineEditor) {
        console.error('Inline editor is not ready yet.');
        return;
    }
    const subscription = inlineEditor.slots.renderComplete.subscribe(() => {
        subscription.unsubscribe();
        if (callback) {
            callback(richText);
        }
    });
}
/**
 * Remove specified text from the current range.
 */
export function cleanSpecifiedTail(std, inlineEditorOrModel, str) {
    if (!str) {
        console.warn('Failed to clean text! Unexpected empty string');
        return;
    }
    const inlineEditor = inlineEditorOrModel instanceof BlockModel
        ? getInlineEditorByModel(std, inlineEditorOrModel)
        : inlineEditorOrModel;
    if (!inlineEditor) {
        return;
    }
    const inlineRange = inlineEditor.getInlineRange();
    if (!inlineRange) {
        return;
    }
    const idx = inlineRange.index - str.length;
    const textStr = inlineEditor.yText.toString().slice(idx, idx + str.length);
    if (textStr !== str) {
        console.warn(`Failed to clean text! Text mismatch expected: ${str} but actual: ${textStr}`);
        return;
    }
    inlineEditor.deleteText({ index: idx, length: str.length });
    inlineEditor.setInlineRange({
        index: idx,
        length: 0,
    });
}
export function getTextContentFromInlineRange(inlineEditor, startRange) {
    const nativeRange = getCurrentNativeRange();
    if (!nativeRange) {
        return null;
    }
    if (nativeRange.startContainer !== nativeRange.endContainer) {
        return null;
    }
    const curRange = inlineEditor.getInlineRange();
    if (!startRange || !curRange) {
        return null;
    }
    if (curRange.index < startRange.index) {
        return null;
    }
    const text = inlineEditor.yText.toString();
    return text.slice(startRange.index, curRange.index);
}
