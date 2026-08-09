import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { footnoteReferenceDeltaToMarkdownAdapterMatcher, FootnoteReferenceMarkdownPreprocessorExtension, markdownFootnoteReferenceToDeltaMatcher, } from './adapters';
export class FootnoteStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-footnote-inline';
    }
    setup(context) {
        super.setup(context);
        context.register(markdownFootnoteReferenceToDeltaMatcher);
        context.register(footnoteReferenceDeltaToMarkdownAdapterMatcher);
        context.register(FootnoteReferenceMarkdownPreprocessorExtension);
    }
}
