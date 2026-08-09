import { AdapterTextUtils, InlineDeltaToPlainTextAdapterExtension, } from '@blocksuite/affine-shared/adapters';
export const referenceDeltaMarkdownAdapterMatch = InlineDeltaToPlainTextAdapterExtension({
    name: 'reference',
    match: delta => !!delta.attributes?.reference,
    toAST: (delta, context) => {
        const node = {
            content: delta.insert,
        };
        const reference = delta.attributes?.reference;
        if (!reference) {
            return node;
        }
        const { configs } = context;
        const title = configs.get(`title:${reference.pageId}`) ?? '';
        const url = AdapterTextUtils.generateDocUrl(configs.get('docLinkBaseUrl') ?? '', String(reference.pageId), reference.params ?? Object.create(null));
        const content = `${title ? `${title}: ` : ''}${url}`;
        return {
            content,
        };
    },
});
