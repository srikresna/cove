import type { ReactiveController } from 'lit';
import type { TableViewUILogic } from '../table-view-ui-logic';
export declare class TableHotkeysController implements ReactiveController {
    private readonly logic;
    get selectionController(): import("./selection").TableSelectionController;
    constructor(logic: TableViewUILogic);
    get host(): import("../table-view-ui-logic").TableViewUI | undefined;
    private _handleDeleteOrBackspace;
    hostConnected(): void;
}
//# sourceMappingURL=hotkeys.d.ts.map