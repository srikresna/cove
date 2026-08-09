import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../core/group-by/trait.js';
import type { MobileKanbanViewUILogic } from './kanban-view-ui-logic.js';
declare const MobileKanbanGroup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileKanbanGroup extends MobileKanbanGroup_base {
    static styles: import("lit").CSSResult;
    private readonly clickAddCard;
    private readonly clickAddCardInStart;
    private readonly clickGroupOptions;
    render(): import("lit-html").TemplateResult;
    accessor group: Group;
    accessor kanbanViewLogic: MobileKanbanViewUILogic;
    get view(): import("../kanban-view-manager.js").KanbanSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-kanban-group': MobileKanbanGroup;
    }
}
export {};
//# sourceMappingURL=group.d.ts.map