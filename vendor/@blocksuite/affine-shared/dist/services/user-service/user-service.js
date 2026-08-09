import { createIdentifier } from '@blocksuite/global/di';
export const UserProvider = createIdentifier('affine-user-service');
export function UserServiceExtension(service) {
    return {
        setup(di) {
            di.addImpl(UserProvider, () => service);
        },
    };
}
