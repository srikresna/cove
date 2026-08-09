import { computed, signal } from '@preact/signals-core';
import { computedLock } from '../utils/lock.js';
import { CellBase } from './cell.js';
import { RowBase } from './row.js';
export class SingleViewBase {
    rowsDelete(rows) {
        this.lockRows(false);
        this.dataSource.rowDelete(rows);
    }
    get dataSource() {
        return this.manager.dataSource;
    }
    get featureFlags$() {
        return this.dataSource.featureFlags$;
    }
    get isLocked() {
        return this.lockRows$.value;
    }
    get meta() {
        return this.dataSource.viewMetaGet(this.type);
    }
    get propertyMetas$() {
        return this.dataSource.propertyMetas$;
    }
    constructor(manager, id) {
        this.manager = manager;
        this.id = id;
        this.searchString = signal('');
        this.traitMap = new Map();
        this.data$ = computed(() => {
            return this.dataSource.viewDataGet(this.id);
        });
        this.lockRows$ = signal(false);
        this.isLocked$ = computed(() => {
            return this.lockRows$.value;
        });
        this.name$ = computed(() => {
            return this.data$.value?.name ?? '';
        });
        this.propertyIds$ = computed(() => {
            return this.properties$.value.map(v => v.id);
        });
        this.propertyMap$ = computed(() => {
            return Object.fromEntries(this.properties$.value.map(v => [v.id, v]));
        });
        this.rowsRaw$ = computed(() => {
            return this.dataSource.rows$.value.map(id => this.rowGetOrCreate(id));
        });
        this.rows$ = computedLock(computed(() => {
            return this.rowsMapping(this.rowsRaw$.value);
        }), this.isLocked$);
        this.rowIds$ = computed(() => {
            return this.rowsRaw$.value.map(v => v.rowId);
        });
        this.vars$ = computed(() => {
            return this.propertiesRaw$.value.flatMap(property => {
                const propertyMeta = this.dataSource.propertyMetaGet(property.type$.value);
                if (!propertyMeta) {
                    return [];
                }
                return {
                    id: property.id,
                    name: property.name$.value,
                    type: propertyMeta.config.jsonValue.type({
                        data: property.data$.value,
                        dataSource: this.dataSource,
                    }),
                    icon: property.icon,
                    propertyType: property.type$.value,
                };
            });
        });
    }
    searchRowsMapping(rows, searchString) {
        return rows.filter(row => {
            if (searchString) {
                const containsSearchString = this.propertyIds$.value.some(propertyId => {
                    return this.cellGetOrCreate(row.rowId, propertyId)
                        .stringValue$.value?.toLowerCase()
                        .includes(searchString?.toLowerCase());
                });
                if (!containsSearchString) {
                    return false;
                }
            }
            return this.isShow(row.rowId);
        });
    }
    cellGetOrCreate(rowId, propertyId) {
        return new CellBase(this, propertyId, rowId);
    }
    serviceGet(key) {
        return this.dataSource.serviceGet(key);
    }
    serviceGetOrCreate(key, create) {
        return this.dataSource.serviceGetOrCreate(key, create);
    }
    dataUpdate(updater) {
        this.dataSource.viewDataUpdate(this.id, updater);
    }
    delete() {
        this.manager.viewDelete(this.id);
    }
    duplicate() {
        this.manager.viewDuplicate(this.id);
    }
    lockRows(lock) {
        this.lockRows$.value = lock;
    }
    nameSet(name) {
        this.dataUpdate(() => {
            return {
                name,
            };
        });
    }
    propertyAdd(position, ops) {
        const id = this.dataSource.propertyAdd(position, ops);
        if (!id) {
            return;
        }
        const property = this.propertyGetOrCreate(id);
        property.move(position);
        return id;
    }
    rowAdd(insertPosition) {
        this.lockRows(false);
        return this.dataSource.rowAdd(insertPosition);
    }
    rowGetOrCreate(rowId) {
        return new RowBase(this, rowId);
    }
    rowsMapping(rows) {
        return this.searchRowsMapping(rows, this.searchString.value);
    }
    setSearch(str) {
        this.searchString.value = str;
    }
    traitGet(key) {
        return this.traitMap.get(key.key);
    }
    traitSet(key, value) {
        this.traitMap.set(key.key, value);
        return value;
    }
}
