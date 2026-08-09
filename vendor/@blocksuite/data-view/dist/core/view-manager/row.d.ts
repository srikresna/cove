import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import { type ReadonlySignal } from '@preact/signals-core';
import { type Cell, CellBase } from './cell.js';
import type { SingleView } from './single-view.js';
export interface Row {
    readonly cells$: ReadonlySignal<Cell[]>;
    readonly rowId: string;
    index$: ReadonlySignal<number | undefined>;
    prev$: ReadonlySignal<Row | undefined>;
    next$: ReadonlySignal<Row | undefined>;
    delete(): void;
    move(position: InsertToPosition): void;
}
export declare class RowBase implements Row {
    readonly singleView: SingleView;
    readonly rowId: string;
    cells$: ReadonlySignal<CellBase<unknown, unknown, Record<string, unknown>>[]>;
    index$: ReadonlySignal<number | undefined>;
    prev$: ReadonlySignal<Row | undefined>;
    next$: ReadonlySignal<Row | undefined>;
    constructor(singleView: SingleView, rowId: string);
    get dataSource(): import("../index.js").DataSource;
    delete(): void;
    move(position: InsertToPosition): void;
}
//# sourceMappingURL=row.d.ts.map