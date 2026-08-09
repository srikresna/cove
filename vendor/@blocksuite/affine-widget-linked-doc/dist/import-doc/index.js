import { ImportDoc, } from './import-doc.js';
export function showImportModal({ schema, collection, extensions, onSuccess, onFail, container = document.body, abortController = new AbortController(), }) {
    const importDoc = new ImportDoc(collection, schema, extensions, onSuccess, onFail, abortController);
    container.append(importDoc);
    abortController.signal.addEventListener('abort', () => importDoc.remove());
    return importDoc;
}
