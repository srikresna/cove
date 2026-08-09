import { NoteBlockModel, NoteDisplayMode, ParagraphBlockModel, RootBlockModel, } from '@blocksuite/affine-model';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { headingKeys } from '../config.js';
export function getNotesFromStore(store, modes = [
    NoteDisplayMode.DocAndEdgeless,
    NoteDisplayMode.DocOnly,
    NoteDisplayMode.EdgelessOnly,
]) {
    const rootModel = store.root;
    if (!rootModel)
        return [];
    const notes = [];
    rootModel.children.forEach(block => {
        if (!matchModels(block, [NoteBlockModel]))
            return;
        if (modes.includes(block.props.displayMode$.value)) {
            notes.push(block);
        }
    });
    return notes;
}
export function isRootBlock(block) {
    return matchModels(block, [RootBlockModel]);
}
export function isHeadingBlock(block) {
    return (matchModels(block, [ParagraphBlockModel]) &&
        headingKeys.has(block.props.type$.value));
}
export function getHeadingBlocksFromNote(note, ignoreEmpty = false) {
    const models = note.children.filter(block => {
        const empty = block.text && block.text.length > 0;
        return isHeadingBlock(block) && (!ignoreEmpty || empty);
    });
    return models;
}
export function getHeadingBlocksFromDoc(store, modes = [
    NoteDisplayMode.DocAndEdgeless,
    NoteDisplayMode.DocOnly,
    NoteDisplayMode.EdgelessOnly,
], ignoreEmpty = false) {
    const notes = getNotesFromStore(store, modes);
    return notes.flatMap(note => getHeadingBlocksFromNote(note, ignoreEmpty));
}
