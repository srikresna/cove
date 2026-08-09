import { ShadowlessElement } from '@blocksuite/std';
import type { MobileKanbanViewUILogic } from './kanban-view-ui-logic.js';
declare const MobileKanbanCard_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileKanbanCard extends MobileKanbanCard_base {
    static styles: import("lit").CSSResult;
    private readonly clickCenterPeek;
    private readonly clickMore;
    private renderBody;
    private renderHeader;
    private renderIcon;
    private renderOps;
    private renderTitle;
    render(): import("lit-html").TemplateResult;
    accessor cardId: string;
    accessor groupKey: string;
    accessor isFocus: boolean;
    accessor kanbanViewLogic: MobileKanbanViewUILogic;
    get view(): import("../kanban-view-manager.js").KanbanSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-kanban-card': MobileKanbanCard;
    }
}
export {};
//# sourceMappingURL=card.d.ts.map