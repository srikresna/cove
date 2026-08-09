import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { LatexBlockSchemaExtension } from '@blocksuite/affine-model';
import { LatexBlockAdapterExtensions } from './adapters/extension';
import { LatexMarkdownPreprocessorExtension } from './adapters/markdown/preprocessor';
export class LatexStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-latex-block';
    }
    setup(context) {
        super.setup(context);
        context.register([LatexBlockSchemaExtension]);
        context.register(LatexBlockAdapterExtensions);
        context.register(LatexMarkdownPreprocessorExtension);
    }
}
