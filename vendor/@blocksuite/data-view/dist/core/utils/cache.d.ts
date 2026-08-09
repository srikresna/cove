import { type ReadonlySignal } from '@preact/signals-core';
export declare const cacheComputed: <T>(ids: ReadonlySignal<string[]>, create: (id: string) => T) => {
    getOrCreate: (id: string) => T;
    list: ReadonlySignal<T[]>;
};
//# sourceMappingURL=cache.d.ts.map