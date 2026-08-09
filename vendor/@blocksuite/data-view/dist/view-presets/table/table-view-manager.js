import { insertPositionToIndex, } from '@blocksuite/affine-shared/utils';
import { computed } from '@preact/signals-core';
import { evalFilter } from '../../core/filter/eval.js';
import { generateDefaultValues } from '../../core/filter/generate-default-values.js';
import { FilterTrait, filterTraitKey } from '../../core/filter/trait.js';
import { emptyFilterGroup } from '../../core/filter/utils.js';
import { GroupTrait, groupTraitKey, sortByManually, } from '../../core/group-by/trait.js';
import { fromJson } from '../../core/property/utils';
import { SortManager, sortTraitKey } from '../../core/sort/manager.js';
import { PropertyBase } from '../../core/view-manager/property.js';
import { RowBase } from '../../core/view-manager/row.js';
import { SingleViewBase, } from '../../core/view-manager/single-view.js';
import { DEFAULT_COLUMN_MIN_WIDTH, DEFAULT_COLUMN_WIDTH } from './consts.js';
export const materializeColumnsByPropertyIds = (columns, propertyIds, getDefaultWidth = () => DEFAULT_COLUMN_WIDTH) => {
    const needShow = new Set(propertyIds);
    const orderedColumns = [];
    for (const column of columns) {
        if (needShow.has(column.id)) {
            orderedColumns.push(column);
            needShow.delete(column.id);
        }
    }
    for (const id of needShow) {
        orderedColumns.push({ id, width: getDefaultWidth(id), hide: undefined });
    }
    return orderedColumns;
};
export const materializeTableColumns = (columns, propertyIds, getDefaultWidth) => {
    const nextColumns = materializeColumnsByPropertyIds(columns, propertyIds, getDefaultWidth);
    const unchanged = columns.length === nextColumns.length &&
        columns.every((column, index) => {
            const nextColumn = nextColumns[index];
            return (nextColumn != null &&
                column.id === nextColumn.id &&
                column.hide === nextColumn.hide);
        });
    return unchanged ? columns : nextColumns;
};
export class TableSingleView extends SingleViewBase {
    get groupProperties() {
        return this.data$.value?.groupProperties ?? [];
    }
    get name() {
        return this.data$.value?.name ?? '';
    }
    get type() {
        return this.data$.value?.mode ?? 'table';
    }
    isShow(rowId) {
        if (this.filter$.value?.conditions.length) {
            const rowMap = Object.fromEntries(this.propertiesRaw$.value.map(column => [
                column.id,
                column.cellGetOrCreate(rowId).jsonValue$.value,
            ]));
            return evalFilter(this.filter$.value, rowMap);
        }
        return true;
    }
    propertyGetOrCreate(columnId) {
        return new TableProperty(this, columnId);
    }
    rowGetOrCreate(rowId) {
        return new TableRow(this, rowId);
    }
    rowAdd(insertPosition, groupKey) {
        const id = super.rowAdd(insertPosition);
        const filter = this.filter$.value;
        if (filter.conditions.length > 0) {
            const defaultValues = generateDefaultValues(filter, this.vars$.value);
            Object.entries(defaultValues).forEach(([propertyId, jsonValue]) => {
                const property = this.propertyGetOrCreate(propertyId);
                const propertyMeta = property.meta$.value;
                if (propertyMeta) {
                    const value = fromJson(propertyMeta.config, {
                        value: jsonValue,
                        data: property.data$.value,
                        dataSource: this.dataSource,
                    });
                    this.cellGetOrCreate(id, propertyId).valueSet(value);
                }
            });
        }
        if (groupKey && id) {
            this.groupTrait.addToGroup(id, groupKey);
        }
        return id;
    }
    rowsMapping(rows) {
        return this.sortManager.sort(super.rowsMapping(rows));
    }
    materializeColumns() {
        const data = this.data$.value;
        if (!data) {
            return;
        }
        const nextColumns = materializeTableColumns(data.columns, this.dataSource.properties$.value, id => this.propertyGetOrCreate(id).width$.value);
        if (nextColumns === data.columns) {
            return;
        }
        this.dataUpdate(() => ({ columns: nextColumns }));
    }
    constructor(viewManager, viewId) {
        super(viewManager, viewId);
        this.propertiesRaw$ = computed(() => {
            const needShow = new Set(this.dataSource.properties$.value);
            const result = [];
            this.data$.value?.columns.forEach(v => {
                if (needShow.has(v.id)) {
                    result.push(v.id);
                    needShow.delete(v.id);
                }
            });
            result.push(...needShow);
            return result.map(id => this.propertyGetOrCreate(id));
        });
        this.properties$ = computed(() => {
            return this.propertiesRaw$.value.filter(property => !property.hide$.value);
        });
        this.filter$ = computed(() => {
            return this.data$.value?.filter ?? emptyFilterGroup;
        });
        this.groupBy$ = computed(() => {
            return this.data$.value?.groupBy;
        });
        this.sortList$ = computed(() => {
            return this.data$.value?.sort;
        });
        this.sortManager = this.traitSet(sortTraitKey, new SortManager(this.sortList$, this, {
            setSortList: sortList => {
                this.dataUpdate(data => {
                    return {
                        sort: {
                            ...data.sort,
                            ...sortList,
                        },
                    };
                });
            },
        }));
        this.detailProperties$ = computed(() => {
            return this.propertiesRaw$.value.filter(property => property.type$.value !== 'title');
        });
        this.filterTrait = this.traitSet(filterTraitKey, new FilterTrait(this.filter$, this, {
            filterSet: (filter) => {
                this.dataUpdate(() => {
                    return {
                        filter,
                    };
                });
            },
        }));
        this.groupTrait = this.traitSet(groupTraitKey, new GroupTrait(this.groupBy$, this, {
            groupBySet: groupBy => {
                this.dataUpdate(() => {
                    return {
                        groupBy,
                    };
                });
            },
            sortGroup: (ids, asc) => {
                const sorted = sortByManually(ids, v => v, this.groupProperties.map(v => v.key));
                // If descending order is requested, reverse the sorted array
                return asc === false ? sorted.reverse() : sorted;
            },
            sortRow: (key, rows) => {
                const property = this.groupProperties.find(v => v.key === key);
                return sortByManually(rows, v => v.rowId, property?.manuallyCardSort ?? []);
            },
            changeGroupSort: keys => {
                const map = new Map(this.groupProperties.map(v => [v.key, v]));
                this.dataUpdate(() => {
                    return {
                        groupProperties: keys.map(key => {
                            const property = map.get(key);
                            if (property) {
                                return property;
                            }
                            return {
                                key,
                                hide: false,
                                manuallyCardSort: [],
                            };
                        }),
                    };
                });
            },
            changeRowSort: (groupKeys, groupKey, keys) => {
                const map = new Map(this.groupProperties.map(v => [v.key, v]));
                this.dataUpdate(() => {
                    return {
                        groupProperties: groupKeys.map(key => {
                            if (key === groupKey) {
                                const group = map.get(key);
                                return group
                                    ? {
                                        ...group,
                                        manuallyCardSort: keys,
                                    }
                                    : {
                                        key,
                                        hide: false,
                                        manuallyCardSort: keys,
                                    };
                            }
                            else {
                                return (map.get(key) ?? {
                                    key,
                                    hide: false,
                                    manuallyCardSort: [],
                                });
                            }
                        }),
                    };
                });
            },
            changeGroupHide: (key, hide) => {
                this.dataUpdate(() => {
                    const list = [...this.groupProperties];
                    const idx = list.findIndex(g => g.key === key);
                    if (idx >= 0) {
                        const target = list[idx];
                        if (!target) {
                            return { groupProperties: list };
                        }
                        list[idx] = { ...target, hide };
                    }
                    else {
                        const order = (this.groupTrait.groupsDataListAll$.value ?? [])
                            .map(g => g?.key)
                            .filter((k) => !!k);
                        let insertPos = 0;
                        for (const k of order) {
                            if (k === key)
                                break;
                            if (list.some(g => g.key === k))
                                insertPos++;
                        }
                        list.splice(insertPos, 0, { key, hide, manuallyCardSort: [] });
                    }
                    return { groupProperties: list };
                });
            },
        }));
        this.mainProperties$ = computed(() => {
            return (this.data$.value?.header ?? {
                titleColumn: this.propertiesRaw$.value.find(property => property.type$.value === 'title')?.id,
                iconColumn: 'type',
            });
        });
        this.readonly$ = computed(() => {
            return this.manager.readonly$.value;
        });
        this.computedProperties$ = computed(() => {
            return this.propertiesRaw$.value.map(property => {
                return {
                    id: property.id,
                    hide: property.hide$.value,
                    width: property.width$.value,
                    statCalcType: property.statCalcOp$.value,
                };
            });
        });
        // Materialize view columns on view activation so newly added properties
        // can participate in hide/order operations in table.
        queueMicrotask(() => {
            this.materializeColumns();
        });
    }
}
export class TableProperty extends PropertyBase {
    hideSet(hide) {
        this.viewDataUpdate(data => {
            return {
                ...data,
                hide,
            };
        });
    }
    move(position) {
        this.tableView.dataUpdate(() => {
            const columnIndex = this.tableView.computedProperties$.value.findIndex(v => v.id === this.id);
            if (columnIndex < 0) {
                return {};
            }
            const columns = [...this.tableView.computedProperties$.value];
            const [column] = columns.splice(columnIndex, 1);
            if (!column)
                return {};
            const index = insertPositionToIndex(position, columns);
            columns.splice(index, 0, column);
            return {
                columns,
            };
        });
    }
    get minWidth() {
        return this.meta$.value?.config.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
    }
    constructor(tableView, columnId) {
        super(tableView, columnId);
        this.tableView = tableView;
        this.hide$ = computed(() => {
            const hideFromViewData = this.viewData$.value?.hide;
            if (hideFromViewData != null) {
                return hideFromViewData;
            }
            const defaultShow = this.meta$.value?.config.fixed?.defaultShow;
            if (defaultShow != null) {
                return !defaultShow;
            }
            return false;
        });
        this.statCalcOp$ = computed(() => {
            return this.viewData$.value?.statCalcType;
        });
        this.width$ = computed(() => {
            const column = this.viewData$.value;
            if (column?.width != null) {
                return column.width;
            }
            const type = this.type$.value;
            if (type === 'title') {
                return 260;
            }
            return DEFAULT_COLUMN_WIDTH;
        });
        this.viewData$ = computed(() => {
            return this.tableView.data$.value?.columns.find(v => v.id === this.id);
        });
    }
    viewDataUpdate(updater) {
        this.tableView.dataUpdate(data => {
            return {
                ...data,
                columns: this.tableView.computedProperties$.value.map(v => v.id === this.id ? { ...v, ...updater(v) } : v),
            };
        });
    }
    updateStatCalcOp(type) {
        this.viewDataUpdate(data => {
            return {
                ...data,
                statCalcType: type,
            };
        });
    }
    updateWidth(width) {
        this.viewDataUpdate(data => {
            return {
                ...data,
                width,
            };
        });
    }
}
export class TableRow extends RowBase {
    move(position, fromGroup, toGroup) {
        if (toGroup == null) {
            super.move(position);
            return;
        }
        this.tableView.groupTrait.moveCardTo(this.rowId, fromGroup, toGroup, position);
    }
    constructor(tableView, rowId) {
        super(tableView, rowId);
        this.tableView = tableView;
    }
}
