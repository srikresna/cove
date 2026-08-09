import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { ReactiveController } from 'lit';
import { TableRowView } from '../row/row.js';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
export declare class TableDragController implements ReactiveController {
    private readonly logic;
    dragStart: (rowView: TableRowView, evt: PointerEvent) => void;
    dropPreview: {
        display(x: number, y: number, width: number): void;
        remove(): void;
    };
    getInsertPosition: (evt: MouseEvent) => {
        groupKey: string | undefined;
        position: InsertToPosition;
        y: number;
        width: number;
        x: number;
    } | undefined;
    showIndicator: (evt: MouseEvent) => {
        groupKey: string | undefined;
        position: InsertToPosition;
        y: number;
        width: number;
        x: number;
    } | undefined;
    constructor(logic: TableViewUILogic);
    get host(): import("../table-view-ui-logic.js").TableViewUI | undefined;
    hostConnected(): void;
}
//# sourceMappingURL=drag.d.ts.map