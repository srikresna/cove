import type { Subject } from 'rxjs';
import { type Map as YMap } from 'yjs';
import { BaseReactiveYData } from '../base-reactive-data';
import type { ProxyOptions, UnRecord } from '../types';
import type { OnChange } from './types';
export declare class ReactiveFlatYMap extends BaseReactiveYData<UnRecord, YMap<unknown>> {
    protected readonly _ySource: YMap<unknown>;
    private readonly _onDispose;
    private readonly _onChange?;
    protected readonly _proxy: UnRecord;
    protected readonly _source: UnRecord;
    protected readonly _options?: ProxyOptions<UnRecord>;
    private readonly _initialized;
    private readonly _observer;
    private readonly _transform;
    private readonly _getPropOnChange;
    private _byPassYjs;
    private readonly _getProxy;
    private readonly _updateWithYjsSkip;
    constructor(_ySource: YMap<unknown>, _onDispose: Subject<void>, _onChange?: OnChange | undefined, defaultProps?: Record<string, unknown>);
    pop: (prop: string) => void;
    stash: (prop: string) => void;
}
//# sourceMappingURL=index.d.ts.map