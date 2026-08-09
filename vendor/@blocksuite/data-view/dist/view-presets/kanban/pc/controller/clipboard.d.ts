import type { ReactiveController } from 'lit';
import type { KanbanViewUILogic } from '../kanban-view-ui-logic.js';
export declare class KanbanClipboardController implements ReactiveController {
    logic: KanbanViewUILogic;
    private readonly _onCopy;
    private readonly _onPaste;
    private get readonly();
    get host(): import("../kanban-view-ui-logic.js").KanbanViewUI | undefined;
    constructor(logic: KanbanViewUILogic);
    hostConnected(): void;
}
//# sourceMappingURL=clipboard.d.ts.map