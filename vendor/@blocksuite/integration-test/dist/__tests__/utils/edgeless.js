export function getSurface(doc, editor) {
    const surfaceModel = doc.getModelsByFlavour('affine:surface');
    return editor.host.view.getBlock(surfaceModel[0].id);
}
export function getDocRootBlock(doc, editor, _) {
    return editor.host.view.getBlock(doc.root.id);
}
export function addNote(doc, props = {}) {
    const noteId = doc.addBlock('affine:note', {
        xywh: '[0, 0, 800, 100]',
        ...props,
    }, doc.root);
    doc.addBlock('affine:paragraph', {}, noteId);
    return noteId;
}
