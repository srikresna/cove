import type { ExtensionType } from '@blocksuite/store';
import type { Signal } from '@preact/signals-core';
import type { AffineUserInfo } from './types';
export interface UserService {
    currentUserInfo$: Signal<AffineUserInfo | null>;
    userInfo$(id: string): Signal<AffineUserInfo | null>;
    isLoading$(id: string): Signal<boolean>;
    error$(id: string): Signal<string | null>;
    revalidateUserInfo(id: string): void;
}
export declare const UserProvider: import("@blocksuite/global/di").ServiceIdentifier<UserService> & (<U extends UserService = UserService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function UserServiceExtension(service: UserService): ExtensionType;
//# sourceMappingURL=user-service.d.ts.map