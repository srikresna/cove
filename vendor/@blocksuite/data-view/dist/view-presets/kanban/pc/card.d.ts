import { ShadowlessElement } from '@blocksuite/std';
import type { KanbanViewUILogic } from './kanban-view-ui-logic.js';
declare const KanbanCard_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class KanbanCard extends KanbanCard_base {
    static styles: import("lit").CSSResult;
    private readonly clickEdit;
    private readonly clickMore;
    private readonly contextMenu;
    private getSelection;
    private renderBody;
    private renderHeader;
    private renderIcon;
    private renderOps;
    private renderTitle;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult;
    accessor cardId: string;
    accessor groupKey: string;
    isFocus$: import("@preact/signals-core").Signal<boolean>;
    accessor kanbanViewLogic: KanbanViewUILogic;
    get view(): import("../kanban-view-manager.js").KanbanSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'affine-data-view-kanban-card': KanbanCard;
    }
}
export {};
//# sourceMappingURL=card.d.ts.map