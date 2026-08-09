import type { GfxPrimitiveElementModel } from '@blocksuite/std/gfx';
import { BlockModel, type Store } from '@blocksuite/store';
import type { ToolbarAction } from '../toolbar-service';
import { type CommentId } from './comment-provider';
export declare function findAllCommentedBlocks(store: Store): BlockModel<{
    comments: Record<CommentId, boolean>;
}>[];
export declare function findCommentedBlocks(store: Store, commentId: CommentId): BlockModel<{
    comments: Record<CommentId, boolean>;
}>[];
export declare function findAllCommentedElements(store: Store): (GfxPrimitiveElementModel<import("@blocksuite/std/gfx").BaseElementProps> & {
    comments: Record<CommentId, boolean>;
})[];
export declare function findCommentedElements(store: Store, commentId: CommentId): (GfxPrimitiveElementModel<import("@blocksuite/std/gfx").BaseElementProps> & {
    comments: Record<CommentId, boolean>;
})[];
export declare const blockCommentToolbarButton: Omit<ToolbarAction, 'id'>;
//# sourceMappingURL=utils.d.ts.map