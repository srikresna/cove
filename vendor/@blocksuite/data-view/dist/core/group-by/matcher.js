import { createIdentifier } from '@blocksuite/global/di';
import { Matcher_ } from '../logical/matcher.js';
import { groupByMatchers } from './define.js';
export const createGroupByMatcher = (list) => {
    return new Matcher_(list, v => v.matchType);
};
export const findGroupByConfigByName = (dataSource, name) => {
    const svc = getGroupByService(dataSource);
    const all = [
        ...svc.allExternalGroupByConfig(),
        ...groupByMatchers,
    ];
    return all.find(c => c.name === name);
};
export class GroupByService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    allExternalGroupByConfig() {
        return Array.from(this.dataSource.provider.getAll(ExternalGroupByConfigProvider).values());
    }
    get matcher() {
        return createGroupByMatcher([
            ...this.allExternalGroupByConfig(),
            ...groupByMatchers,
        ]);
    }
}
export const GroupByProvider = createIdentifier('group-by-service');
export const getGroupByService = (dataSource) => {
    return dataSource.serviceGetOrCreate(GroupByProvider, () => new GroupByService(dataSource));
};
export const ExternalGroupByConfigProvider = createIdentifier('external-group-by-config');
