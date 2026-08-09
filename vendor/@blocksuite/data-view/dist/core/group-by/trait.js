import { insertPositionToIndex, } from '@blocksuite/affine-shared/utils';
import { computed, effect, signal, } from '@preact/signals-core';
import { createTraitKey } from '../traits/key.js';
import { computedLock } from '../utils/lock.js';
import { compareDateKeys } from './compare-date-keys.js';
import { defaultGroupBy } from './default.js';
import { findGroupByConfigByName, getGroupByService } from './matcher.js';
export class Group {
    constructor(key, value, groupInfo, manager) {
        this.key = key;
        this.value = value;
        this.groupInfo = groupInfo;
        this.manager = manager;
        this.rows = [];
        this.name$ = computed(() => {
            const type = this.property.dataType$.value;
            return type ? this.groupInfo.config.groupName(type, this.value) : '';
        });
        this.hide$ = computed(() => {
            const groupHide = this.manager.groupPropertiesMap$.value[this.key]?.hide ?? false;
            const emptyHidden = this.manager.hideEmpty$.value && this.rows.length === 0;
            return groupHide || emptyHidden;
        });
    }
    get property() {
        return this.groupInfo.property;
    }
    get config() {
        return this.groupInfo.config;
    }
    get tType() {
        return this.groupInfo.tType;
    }
    get view() {
        return this.config.view;
    }
    hideSet(hide) {
        this.manager.setGroupHide(this.key, hide);
    }
}
function hasGroupProperties(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    if (!('groupProperties' in data)) {
        return false;
    }
    const value = data.groupProperties;
    return value === undefined || Array.isArray(value);
}
const getOrderedGroupKeys = (keys, groupInfo, sortGroup, sortAsc) => {
    if (groupInfo?.config.matchType.name === 'Date') {
        return [...keys].sort(compareDateKeys(groupInfo.config.name, sortAsc));
    }
    return sortGroup(keys, sortAsc);
};
const applyGroupRowSort = (groups, orderedKeys, sortRow) => {
    orderedKeys.forEach(key => {
        const group = groups[key];
        if (!group) {
            return;
        }
        group.rows = sortRow(key, group.rows);
    });
};
const reorderGroupKeys = (keys, groupKey, position) => {
    const currentIndex = keys.findIndex(key => key === groupKey);
    if (currentIndex < 0) {
        return keys;
    }
    if (typeof position === 'object') {
        if (position.id === groupKey) {
            return keys;
        }
        if (!keys.includes(position.id)) {
            return keys;
        }
    }
    const reordered = [...keys];
    reordered.splice(currentIndex, 1);
    const index = insertPositionToIndex(position, reordered, key => key);
    if (index < 0) {
        return keys;
    }
    reordered.splice(index, 0, groupKey);
    return reordered;
};
export class GroupTrait {
    /**
     * Synchronize sortAsc$ with the GroupBy sort descriptor
     */
    constructor(groupBy$, view, ops) {
        this.groupBy$ = groupBy$;
        this.view = view;
        this.ops = ops;
        this.hideEmpty$ = signal(true);
        this.sortAsc$ = signal(true);
        this.groupProperties$ = computed(() => {
            const data = this.view.data$.value;
            return hasGroupProperties(data) ? (data.groupProperties ?? []) : [];
        });
        this.groupPropertiesMap$ = computed(() => {
            const map = {};
            this.groupProperties$.value.forEach(g => {
                map[g.key] = g;
            });
            return map;
        });
        this.groupInfo$ = computed(() => {
            const groupBy = this.groupBy$.value;
            if (!groupBy)
                return;
            const property = this.view.propertyGetOrCreate(groupBy.columnId);
            if (!property)
                return;
            const tType = property.dataType$.value;
            if (!tType)
                return;
            const svc = getGroupByService(this.view.manager.dataSource);
            const res = groupBy.name != null
                ? (findGroupByConfigByName(this.view.manager.dataSource, groupBy.name) ?? svc?.matcher.match(tType))
                : svc?.matcher.match(tType);
            if (!res)
                return;
            return { config: res, property, tType };
        });
        this.staticInfo$ = computed(() => {
            const info = this.groupInfo$.value;
            if (!info)
                return;
            const staticMap = Object.fromEntries(info.config
                .defaultKeys(info.tType)
                .map(({ key, value }) => [key, new Group(key, value, info, this)]));
            return { staticMap, groupInfo: info };
        });
        this.groupDataMap$ = computed(() => {
            const si = this.staticInfo$.value;
            if (!si)
                return;
            const { staticMap, groupInfo } = si;
            // Create fresh Group instances with empty rows arrays
            const map = {};
            Object.entries(staticMap).forEach(([key, group]) => {
                map[key] = new Group(key, group.value, groupInfo, this);
            });
            // Assign rows to their respective groups
            this.view.rows$.value.forEach(row => {
                const cell = this.view.cellGetOrCreate(row.rowId, groupInfo.property.id);
                const jv = cell.jsonValue$.value;
                const keys = groupInfo.config.valuesGroup(jv, groupInfo.tType);
                keys.forEach(({ key, value }) => {
                    if (!map[key])
                        map[key] = new Group(key, value, groupInfo, this);
                    map[key].rows.push(row);
                });
            });
            return map;
        });
        this.groupsDataList$ = computedLock(computed(() => {
            const map = this.groupDataMap$.value;
            if (!map)
                return;
            const gi = this.groupInfo$.value;
            const ordered = getOrderedGroupKeys(Object.keys(map), gi, this.ops.sortGroup, this.sortAsc$.value);
            applyGroupRowSort(map, ordered, this.ops.sortRow);
            return ordered
                .map(k => map[k])
                .filter((g) => !!g &&
                !this.isGroupHidden(g.key) &&
                (!this.hideEmpty$.value || g.rows.length > 0));
        }), this.view.isLocked$);
        /**
         * Computed list of groups including hidden ones, used by settings UI.
         */
        this.groupsDataListAll$ = computedLock(computed(() => {
            const map = this.groupDataMap$.value;
            const info = this.groupInfo$.value;
            if (!map || !info)
                return;
            const orderedKeys = getOrderedGroupKeys(Object.keys(map), info, this.ops.sortGroup, this.sortAsc$.value);
            applyGroupRowSort(map, orderedKeys, this.ops.sortRow);
            const visible = [];
            const hidden = [];
            orderedKeys
                .map(key => map[key])
                .filter((g) => g != null)
                .forEach(g => {
                if (g.hide$.value) {
                    hidden.push(g);
                }
                else {
                    visible.push(g);
                }
            });
            return [...visible, ...hidden];
        }), this.view.isLocked$);
        /** Whether all groups are currently hidden */
        this.allHidden$ = computed(() => {
            const map = this.groupDataMap$.value;
            if (!map)
                return false;
            return Object.keys(map).every(key => this.isGroupHidden(key));
        });
        this.property$ = computed(() => this.groupInfo$.value?.property);
        this.updateData = (data) => {
            const prop = this.property$.value;
            if (!prop)
                return;
            this.view.propertyGetOrCreate(prop.id).dataUpdate(() => data);
        };
        effect(() => {
            const desc = this.groupBy$.value?.sort?.desc;
            if (desc != null && this.sortAsc$.value === desc) {
                this.sortAsc$.value = !desc;
            }
        });
        // Sync hideEmpty state with GroupBy data
        effect(() => {
            const hide = this.groupBy$.value?.hideEmpty;
            if (hide != null && this.hideEmpty$.value !== hide) {
                this.hideEmpty$.value = hide;
            }
        });
    }
    /**
     * Toggle hiding of empty groups.
     */
    setHideEmpty(value) {
        this.hideEmpty$.value = value;
        const gb = this.groupBy$.value;
        if (gb) {
            this.ops.groupBySet({ ...gb, hideEmpty: value });
        }
    }
    isGroupHidden(key) {
        return this.groupPropertiesMap$.value[key]?.hide ?? false;
    }
    setGroupHide(key, hide) {
        this.ops.changeGroupHide?.(key, hide);
    }
    /**
     * Set sort order for date groupings and update GroupBy sort descriptor.
     */
    setDateSortOrder(asc) {
        this.sortAsc$.value = asc;
        const gb = this.groupBy$.value;
        if (gb) {
            this.ops.groupBySet({
                ...gb,
                sort: { desc: !asc },
                hideEmpty: gb.hideEmpty,
            });
        }
    }
    addToGroup(rowId, key) {
        this.view.lockRows(false);
        const groupMap = this.groupDataMap$.value;
        const groupInfo = this.groupInfo$.value;
        if (!groupMap || !groupInfo) {
            return;
        }
        const addTo = groupInfo.config.addToGroup;
        if (addTo === false) {
            return;
        }
        const v = groupMap[key]?.value;
        if (v != null) {
            const newValue = addTo(v, this.view.cellGetOrCreate(rowId, groupInfo.property.id).jsonValue$.value);
            this.view
                .cellGetOrCreate(rowId, groupInfo.property.id)
                .valueSet(newValue);
        }
        const map = this.groupDataMap$.value;
        const info = this.groupInfo$.value;
        if (!map || !info)
            return;
        const addFn = info.config.addToGroup;
        if (addFn === false)
            return;
        const group = map[key];
        if (!group)
            return;
        const current = group.value;
        // Handle both null and non-null values to ensure proper group assignment
        const newVal = addFn(current, this.view.cellGetOrCreate(rowId, info.property.id).jsonValue$.value);
        this.view.cellGetOrCreate(rowId, info.property.id).valueSet(newVal);
    }
    changeGroupMode(modeName) {
        const propId = this.property$.value?.id;
        if (!propId)
            return;
        this.ops.groupBySet({
            type: 'groupBy',
            columnId: propId,
            name: modeName,
            sort: { desc: !this.sortAsc$.value },
            hideEmpty: this.hideEmpty$.value,
        });
    }
    changeGroup(columnId) {
        if (columnId == null) {
            this.ops.groupBySet(undefined);
            return;
        }
        const column = this.view.propertyGetOrCreate(columnId);
        const meta = this.view.manager.dataSource.propertyMetaGet(column.type$.value);
        if (meta) {
            const gb = defaultGroupBy(this.view.manager.dataSource, meta, column.id, column.data$.value);
            if (gb) {
                gb.sort = { desc: !this.sortAsc$.value };
                gb.hideEmpty = this.hideEmpty$.value;
            }
            this.ops.groupBySet(gb);
        }
    }
    get addGroup() {
        return this.property$.value?.meta$.value?.config.addGroup;
    }
    changeGroupSort(keys) {
        this.ops.changeGroupSort(keys);
    }
    moveCardTo(rowId, fromGroupKey, toGroupKey, position) {
        this.view.lockRows(false);
        const groupMap = this.groupDataMap$.value;
        if (!groupMap) {
            return;
        }
        if (fromGroupKey !== toGroupKey) {
            const propertyId = this.property$.value?.id;
            if (!propertyId) {
                return;
            }
            const remove = this.groupInfo$.value?.config.removeFromGroup ?? (() => null);
            const group = fromGroupKey != null ? groupMap[fromGroupKey] : undefined;
            let newValue = null;
            if (group) {
                newValue = remove(group.value, this.view.cellGetOrCreate(rowId, propertyId).jsonValue$.value);
            }
            const addTo = this.groupInfo$.value?.config.addToGroup;
            if (addTo === false || addTo == null) {
                return;
            }
            newValue = addTo(groupMap[toGroupKey]?.value ?? null, newValue);
            this.view.cellGetOrCreate(rowId, propertyId).jsonValueSet(newValue);
        }
        const rows = groupMap[toGroupKey]?.rows
            .filter(row => row.rowId !== rowId)
            .map(row => row.rowId) ?? [];
        const index = insertPositionToIndex(position, rows, row => row);
        rows.splice(index, 0, rowId);
        const groupKeys = getOrderedGroupKeys(Object.keys(groupMap), this.groupInfo$.value, this.ops.sortGroup, this.sortAsc$.value);
        this.ops.changeRowSort(groupKeys, toGroupKey, rows);
    }
    moveGroupTo(groupKey, position) {
        this.view.lockRows(false);
        const groups = this.groupsDataListAll$.value;
        if (!groups) {
            return;
        }
        const currentKeys = groups.map(group => group.key);
        const reorderedKeys = reorderGroupKeys(currentKeys, groupKey, position);
        if (currentKeys.length === reorderedKeys.length &&
            currentKeys.every((key, index) => key === reorderedKeys[index])) {
            return;
        }
        this.changeGroupSort(reorderedKeys);
    }
    removeFromGroup(rowId, key) {
        this.view.lockRows(false);
        const groupMap = this.groupDataMap$.value;
        if (!groupMap) {
            return;
        }
        const propertyId = this.property$.value?.id;
        if (!propertyId) {
            return;
        }
        const remove = this.groupInfo$.value?.config.removeFromGroup ?? (() => undefined);
        const newValue = remove(groupMap[key]?.value ?? null, this.view.cellGetOrCreate(rowId, propertyId).jsonValue$.value);
        this.view.cellGetOrCreate(rowId, propertyId).valueSet(newValue);
    }
    updateValue(rows, value) {
        this.view.lockRows(false);
        const propertyId = this.property$.value?.id;
        if (!propertyId) {
            return;
        }
        rows.forEach(rowId => {
            this.view.cellGetOrCreate(rowId, propertyId).jsonValueSet(value);
        });
    }
}
export const groupTraitKey = createTraitKey('group');
export const sortByManually = (arr, getId, ids) => {
    const map = new Map(arr.map(v => [getId(v), v]));
    const result = [];
    for (const id of ids) {
        const value = map.get(id);
        if (value) {
            map.delete(id);
            result.push(value);
        }
    }
    result.push(...map.values());
    return result;
};
