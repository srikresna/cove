export declare const RELATIVE_ASC: readonly ["last30", "last7", "yesterday", "today", "tomorrow", "next7", "next30"];
export declare const RELATIVE_DESC: ("last30" | "last7" | "yesterday" | "today" | "tomorrow" | "next7" | "next30")[];
/**
 * Sorts relative date keys in chronological order
 */
export declare function sortRelativeKeys(a: string, b: string, asc: boolean): number;
/**
 * Sorts numeric date keys (timestamps)
 */
export declare function sortNumericKeys(a: string, b: string, asc: boolean): number;
export declare function compareDateKeys(mode: string | undefined, asc: boolean): (a: string, b: string) => number;
//# sourceMappingURL=compare-date-keys.d.ts.map