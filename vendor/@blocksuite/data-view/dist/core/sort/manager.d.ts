import { type ReadonlySignal } from '@preact/signals-core';
import type { Row, SingleView } from '../view-manager/index.js';
import type { Sort, SortBy } from './types.js';
export declare class SortManager {
    readonly sort$: ReadonlySignal<Sort | undefined>;
    readonly view: SingleView;
    private readonly ops;
    hasSort$: ReadonlySignal<boolean>;
    setSortList: (sortList: SortBy[]) => void;
    sort: (rows: Row[]) => Row[];
    sortList$: ReadonlySignal<SortBy[]>;
    constructor(sort$: ReadonlySignal<Sort | undefined>, view: SingleView, ops: {
        setSortList: (sortList: Sort) => void;
    });
}
export declare const sortTraitKey: import("../traits/key.js").TraitKey<SortManager>;
//# sourceMappingURL=manager.d.ts.map