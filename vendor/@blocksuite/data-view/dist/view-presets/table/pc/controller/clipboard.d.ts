import type { ReactiveController } from 'lit';
import type { TableViewUILogic } from '../table-view-ui-logic.js';
export declare class TableClipboardController implements ReactiveController {
    logic: TableViewUILogic;
    private readonly _onCopy;
    private readonly _onCut;
    private readonly _onPaste;
    private get clipboard();
    private get notification();
    private get readonly();
    constructor(logic: TableViewUILogic);
    get host(): import("../table-view-ui-logic.js").TableViewUI | undefined;
    get selectionController(): import("./selection.js").TableSelectionController;
    copy(): void;
    cut(): void;
    hostConnected(): void;
}
//# sourceMappingURL=clipboard.d.ts.map