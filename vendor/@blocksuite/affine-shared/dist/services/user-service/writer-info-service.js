import { createIdentifier } from '@blocksuite/global/di';
export const WriterInfoProvider = createIdentifier('affine-writer-info-service');
export function WriterInfoServiceExtension(service) {
    return {
        setup(di) {
            di.addImpl(WriterInfoProvider, () => service);
        },
    };
}
