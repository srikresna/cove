import { NoteBlockModel, NoteDisplayMode } from '@blocksuite/affine-model';
import { matchModels } from './checker.js';
export function findAncestorModel(model, match) {
    let curModel = model;
    while (curModel) {
        if (match(curModel)) {
            return curModel;
        }
        curModel = curModel.parent;
    }
    return null;
}
/**
 * Get block component by its model and wait for the doc element to finish updating.
 *
 */
export async function asyncGetBlockComponent(std, id) {
    const rootBlockId = std.store.root?.id;
    if (!rootBlockId)
        return null;
    const rootComponent = std.view.getBlock(rootBlockId);
    if (!rootComponent)
        return null;
    await rootComponent.updateComplete;
    return std.view.getBlock(id);
}
export function findNoteBlockModel(model) {
    return findAncestorModel(model, m => matchModels(m, [NoteBlockModel]));
}
export function getLastNoteBlock(doc) {
    let note = null;
    if (!doc.root)
        return null;
    const { children } = doc.root;
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (matchModels(child, [NoteBlockModel]) &&
            child.props.displayMode !== NoteDisplayMode.EdgelessOnly) {
            note = child;
            break;
        }
    }
    return note;
}
export function getFirstNoteBlock(doc) {
    let note = null;
    if (!doc.root)
        return null;
    const { children } = doc.root;
    for (const child of children) {
        if (matchModels(child, [NoteBlockModel]) &&
            child.props.displayMode !== NoteDisplayMode.EdgelessOnly) {
            note = child;
            break;
        }
    }
    return note;
}
