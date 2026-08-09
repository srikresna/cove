export function getDocTitleByEditorHost(editorHost) {
    const docViewport = editorHost.closest('.affine-page-viewport');
    if (!docViewport)
        return null;
    return docViewport.querySelector('doc-title');
}
