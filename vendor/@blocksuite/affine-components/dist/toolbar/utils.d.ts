import type { BlockStdScope } from '@blocksuite/std';
import type { FatMenuItems, MenuItem, MenuItemGroup, ToolbarMoreMenuConfig } from './types.js';
export declare function groupsToActions<T>(groups: MenuItemGroup<T>[], context: T): MenuItem[][];
export declare function renderActions(fatMenuItems: FatMenuItems, action?: (item: MenuItem) => Promise<void> | void, selectedName?: string): Iterable<unknown>;
export declare function cloneGroups<T>(groups: MenuItemGroup<T>[]): {
    items: import("./types.js").AdvancedMenuItem<T>[];
    type: string;
    when?: ((context: T) => boolean) | undefined;
}[];
export declare function renderGroups<T>(groups: MenuItemGroup<T>[], context: T): Iterable<unknown>;
export declare function renderToolbarSeparator(orientation?: 'horizontal'): import("lit-html").TemplateResult<1>;
export declare function getMoreMenuConfig(std: BlockStdScope): ToolbarMoreMenuConfig;
//# sourceMappingURL=utils.d.ts.map