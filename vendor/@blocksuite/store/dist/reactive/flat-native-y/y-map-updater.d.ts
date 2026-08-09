import type { CreateProxyOptions } from './types';
type YMapOptions = Pick<CreateProxyOptions, 'shouldByPassYjs' | 'yMap' | 'initialized' | 'onChange'> & {
    fullPath: string;
    value: unknown;
};
export declare function yMapUpdater({ shouldByPassYjs, yMap, initialized, onChange, fullPath, value, }: YMapOptions): void;
export {};
//# sourceMappingURL=y-map-updater.d.ts.map