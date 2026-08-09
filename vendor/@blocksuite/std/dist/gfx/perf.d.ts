/**
 * Measure operation cost via Performance API when available.
 *
 * Marks are always cleared, while measure entries are intentionally retained
 * so callers can inspect them from Performance tools.
 */
export declare const measureOperation: <T>(name: string, fn: () => T) => T;
//# sourceMappingURL=perf.d.ts.map