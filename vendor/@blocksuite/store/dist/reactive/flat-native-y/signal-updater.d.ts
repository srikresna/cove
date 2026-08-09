import type { CreateProxyOptions } from './types';
type UpdateSignalOptions = Pick<CreateProxyOptions, 'shouldByPassSignal' | 'root' | 'onChange' | 'byPassSignalUpdate' | 'basePath' | 'shouldByPassYjs'> & {
    firstKey: string;
    value: unknown;
    handleNestedUpdate: (signalKey: string) => void;
};
export declare function signalUpdater({ root, firstKey, shouldByPassSignal, byPassSignalUpdate, onChange, basePath, value, handleNestedUpdate, shouldByPassYjs, }: UpdateSignalOptions): void;
export {};
//# sourceMappingURL=signal-updater.d.ts.map