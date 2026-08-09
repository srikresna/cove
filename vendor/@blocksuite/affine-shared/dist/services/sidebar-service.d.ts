import type { ExtensionType } from '@blocksuite/store';
export interface SidebarService {
    open: (tabId?: string) => void;
    close: () => void;
    getTabIds: () => string[];
}
export declare const SidebarExtensionIdentifier: import("@blocksuite/global/di").ServiceIdentifier<SidebarService> & (<U extends SidebarService = SidebarService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const SidebarExtension: (service: SidebarService) => ExtensionType;
//# sourceMappingURL=sidebar-service.d.ts.map