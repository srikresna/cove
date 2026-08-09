import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { latexDeltaMarkdownAdapterMatch, latexDeltaToMarkdownAdapterMatcher, markdownInlineMathToDeltaMatcher, } from './adapters';
export class LatexStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-latex-inline';
    }
    setup(context) {
        super.setup(context);
        context.register(latexDeltaMarkdownAdapterMatch);
        context.register(latexDeltaToMarkdownAdapterMatcher);
        context.register(markdownInlineMathToDeltaMatcher);
    }
}
