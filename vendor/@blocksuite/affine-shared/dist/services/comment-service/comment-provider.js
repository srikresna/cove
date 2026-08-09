import { createIdentifier } from '@blocksuite/global/di';
export const CommentProviderIdentifier = createIdentifier('comment-provider');
export const CommentProviderExtension = (provider) => {
    return {
        setup: di => {
            di.addImpl(CommentProviderIdentifier, provider);
        },
    };
};
