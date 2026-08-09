export function matchModels(model, expected) {
    if (model === null || model === undefined) {
        return false;
    }
    return expected.some(expectedModel => model instanceof expectedModel);
}
export function isInsideBlockByFlavour(doc, block, flavour) {
    const parent = doc.getParent(block);
    if (parent === null) {
        return false;
    }
    if (flavour === parent.flavour) {
        return true;
    }
    return isInsideBlockByFlavour(doc, parent, flavour);
}
