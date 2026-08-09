import type { ExtensionType } from '@blocksuite/store';
import type { ReadonlySignal } from '@preact/signals-core';
import type { AffineUserInfo } from './types';
export interface UserListService {
    users$: ReadonlySignal<AffineUserInfo[]>;
    isLoading$: ReadonlySignal<boolean>;
    searchText$: ReadonlySignal<string>;
    hasMore$: ReadonlySignal<boolean>;
    loadMore(): void;
    search(keyword: string): void;
}
export declare const UserListProvider: import("@blocksuite/global/di").ServiceIdentifier<UserListService> & (<U extends UserListService = UserListService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare function UserListServiceExtension(service: UserListService): ExtensionType;
//# sourceMappingURL=user-list-service.d.ts.map