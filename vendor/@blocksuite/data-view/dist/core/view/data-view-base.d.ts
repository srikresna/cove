import type { DatabaseAllViewEvents, EventTraceFn } from '@blocksuite/affine-shared/services';
import type { UniComponent } from '@blocksuite/affine-shared/types';
import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { DisposableMember } from '@blocksuite/global/disposable';
import { type EventName, ShadowlessElement, type UIEventHandler } from '@blocksuite/std';
import type { DataViewRootUILogic } from '../data-view.js';
import type { DataViewSelection } from '../types.js';
import type { SingleView } from '../view-manager/single-view.js';
import type { DataViewWidget } from '../widget/index.js';
import type { DataViewInstance, DataViewProps } from './types.js';
declare const DataViewBase_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare abstract class DataViewBase<Selection extends DataViewSelection = DataViewSelection> extends DataViewBase_base {
    abstract expose: DataViewInstance;
    accessor props: DataViewProps<Selection>;
}
declare const DataViewUIBase_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare abstract class DataViewUIBase<Logic extends DataViewUILogicBase = DataViewUILogicBase> extends DataViewUIBase_base {
    accessor logic: Logic;
}
export declare abstract class DataViewUILogicBase<T extends SingleView = SingleView, Selection extends DataViewSelection = DataViewSelection> {
    readonly root: DataViewRootUILogic;
    readonly view: T;
    constructor(root: DataViewRootUILogic, view: T);
    get headerWidget(): DataViewWidget | undefined;
    bindHotkey(hotkeys: Record<string, UIEventHandler>): DisposableMember;
    handleEvent(name: EventName, handler: UIEventHandler): DisposableMember;
    setSelection(selection?: Selection): void;
    selection$: import("@preact/signals-core").ReadonlySignal<Selection | undefined>;
    eventTrace: EventTraceFn<DatabaseAllViewEvents>;
    abstract clearSelection: () => void;
    abstract addRow: (position: InsertToPosition) => string | undefined;
    abstract focusFirstCell: () => void;
    abstract showIndicator: (evt: MouseEvent) => boolean;
    abstract hideIndicator: () => void;
    abstract moveTo: (id: string, evt: MouseEvent) => void;
    abstract renderer: UniComponent<{
        logic: DataViewUILogicBase<T, Selection>;
    }>;
}
type Constructor<T extends abstract new (...args: any) => any> = new (...args: ConstructorParameters<T>) => InstanceType<T>;
export type DataViewUILogicBaseConstructor = Constructor<typeof DataViewUILogicBase>;
export {};
//# sourceMappingURL=data-view-base.d.ts.map