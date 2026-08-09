import groupBy from 'lodash-es/groupBy';
import maxBy from 'lodash-es/maxBy';
export function getMostCommonValue(records, field) {
    const grouped = groupBy(records, record => record[field]);
    const values = Object.values(grouped);
    const record = maxBy(values, records => records.length)?.[0];
    return record?.[field];
}
export function getMostCommonResolvedValue(records, field, resolve) {
    return getMostCommonValue(records.map(record => ({ [field]: resolve(record[field]) })), String(field));
}
