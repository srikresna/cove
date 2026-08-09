import { computed } from '@preact/signals-core';
export class PropertyBase {
    get delete() {
        return () => this.dataSource.propertyDelete(this.id);
    }
    get duplicate() {
        return () => {
            const id = this.dataSource.propertyDuplicate(this.id);
            if (!id) {
                return;
            }
            const property = this.view.propertyGetOrCreate(id);
            property.move({
                before: false,
                id: this.id,
            });
        };
    }
    get icon() {
        if (!this.type$.value)
            return undefined;
        return this.dataSource.propertyMetaGet(this.type$.value)?.renderer.icon;
    }
    get id() {
        return this.propertyId;
    }
    get typeSet() {
        return type => this.dataSource.propertyTypeSet(this.id, type);
    }
    constructor(view, propertyId) {
        this.view = view;
        this.propertyId = propertyId;
        this.meta$ = computed(() => {
            return this.dataSource.propertyMetaGet(this.type$.value);
        });
        this.cells$ = computed(() => {
            return this.view.rows$.value.map(row => this.view.cellGetOrCreate(row.rowId, this.id));
        });
        this.data$ = computed(() => {
            return this.dataSource.propertyDataGet(this.id);
        });
        this.dataType$ = computed(() => {
            const type = this.type$.value;
            if (!type) {
                return;
            }
            const meta = this.dataSource.propertyMetaGet(type);
            if (!meta) {
                return;
            }
            return meta.config.jsonValue.type({
                data: this.data$.value,
                dataSource: this.dataSource,
            });
        });
        this.name$ = computed(() => {
            return this.dataSource.propertyNameGet(this.id);
        });
        this.readonly$ = computed(() => {
            return (this.view.readonly$.value || this.dataSource.propertyReadonlyGet(this.id));
        });
        this.type$ = computed(() => {
            return this.dataSource.propertyTypeGet(this.id);
        });
        this.renderer$ = computed(() => {
            return this.meta$.value?.renderer.cellRenderer;
        });
        this.index$ = computed(() => {
            const index = this.view.propertyIds$.value.indexOf(this.id);
            return index >= 0 ? index : undefined;
        });
        this.isFirst$ = computed(() => {
            return this.index$.value === 0;
        });
        this.isLast$ = computed(() => {
            return this.index$.value === this.view.propertyIds$.value.length - 1;
        });
        this.next$ = computed(() => {
            const properties = this.view.properties$.value;
            if (this.index$.value == null) {
                return;
            }
            return properties[this.index$.value + 1];
        });
        this.prev$ = computed(() => {
            const properties = this.view.properties$.value;
            if (this.index$.value == null) {
                return;
            }
            return properties[this.index$.value - 1];
        });
    }
    get dataSource() {
        return this.view.manager.dataSource;
    }
    get canDelete() {
        return this.dataSource.propertyCanDelete(this.id);
    }
    get canDuplicate() {
        return this.dataSource.propertyCanDuplicate(this.id);
    }
    get typeCanSet() {
        return this.dataSource.propertyTypeCanSet(this.id);
    }
    get hideCanSet() {
        return this.type$.value !== 'title';
    }
    cellGetOrCreate(rowId) {
        return this.view.cellGetOrCreate(rowId, this.id);
    }
    dataUpdate(updater) {
        const data = this.data$.value;
        this.dataSource.propertyDataSet(this.id, {
            ...data,
            ...updater(data),
        });
    }
    nameSet(name) {
        this.dataSource.propertyNameSet(this.id, name);
    }
    stringValueGet(rowId) {
        return this.cellGetOrCreate(rowId).stringValue$.value;
    }
    valueGet(rowId) {
        return this.cellGetOrCreate(rowId).value$.value;
    }
    valueSet(rowId, value) {
        return this.cellGetOrCreate(rowId).valueSet(value);
    }
    parseValueFromString(value) {
        const type = this.type$.value;
        if (!type) {
            return;
        }
        const fromString = this.dataSource.propertyMetaGet(type)?.config.rawValue.fromString;
        if (!fromString) {
            return;
        }
        return fromString({
            value,
            data: this.data$.value,
            dataSource: this.dataSource,
        });
    }
    valueSetFromString(rowId, value) {
        const data = this.parseValueFromString(value);
        if (!data) {
            return;
        }
        if (data.data) {
            this.dataUpdate(() => data.data);
        }
        this.valueSet(rowId, data.value);
    }
}
