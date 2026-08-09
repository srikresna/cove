import { TextSelection } from '@blocksuite/std';
export function findAllCommentedTexts(store) {
    const result = new Map();
    store.getAllModels().forEach(model => {
        if (!model.text)
            return;
        let index = 0;
        model.text.toDelta().forEach(delta => {
            if (!delta.insert)
                return;
            const length = delta.insert.length;
            if (!delta.attributes) {
                index += length;
                return;
            }
            Object.keys(delta.attributes)
                .filter(key => key.startsWith('comment-'))
                .forEach(key => {
                const commentId = key.replace('comment-', '');
                const selection = new TextSelection({
                    from: {
                        blockId: model.id,
                        index,
                        length,
                    },
                    to: null,
                });
                result.set(selection, commentId);
            });
            index += length;
        });
    });
    return result;
}
export function findCommentedTexts(store, commentId) {
    return [...findAllCommentedTexts(store).entries()]
        .filter(([_, id]) => id === commentId)
        .map(([selection]) => selection);
}
export function extractCommentIdFromDelta(delta) {
    if (!delta.attributes)
        return [];
    return Object.keys(delta.attributes)
        .filter(key => key.startsWith('comment-'))
        .map(key => key.replace('comment-', ''));
}
