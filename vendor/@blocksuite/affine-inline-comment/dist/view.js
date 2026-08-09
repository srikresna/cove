import { ViewExtensionProvider, } from '@blocksuite/affine-ext-loader';
import z from 'zod';
import { effects } from './effects';
import { InlineCommentManager } from './inline-comment-manager';
import { CommentInlineSpecExtension, NullCommentInlineSpecExtension, } from './inline-spec';
const optionsSchema = z.object({
    enabled: z.boolean().optional().default(true),
});
export class InlineCommentViewExtension extends ViewExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-inline-comment';
        this.schema = optionsSchema;
    }
    effect() {
        super.effect();
        effects();
    }
    setup(context, options) {
        super.setup(context, options);
        context.register([
            options?.enabled
                ? CommentInlineSpecExtension
                : NullCommentInlineSpecExtension,
            InlineCommentManager,
        ]);
    }
}
