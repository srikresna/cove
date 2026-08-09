import { ReferencePopup } from './reference-popup';
export function toggleReferencePopup(std, docTitle, referenceInfo, inlineEditor, inlineRange, abortController) {
    const popup = new ReferencePopup();
    popup.std = std;
    popup.docTitle = docTitle;
    popup.referenceInfo = referenceInfo;
    popup.inlineEditor = inlineEditor;
    popup.inlineRange = inlineRange;
    popup.abortController = abortController;
    document.body.append(popup);
    return popup;
}
