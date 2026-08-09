export function getSurfaceBlock(doc) {
    const blocks = doc.getBlocksByFlavour('affine:surface');
    return blocks.length !== 0 ? blocks[0].model : null;
}
export function getSurfaceComponent(std) {
    const surface = getSurfaceBlock(std.store);
    if (!surface)
        return null;
    return std.view.getBlock(surface.id);
}
