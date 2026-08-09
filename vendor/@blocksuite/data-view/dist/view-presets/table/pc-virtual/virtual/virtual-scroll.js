import { computed, effect, signal, } from '@preact/signals-core';
import { BatchTaskManager } from './batch-task-manager';
import { VirtualElementWrapper } from './virtual-cell';
export class NodeLifeCycle {
    constructor() {
        this.disposables = [];
        this.isDisposed = false;
    }
    init() { }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;
        this.disposables.forEach(disposable => disposable());
    }
}
export class GridNode extends NodeLifeCycle {
    get data() {
        if (!this._data) {
            this._data = this.initData();
        }
        return this._data;
    }
    constructor(initData) {
        super();
        this.initData = initData;
    }
}
export class CacheManager {
    constructor(keyToString) {
        this.keyToString = keyToString;
        this.cache = new Map();
    }
    getOrCreate(key, create) {
        const stringKey = this.keyToString(key);
        let value = this.cache.get(stringKey);
        if (!value) {
            value = create();
            this.cache.set(stringKey, value);
        }
        return value;
    }
    has(key) {
        return this.cache.has(this.keyToString(key));
    }
    delete(key) {
        const value = this.cache.get(this.keyToString(key));
        if (value) {
            value.dispose();
            this.cache.delete(this.keyToString(key));
        }
    }
    clear() {
        for (const value of this.cache.values()) {
            value.dispose();
        }
        this.cache.clear();
    }
    cleanup(activeKeys) {
        const toDelete = [];
        for (const key of this.cache.keys()) {
            if (!activeKeys.has(key)) {
                toDelete.push(key);
            }
        }
        for (const key of toDelete) {
            this.cache.get(key)?.dispose();
            this.cache.delete(key);
        }
    }
}
export class VirtualScroll extends NodeLifeCycle {
    constructor(containerOptions) {
        super();
        this.container = new VirtualScrollContainer(containerOptions);
    }
    dispose() {
        super.dispose();
        this.container.dispose();
    }
}
export class GridCell extends GridNode {
    get rowIndex$() {
        return this.row.rowIndex$;
    }
    get grid() {
        return this.row.grid;
    }
    constructor(row, columnId, createElement, initCellData) {
        super(() => initCellData(this));
        this.row = row;
        this.columnId = columnId;
        this.columnIndex$ = computed(() => {
            return this.row.grid.columns$.value.findIndex(column => column.id === this.columnId);
        });
        this.realHeight$ = signal();
        this.contentHeight$ = computed(() => {
            return this.realHeight$.value;
        });
        this.columnPosition$ = computed(() => {
            return this.row.grid.columnPosition$.value[this.columnIndex$.value];
        });
        this.height$ = computed(() => this.grid.fixedRowHeight$.value ?? this.contentHeight$.value);
        this.width$ = computed(() => this.columnPosition$.value?.width);
        this.left$ = computed(() => this.columnPosition$.value?.left);
        this.top$ = computed(() => this.row.top$.value);
        this.right$ = computed(() => {
            return this.columnPosition$.value?.right;
        });
        this.bottom$ = computed(() => {
            const top = this.top$.value;
            if (top == null) {
                return;
            }
            const height = this.height$.value;
            if (height == null) {
                return;
            }
            return top + height;
        });
        this.isVisible$ = computed(() => {
            const height = this.realHeight$.value;
            if (height == null) {
                return false;
            }
            const offsetTop = this.top$.value;
            if (offsetTop == null) {
                return false;
            }
            const offsetBottom = this.bottom$.value;
            if (offsetBottom == null) {
                return false;
            }
            const offsetLeft = this.left$.value ?? 0;
            const offsetRight = this.right$.value ?? 0;
            const viewport = this.grid.container.viewport$.value;
            const xInView = offsetRight >= viewport.left && offsetLeft <= viewport.right;
            const yInView = offsetBottom >= viewport.top && offsetTop <= viewport.bottom;
            const isVisible = xInView && yInView;
            return isVisible;
        });
        this.element = new VirtualElementWrapper();
        this.element.rect = {
            left$: this.left$,
            top$: this.top$,
            width$: this.width$,
            height$: this.row.height$,
        };
        this.element.updateHeight = height => this.updateHeight(height);
        this.element.element = createElement(this, this.element);
        const isInit = computed(() => {
            return this.height$.value != null;
        });
        this.renderTask = this.grid.container.initElement(this.element, isInit);
        const cancel = effect(() => {
            if (isInit.value && !this.isVisible$.peek()) {
                this.renderTask.hide();
                cancel();
            }
        });
        this.disposables.push(cancel);
        this.disposables.push(effect(() => {
            this.checkRender();
        }));
    }
    checkRender() {
        const isVisible = this.isVisible$.value;
        if (isVisible && !this.element.isConnected) {
            this.renderTask.show();
        }
        else if (!isVisible && this.element.isConnected) {
            this.renderTask.hide();
        }
    }
    updateHeight(height) {
        this.realHeight$.value = height;
    }
    dispose() {
        super.dispose();
        this.renderTask.cancel();
        this.element.remove();
    }
}
export class GridRow extends GridNode {
    get grid() {
        return this.group.grid;
    }
    constructor(group, rowId, initRowData) {
        super(() => initRowData(this));
        this.group = group;
        this.rowId = rowId;
        this.cells$ = computed(() => {
            return this.grid.columns$.value.map(column => {
                return this.grid.getOrCreateCell(this, column.id);
            });
        });
        this.rowIndex$ = computed(() => {
            return this.group.rows$.value.findIndex(row => row.rowId === this.rowId);
        });
        this.prevRow$ = computed(() => {
            return this.group.rows$.value[this.rowIndex$.value - 1];
        });
        this.top$ = computed(() => {
            const prevRow = this.prevRow$.value;
            if (!prevRow) {
                return this.group.rowsTop$.value;
            }
            return prevRow.bottom$.value;
        });
        this.bottom$ = computed(() => {
            const top = this.top$.value;
            if (top == null) {
                return;
            }
            const height = this.height$.value;
            if (height == null) {
                return;
            }
            return top + height;
        });
        this.height$ = computed(() => {
            const fixedRowHeight = this.grid.fixedRowHeight$.value;
            if (fixedRowHeight != null) {
                return fixedRowHeight;
            }
            const cells = this.cells$.value
                .map(cell => cell.height$.value)
                .filter(v => v != null);
            if (cells.length > 0) {
                return Math.max(...cells);
            }
            return;
        });
    }
    dispose() {
        super.dispose();
    }
}
export class GroupNode extends NodeLifeCycle {
    constructor(group, top$, content, visibleCheck) {
        super();
        this.group = group;
        this.top$ = top$;
        this.visibleCheck = visibleCheck;
        this.height$ = signal();
        this.bottom$ = computed(() => {
            const top = this.top$.value;
            const height = this.height$.value;
            if (top == null) {
                return;
            }
            if (height == null) {
                return;
            }
            return top + height;
        });
        this.isVisible$ = computed(() => {
            return this.visibleCheck(this);
        });
        const element = new VirtualElementWrapper();
        element.rect = {
            left$: signal(0),
            top$,
            width$: signal(),
            height$: this.height$,
        };
        element.element = content(this.group, element);
        element.updateHeight = height => {
            this.height$.value = height;
        };
        const isInit = computed(() => {
            return this.height$.value != null;
        });
        this.renderTask = this.container.initElement(element, isInit);
        const cancel = effect(() => {
            if (isInit.value && !this.isVisible$.peek()) {
                this.renderTask.hide();
                cancel();
            }
        });
        this.disposables.push(effect(() => {
            this.checkRender();
        }));
    }
    get container() {
        return this.group.grid.container;
    }
    checkRender() {
        const isVisible = this.isVisible$.value;
        if (isVisible) {
            this.renderTask.show();
        }
        else {
            this.renderTask.hide();
        }
    }
}
export class GridGroup extends GridNode {
    get rowsTop$() {
        return this.topNode.bottom$;
    }
    get bottomNodeTop$() {
        return this.lastRowBottom$;
    }
    constructor(grid, groupId, topElement, bottomElement, initGroupData) {
        super(() => initGroupData(this));
        this.grid = grid;
        this.groupId = groupId;
        this.topElement = topElement;
        this.bottomElement = bottomElement;
        this.top$ = computed(() => {
            const prevGroup = this.prevGroup$.value;
            if (!prevGroup) {
                return 0;
            }
            return prevGroup.bottom$.value;
        });
        this.topNode = new GroupNode(this, this.top$, this.topElement, node => {
            const height = node.height$.value;
            if (height == null) {
                return false;
            }
            const top = this.top$.value;
            if (top == null) {
                return false;
            }
            const bottom = this.lastRowBottom$.value ?? top + height;
            const groupInView = top < this.grid.container.viewport$.value.bottom &&
                bottom > this.grid.container.viewport$.value.top;
            return groupInView;
        });
        this.lastRowBottom$ = computed(() => {
            if (this.rows$.value.length === 0) {
                return this.rowsTop$.value;
            }
            const lastRow = this.rows$.value.findLast(row => row.bottom$.value != null);
            if (lastRow == null) {
                return;
            }
            return lastRow.bottom$.value;
        });
        this.bottomNode = new GroupNode(this, this.lastRowBottom$, this.bottomElement, node => {
            const height = node.height$.value;
            if (height == null) {
                return false;
            }
            const top = this.lastRowBottom$.value;
            if (top == null) {
                return false;
            }
            const bottom = top + height;
            const groupInView = top < this.grid.container.viewport$.value.bottom &&
                bottom > this.grid.container.viewport$.value.top;
            return groupInView;
        });
        this.rows$ = computed(() => {
            const group = this.grid.options.groups$.value.find(g => g.id === this.groupId);
            if (!group) {
                return [];
            }
            return group.rows.map(rowId => {
                return this.grid.getOrCreateRow(this, rowId);
            });
        });
        this.groupIndex$ = computed(() => {
            return this.grid.groups$.value.findIndex(group => group.groupId === this.groupId);
        });
        this.prevGroup$ = computed(() => {
            return this.grid.groups$.value[this.groupIndex$.value - 1];
        });
        this.height$ = computed(() => {
            const bottom = this.bottom$.value;
            if (bottom == null) {
                return;
            }
            const top = this.top$.value;
            if (top == null) {
                return;
            }
            return bottom - top;
        });
        this.bottom$ = computed(() => {
            return this.bottomNode.bottom$.value;
        });
    }
    dispose() {
        super.dispose();
    }
}
export class GridVirtualScroll extends VirtualScroll {
    constructor(options) {
        super(options);
        this.options = options;
        this.cellsCache = new CacheManager(cell => `${cell.groupId}-${cell.rowId}-${cell.columnId}`);
        this.rowsCache = new CacheManager(row => `${row.groupId}-${row.rowId}`);
        this.groupsCache = new CacheManager(groupId => groupId);
        this.groups$ = computed(() => {
            return this.options.groups$.value.map(group => {
                return this.getOrCreateGroup(group.id);
            });
        });
        this.lastGroupBottom$ = computed(() => {
            const lastGroup = this.groups$.value.findLast(group => group.bottom$.value != null);
            if (lastGroup == null) {
                return;
            }
            return lastGroup.bottom$.value;
        });
        this.columnPosition$ = computed(() => {
            const columns = this.options.columns$.value;
            const positions = [];
            let left = 0;
            for (const column of columns) {
                positions.push({
                    left,
                    right: left + column.width,
                    width: column.width,
                });
                left += column.width ?? 0;
            }
            return positions;
        });
        this.totalWidth$ = computed(() => {
            const lastPosition = this.columnPosition$.value[this.columnPosition$.value.length - 1];
            if (lastPosition == null) {
                return 0;
            }
            return lastPosition.right;
        });
    }
    getOrCreateRow(group, rowId) {
        return this.rowsCache.getOrCreate({ groupId: group.groupId, rowId }, () => {
            return new GridRow(group, rowId, this.options.initRowData);
        });
    }
    getGroup(groupId) {
        return this.getOrCreateGroup(groupId);
    }
    getRow(groupId, rowId) {
        const group = this.getOrCreateGroup(groupId);
        return this.getOrCreateRow(group, rowId);
    }
    getCell(groupId, rowId, columnId) {
        const row = this.getRow(groupId, rowId);
        return this.getOrCreateCell(row, columnId);
    }
    getOrCreateCell(row, columnId) {
        return this.cellsCache.getOrCreate({ groupId: row.group.groupId, rowId: row.rowId, columnId }, () => {
            return new GridCell(row, columnId, this.options.createCell, this.options.initCellData);
        });
    }
    getOrCreateGroup(groupId) {
        return this.groupsCache.getOrCreate(groupId, () => {
            return new GridGroup(this, groupId, this.options.createGroup.top, this.options.createGroup.bottom, this.options.initGroupData);
        });
    }
    listenDataChange() {
        this.disposables.push(effect(() => {
            const activeGroupIds = new Set();
            const activeRowIds = new Set();
            const activeCellIds = new Set();
            for (const group of this.groups$.value) {
                activeGroupIds.add(group.groupId);
                for (const row of group.rows$.value) {
                    const rowKey = this.rowsCache.keyToString({
                        groupId: group.groupId,
                        rowId: row.rowId,
                    });
                    activeRowIds.add(rowKey);
                    for (const cell of row.cells$.value) {
                        const cellKey = this.cellsCache.keyToString({
                            groupId: group.groupId,
                            rowId: row.rowId,
                            columnId: cell.columnId,
                        });
                        activeCellIds.add(cellKey);
                    }
                }
            }
            this.cellsCache.cleanup(activeCellIds);
            this.rowsCache.cleanup(activeRowIds);
            this.groupsCache.cleanup(activeGroupIds);
        }));
    }
    dispose() {
        super.dispose();
        this.cellsCache.clear();
        this.rowsCache.clear();
        this.groupsCache.clear();
    }
    get columns$() {
        return this.options.columns$;
    }
    get fixedRowHeight$() {
        return this.options.fixedRowHeight$;
    }
    get content() {
        return this.container.content;
    }
    init() {
        super.init();
        this.container.init();
        this.listenSizeChange();
        this.listenDataChange();
    }
    listenSizeChange() {
        this.disposables.push(effect(() => {
            const width = this.totalWidth$.value ?? 0;
            const height = this.lastGroupBottom$.value ?? 0;
            this.container.updateContentSize(width, height);
        }));
    }
}
export const getScrollContainer = (element, direction) => {
    let current = element;
    while (current) {
        const overflow = current
            .computedStyleMap()
            .get(`overflow-${direction}`)
            ?.toString();
        if (overflow === 'auto' || overflow === 'scroll') {
            return current;
        }
        current = current.parentElement;
    }
    return;
};
export class VirtualScrollContainer {
    constructor(options) {
        this.xScrollContainerWidth$ = signal(0);
        this.yScrollContainerHeight$ = signal(0);
        this.content = document.createElement('div');
        this.scrollTop$ = signal(0);
        this.scrollLeft$ = signal(0);
        this.disposables = [];
        this.preloadSize = signal({
            left: 100,
            right: 100,
            top: 100,
            bottom: 100,
        });
        this.offsetTop$ = signal(0);
        this.offsetLeft$ = signal(0);
        this.viewport$ = computed(() => {
            const preloadSize = this.preloadSize.value;
            const offsetTop = this.offsetTop$.value;
            const offsetLeft = this.offsetLeft$.value;
            const scrollTop = this.scrollTop$.value;
            const scrollLeft = this.scrollLeft$.value;
            const xScrollContainerWidth = this.xScrollContainerWidth$.value;
            const yScrollContainerHeight = this.yScrollContainerHeight$.value;
            const top = scrollTop - offsetTop - preloadSize.top;
            const height = yScrollContainerHeight + preloadSize.top + preloadSize.bottom;
            const bottom = top + height;
            const left = scrollLeft - offsetLeft - preloadSize.left;
            const width = xScrollContainerWidth + preloadSize.left + preloadSize.right;
            const right = left + width;
            return {
                width,
                height,
                top,
                bottom,
                left,
                right,
            };
        });
        this.batchTaskManager = new BatchTaskManager([5, 50], 50);
        this.options = {
            ...options,
        };
    }
    init() {
        this.content.style.position = 'relative';
        this.content.style.overflow = 'hidden';
        this.xScrollContainer =
            this.options.xScrollContainer ??
                getScrollContainer(this.content, 'x') ??
                document.body;
        this.yScrollContainer =
            this.options.yScrollContainer ??
                getScrollContainer(this.content, 'y') ??
                document.body;
        this.listenScroll();
        this.listenResize();
        this.updateOffset();
    }
    getOffset(container, content, direction) {
        let current = content;
        let offset = 0;
        while (current) {
            offset += current[`offset${direction}`];
            current =
                current.offsetParent instanceof HTMLElement
                    ? current.offsetParent
                    : null;
            if (current === container) {
                return offset;
            }
        }
        return;
    }
    updateOffset() {
        if (this.updateOffsetTask) {
            clearTimeout(this.updateOffsetTask);
            this.updateOffsetTask = undefined;
        }
        if (this.yScrollContainer) {
            this.offsetTop$.value =
                this.getOffset(this.yScrollContainer, this.content, 'Top') ?? 0;
        }
        if (this.xScrollContainer) {
            this.offsetLeft$.value =
                this.getOffset(this.xScrollContainer, this.content, 'Left') ?? 0;
        }
        this.updateOffsetTask = setTimeout(() => {
            this.updateOffsetTask = undefined;
            this.updateOffset();
        }, 1000);
    }
    listenScroll() {
        const handlerX = () => {
            this.scrollLeft$.value = this.xScrollContainer?.scrollLeft ?? 0;
        };
        const handlerY = () => {
            this.scrollTop$.value = this.yScrollContainer?.scrollTop ?? 0;
        };
        this.yScrollContainer?.addEventListener('scroll', handlerY);
        this.xScrollContainer?.addEventListener('scroll', handlerX);
        this.disposables.push(() => {
            this.yScrollContainer?.removeEventListener('scroll', handlerY);
            this.xScrollContainer?.removeEventListener('scroll', handlerX);
        });
    }
    listenResize() {
        if (this.xScrollContainer) {
            const handlerX = () => {
                this.xScrollContainerWidth$.value =
                    this.xScrollContainer?.clientWidth ?? 0;
            };
            const resizeObserver = new ResizeObserver(handlerX);
            resizeObserver.observe(this.xScrollContainer);
            this.disposables.push(() => {
                resizeObserver.disconnect();
            });
        }
        if (this.yScrollContainer) {
            const handlerY = () => {
                this.yScrollContainerHeight$.value =
                    this.yScrollContainer?.clientHeight ?? 0;
            };
            const resizeObserver = new ResizeObserver(handlerY);
            resizeObserver.observe(this.yScrollContainer);
            this.disposables.push(() => {
                resizeObserver.disconnect();
            });
        }
    }
    initElement(element, isInit) {
        const initTask = this.batchTaskManager.newTask();
        initTask.updateTask(0, () => {
            if (element.isConnected || isInit.value) {
                return false;
            }
            this.content.append(element);
            return;
        }, true);
        const task = this.batchTaskManager.newTask();
        return {
            cancel: () => {
                initTask.cancel();
                task.cancel();
            },
            show: () => {
                task.updateTask(1, () => {
                    if (element.isConnected) {
                        return false;
                    }
                    this.content.append(element);
                    return;
                });
            },
            hide: () => {
                task.updateTask(1, () => {
                    if (!element.isConnected) {
                        return false;
                    }
                    element.remove();
                    return;
                });
            },
        };
    }
    dispose() {
        this.batchTaskManager.clean();
        this.disposables.forEach(disposable => disposable());
    }
    updateContentSize(width, height) {
        this.content.style.width = `${width}px`;
        this.content.style.height = `${height}px`;
    }
    scrollToPosition(x, y, behavior = 'auto') {
        this.xScrollContainer?.scrollTo({
            left: x,
            behavior,
        });
        this.yScrollContainer?.scrollTo({
            top: y,
            behavior,
        });
    }
}
export class ListVirtualScroll extends VirtualScroll {
    constructor(options) {
        super(options);
        this.itemCount = options.itemCount;
        this.itemHeight = options.itemHeight;
        this.updateTotalSize();
    }
    updateTotalSize() { }
}
