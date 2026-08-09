import { LinkPopup } from './link-popup';
export function toggleLinkPopup(std, type, inlineEditor, targetInlineRange, abortController) {
    const popup = new LinkPopup();
    popup.std = std;
    popup.type = type;
    popup.inlineEditor = inlineEditor;
    popup.targetInlineRange = targetInlineRange;
    popup.abortController = abortController;
    const root = inlineEditor.rootElement?.closest('editor-host')?.parentElement ??
        document.body;
    root.append(popup);
    return popup;
}
