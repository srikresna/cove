import { createIdentifier } from '@blocksuite/global/di';
export const GfxViewInteractionIdentifier = createIdentifier('GfxViewInteraction');
export function GfxViewInteractionExtension(viewType, config) {
    return {
        setup(di) {
            di.addImpl(GfxViewInteractionIdentifier(viewType), () => config);
        },
    };
}
