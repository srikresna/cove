import { createIdentifier } from '@blocksuite/global/di';
export const UserListProvider = createIdentifier('affine-user-list-service');
export function UserListServiceExtension(service) {
    return {
        setup(di) {
            di.addImpl(UserListProvider, () => service);
        },
    };
}
