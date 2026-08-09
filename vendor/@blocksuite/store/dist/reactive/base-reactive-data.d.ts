import * as Y from 'yjs';
import type { ProxyOptions } from './types';
export declare abstract class BaseReactiveYData<T, YSource extends Y.AbstractType<any>> {
    protected _getOrigin: (doc: Y.Doc) => {
        doc: Y.Doc;
        proxy: true;
        target: BaseReactiveYData<any, any>;
    };
    protected _onObserve: (event: Y.YEvent<any>, handler: () => void) => void;
    protected abstract readonly _options?: ProxyOptions<T>;
    protected abstract readonly _proxy: T;
    protected _skipNext: boolean;
    protected abstract readonly _source: T;
    protected readonly _stashed: Set<string | number>;
    protected _transact: (doc: Y.Doc, fn: () => void) => void;
    protected _updateWithSkip: (fn: () => void) => void;
    protected abstract readonly _ySource: YSource;
    get proxy(): T;
    abstract pop(prop: string | number): void;
    abstract stash(prop: string | number): void;
}
//# sourceMappingURL=base-reactive-data.d.ts.map