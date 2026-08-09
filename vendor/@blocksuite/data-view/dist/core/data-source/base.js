import { Container, createScope, } from '@blocksuite/global/di';
import { computed } from '@preact/signals-core';
export const DataSourceScope = createScope('data-source');
export class DataSourceBase {
    constructor() {
        this.container = new Container();
        this.fixedProperties$ = computed(() => {
            return this.allPropertyMetas$.value
                .filter(v => v.config.fixed)
                .map(v => v.type);
        });
        this.fixedPropertySet = computed(() => {
            return new Set(this.fixedProperties$.value);
        });
    }
    propertyTypeCanSet(propertyId) {
        return !this.isFixedProperty(propertyId);
    }
    propertyCanDuplicate(propertyId) {
        return !this.isFixedProperty(propertyId);
    }
    propertyCanDelete(propertyId) {
        return !this.isFixedProperty(propertyId);
    }
    cellValueGet$(rowId, propertyId) {
        return computed(() => this.cellValueGet(rowId, propertyId));
    }
    get provider() {
        return this.container.provider(DataSourceScope, this.parentProvider);
    }
    serviceGet(key) {
        return this.provider.getOptional(key);
    }
    serviceSet(key, value) {
        this.container.addValue(key, value, { scope: DataSourceScope });
    }
    serviceGetOrCreate(key, create) {
        const result = this.serviceGet(key);
        if (result != null) {
            return result;
        }
        const value = create();
        this.serviceSet(key, value);
        return value;
    }
    propertyDataGet$(propertyId) {
        return computed(() => this.propertyDataGet(propertyId));
    }
    propertyDataTypeGet$(propertyId) {
        return computed(() => this.propertyDataTypeGet(propertyId));
    }
    propertyNameGet$(propertyId) {
        return computed(() => this.propertyNameGet(propertyId));
    }
    propertyReadonlyGet(_propertyId) {
        return false;
    }
    propertyReadonlyGet$(propertyId) {
        return computed(() => this.propertyReadonlyGet(propertyId));
    }
    propertyTypeGet$(propertyId) {
        return computed(() => this.propertyTypeGet(propertyId));
    }
    viewDataGet$(viewId) {
        return computed(() => this.viewDataGet(viewId));
    }
    viewMetaGet$(type) {
        return computed(() => this.viewMetaGet(type));
    }
    viewMetaGetById$(viewId) {
        return computed(() => this.viewMetaGetById(viewId));
    }
    isFixedProperty(propertyId) {
        if (this.fixedPropertySet.value.has(propertyId)) {
            return true;
        }
        const result = this.getNormalPropertyAndIndex(propertyId);
        if (result) {
            return this.fixedPropertySet.value.has(result.column.type);
        }
        return false;
    }
}
