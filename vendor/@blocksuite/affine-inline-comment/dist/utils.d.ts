import type { CommentId } from '@blocksuite/affine-shared/services';
import type { AffineTextAttributes } from '@blocksuite/affine-shared/types';
import { TextSelection } from '@blocksuite/std';
import type { DeltaInsert, Store } from '@blocksuite/store';
export declare function findAllCommentedTexts(store: Store): Map<TextSelection, CommentId>;
export declare function findCommentedTexts(store: Store, commentId: CommentId): TextSelection[];
export declare function extractCommentIdFromDelta(delta: DeltaInsert<AffineTextAttributes>): string[];
//# sourceMappingURL=utils.d.ts.map