import { LifeCycleWatcher } from '@blocksuite/std';
import { type GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import type { BlockModel } from '@blocksuite/store';
import { type CommentId } from './comment-provider';
export declare class BlockElementCommentManager extends LifeCycleWatcher {
    static key: string;
    private readonly _highlightedCommentId$;
    private readonly _disposables;
    private get _provider();
    isBlockCommentHighlighted(block: BlockModel<{
        comments?: Record<CommentId, boolean>;
    }>): boolean;
    isElementCommentHighlighted(element: GfxPrimitiveElementModel): boolean;
    mounted(): void;
    unmounted(): void;
    private readonly _handleAddComment;
    readonly handleDeleteAndResolve: (id: CommentId, type: "delete" | "resolve") => void;
    private readonly _handleHighlightComment;
}
//# sourceMappingURL=block-element-comment-manager.d.ts.map