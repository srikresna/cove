import { BaseSelection, SelectionExtension } from '@blocksuite/store';
import { z } from 'zod';
const TableAreaSelectionSchema = z.object({
    type: z.literal('area'),
    rowStartIndex: z.number(),
    rowEndIndex: z.number(),
    columnStartIndex: z.number(),
    columnEndIndex: z.number(),
});
const TableRowSelectionSchema = z.object({
    type: z.literal('row'),
    rowId: z.string(),
});
const TableColumnSelectionSchema = z.object({
    type: z.literal('column'),
    columnId: z.string(),
});
const TableSelectionDataSchema = z.union([
    TableAreaSelectionSchema,
    TableRowSelectionSchema,
    TableColumnSelectionSchema,
]);
export const TableSelectionData = {
    equals(a, b) {
        if (a === b) {
            return true;
        }
        if (a == null || b == null) {
            return a === b;
        }
        if (a.type !== b.type) {
            return false;
        }
        if (a.type === 'area' && b.type === 'area') {
            return (a.rowStartIndex === b.rowStartIndex &&
                a.rowEndIndex === b.rowEndIndex &&
                a.columnStartIndex === b.columnStartIndex &&
                a.columnEndIndex === b.columnEndIndex);
        }
        if (a.type === 'row' && b.type === 'row') {
            return a.rowId === b.rowId;
        }
        if (a.type === 'column' && b.type === 'column') {
            return a.columnId === b.columnId;
        }
        return false;
    },
};
const TableSelectionSchema = z.object({
    blockId: z.string(),
    data: TableSelectionDataSchema,
});
export class TableSelection extends BaseSelection {
    static { this.group = 'note'; }
    static { this.type = 'table'; }
    static { this.recoverable = true; }
    constructor({ blockId, data, }) {
        super({
            blockId,
        });
        this.data = data;
    }
    static fromJSON(json) {
        TableSelectionSchema.parse(json);
        return new TableSelection({
            blockId: json.blockId,
            data: json.data,
        });
    }
    equals(other) {
        if (!(other instanceof TableSelection)) {
            return false;
        }
        return this.blockId === other.blockId;
    }
    toJSON() {
        return {
            type: 'table',
            blockId: this.blockId,
            data: this.data,
        };
    }
}
export const TableSelectionExtension = SelectionExtension(TableSelection);
