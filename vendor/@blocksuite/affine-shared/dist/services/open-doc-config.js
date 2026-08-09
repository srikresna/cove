import { createIdentifier } from '@blocksuite/global/di';
import { CenterPeekIcon, ExpandFullIcon } from '@blocksuite/icons/lit';
import {} from '@blocksuite/store';
export const OpenDocExtensionIdentifier = createIdentifier('AffineOpenDocExtension');
const defaultConfig = {
    items: [
        {
            type: 'open-in-active-view',
            label: 'Open this doc',
            icon: ExpandFullIcon(),
        },
        {
            type: 'open-in-center-peek',
            label: 'Open in center peek',
            icon: CenterPeekIcon(),
        },
    ],
};
export const OpenDocExtension = (config) => ({
    setup: di => {
        di.override(OpenDocExtensionIdentifier, () => {
            const allowedOpenDocModes = new Set(config.items.map(item => item.type));
            return {
                isAllowed: (mode) => allowedOpenDocModes.has(mode),
                items: config.items,
            };
        });
    },
});
export const DefaultOpenDocExtension = OpenDocExtension(defaultConfig);
