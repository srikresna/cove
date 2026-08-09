import type { Row, SingleView } from '../view-manager/index.js';
import type { Sort } from './types.js';
export declare const Compare: {
    readonly GT: "GT";
    readonly LT: "LT";
};
export type CompareType = keyof typeof Compare | number;
export declare const evalSort: (sort: Sort, view: SingleView) => ((rowA: Row, rowB: Row) => number) | undefined;
//# sourceMappingURL=eval.d.ts.map