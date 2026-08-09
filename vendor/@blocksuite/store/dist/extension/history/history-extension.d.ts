import { Subject } from 'rxjs';
import * as Y from 'yjs';
import type { Store } from '../../model';
import { StoreExtension } from '../store-extension';
export declare class HistoryExtension extends StoreExtension {
    static readonly key = "history";
    private readonly _history;
    private readonly _canRedo;
    private readonly _canUndo;
    readonly onUpdated: Subject<void>;
    constructor(store: Store);
    private readonly _updateCanUndoRedoSignals;
    get canRedo(): boolean;
    get canUndo(): boolean;
    get canRedo$(): import("@preact/signals-core").Signal<boolean>;
    get canUndo$(): import("@preact/signals-core").Signal<boolean>;
    get undoManager(): Y.UndoManager;
    loaded(): void;
    private readonly _historyObserver;
    disposed(): void;
}
//# sourceMappingURL=history-extension.d.ts.map