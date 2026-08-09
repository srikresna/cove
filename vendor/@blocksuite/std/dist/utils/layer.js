import { isGfxGroupCompatibleModel, } from '../gfx/model/base.js';
import {} from '../gfx/model/gfx-block-model.js';
import { GfxLocalElementModel } from '../gfx/model/surface/local-element-model.js';
export function getLayerEndZIndex(layers, layerIndex) {
    const layer = layers[layerIndex];
    return layer ? layer.zIndex + layer.elements.length - 1 : 0;
}
export function updateLayersZIndex(layers, startIdx) {
    const startLayer = layers[startIdx];
    let curIndex = startLayer.zIndex;
    for (let i = startIdx; i < layers.length; ++i) {
        const curLayer = layers[i];
        curLayer.zIndex = curIndex;
        curIndex += curLayer.elements.length;
    }
}
export function getElementIndex(indexable) {
    const groups = indexable.groups;
    if (groups.length) {
        const groupIndexes = groups
            .map(group => group.index)
            .reverse()
            .join('-');
        return `${groupIndexes}-${indexable.index}`;
    }
    return indexable.index;
}
export function ungroupIndex(index) {
    return index.split('-')[0];
}
export function insertToOrderedArray(array, element) {
    let idx = 0;
    while (idx < array.length &&
        [SortOrder.BEFORE, SortOrder.SAME].includes(compare(array[idx], element))) {
        ++idx;
    }
    array.splice(idx, 0, element);
}
export function removeFromOrderedArray(array, element) {
    const idx = array.indexOf(element);
    if (idx !== -1) {
        array.splice(idx, 1);
    }
}
export var SortOrder;
(function (SortOrder) {
    SortOrder[SortOrder["AFTER"] = 1] = "AFTER";
    SortOrder[SortOrder["BEFORE"] = -1] = "BEFORE";
    SortOrder[SortOrder["SAME"] = 0] = "SAME";
})(SortOrder || (SortOrder = {}));
export function isInRange(edges, target) {
    return compare(target, edges[0]) >= 0 && compare(target, edges[1]) < 0;
}
export function renderableInEdgeless(doc, surface, block) {
    const parent = doc.getParent(block);
    return parent === doc.root || parent === surface;
}
export function compareIndex(aIndex, bIndex) {
    return aIndex === bIndex
        ? SortOrder.SAME
        : aIndex < bIndex
            ? SortOrder.BEFORE
            : SortOrder.AFTER;
}
function compareLocal(a, b) {
    const isALocal = a instanceof GfxLocalElementModel;
    const isBLocal = b instanceof GfxLocalElementModel;
    if (isALocal && a.creator && a.creator === b) {
        return SortOrder.AFTER;
    }
    if (isBLocal && b.creator && b.creator === a) {
        return SortOrder.BEFORE;
    }
    if (isALocal && isBLocal && a.creator && a.creator === b.creator) {
        return compareIndex(a.index, b.index);
    }
    return {
        a: isALocal && a.creator ? a.creator : a,
        b: isBLocal && b.creator ? b.creator : b,
    };
}
/**
 * A comparator function for sorting elements in the surface.
 * SortOrder.AFTER means a should be rendered after b and so on.
 * @returns
 */
export function compare(a, b) {
    const result = compareLocal(a, b);
    if (typeof result === 'number') {
        return result;
    }
    a = result.a;
    b = result.b;
    if (isGfxGroupCompatibleModel(a) && b.groups.includes(a)) {
        return SortOrder.BEFORE;
    }
    else if (isGfxGroupCompatibleModel(b) && a.groups.includes(b)) {
        return SortOrder.AFTER;
    }
    else {
        const aGroups = a.groups;
        const bGroups = b.groups;
        let i = 1;
        let aGroup = aGroups.at(-i);
        let bGroup = bGroups.at(-i);
        while (aGroup === bGroup && aGroup) {
            ++i;
            aGroup = aGroups.at(-i);
            bGroup = bGroups.at(-i);
        }
        aGroup = aGroup ?? a;
        bGroup = bGroup ?? b;
        return compareIndex(aGroup.index, bGroup.index);
    }
}
