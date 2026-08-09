import { createIdentifier } from '@blocksuite/global/di';
export const SidebarExtensionIdentifier = createIdentifier('AffineSidebarExtension');
export const SidebarExtension = (service) => ({
    setup: di => {
        di.addImpl(SidebarExtensionIdentifier, () => service);
    },
});
