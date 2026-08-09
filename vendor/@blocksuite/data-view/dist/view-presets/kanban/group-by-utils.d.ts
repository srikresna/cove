import type { GroupBy } from '../../core/common/types.js';
import type { DataSource } from '../../core/data-source/base.js';
export declare const getKanbanDefaultHideEmpty: (groupName?: string) => boolean;
export declare const canGroupable: (dataSource: DataSource, propertyId: string) => boolean;
export declare const pickKanbanGroupColumn: (dataSource: DataSource, propertyIds?: string[]) => string | undefined;
export declare const ensureKanbanGroupColumn: (dataSource: DataSource) => string | undefined;
export declare const resolveKanbanGroupBy: (dataSource: DataSource, current?: GroupBy) => GroupBy | undefined;
//# sourceMappingURL=group-by-utils.d.ts.map