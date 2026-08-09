import { ShadowlessElement } from '@blocksuite/std';
import type { Group } from '../../../core/group-by/trait.js';
import type { KanbanViewUILogic } from './kanban-view-ui-logic.js';
declare const KanbanGroup_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class KanbanGroup extends KanbanGroup_base {
    static styles: import("lit").CSSResult;
    private readonly clickAddCard;
    private readonly clickAddCardInStart;
    private readonly clickGroupOptions;
    render(): import("lit-html").TemplateResult;
    accessor group: Group;
    accessor kanbanViewLogic: KanbanViewUILogic;
    get view(): import("../kanban-view-manager.js").KanbanSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-kanban-group': KanbanGroup;
    }
}
export {};
//# sourceMappingURL=group.d.ts.map