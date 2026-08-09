import type { ReadonlySignal } from '@preact/signals-core';
import type { TableViewSelectionWithType } from './selection';
export interface TableCell {
    rowId: string;
    setTagDraft?(value: string): void;
}
export type ColumnAccessor<T extends TableCell> = (cell: T) => {
    valueSetFromString(rowId: string, value: string): void;
    type$: ReadonlySignal<string>;
} | undefined;
export interface StartEditOptions<T extends TableCell> {
    event: KeyboardEvent;
    selection: TableViewSelectionWithType | undefined;
    getCellContainer: (groupKey: string | undefined, rowIndex: number, columnIndex: number) => T | undefined;
    updateSelection: (sel: TableViewSelectionWithType) => void;
    getColumn: ColumnAccessor<T>;
}
export declare function handleCharStartEdit<T extends TableCell>(options: StartEditOptions<T>): boolean;
//# sourceMappingURL=utils.d.ts.map