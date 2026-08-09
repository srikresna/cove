import type { DisposableMember } from '@blocksuite/global/disposable';
import type { BaseSelection, ExtensionType } from '@blocksuite/store';
export type CommentId = string;
/**
 * The `CommentProvider` is an interface used to connect external comment services
 * with in-editor comment operations and rendering.
 * All comment-related actions within the editor are routed through
 * this interface to make external requests, and the editor is notified via callbacks.
 * In essence, it follows the flow: BlockSuite -> AFFiNE -> BlockSuite.
 */
export interface CommentProvider {
    addComment: (selections: BaseSelection[]) => void;
    resolveComment: (id: CommentId) => void;
    highlightComment: (id: CommentId | null) => void;
    getComments: (type: 'resolved' | 'unresolved' | 'all') => Promise<CommentId[]> | CommentId[];
    onCommentAdded: (callback: (id: CommentId, selections: BaseSelection[]) => void) => DisposableMember;
    onCommentResolved: (callback: (id: CommentId) => void) => DisposableMember;
    onCommentDeleted: (callback: (id: CommentId) => void) => DisposableMember;
    onCommentHighlighted: (callback: (id: CommentId | null) => void) => DisposableMember;
}
export declare const CommentProviderIdentifier: import("@blocksuite/global/di").ServiceIdentifier<CommentProvider> & (<U extends CommentProvider = CommentProvider>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const CommentProviderExtension: (provider: CommentProvider) => ExtensionType;
//# sourceMappingURL=comment-provider.d.ts.map