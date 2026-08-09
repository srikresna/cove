import type { TypeInstance } from '../logical/type.js';
import type { GroupByConfig } from './types.js';
export declare const createGroupByConfig: <Data extends Record<string, unknown>, MatchType extends TypeInstance, GroupValue = unknown>(config: GroupByConfig<Data, MatchType, GroupValue>) => GroupByConfig;
export declare const ungroups: {
    key: string;
    value: null;
};
export declare const groupByMatchers: GroupByConfig[];
//# sourceMappingURL=define.d.ts.map