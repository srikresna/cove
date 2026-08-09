import { LifeCycleWatcher } from '@blocksuite/std';
export declare class InlineCommentManager extends LifeCycleWatcher {
    static key: string;
    private readonly _disposables;
    private readonly _highlightedCommentId$;
    private get _provider();
    mounted(): void;
    unmounted(): void;
    private _init;
    getCommentsInEditor(): string[];
    private readonly _handleAddComment;
    private readonly _handleDeleteAndResolve;
    private readonly _handleHighlightComment;
    private readonly _handleSelectionChanged;
}
//# sourceMappingURL=inline-comment-manager.d.ts.map