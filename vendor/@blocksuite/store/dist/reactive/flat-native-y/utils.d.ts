import type { UnRecord } from '../types';
export declare const keyWithoutPrefix: (key: string) => string;
export declare const keyWithPrefix: (key: string) => string;
export declare function isProxy(value: unknown): boolean;
export declare function markProxy(value: UnRecord): UnRecord;
export declare function isEmptyObject(obj: UnRecord): boolean;
export declare function deleteEmptyObject(obj: UnRecord, key: string, parent: UnRecord): void;
export declare function getFirstKey(key: string): string;
export declare function bindOnChangeIfNeed(value: unknown, onChange: () => void): void;
//# sourceMappingURL=utils.d.ts.map