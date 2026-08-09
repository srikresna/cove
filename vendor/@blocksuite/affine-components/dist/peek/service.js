import { createIdentifier } from '@blocksuite/global/di';
export const PeekViewProvider = createIdentifier('AffinePeekViewProvider');
export function PeekViewExtension(service) {
    return {
        setup: di => {
            di.override(PeekViewProvider, () => service);
        },
    };
}
