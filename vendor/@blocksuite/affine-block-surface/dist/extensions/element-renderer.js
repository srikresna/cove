import { createIdentifier, } from '@blocksuite/global/di';
export const ElementRendererIdentifier = createIdentifier('element-renderer');
export const ElementRendererExtension = (id, renderer) => {
    const identifier = ElementRendererIdentifier(id);
    return {
        setup: di => {
            di.addImpl(identifier, () => renderer);
        },
        identifier,
    };
};
