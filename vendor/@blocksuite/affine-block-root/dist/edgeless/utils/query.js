import { ShapeElementModel, TextElementModel, } from '@blocksuite/affine-model';
import { isTopLevelBlock } from '@blocksuite/affine-shared/utils';
import { drawingCursor } from './cursors';
export function isEdgelessTextBlock(element) {
    return (!!element &&
        'flavour' in element &&
        element.flavour === 'affine:edgeless-text');
}
export function isImageBlock(element) {
    return (!!element && 'flavour' in element && element.flavour === 'affine:image');
}
export function isAttachmentBlock(element) {
    return (!!element && 'flavour' in element && element.flavour === 'affine:attachment');
}
export function isEmbedSyncedDocBlock(element) {
    return (!!element &&
        'flavour' in element &&
        element.flavour === 'affine:embed-synced-doc');
}
export function isCanvasElement(selectable) {
    return !isTopLevelBlock(selectable);
}
export function isCanvasElementWithText(element) {
    return (element instanceof TextElementModel || element instanceof ShapeElementModel);
}
export function isConnectable(element) {
    return !!element && element.connectable;
}
// https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
export function getCursorMode(edgelessTool) {
    if (!edgelessTool) {
        return 'default';
    }
    switch (edgelessTool.toolType?.toolName) {
        case 'default':
            return 'default';
        case 'pan':
            return edgelessTool.options?.panning
                ? 'grabbing'
                : 'grab';
        case 'brush':
        case 'highlighter':
            return drawingCursor;
        case 'eraser':
        case 'shape':
        case 'connector':
        case 'frame':
        case 'affine:note':
            return 'crosshair';
        case 'text':
            return 'text';
        default:
            return 'default';
    }
}
