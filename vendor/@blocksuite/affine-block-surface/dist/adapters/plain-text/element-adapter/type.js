import { createIdentifier, } from '@blocksuite/global/di';
export const ElementToPlainTextAdapterMatcherIdentifier = createIdentifier('elementToPlainTextAdapterMatcher');
export function ElementToPlainTextAdapterExtension(matcher) {
    const identifier = ElementToPlainTextAdapterMatcherIdentifier(matcher.name);
    return {
        setup: di => {
            di.addImpl(identifier, () => matcher);
        },
        identifier,
    };
}
