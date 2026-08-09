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
import { SingleViewBase } from '../../core/view-manager/single-view.js';
import { getKanbanDefaultHideEmpty, resolveKanbanGroupBy, } from './group-by-utils.js';
const materializeColumnsByPropertyIds = (columns, propertyIds) => {
    const needShow = new Set(propertyIds);
    const orderedColumns = [];
    for (const column of columns) {
        if (needShow.has(column.id)) {
            orderedColumns.push(column);
            needShow.delete(column.id);
        }
    }
    for (const id of needShow) {
        orderedColumns.push({ id });
    }
    return orderedColumns;
};
export const materializeKanbanColumns = (columns, propertyIds) => {
    const nextColumns = materializeColumnsByPropertyIds(columns, propertyIds);
    const unchanged = columns.length === nextColumns.length &&
        columns.every((column, index) => {
            const nextColumn = nextColumns[index];
            return (nextColumn != null &&
                column.id === nextColumn.id &&
                column.hide === nextColumn.hide);
        });
    return unchanged ? columns : nextColumns;
};
export class KanbanSingleView extends SingleViewBase {
    get columns() {
        return this.propertiesRaw$.value.filter(property => !property.hide$.value);
    }
    get filter() {
        return this.view?.filter ?? emptyFilterGroup;
    }
    get header() {
        return this.view?.header;
    }
    get type() {
        return this.view?.mode ?? 'kanban';
    }
    materializeColumns() {
        const view = this.view;
        if (!view) {
            return;
        }
        const nextColumns = materializeKanbanColumns(view.columns, this.dataSource.properties$.value);
        if (nextColumns === view.columns) {
            return;
        }
        this.dataUpdate(() => ({ columns: nextColumns }));
    }
    get view() {
        return this.data$.value;
    }
    addCard(position, group) {
        const id = this.rowAdd(position);
        this.groupTrait.addToGroup(id, group);
        const filter = this.filter$.value;
        if (filter.conditions.length > 0) {
            const defaultValues = generateDefaultValues(filter, this.vars$.value);
            Object.entries(defaultValues).forEach(([propertyId, jsonValue]) => {
                const property = this.propertyGetOrCreate(propertyId);
                const propertyMeta = property.meta$.value;
                if (!propertyMeta) {
                    return;
                }
                const value = fromJson(propertyMeta.config, {
                    value: jsonValue,
                    data: property.data$.value,
                    dataSource: this.dataSource,
                });
                this.cellGetOrCreate(id, propertyId).valueSet(value);
            });
        }
        return id;
    }
    getHeaderCover(_rowId) {
        const columnId = this.view?.header.coverColumn;
        if (!columnId) {
            return;
        }
        return this.propertyGetOrCreate(columnId);
    }
    getHeaderIcon(_rowId) {
        const columnId = this.view?.header.iconColumn;
        if (!columnId) {
            return;
        }
        return this.propertyGetOrCreate(columnId);
    }
    getHeaderTitle(_rowId) {
        const columnId = this.view?.header.titleColumn;
        if (!columnId) {
            return;
        }
        return this.propertyGetOrCreate(columnId);
    }
    hasHeader(_rowId) {
        const hd = this.view?.header;
        if (!hd) {
            return false;
        }
        return !!hd.titleColumn || !!hd.iconColumn || !!hd.coverColumn;
    }
    isInHeader(columnId) {
        const hd = this.view?.header;
        if (!hd) {
            return false;
        }
        return (hd.titleColumn === columnId ||
            hd.iconColumn === columnId ||
            hd.coverColumn === columnId);
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
    rowsMapping(rows) {
        return this.sortManager.sort(super.rowsMapping(rows));
    }
    propertyGetOrCreate(columnId) {
        return new KanbanColumn(this, columnId);
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
        this.detailProperties$ = computed(() => {
            return this.propertiesRaw$.value.filter(property => property.type$.value !== 'title');
        });
        this.filter$ = computed(() => {
            return this.data$.value?.filter ?? emptyFilterGroup;
        });
        this.sortList$ = computed(() => {
            return this.data$.value?.sort;
        });
        this.sortManager = this.traitSet(sortTraitKey, new SortManager(this.sortList$, this, {
            setSortList: sortList => {
                this.dataUpdate(data => ({ sort: { ...data.sort, ...sortList } }));
            },
        }));
        this.filterTrait = this.traitSet(filterTraitKey, new FilterTrait(this.filter$, this, {
            filterSet: filter => {
                this.dataUpdate(() => {
                    return {
                        filter,
                    };
                });
            },
        }));
        this.groupBy$ = computed(() => {
            const groupBy = this.data$.value?.groupBy;
            if (!groupBy || groupBy.hideEmpty != null) {
                return groupBy;
            }
            return {
                ...groupBy,
                hideEmpty: getKanbanDefaultHideEmpty(groupBy.name),
            };
        });
        this.groupTrait = this.traitSet(groupTraitKey, new GroupTrait(this.groupBy$, this, {
            groupBySet: groupBy => {
                const nextGroupBy = resolveKanbanGroupBy(this.manager.dataSource, groupBy);
                this.dataUpdate(() => {
                    return {
                        groupBy: nextGroupBy,
                    };
                });
            },
            sortGroup: (ids, asc) => {
                const sorted = sortByManually(ids, v => v, this.view?.groupProperties.map(v => v.key) ?? []);
                // If descending order is requested, reverse the sorted array
                return asc === false ? sorted.reverse() : sorted;
            },
            sortRow: (key, rows) => {
                if (this.sortManager.hasSort$.value)
                    return rows;
                const property = this.view?.groupProperties.find(v => v.key === key);
                return sortByManually(rows, v => v.rowId, property?.manuallyCardSort ?? []);
            },
            changeGroupSort: keys => {
                const map = new Map(this.view?.groupProperties.map(v => [v.key, v]));
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
                const map = new Map(this.view?.groupProperties.map(v => [v.key, v]));
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
                    const list = [...(this.view?.groupProperties ?? [])];
                    const idx = list.findIndex(g => g.key === key);
                    if (idx >= 0) {
                        const target = list[idx];
                        if (!target) {
                            return { groupProperties: list };
                        }
                        list[idx] = { ...target, hide };
                    }
                    else {
                        // maintain existing order when inserting a new entry
                        const order = (this.groupTrait.groupsDataListAll$.value ?? [])
                            .map(g => g?.key)
                            .filter((k) => typeof k === 'string');
                        let insertPos = 0;
                        for (const k of order) {
                            if (k === key)
                                break;
                            if (list.findIndex(g => g.key === k) !== -1) {
                                insertPos++;
                            }
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
        // Materialize view columns on view activation so newly added properties
        // can participate in hide/order operations in kanban.
        this.materializeColumns();
    }
}
export class KanbanColumn extends PropertyBase {
    move(position) {
        this.kanbanView.dataUpdate(view => {
            const columnIndex = view.columns.findIndex(v => v.id === this.id);
            if (columnIndex < 0) {
                return {};
            }
            const columns = [...view.columns];
            const [column] = columns.splice(columnIndex, 1);
            if (!column) {
                return {};
            }
            const index = insertPositionToIndex(position, columns);
            columns.splice(index, 0, column);
            return {
                columns,
            };
        });
    }
    hideSet(hide) {
        this.viewDataUpdate(data => {
            return {
                ...data,
                hide,
            };
        });
    }
    viewDataUpdate(updater) {
        this.kanbanView.dataUpdate(data => {
            return {
                ...data,
                columns: data.columns.map(v => v.id === this.id ? { ...v, ...updater(v) } : v),
            };
        });
    }
    constructor(kanbanView, columnId) {
        super(kanbanView, columnId);
        this.kanbanView = kanbanView;
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
        this.viewData$ = computed(() => {
            return this.kanbanView.data$.value?.columns.find(v => v.id === this.id);
        });
    }
}
