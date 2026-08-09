import type { SlashMenuActionItem, SlashMenuConfig, SlashMenuContext, SlashMenuItem, SlashMenuSubMenu } from './types';
export declare function isActionItem(item: SlashMenuItem): item is SlashMenuActionItem;
export declare function isSubMenuItem(item: SlashMenuItem): item is SlashMenuSubMenu;
export declare function slashItemClassName({ name }: SlashMenuItem): string;
export declare function parseGroup(group: NonNullable<SlashMenuItem['group']>): readonly [number, string, number];
export declare function buildSlashMenuItems(items: SlashMenuItem[], context: SlashMenuContext, transform?: (item: SlashMenuItem) => SlashMenuItem): SlashMenuItem[];
export declare function mergeSlashMenuConfigs(configs: Map<string, SlashMenuConfig>): SlashMenuConfig;
export declare function formatDate(date: Date): string;
export declare function formatTime(date: Date): string;
//# sourceMappingURL=utils.d.ts.map