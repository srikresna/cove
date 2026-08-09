import { DividerBlockModel } from '@blocksuite/affine-model';
import { DisposableGroup } from '@blocksuite/global/disposable';
import { BlockSelection, LifeCycleWatcher, SurfaceSelection, TextSelection, } from '@blocksuite/std';
import { GfxControllerIdentifier, } from '@blocksuite/std/gfx';
import { signal } from '@preact/signals-core';
import { getSelectedBlocksCommand } from '../../commands';
import { ImageSelection } from '../../selection';
import { matchModels } from '../../utils';
import { CommentProviderIdentifier } from './comment-provider';
import { findCommentedBlocks, findCommentedElements } from './utils';
export class BlockElementCommentManager extends LifeCycleWatcher {
    constructor() {
        super(...arguments);
        this._highlightedCommentId$ = signal(null);
        this._disposables = new DisposableGroup();
        this._handleAddComment = (id, selections) => {
            // get blocks from text range that some no-text blocks are selected such as image, bookmark, etc.
            const noTextBlocksFromTextRange = selections
                .filter((s) => s.is(TextSelection))
                .flatMap(s => {
                const [_, { selectedBlocks }] = this.std.command.exec(getSelectedBlocksCommand, {
                    textSelection: s,
                });
                if (!selectedBlocks)
                    return [];
                return selectedBlocks.map(b => b.model).filter(m => !m.text);
            });
            const blocksFromBlockSelection = selections
                .filter(s => s instanceof BlockSelection || s instanceof ImageSelection)
                .map(({ blockId }) => this.std.store.getModelById(blockId))
                .filter((m) => m !== null && !matchModels(m, [DividerBlockModel]));
            const needCommentBlocks = [
                ...noTextBlocksFromTextRange,
                ...blocksFromBlockSelection,
            ];
            if (needCommentBlocks.length !== 0) {
                this.std.store.withoutTransact(() => {
                    needCommentBlocks.forEach(block => {
                        const comments = ('comments' in block.props &&
                            typeof block.props.comments === 'object' &&
                            block.props.comments !== null
                            ? block.props.comments
                            : {});
                        this.std.store.updateBlock(block, {
                            comments: { [id]: true, ...comments },
                        });
                    });
                });
            }
            const gfx = this.std.get(GfxControllerIdentifier);
            const elementsFromSurfaceSelection = selections
                .filter(s => s instanceof SurfaceSelection)
                .flatMap(({ elements }) => {
                return elements
                    .map(id => gfx.getElementById(id))
                    .filter(m => m !== null);
            });
            if (elementsFromSurfaceSelection.length !== 0) {
                this.std.store.withoutTransact(() => {
                    elementsFromSurfaceSelection.forEach(element => {
                        const comments = 'comments' in element &&
                            typeof element.comments === 'object' &&
                            element.comments !== null
                            ? element.comments
                            : {};
                        gfx.updateElement(element, {
                            comments: { [id]: true, ...comments },
                        });
                    });
                });
            }
        };
        this.handleDeleteAndResolve = (id, type) => {
            const commentedBlocks = findCommentedBlocks(this.std.store, id);
            this.std.store.withoutTransact(() => {
                commentedBlocks.forEach(block => {
                    if (type === 'delete') {
                        delete block.props.comments[id];
                    }
                    else {
                        block.props.comments[id] = false;
                    }
                });
            });
            const commentedElements = findCommentedElements(this.std.store, id);
            this.std.store.withoutTransact(() => {
                commentedElements.forEach(element => {
                    if (type === 'delete') {
                        delete element.comments[id];
                    }
                    else {
                        element.comments[id] = false;
                    }
                });
            });
        };
        this._handleHighlightComment = (id) => {
            this._highlightedCommentId$.value = id;
        };
    }
    static { this.key = 'block-element-comment-manager'; }
    get _provider() {
        return this.std.getOptional(CommentProviderIdentifier);
    }
    isBlockCommentHighlighted(block) {
        const comments = block.props.comments;
        if (!comments)
            return false;
        return (this._highlightedCommentId$.value !== null &&
            Object.keys(comments).includes(this._highlightedCommentId$.value));
    }
    isElementCommentHighlighted(element) {
        const comments = element.comments;
        if (!comments)
            return false;
        return (this._highlightedCommentId$.value !== null &&
            Object.keys(comments).includes(this._highlightedCommentId$.value));
    }
    mounted() {
        const provider = this._provider;
        if (!provider)
            return;
        this._disposables.add(provider.onCommentAdded(this._handleAddComment));
        this._disposables.add(provider.onCommentDeleted(id => this.handleDeleteAndResolve(id, 'delete')));
        this._disposables.add(provider.onCommentResolved(id => this.handleDeleteAndResolve(id, 'resolve')));
        this._disposables.add(provider.onCommentHighlighted(this._handleHighlightComment));
    }
    unmounted() {
        this._disposables.dispose();
    }
}
