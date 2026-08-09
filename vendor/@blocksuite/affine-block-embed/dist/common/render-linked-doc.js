import { getSurfaceBlock } from '@blocksuite/affine-block-surface';
import { ListBlockModel, NoteBlockModel, NoteDisplayMode, ParagraphBlockModel, } from '@blocksuite/affine-model';
import { NotificationProvider } from '@blocksuite/affine-shared/services';
import { matchModels } from '@blocksuite/affine-shared/utils';
import { Slice, Text, } from '@blocksuite/store';
// Throttle delay for block updates to reduce unnecessary re-renders
// - Prevents rapid-fire updates when multiple blocks are updated in quick succession
// - Ensures UI remains responsive while maintaining performance
// - Small enough to feel instant to users, large enough to batch updates effectively
export const RENDER_CARD_THROTTLE_MS = 60;
function filterTextModel(model) {
    if (matchModels(model, [ParagraphBlockModel, ListBlockModel])) {
        return !!model.text?.toString().length;
    }
    return false;
}
export function getNotesFromDoc(doc) {
    const notes = doc.root?.children.filter(child => matchModels(child, [NoteBlockModel]) &&
        child.props.displayMode !== NoteDisplayMode.EdgelessOnly);
    if (!notes || !notes.length) {
        return null;
    }
    return notes;
}
export function isEmptyDoc(doc, mode) {
    if (!doc) {
        return true;
    }
    if (mode === 'page') {
        const notes = getNotesFromDoc(doc);
        if (!notes || !notes.length) {
            return true;
        }
        return notes.every(note => isEmptyNote(note));
    }
    else {
        const surface = getSurfaceBlock(doc);
        if (surface?.elementModels.length || doc.blockSize > 2) {
            return false;
        }
        return true;
    }
}
export function isEmptyNote(note) {
    return note.children.every(block => {
        return (block.flavour === 'affine:paragraph' &&
            (!block.text || block.text.length === 0));
    });
}
/**
 * Gets the document content with a max length.
 */
export function getDocContentWithMaxLength(doc, maxlength = 500) {
    const notes = getNotesFromDoc(doc);
    if (!notes)
        return;
    const noteChildren = notes.flatMap(note => note.children.filter(model => filterTextModel(model)));
    if (!noteChildren.length)
        return;
    let count = 0;
    let reached = false;
    const texts = [];
    for (const model of noteChildren) {
        let t = model.text?.toString();
        if (t?.length) {
            const c = count + Math.max(0, texts.length - 1);
            if (t.length + c > maxlength) {
                t = t.substring(0, maxlength - c);
                reached = true;
            }
            texts.push(t);
            count += t.length;
            if (reached) {
                break;
            }
        }
    }
    return texts.join('\n');
}
export function getTitleFromSelectedModels(selectedModels) {
    const firstBlock = selectedModels[0];
    const isParagraph = (model) => model.flavour === 'affine:paragraph';
    if (isParagraph(firstBlock) && firstBlock.props.type.startsWith('h')) {
        return firstBlock.props.text.toString();
    }
    return undefined;
}
export function promptDocTitle(std, autofill) {
    const notification = std.getOptional(NotificationProvider);
    if (!notification)
        return Promise.resolve(undefined);
    return notification.prompt({
        title: 'Create linked doc',
        message: 'Enter a title for the new doc.',
        placeholder: 'Untitled',
        autofill,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
    });
}
export function notifyDocCreated(std) {
    std.getOptional(NotificationProvider)?.notifyWithUndoAction({
        title: 'Linked doc created',
        message: 'You can click undo to recovery block content',
        accent: 'info',
        duration: 10 * 1000,
    });
}
export async function convertSelectedBlocksToLinkedDoc(std, doc, selectedModels, docTitle) {
    const models = await selectedModels;
    const slice = std.clipboard.sliceToSnapshot(Slice.fromModels(doc, models));
    if (!slice) {
        return;
    }
    const firstBlock = models[0];
    if (!firstBlock) {
        return;
    }
    // if title undefined, use the first heading block content as doc title
    const title = docTitle || getTitleFromSelectedModels(models);
    const linkedDoc = createLinkedDocFromSlice(std, doc, slice.content, title);
    // insert linked doc card
    doc.addSiblingBlocks(doc.getBlock(firstBlock.id).model, [
        {
            flavour: 'affine:embed-linked-doc',
            pageId: linkedDoc.id,
        },
    ], 'before');
    // delete selected elements
    models.forEach(model => doc.deleteBlock(model.id));
    return linkedDoc;
}
export function createLinkedDocFromSlice(std, doc, snapshots, docTitle) {
    const _doc = doc.workspace.createDoc();
    const linkedDoc = _doc.getStore();
    linkedDoc.load(() => {
        const rootId = linkedDoc.addBlock('affine:page', {
            title: new Text(docTitle),
        });
        linkedDoc.addBlock('affine:surface', {}, rootId);
        const noteId = linkedDoc.addBlock('affine:note', {}, rootId);
        snapshots.forEach(snapshot => {
            std.clipboard
                .pasteBlockSnapshot(snapshot, linkedDoc, noteId)
                .catch(console.error);
        });
    });
    return linkedDoc;
}
