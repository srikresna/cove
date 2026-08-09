import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { ReactiveController } from 'lit';
import type { VirtualTableViewUILogic } from '../table-view-ui-logic';
export declare class TableDragController implements ReactiveController {
    private readonly logic;
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
    constructor(logic: VirtualTableViewUILogic);
    get host(): import("../table-view-ui-logic").TableViewUI | undefined;
    hostConnected(): void;
}
//# sourceMappingURL=drag.d.ts.map