export function isConnectable(element) {
    return !!element && element.connectable;
}
export function isNoteBlock(element) {
    return !!element && 'flavour' in element && element.flavour === 'affine:note';
}
