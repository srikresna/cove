import { Subject } from 'rxjs';
import { StoreExtension } from '../store-extension';
import type { BaseSelection } from './base';
import type { SelectionConstructor } from './types';
export declare class StoreSelectionExtension extends StoreExtension {
    static readonly key = "selection";
    private readonly _id;
    private _selectionConstructors;
    private readonly _selections;
    private readonly _remoteSelections;
    private readonly _itemAdded;
    private readonly _itemPopped;
    private readonly _jsonToSelection;
    slots: {
        changed: Subject<BaseSelection[]>;
        remoteChanged: Subject<Map<number, BaseSelection[]>>;
    };
    loaded(): void;
    disposed(): void;
    get value(): BaseSelection[];
    get remoteSelections(): Map<number, BaseSelection[]>;
    clear(types?: string[]): void;
    create<T extends SelectionConstructor>(Type: T, ...args: ConstructorParameters<T>): InstanceType<T>;
    getGroup(group: string): BaseSelection[];
    filter<T extends SelectionConstructor>(type: T): InstanceType<T>[];
    filter$<T extends SelectionConstructor>(type: T): import("@preact/signals-core").ReadonlySignal<InstanceType<T>[]>;
    find<T extends SelectionConstructor>(type: T): InstanceType<T> | undefined;
    find$<T extends SelectionConstructor>(type: T): import("@preact/signals-core").ReadonlySignal<InstanceType<T> | undefined>;
    set(selections: BaseSelection[]): void;
    setGroup(group: string, selections: BaseSelection[]): void;
    clearRemote(): void;
    update(fn: (currentSelections: BaseSelection[]) => BaseSelection[]): void;
    fromJSON(json: Record<string, unknown>[]): void;
}
//# sourceMappingURL=selection-extension.d.ts.map