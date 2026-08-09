import { InlineDeltaToMarkdownAdapterExtension } from '@blocksuite/affine-shared/adapters';
export const latexDeltaToMarkdownAdapterMatcher = InlineDeltaToMarkdownAdapterExtension({
    name: 'inlineLatex',
    match: delta => !!delta.attributes?.latex,
    toAST: delta => {
        const mdast = {
            type: 'text',
            value: delta.insert,
        };
        if (delta.attributes?.latex) {
            return {
                type: 'inlineMath',
                value: delta.attributes.latex,
            };
        }
        return mdast;
    },
});
