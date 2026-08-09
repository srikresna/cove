import { CanvasElementType, EdgelessCRUDIdentifier, } from '@blocksuite/affine-block-surface';
import { TelemetryProvider } from '@blocksuite/affine-shared/services';
import { Bound, Vec } from '@blocksuite/global/gfx';
import * as Y from 'yjs';
const { GROUP, MINDMAP, CONNECTOR } = CanvasElementType;
export function createCanvasElement(std, clipboardData, context, newXYWH) {
    if (clipboardData.type === GROUP) {
        const yMap = new Y.Map();
        const children = clipboardData.children ?? {};
        for (const [key, value] of Object.entries(children)) {
            const newKey = context.oldToNewIdMap.get(key);
            if (!newKey) {
                console.error(`Copy failed: cannot find the copied child in group, key: ${key}`);
                return null;
            }
            yMap.set(newKey, value);
        }
        clipboardData.children = yMap;
        clipboardData.xywh = newXYWH;
    }
    else if (clipboardData.type === MINDMAP) {
        const yMap = new Y.Map();
        const children = clipboardData.children ?? {};
        for (const [oldKey, oldValue] of Object.entries(children)) {
            const newKey = context.oldToNewIdMap.get(oldKey);
            const newValue = {
                ...oldValue,
            };
            if (!newKey) {
                console.error(`Copy failed: cannot find the copied node in mind map, key: ${oldKey}`);
                return null;
            }
            if (oldValue.parent) {
                const newParent = context.oldToNewIdMap.get(oldValue.parent);
                if (!newParent) {
                    console.error(`Copy failed: cannot find the copied node in mind map, parent: ${oldValue.parent}`);
                    return null;
                }
                newValue.parent = newParent;
            }
            yMap.set(newKey, newValue);
        }
        clipboardData.children = yMap;
    }
    else if (clipboardData.type === CONNECTOR) {
        const source = clipboardData.source;
        const target = clipboardData.target;
        const oldBound = Bound.deserialize(clipboardData.xywh);
        const newBound = Bound.deserialize(newXYWH);
        const offset = Vec.sub([newBound.x, newBound.y], [oldBound.x, oldBound.y]);
        if (source.id) {
            source.id = context.oldToNewIdMap.get(source.id) ?? source.id;
        }
        else if (source.position) {
            source.position = Vec.add(source.position, offset);
        }
        if (target.id) {
            target.id = context.oldToNewIdMap.get(target.id) ?? target.id;
        }
        else if (target.position) {
            target.position = Vec.add(target.position, offset);
        }
    }
    else {
        clipboardData.xywh = newXYWH;
    }
    clipboardData.lockedBySelf = false;
    const crud = std.get(EdgelessCRUDIdentifier);
    const id = crud.addElement(clipboardData.type, clipboardData);
    if (!id) {
        return null;
    }
    std.getOptional(TelemetryProvider)?.track('CanvasElementAdded', {
        control: 'canvas:paste',
        page: 'whiteboard editor',
        module: 'toolbar',
        segment: 'toolbar',
        type: clipboardData.type,
    });
    const element = crud.getElementById(id);
    if (!element) {
        console.error(`Copy failed: cannot find the copied element, id: ${id}`);
        return null;
    }
    return element;
}
