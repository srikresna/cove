import { DisposableGroup } from '@blocksuite/global/disposable';
import { Subject } from 'rxjs';
import type { BlockStdScope } from '../scope/std-scope';
import { LifeCycleWatcher } from './lifecycle-watcher';
export declare class EditorLifeCycleExtension extends LifeCycleWatcher {
    readonly std: BlockStdScope;
    static key: string;
    disposables: DisposableGroup;
    readonly slots: {
        created: Subject<void>;
        mounted: Subject<void>;
        rendered: Subject<void>;
        unmounted: Subject<void>;
    };
    constructor(std: BlockStdScope);
    created(): void;
    mounted(): void;
    rendered(): void;
    unmounted(): void;
}
//# sourceMappingURL=editor-life-cycle.d.ts.map