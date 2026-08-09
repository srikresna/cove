import type { UnRecord } from '../types';
import type { CreateProxyOptions } from './types';
type InitializeDataOptions = Pick<CreateProxyOptions, 'transform' | 'yMap'> & {
    getProxy: (source: UnRecord, root: UnRecord, path?: string) => UnRecord;
};
export declare const initializeData: ({ getProxy, transform, yMap, }: InitializeDataOptions) => UnRecord;
export {};
//# sourceMappingURL=initialize.d.ts.map