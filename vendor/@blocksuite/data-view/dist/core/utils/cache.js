import { computed } from '@preact/signals-core';
export const cacheComputed = (ids, create) => {
    const cache = new Map();
    const getOrCreate = (id) => {
        if (cache.has(id)) {
            return cache.get(id);
        }
        const value = create(id);
        if (value) {
            cache.set(id, value);
        }
        return value;
    };
    return {
        getOrCreate,
        list: computed(() => {
            const list = ids.value;
            const keys = new Set(cache.keys());
            for (const [cachedId] of cache) {
                keys.delete(cachedId);
            }
            for (const id of keys) {
                cache.delete(id);
            }
            return list.map(id => getOrCreate(id));
        }),
    };
};
