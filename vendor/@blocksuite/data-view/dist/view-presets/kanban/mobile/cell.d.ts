import { ShadowlessElement } from '@blocksuite/std';
import type { DataViewCellLifeCycle } from '../../../core/property/index.js';
import type { Property } from '../../../core/view-manager/property.js';
import type { MobileKanbanViewUILogic } from './kanban-view-ui-logic.js';
declare const MobileKanbanCell_base: typeof ShadowlessElement & import("@blocksuite/global/utils").Constructor<import("@blocksuite/global/lit").DisposableClass>;
export declare class MobileKanbanCell extends MobileKanbanCell_base {
    static styles: import("lit").CSSResult;
    private readonly _cell;
    isSelectionEditing$: import("@preact/signals-core").ReadonlySignal<boolean>;
    selectCurrentCell: (editing: boolean) => void;
    get cell(): DataViewCellLifeCycle | undefined;
    connectedCallback(): void;
    render(): import("lit-html").TemplateResult | undefined;
    renderIcon(): import("lit-html").TemplateResult | undefined;
    accessor cardId: string;
    accessor column: Property;
    accessor contentOnly: boolean;
    accessor groupKey: string;
    isEditing$: import("@preact/signals-core").Signal<boolean>;
    accessor kanbanViewLogic: MobileKanbanViewUILogic;
    get view(): import("../kanban-view-manager.js").KanbanSingleView;
}
declare global {
    interface HTMLElementTagNameMap {
        'mobile-kanban-cell': MobileKanbanCell;
    }
}
export {};
//# sourceMappingURL=cell.d.ts.map