import { computed } from '@preact/signals-core';
import { CellBase } from './cell.js';
export class RowBase {
    constructor(singleView, rowId) {
        this.singleView = singleView;
        this.rowId = rowId;
        this.cells$ = computed(() => {
            return this.singleView.propertiesRaw$.value.map(property => {
                return new CellBase(this.singleView, property.id, this.rowId);
            });
        });
        this.index$ = computed(() => {
            const idx = this.singleView.rowIds$.value.indexOf(this.rowId);
            return idx >= 0 ? idx : undefined;
        });
        this.prev$ = computed(() => {
            const index = this.index$.value;
            if (index == null) {
                return;
            }
            return this.singleView.rows$.value[index - 1];
        });
        this.next$ = computed(() => {
            const index = this.index$.value;
            if (index == null) {
                return;
            }
            return this.singleView.rows$.value[index + 1];
        });
    }
    get dataSource() {
        return this.singleView.manager.dataSource;
    }
    delete() {
        this.dataSource.rowDelete([this.rowId]);
    }
    move(position) {
        this.dataSource.rowMove(this.rowId, position);
    }
}
