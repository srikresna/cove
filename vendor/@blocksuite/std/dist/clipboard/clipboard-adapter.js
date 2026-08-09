import { createIdentifier } from '@blocksuite/global/di';
export const ClipboardAdapterConfigIdentifier = createIdentifier('clipboard-adapter-config');
export function ClipboardAdapterConfigExtension(config) {
    return {
        setup: di => {
            di.addImpl(ClipboardAdapterConfigIdentifier(config.mimeType), () => config);
        },
    };
}
