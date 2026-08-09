import { computed } from '@preact/signals-core';
import { fromJson } from '../property/utils.js';
export class CellBase {
    get dataSource() {
        return this.view.manager.dataSource;
    }
    get property() {
        return this.property$.value;
    }
    get row() {
        return this.view.rowGetOrCreate(this.rowId);
    }
    constructor(view, propertyId, rowId) {
        this.view = view;
        this.propertyId = propertyId;
        this.rowId = rowId;
        this.meta$ = computed(() => {
            return this.dataSource.propertyMetaGet(this.property.type$.value);
        });
        this.value$ = computed(() => {
            return this.view.manager.dataSource.cellValueGet(this.rowId, this.propertyId);
        });
        this.isEmpty$ = computed(() => {
            return (this.meta$.value?.config.jsonValue.isEmpty({
                value: this.jsonValue$.value,
                dataSource: this.view.manager.dataSource,
            }) ?? true);
        });
        this.jsonValue$ = computed(() => {
            const toJson = this.property.meta$.value?.config.rawValue.toJson;
            if (!toJson) {
                return undefined;
            }
            return (toJson({
                value: this.value$.value,
                data: this.property.data$.value,
                dataSource: this.dataSource,
            }) ?? undefined);
        });
        this.property$ = computed(() => {
            return this.view.propertyGetOrCreate(this.propertyId);
        });
        this.stringValue$ = computed(() => {
            const toString = this.property.meta$.value?.config.rawValue.toString;
            if (!toString) {
                return;
            }
            return toString({
                value: this.value$.value,
                data: this.property.data$.value,
            });
        });
    }
    valueSet(value) {
        this.view.manager.dataSource.cellValueChange(this.rowId, this.propertyId, value);
    }
    jsonValueSet(value) {
        const meta = this.property.meta$.value;
        if (!meta) {
            return;
        }
        const rawValue = fromJson(meta.config, {
            value: value,
            data: this.property.data$.value,
            dataSource: this.view.manager.dataSource,
        });
        this.dataSource.cellValueChange(this.rowId, this.propertyId, rawValue);
    }
}
