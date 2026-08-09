import { z } from 'zod';
export const TableViewTypeSchema = z.object({
    viewId: z.string(),
    type: z.literal('table'),
});
export const RangeSchema = z.object({
    start: z.number(),
    end: z.number(),
});
export const FocusSchema = z.object({
    rowIndex: z.number(),
    columnIndex: z.number(),
});
export const TableViewAreaSelectionSchema = z.object({
    selectionType: z.literal('area'),
    groupKey: z.string().optional(),
    rowsSelection: RangeSchema,
    columnsSelection: RangeSchema,
    focus: FocusSchema,
    isEditing: z.boolean(),
});
export const RowWithGroupSchema = z.object({
    id: z.string(),
    groupKey: z.string().optional(),
});
export const TableViewRowSelectionSchema = z.object({
    selectionType: z.literal('row'),
    rows: z.array(RowWithGroupSchema),
});
export const TableViewSelectionSchema = z.union([
    TableViewAreaSelectionSchema,
    TableViewRowSelectionSchema,
]);
export const TableViewSelectionWithTypeSchema = z.union([
    z.intersection(TableViewTypeSchema, TableViewAreaSelectionSchema),
    z.intersection(TableViewTypeSchema, TableViewRowSelectionSchema),
]);
export const RowWithGroup = {
    equal(a, b) {
        if (a == null || b == null) {
            return false;
        }
        return a.id === b.id && a.groupKey === b.groupKey;
    },
};
export const TableViewRowSelection = {
    rows: (selection) => {
        if (selection?.selectionType === 'row') {
            return selection.rows;
        }
        return [];
    },
    rowsIds: (selection) => {
        return TableViewRowSelection.rows(selection).map(v => v.id);
    },
    includes(selection, row) {
        if (!selection) {
            return false;
        }
        return TableViewRowSelection.rows(selection).some(v => RowWithGroup.equal(v, row));
    },
    create(options) {
        return {
            selectionType: 'row',
            rows: options.rows,
        };
    },
    is(selection) {
        return selection?.selectionType === 'row';
    },
};
export const TableViewAreaSelection = {
    create: (options) => {
        return {
            ...options,
            selectionType: 'area',
            rowsSelection: options.rowsSelection ?? {
                start: options.focus.rowIndex,
                end: options.focus.rowIndex,
            },
            columnsSelection: options.columnsSelection ?? {
                start: options.focus.columnIndex,
                end: options.focus.columnIndex,
            },
        };
    },
    isFocus(selection) {
        return (selection.focus.rowIndex === selection.rowsSelection.start &&
            selection.focus.rowIndex === selection.rowsSelection.end &&
            selection.focus.columnIndex === selection.columnsSelection.start &&
            selection.focus.columnIndex === selection.columnsSelection.end);
    },
};
