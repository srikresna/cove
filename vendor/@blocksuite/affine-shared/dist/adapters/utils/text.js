import isEqual from 'lodash-es/isEqual';
const mergeDeltas = (acc, cur, options = { force: false }) => {
    if (acc.length === 0) {
        return [cur];
    }
    const last = acc[acc.length - 1];
    if (options?.force) {
        last.insert = last.insert + cur.insert;
        last.attributes = Object.create(null);
        return acc;
    }
    else if (typeof last.insert === 'string' &&
        typeof cur.insert === 'string' &&
        (isEqual(last.attributes, cur.attributes) ||
            (last.attributes === undefined && cur.attributes === undefined))) {
        last.insert += cur.insert;
        return acc;
    }
    return [...acc, cur];
};
const isNullish = (value) => value === null || value === undefined;
const createText = (s) => {
    return {
        '$blocksuite:internal:text$': true,
        delta: s.length === 0 ? [] : [{ insert: s }],
    };
};
const isText = (o) => {
    if (typeof o === 'object' &&
        o !== null &&
        '$blocksuite:internal:text$' in o) {
        return o['$blocksuite:internal:text$'] === true;
    }
    return false;
};
function toURLSearchParams(params) {
    if (!params)
        return;
    const items = Object.entries(params)
        .filter(([_, v]) => !isNullish(v))
        .filter(([_, v]) => {
        if (typeof v === 'string') {
            return v.length > 0;
        }
        if (Array.isArray(v)) {
            return v.length > 0;
        }
        return false;
    })
        .map(([k, v]) => [k, Array.isArray(v) ? v.filter(v => v.length) : v]);
    return new URLSearchParams(items
        .filter(([_, v]) => v.length)
        .map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v]));
}
function generateDocUrl(docBaseUrl, pageId, params) {
    const search = toURLSearchParams(params);
    const query = search?.size ? `?${search.toString()}` : '';
    const url = docBaseUrl ? `${docBaseUrl}/${pageId}${query}` : '';
    return url;
}
export const AdapterTextUtils = {
    mergeDeltas,
    isNullish,
    createText,
    isText,
    toURLSearchParams,
    generateDocUrl,
};
