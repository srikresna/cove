import { createIdentifier, } from '@blocksuite/global/di';
export const ElementToMarkdownAdapterMatcherIdentifier = createIdentifier('elementToMarkdownAdapterMatcher');
export function ElementToMarkdownAdapterExtension(matcher) {
    const identifier = ElementToMarkdownAdapterMatcherIdentifier(matcher.name);
    return {
        setup: di => {
            di.addImpl(identifier, () => matcher);
        },
        identifier,
    };
}
