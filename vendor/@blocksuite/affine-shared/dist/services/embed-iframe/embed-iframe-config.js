import { createIdentifier, } from '@blocksuite/global/di';
export const EmbedIframeConfigIdentifier = createIdentifier('EmbedIframeConfig');
export function EmbedIframeConfigExtension(config) {
    const identifier = EmbedIframeConfigIdentifier(config.name);
    return {
        setup: di => {
            di.addImpl(identifier, () => config);
        },
        identifier,
    };
}
