import { getInlineEditorByModel } from '@blocksuite/affine-rich-text';
import { getSelectedBlocksCommand } from '@blocksuite/affine-shared/commands';
import { BlockElementCommentManager, CommentProviderIdentifier, findAllCommentedBlocks, findAllCommentedElements, } from '@blocksuite/affine-shared/services';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { LifeCycleWatcher, TextSelection, } from '@blocksuite/std';
import { signal } from '@preact/signals-core';
import difference from 'lodash-es/difference';
import { extractCommentIdFromDelta, findAllCommentedTexts, findCommentedTexts, } from './utils';
export class InlineCommentManager extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        this._disposables = new DisposableGroup();
        this._highlightedCommentId$ = signal(null);
        this._handleAddComment = (id, selections) => {
            const needCommentTexts = selections.flatMap(selection => {
                if (!selection.is(TextSelection))
                    return [];
                const [_, { selectedBlocks }] = this.std.command
                    .chain()
                    .pipe(getSelectedBlocksCommand, {
                    textSelection: selection,
                })
                    .run();
                if (!selectedBlocks)
                    return [];
                return selectedBlocks
                    .map(({ model }) => [model, getInlineEditorByModel(this.std, model)])
                    .filter((pair) => !!pair[0].text && !!pair[1])
                    .map(([model, inlineEditor]) => {
                    let from;
                    let to;
                    if (model.id === selection.from.blockId) {
                        from = selection.from;
                        to = null;
                    }
                    else if (model.id === selection.to?.blockId) {
                        from = selection.to;
                        to = null;
                    }
                    else {
                        from = {
                            blockId: model.id,
                            index: 0,
                            length: model.text.yText.length,
                        };
                        to = null;
                    }
                    return [new TextSelection({ from, to }), inlineEditor];
                });
            });
            if (needCommentTexts.length === 0)
                return;
            needCommentTexts.forEach(([selection, inlineEditor]) => {
                inlineEditor.formatText(selection.from, {
                    [`comment-${id}`]: true,
                }, {
                    withoutTransact: true,
                });
            });
        };
        this._handleDeleteAndResolve = (id, type) => {
            const commentedTexts = findCommentedTexts(this.std.store, id);
            if (commentedTexts.length === 0)
                return;
            this.std.store.withoutTransact(() => {
                commentedTexts.forEach(selection => {
                    const inlineEditor = getInlineEditorByModel(this.std, selection.from.blockId);
                    inlineEditor?.formatText(selection.from, {
                        [`comment-${id}`]: type === 'delete' ? null : false,
                    }, {
                        withoutTransact: true,
                    });
                });
            });
        };
        this._handleHighlightComment = (id) => {
            this._highlightedCommentId$.value = id;
        };
        this._handleSelectionChanged = (selections) => {
            const currentHighlightedCommentId = this._highlightedCommentId$.peek();
            if (selections.length === 1) {
                const selection = selections[0];
                // InlineCommentManager only handle text selection
                if (!selection.is(TextSelection))
                    return;
                if (!selection.isCollapsed() && currentHighlightedCommentId !== null) {
                    this._provider?.highlightComment(null);
                    return;
                }
                const model = this.std.store.getModelById(selection.from.blockId);
                if (!model)
                    return;
                const inlineEditor = getInlineEditorByModel(this.std, model);
                if (!inlineEditor)
                    return;
                const delta = inlineEditor.getDeltaByRangeIndex(selection.from.index);
                if (!delta)
                    return;
                const commentIds = extractCommentIdFromDelta(delta);
                if (commentIds.length !== 0)
                    return;
            }
            if (currentHighlightedCommentId !== null) {
                this._provider?.highlightComment(null);
            }
        };
    }
    static { this.key = 'inline-comment-manager'; }
    get _provider() {
        return this.std.getOptional(CommentProviderIdentifier);
    }
    mounted() {
        const provider = this._provider;
        if (!provider)
            return;
        this._init().catch(console.error);
        this._disposables.add(provider.onCommentAdded(this._handleAddComment));
        this._disposables.add(provider.onCommentDeleted(id => this._handleDeleteAndResolve(id, 'delete')));
        this._disposables.add(provider.onCommentResolved(id => this._handleDeleteAndResolve(id, 'resolve')));
        this._disposables.add(provider.onCommentHighlighted(this._handleHighlightComment));
        this._disposables.add(this.std.selection.slots.changed.subscribe(this._handleSelectionChanged));
    }
    unmounted() {
        this._disposables.dispose();
    }
    async _init() {
        const provider = this._provider;
        if (!provider)
            return;
        const commentsInProvider = await provider.getComments('all');
        const commentsInEditor = this.getCommentsInEditor();
        // remove comments that are in editor but not in provider
        // which means the comment may be removed or resolved in provider side
        difference(commentsInEditor, commentsInProvider).forEach(comment => {
            this.std
                .get(BlockElementCommentManager)
                .handleDeleteAndResolve(comment, 'delete');
        });
    }
    getCommentsInEditor() {
        const inlineComments = [...findAllCommentedTexts(this.std.store).values()];
        const blockComments = findAllCommentedBlocks(this.std.store).flatMap(block => Object.keys(block.props.comments));
        const surfaceComments = findAllCommentedElements(this.std.store).flatMap(element => Object.keys(element.comments));
        const commentsInEditor = [
            ...new Set([...inlineComments, ...blockComments, ...surfaceComments]),
        ];
        return commentsInEditor;
    }
}
