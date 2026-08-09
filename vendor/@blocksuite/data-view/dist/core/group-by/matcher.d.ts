import type { DataSource } from '../data-source/base.js';
import { Matcher_ } from '../logical/matcher.js';
import type { GroupByConfig } from './types.js';
export declare const createGroupByMatcher: (list: GroupByConfig[]) => Matcher_<GroupByConfig, import("../index.js").TypeInstance>;
export declare const findGroupByConfigByName: (dataSource: DataSource, name: string) => GroupByConfig | undefined;
export declare class GroupByService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    allExternalGroupByConfig(): GroupByConfig[];
    get matcher(): Matcher_<GroupByConfig, import("../index.js").TypeInstance>;
}
export declare const GroupByProvider: import("@blocksuite/global/di").ServiceIdentifier<GroupByService> & (<U extends GroupByService = GroupByService>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
export declare const getGroupByService: (dataSource: DataSource) => GroupByService;
export declare const ExternalGroupByConfigProvider: import("@blocksuite/global/di").ServiceIdentifier<GroupByConfig> & (<U extends GroupByConfig = GroupByConfig>(variant: import("@blocksuite/global/di").ServiceVariant) => import("@blocksuite/global/di").ServiceIdentifier<U>);
//# sourceMappingURL=matcher.d.ts.map