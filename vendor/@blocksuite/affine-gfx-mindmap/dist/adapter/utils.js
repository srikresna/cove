import { getShapeText } from '@blocksuite/affine-gfx-shape';
import { buildMindMapTree, } from '@blocksuite/affine-model';
/**
 * traverse the mindMapTree and construct the content string
 * like:
 * - Root
 *   - Child 1
 *     - Child 1.1
 *     - Child 1.2
 *   - Child 2
 *     - Child 2.1
 *     - Child 2.2
 *   - Child 3
 *     - Child 3.1
 *     - Child 3.2
 * @param elementModel - the mindmap element model
 * @param elements - the elements map
 * @returns the mindmap tree text
 */
export function getMindMapTreeText(elementModel, elements, options = {
    prefix: ' ',
    repeat: 2,
}) {
    let mindMapContent = '';
    if (elementModel.type !== 'mindmap') {
        return mindMapContent;
    }
    const mindMapTree = buildMindMapTree(elementModel);
    if (!mindMapTree) {
        return mindMapContent;
    }
    let layer = 0;
    const traverseMindMapTree = (node, prefix, repeat) => {
        const shapeElement = elements[node.id];
        const shapeText = getShapeText(shapeElement);
        if (shapeElement) {
            mindMapContent += `${prefix.repeat(layer * repeat)}- ${shapeText}\n`;
        }
        node.children.forEach(child => {
            layer++;
            traverseMindMapTree(child, prefix, repeat);
            layer--;
        });
    };
    traverseMindMapTree(mindMapTree, options.prefix, options.repeat);
    return mindMapContent;
}
