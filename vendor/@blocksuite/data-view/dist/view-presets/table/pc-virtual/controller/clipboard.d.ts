import { DisposableGroup } from '@blocksuite/global/disposable';
import type { ReactiveController } from 'lit';
import type { VirtualTableViewUILogic } from '../table-view-ui-logic.js';
export declare class TableClipboardController implements ReactiveController {
    logic: VirtualTableViewUILogic;
    disposables: DisposableGroup;
    private readonly _onCopy;
    private readonly _onCut;
    private readonly _onPaste;
    private get clipboard();
    private get notification();
    private get readonly();
    constructor(logic: VirtualTableViewUILogic);
    get host(): import("../table-view-ui-logic.js").TableViewUI | undefined;
    get selection(): ({
        type: "table";
        viewId: string;
    } & {
        focus: {
            rowIndex: number;
            columnIndex: number;
        };
        selectionType: "area";
        rowsSelection: {
            start: number;
            end: number;
        };
        columnsSelection: {
            start: number;
            end: number;
        };
        isEditing: boolean;
        groupKey?: string | undefined;
    }) | ({
        type: "table";
        viewId: string;
    } & {
        selectionType: "row";
        rows: {
            id: string;
            groupKey?: string | undefined;
        }[];
    }) | undefined;
    copy(): void;
    cut(): void;
    hostConnected(): void;
}
//# sourceMappingURL=clipboard.d.ts.map