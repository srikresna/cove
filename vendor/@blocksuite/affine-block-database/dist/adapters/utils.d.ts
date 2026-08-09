import type { ColumnDataType, SerializedCells } from '@blocksuite/affine-model';
import type { BlockSnapshot, DeltaInsert } from '@blocksuite/store';
export declare function formatTable(rows: string[][]): string;
export declare const isDelta: (value: unknown) => value is {
    delta: DeltaInsert[];
};
type Table = {
    headers: ColumnDataType[];
    rows: Row[];
};
type Row = {
    cells: Cell[];
};
type Cell = {
    value: string | {
        delta: DeltaInsert[];
    };
};
export declare const processTable: (columns?: ColumnDataType[], children?: BlockSnapshot[], cells?: SerializedCells) => Table;
export {};
//# sourceMappingURL=utils.d.ts.map