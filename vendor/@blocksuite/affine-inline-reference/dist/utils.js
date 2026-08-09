import { REFERENCE_NODE } from '@blocksuite/affine-shared/consts';
export function insertLinkedNode({ inlineEditor, docId, }) {
    if (!inlineEditor)
        return;
    const inlineRange = inlineEditor.getInlineRange();
    if (!inlineRange)
        return;
    inlineEditor.insertText(inlineRange, REFERENCE_NODE, {
        reference: { type: 'LinkedPage', pageId: docId },
    });
    inlineEditor.setInlineRange({
        index: inlineRange.index + 1,
        length: 0,
    });
}
