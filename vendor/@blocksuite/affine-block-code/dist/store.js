import { StoreExtensionProvider, } from '@blocksuite/affine-ext-loader';
import { CodeBlockSchemaExtension } from '@blocksuite/affine-model';
import { CodeBlockAdapterExtensions } from './adapters/extension';
import { CodeMarkdownPreprocessorExtension } from './adapters/markdown/preprocessor';
export class CodeStoreExtension extends StoreExtensionProvider {
    constructor() {
        super(...arguments);
        this.name = 'affine-code-block';
    }
    setup(context) {
        super.setup(context);
        context.register(CodeBlockSchemaExtension);
        context.register(CodeBlockAdapterExtensions);
        context.register(CodeMarkdownPreprocessorExtension);
    }
}
