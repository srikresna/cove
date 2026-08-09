import type { InsertToPosition } from '@blocksuite/affine-shared/utils';
import type { ReactiveController } from 'lit';
import { KanbanCard } from '../card.js';
import { KanbanGroup } from '../group.js';
import type { KanbanViewUILogic } from '../kanban-view-ui-logic.js';
export declare class KanbanDragController implements ReactiveController {
    private readonly logic;
    dragStart: (ele: KanbanCard, evt: PointerEvent) => void;
    get host(): import("../kanban-view-ui-logic.js").KanbanViewUI | undefined;
    dropPreview: {
        display(group: KanbanGroup, self: KanbanCard | undefined, card?: KanbanCard): void;
        remove(): void;
    };
    getInsertPosition: (evt: MouseEvent) => {
        group: KanbanGroup;
        card?: KanbanCard;
        position: InsertToPosition;
    } | undefined;
    showIndicator: (evt: MouseEvent, self: KanbanCard | undefined) => {
        group: KanbanGroup;
        position: InsertToPosition;
    } | undefined;
    get scrollContainer(): HTMLElement | undefined;
    constructor(logic: KanbanViewUILogic);
    hostConnected(): void;
}
//# sourceMappingURL=drag.d.ts.map