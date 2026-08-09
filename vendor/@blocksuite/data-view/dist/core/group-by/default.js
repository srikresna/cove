import { getGroupByService } from './matcher.js';
export const defaultGroupBy = (dataSource, propertyMeta, propertyId, data) => {
    const groupByService = getGroupByService(dataSource);
    const name = groupByService?.matcher.match(propertyMeta.config.jsonValue.type({ data, dataSource }))?.name;
    return name != null
        ? {
            type: 'groupBy',
            columnId: propertyId,
            name: name,
            hideEmpty: true,
        }
        : undefined;
};
