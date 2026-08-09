import { InlineDeltaToPlainTextAdapterExtension, } from '@blocksuite/affine-shared/adapters';
export const latexDeltaMarkdownAdapterMatch = InlineDeltaToPlainTextAdapterExtension({
    name: 'inlineLatex',
    match: delta => !!delta.attributes?.latex,
    toAST: delta => {
        const node = {
            content: delta.insert,
        };
        if (!delta.attributes?.latex) {
            return node;
        }
        return {
            content: delta.attributes?.latex,
        };
    },
});
