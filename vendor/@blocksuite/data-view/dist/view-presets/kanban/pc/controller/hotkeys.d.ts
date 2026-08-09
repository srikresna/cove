import type { ReactiveController } from 'lit';
import type { KanbanViewUILogic } from '../kanban-view-ui-logic.js';
export declare class KanbanHotkeysController implements ReactiveController {
    logic: KanbanViewUILogic;
    private get hasSelection();
    constructor(logic: KanbanViewUILogic);
    get host(): import("../kanban-view-ui-logic.js").KanbanViewUI | undefined;
    hostConnected(): void;
}
//# sourceMappingURL=hotkeys.d.ts.map