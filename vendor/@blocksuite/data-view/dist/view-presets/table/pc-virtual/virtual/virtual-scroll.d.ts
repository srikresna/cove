import { type ReadonlySignal } from '@preact/signals-core';
import { BatchTaskManager } from './batch-task-manager';
import { VirtualElementWrapper } from './virtual-cell';
export interface Disposable {
    dispose(): void;
}
export declare class NodeLifeCycle implements Disposable {
    disposables: (() => void)[];
    init(): void;
    isDisposed: boolean;
    dispose(): void;
}
export declare class GridNode<Data> extends NodeLifeCycle {
    private readonly initData;
    private _data?;
    get data(): Data;
    constructor(initData: () => Data);
}
export declare class CacheManager<K, V extends Disposable> {
    readonly keyToString: (key: K) => string;
    constructor(keyToString: (key: K) => string);
    protected readonly cache: Map<string, V>;
    getOrCreate(key: K, create: () => V): V;
    has(key: K): boolean;
    delete(key: K): void;
    clear(): void;
    cleanup(activeKeys: Set<string>): void;
}
export declare abstract class VirtualScroll extends NodeLifeCycle {
    readonly container: VirtualScrollContainer;
    constructor(containerOptions: VirtualScrollOptions);
    dispose(): void;
}
export declare class GridCell<GroupData, RowData, CellData> extends GridNode<CellData> {
    readonly row: GridRow<GroupData, RowData, CellData>;
    readonly columnId: string;
    readonly renderTask: {
        cancel: () => void;
        show: () => void;
        hide: () => void;
    };
    readonly element: VirtualElementWrapper;
    readonly columnIndex$: ReadonlySignal<number>;
    private readonly realHeight$;
    readonly contentHeight$: ReadonlySignal<number | undefined>;
    private readonly columnPosition$;
    readonly height$: ReadonlySignal<number | undefined>;
    readonly width$: ReadonlySignal<number | undefined>;
    readonly left$: ReadonlySignal<number | undefined>;
    readonly top$: ReadonlySignal<number | undefined>;
    readonly right$: ReadonlySignal<number | undefined>;
    readonly bottom$: ReadonlySignal<number | undefined>;
    get rowIndex$(): ReadonlySignal<number>;
    get grid(): GridVirtualScroll<GroupData, RowData, CellData>;
    constructor(row: GridRow<GroupData, RowData, CellData>, columnId: string, createElement: (cell: GridCell<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement, initCellData: (cell: GridCell<GroupData, RowData, CellData>) => CellData);
    isVisible$: ReadonlySignal<boolean>;
    checkRender(): void;
    updateHeight(height: number): void;
    dispose(): void;
}
export declare class GridRow<GroupData, RowData, CellData> extends GridNode<RowData> {
    readonly group: GridGroup<GroupData, RowData, CellData>;
    readonly rowId: string;
    cells$: ReadonlySignal<GridCell<GroupData, RowData, CellData>[]>;
    rowIndex$: ReadonlySignal<number>;
    prevRow$: ReadonlySignal<GridRow<GroupData, RowData, CellData> | undefined>;
    get grid(): GridVirtualScroll<GroupData, RowData, CellData>;
    top$: ReadonlySignal<number | undefined>;
    bottom$: ReadonlySignal<number | undefined>;
    height$: ReadonlySignal<number | undefined>;
    constructor(group: GridGroup<GroupData, RowData, CellData>, rowId: string, initRowData: (row: GridRow<GroupData, RowData, CellData>) => RowData);
    dispose(): void;
}
export declare class GroupNode<GroupData, RowData, CellData> extends NodeLifeCycle {
    readonly group: GridGroup<GroupData, RowData, CellData>;
    readonly top$: ReadonlySignal<number | undefined>;
    readonly visibleCheck: (node: GroupNode<GroupData, RowData, CellData>) => boolean;
    readonly renderTask: {
        cancel: () => void;
        show: () => void;
        hide: () => void;
    };
    readonly height$: import("@preact/signals-core").Signal<number | undefined>;
    readonly bottom$: ReadonlySignal<number | undefined>;
    constructor(group: GridGroup<GroupData, RowData, CellData>, top$: ReadonlySignal<number | undefined>, content: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement, visibleCheck: (node: GroupNode<GroupData, RowData, CellData>) => boolean);
    get container(): VirtualScrollContainer;
    isVisible$: ReadonlySignal<boolean>;
    checkRender(): void;
}
export declare class GridGroup<GroupData, RowData, CellData> extends GridNode<GroupData> {
    readonly grid: GridVirtualScroll<GroupData, RowData, CellData>;
    readonly groupId: string;
    readonly topElement: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement;
    readonly bottomElement: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement;
    top$: ReadonlySignal<number | undefined>;
    topNode: GroupNode<GroupData, RowData, CellData>;
    lastRowBottom$: ReadonlySignal<number | undefined>;
    bottomNode: GroupNode<GroupData, RowData, CellData>;
    rows$: ReadonlySignal<GridRow<GroupData, RowData, CellData>[]>;
    groupIndex$: ReadonlySignal<number>;
    prevGroup$: ReadonlySignal<GridGroup<GroupData, RowData, CellData> | undefined>;
    get rowsTop$(): ReadonlySignal<number | undefined>;
    get bottomNodeTop$(): ReadonlySignal<number | undefined>;
    height$: ReadonlySignal<number | undefined>;
    bottom$: ReadonlySignal<number | undefined>;
    constructor(grid: GridVirtualScroll<GroupData, RowData, CellData>, groupId: string, topElement: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement, bottomElement: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement, initGroupData: (group: GridGroup<GroupData, RowData, CellData>) => GroupData);
    dispose(): void;
}
export interface GridGroupData {
    id: string;
    rows: string[];
}
export interface GridVirtualScrollOptions<GroupData, RowData, CellData> extends VirtualScrollOptions {
    initGroupData: (group: GridGroup<GroupData, RowData, CellData>) => GroupData;
    initRowData: (row: GridRow<GroupData, RowData, CellData>) => RowData;
    initCellData: (cell: GridCell<GroupData, RowData, CellData>) => CellData;
    columns$: ReadonlySignal<{
        id: string;
        width: number;
    }[]>;
    fixedRowHeight$: ReadonlySignal<number | undefined>;
    createGroup: {
        top: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement;
        bottom: (group: GridGroup<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement;
    };
    createCell: (cell: GridCell<GroupData, RowData, CellData>, wrapper: VirtualElementWrapper) => HTMLElement;
    groups$: ReadonlySignal<GridGroupData[]>;
}
export declare class GridVirtualScroll<GroupData, RowData, CellData> extends VirtualScroll {
    readonly options: GridVirtualScrollOptions<GroupData, RowData, CellData>;
    readonly cellsCache: CacheManager<{
        groupId: string;
        columnId: string;
        rowId: string;
    }, GridCell<GroupData, RowData, CellData>>;
    readonly rowsCache: CacheManager<{
        groupId: string;
        rowId: string;
    }, GridRow<GroupData, RowData, CellData>>;
    readonly groupsCache: CacheManager<string, GridGroup<GroupData, RowData, CellData>>;
    readonly groups$: ReadonlySignal<GridGroup<GroupData, RowData, CellData>[]>;
    constructor(options: GridVirtualScrollOptions<GroupData, RowData, CellData>);
    getOrCreateRow(group: GridGroup<GroupData, RowData, CellData>, rowId: string): GridRow<GroupData, RowData, CellData>;
    getGroup(groupId: string): GridGroup<GroupData, RowData, CellData>;
    getRow(groupId: string, rowId: string): GridRow<GroupData, RowData, CellData>;
    getCell(groupId: string, rowId: string, columnId: string): GridCell<GroupData, RowData, CellData>;
    getOrCreateCell(row: GridRow<GroupData, RowData, CellData>, columnId: string): GridCell<GroupData, RowData, CellData>;
    getOrCreateGroup(groupId: string): GridGroup<GroupData, RowData, CellData>;
    private listenDataChange;
    lastGroupBottom$: ReadonlySignal<number | undefined>;
    dispose(): void;
    get columns$(): ReadonlySignal<{
        id: string;
        width: number;
    }[]>;
    get fixedRowHeight$(): ReadonlySignal<number | undefined>;
    columnPosition$: ReadonlySignal<{
        left: number;
        right: number;
        width: number;
    }[]>;
    totalWidth$: ReadonlySignal<number>;
    get content(): HTMLElement;
    init(): void;
    private listenSizeChange;
}
export interface VirtualScrollOptions {
    xScrollContainer?: HTMLElement;
    yScrollContainer?: HTMLElement;
}
export declare const getScrollContainer: (element: HTMLElement, direction: "x" | "y") => HTMLElement | undefined;
export declare class VirtualScrollContainer {
    private readonly options;
    private xScrollContainer?;
    private readonly xScrollContainerWidth$;
    private yScrollContainer?;
    private readonly yScrollContainerHeight$;
    readonly content: HTMLElement;
    readonly scrollTop$: import("@preact/signals-core").Signal<number>;
    readonly scrollLeft$: import("@preact/signals-core").Signal<number>;
    private readonly disposables;
    private readonly preloadSize;
    private readonly offsetTop$;
    private readonly offsetLeft$;
    readonly viewport$: ReadonlySignal<{
        width: number;
        height: number;
        top: number;
        bottom: number;
        left: number;
        right: number;
    }>;
    constructor(options: VirtualScrollOptions);
    init(): void;
    private getOffset;
    private updateOffsetTask?;
    private updateOffset;
    private listenScroll;
    private listenResize;
    readonly batchTaskManager: BatchTaskManager;
    initElement(element: HTMLElement, isInit: ReadonlySignal<boolean>): {
        cancel: () => void;
        show: () => void;
        hide: () => void;
    };
    dispose(): void;
    updateContentSize(width: number, height: number): void;
    scrollToPosition(x: number, y: number, behavior?: ScrollBehavior): void;
}
export interface ListVirtualScrollOptions extends VirtualScrollOptions {
    itemCount: number;
    itemHeight: number | ((index: number) => number);
}
export declare class ListVirtualScroll extends VirtualScroll {
    protected itemCount: number;
    protected itemHeight: number | ((index: number) => number);
    constructor(options: ListVirtualScrollOptions);
    private updateTotalSize;
}
//# sourceMappingURL=virtual-scroll.d.ts.map